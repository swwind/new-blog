<template lang="pug">
  div.reply#reply: div.card
    h3.title 评论
    div.content
      ul.replies-list(v-if="replies && replies.length !== 0")
        li(v-for="reply in replyTree", v-bind:style="{ marginLeft: reply.depth * 56 + 'px' }", v-if="!reply.deleted")
          a.avatar(v-bind:href="reply.site || false", target="view_window")
            div.gravatar-avatar(v-if="reply.gravatar", v-bind:style="{ backgroundImage: `url(https://gravatar.loli.net/avatar/${reply.gravatar}?d=mm&s=40)` }")
            div.github-avatar(v-if="reply.githubId", v-bind:style="{ backgroundImage: `url(https://github.com/${reply.githubId}.png)` }")
            div.fallback-avatar(v-text="reply.user.trim().substr(0, 1).toUpperCase()")
          div.reply-body
            a.name(v-bind:href="reply.site || false", target="view_window", v-text="reply.user")
            div.tags
              span.osname(v-if="reply.os", v-text="reply.os.name + ' ' + reply.os.version")
              span.browser(v-if="reply.browser", v-text="reply.browser.name + ' ' + reply.browser.version")
            div.date(v-text="timeToString(reply.datetime)")
            div(v-html="reply.content", v-if="reply.markdown")
            div.raw-content(v-else, v-text="reply.content")
            a.reply-to(@click="setReplyTo(reply.index)") 回复该评论
      div#reply-form.send-new
        h3(v-if="replyTo === null") 发表评论
        h3(v-if="replyTo !== null && replies[replyTo] !== undefined",
          v-text="'回复给 ' + replies[replyTo].user")
        table.form-table: tbody
          tr
            th 姓名
            td: input.full(v-model="name", placeholder="必填")
          tr
            th 站点
            td: input.full(v-model="site", placeholder="选填")
          tr
            th 电子邮件
            td: input.full(v-model="email", placeholder="选填，不会公开，用于显示 gravatar 头像")
          tr
            th GitHub ID
            td: input.full(v-model="githubId", placeholder="选填，如果没有 gravatar 则使用 github 头像代替")
          tr
            th 评论
            td: textarea.content(v-model="content", placeholder="必填，可以使用 Markdown 语法")
          tr
            td
            td
              button(@click="submit") 提交
              button(@click="reset") 重置
</template>

<script>
import timeToString from '../utils/timeToString';
import api from '../api';
import md5 from 'md5';
import detect from 'ua-parser-js';

function ReplyNode (value) {
  this.value = value;
  this.childs = [];
}

