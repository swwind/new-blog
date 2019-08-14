const express = require('express');
const utils = require('../utils');
const config = require('../config');

const router = express.Router();

/**
 * Get all categories from posts. Read only.
 */
router.get('/', async (req, res) => {
  let categories;
  try {
    categories = await utils.db.conn.collection('posts').distinct('category');
  } catch (e) {
    /* istanbul ignore next */
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL
    });
  }
  return res.send({
    status: 'ok',
    categories
  });
});

/**
 * Get all posts with the same category. Read only.
 */
router.get('/:category/posts', async (req, res) => {
  const page = Math.max(req.query.page ? req.query.page - 1 : 0, 0);
  let posts, count;
  try {
    const cursor = utils.db.conn.collection('posts').find({ category: req.params.category }, { sort: [['date', 'desc']] }).skip(page * config.page.size).limit(config.page.size);
    posts = await cursor.toArray();
    count = await cursor.count();
  } catch (e) {
    /* istanbul ignore next */
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL
    });
  }

  for (const post of posts) {
    delete post.replies;
  }

  if (posts.length === 0) {
    return res.status(404).send({
      status: 'error',
      message: 'the specified resources cannot be found on this server.'
    });
  }

  return res.send({
    status: 'ok',
    posts: utils.render(posts, { preview: true, acceptLanguage: req.headers['accept-language'] }),
    page: {
      size: config.page.size,
      max: Math.floor(count / config.page.size) + (count % config.page.size === 0 ? 0 : 1),
      current: page + 1
    }
  });
});

module.exports = router;
