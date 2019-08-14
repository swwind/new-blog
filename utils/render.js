const pug = require('pug');
const Prism = require('./prism.min.js');
const config = require('../config');
const mdit = require('markdown-it');
const mathjax = require('markdown-it-mathjax')();
const escapeHTML = mdit().utils.escapeHtml;

const getRenderedCode = (str, lang) => {
  const code = Prism.languages[lang]
    ? Prism.highlight(str, Prism.languages[lang], lang)
    : escapeHTML(str);
  const lines = str.trim().split('\n').length;
  const line = `<span class="line-numbers-rows">${new Array(lines).fill('<span></span>').join('')}</span>`;
  return `<pre class="line-numbers language-${lang}"><code>${code}${line}</code></pre>`;
};

function render (posts, options) {
  const acceptLanguage = options.acceptLanguage || '';

  return posts.map(origPost => {
    const post = JSON.parse(JSON.stringify(origPost));
    post.date = new Date(post.date);

    // Get all available languages.
    const availableLanguages = post.body.map(body => {
      const matchedOffset = acceptLanguage.indexOf(body.language);
      const priority = (matchedOffset >= 0) ? (acceptLanguage.length - acceptLanguage.indexOf(body.language)) : -1;
      return {
        name: body.language,
        priority
      };
    }).sort((a, b) => b.priority - a.priority);

    let matchedBody = null;
    if (availableLanguages[0].priority < 0) {
      // Nobody matched, use default;
      matchedBody = post.body.filter(body => body.default)[0] || post.body[0];
    } else {
      // use language which has max priority
      matchedBody = post.body.filter(body => body.language === availableLanguages[0].name)[0];
    }

    // Check if post is password-protected.
    if (typeof post.password === 'string' && post.password.length > 0) {
      if (options.password !== post.password) {
        post.more = true;
        post.protected = true;
        post.replies = [];
        post.title = matchedBody.title;
        post.content = 'This is a password-protected post, content preview is not available.';

        delete post.password;

        return post;
      }
    }

    if (!options.fakeRendering && !options.titleOnly) {
      if (/^markdown$/i.test(matchedBody.format)) {
        // Markdown-it can do it cleanly.
        if (options.preview && matchedBody.content.indexOf('<!-- more -->') >= 0) {
          post.content = matchedBody.content.substr(0, matchedBody.content.indexOf('<!-- more -->'));
          post.more = true;
        } else {
          post.content = matchedBody.content;
        }
        post.content = mdit({
          html: true,
          linkify: true,
          highlight: getRenderedCode
        }).use(mathjax).render(post.content);

        // fuck this grammar, my mathjax all exploded
      } else {
        // Render other formats (pug, makrdown, etc) into html
        if (/^(jade|pug)$/i.test(matchedBody.format)) {
          post.content = pug.render(matchedBody.content);
        } else {
          post.content = matchedBody.content;
        }

        // Cut the post content if we are in preview mode.
        if (options.preview && post.content.indexOf('<!-- more -->') >= 0) {
          post.content = post.content.substr(0, post.content.indexOf('<!-- more -->'));
          post.more = true;
        }

        // I will do it on front end
      }

      if (post.replies && config.reply.enableMarkdownSupport) {
        post.replies = post.replies.map(reply => {
          if (!reply.content) {
            return {};
          }

          reply.content = mdit({
            html: false,
            linkify: true,
            highlight: getRenderedCode
          }).use(mathjax).render(reply.content);
          reply.markdown = true;
          return reply;
        });
      }
    }

    // Finally, remove original source & add title
    post.title = matchedBody.title;
    post.language = matchedBody.language;
    delete post.body;

    // *Always* delete password after rendering.
    delete post.password;

    return post;
  });
}

module.exports = function () {
  try {
    return render.apply(null, arguments);
  } catch (e) {
    console.log(e);
  }
};