export default {
  name: 'Reply',
  props: {
    replies: {
      type: Array,
      required: true
    },
    apiPath: {
      type: String,
      required: true
    },
    refreshReplies: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      name: '',
      email: '',
      content: '',
      site: '',
      githubId: '',
      replyTo: null,
      busy: false,
    };
  },
  computed: {
    replyTree () {
      const replies = this.replies.map((el, idx) => {
        el.index = idx;
        if (el.ua) {
          const result = detect(el.ua);
          el.os = result.os;
          el.browser = result.browser;
        }
        return el;
      });

      if (!replies) {
        return;
      }

      const nodes = [];
      const root = [];
      replies.forEach((reply, index) => {
        const node = new ReplyNode(reply);
        nodes[index] = node;

        if (typeof reply.replyTo === 'number') {
          nodes[reply.replyTo].childs.push(node);
        } else {
          root.unshift(node);
        }
      });

      const treeView = [];
      const dfs = (node, depth = 0) => {
        const value = node.value;
        value.depth = depth;
        treeView.push(value);

        node.childs.forEach(childNode => dfs(childNode, depth + 1));
      };

      root.forEach(node => dfs(node, 0));

      return treeView;
    }
  },
  watch: {
    replies () {
      this.reset();
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.$route.hash === '#reply') {
        this.$el.scrollIntoView();
      }

      this.name = localStorage.getItem('reply.user') || '';
      this.site = localStorage.getItem('reply.site') || '';
      this.email = localStorage.getItem('reply.email') || '';
      this.githubId = localStorage.getItem('reply.github') || '';
    });
  },
  methods: {
    timeToString,
    submit () {
      if (this.busy) {
        return;
      }

      this.busy = true;

      const data = {
        user: this.name,
        email: this.email,
        site: this.site,
        content: this.content,
        replyTo: this.replyTo,
        githubId: this.githubId,
        gravatar: this.email ? md5(this.email) : ''
      };

      if (!data.user) {
        alert('姓名是必填项呢');
        return;
      } else if (!data.content) {
        alert('评论内容为空呢');
        return;
      }

      api[this.$props.apiPath].putReplyBySlug({ slug: this.$route.params.slug, data })
        .then(() => {
          if (this.$store.state.forceReload) {
            window.location.reload();
          } else {
            this.$props.refreshReplies();
          }

          this.busy = false;
        });
      
      localStorage.setItem('reply.user', this.name);
      localStorage.setItem('reply.email', this.email);
      localStorage.setItem('reply.site', this.site);
      localStorage.setItem('reply.github', this.githubId);
    },
    reset () {
      Object.assign(this.$data, {
        name: '',
        email: '',
        content: '',
        site: '',
        githubId: '',
        replyTo: null
      });
    },
    setReplyTo (idx) {
      this.replyTo = idx;
      this.focusReplyForm();
    },
    focusReplyForm () {
      this.$el.querySelector('#reply-form').scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
};
</script>

<style lang="scss">
// @import '../style/color.scss';
// @import '../style/form-table.scss';

div.reply {
  div.content {
    padding: 0 1em 1em;
  }
  table th {
    text-align: right;
    width: 90px;
    vertical-align: top;
    font-weight: normal;
  }
  table {
    width: 90%;
    border-spacing: 5px;
  }
  table textarea.content {
    height: 8em;
  }

  div.raw-content {
    white-space: pre;
  }

  ul.replies-list {
    padding: 0;
    list-style: none;

    > li {
      position: relative;
      display: flex;
      padding: 0.6em 1em 0.1em 0.3em;
      margin: 0.5em 0 0.5em 0;
      // background-color: rgb(245, 245, 245);
      border-radius: 2px;
      line-height: 1.2em;

      pre {
        background-color: inherit;
        border: rgb(235, 235, 235);
        border-radius: 0;
      }

      a.reply-to {
        font-size: 12px;
        position: absolute;
        bottom: 5px;
        right: 8px;
        opacity: 0;
        transition: all ease 0.3s;
        &:not(:hover) {
          border-bottom: 1px solid transparent;
        }
      }

      a.avatar, div.github-avatar, div.gravatar-avatar {
        width: 40px;
        height: 40px;
      }

      a.avatar {
        flex-grow: 0;
        flex-shrink: 0;
        border-radius: 20px;
        overflow: hidden;
        margin-top: 5px;
        margin-right: 1em;
        position: relative;
        border-bottom: none;
        &:not([href]) {
          cursor: default;
        }
      }

      div.github-avatar, div.fallback-avatar, div.gravatar-avatar {
        position: absolute;
      }

      div.gravatar-avatar {
        z-index: 3;
        background-size: cover;
      }

      div.github-avatar {
        z-index: 2;
        background-size: cover;
      }

      div.fallback-avatar {
        z-index: 1;
        user-select: none;
        line-height: 40px;
        width: 40px;
        text-align: center;
        font-size: 20px;
        background-color: var(--avatar_fallback_background_color);
        color: var(--avatar_fallback_text_color);
        user-select: none;
      }
    }

    > li:hover {
      a.reply-to {
        opacity: 1;
        transition: none;
      }
    }

    a.name {
      font-weight: bold;
      &:not([href]) {
        cursor: default;
        &:hover {
          border-bottom: none;
        }
      }
    }
    div.date, a.name, div.tags {
      font-size: 0.8em;
      color: var(--font_light_color);
    }
    div.tags {
      display: inline-block;

      span {
        padding: 2px 5px;
        border-radius: 2px;
        margin-left: 10px;
      }
    }
  }

  button {
    font-size: 12px;
    margin-right: 5px;
  }
}
</style>
