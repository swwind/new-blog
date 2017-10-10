const express = require('express');
const utils = require('../utils');
const { ObjectID } = require('mongodb');

let router = express.Router();

/**
 * Get all enabled widgets
 * GET /api/widget
 */
router.get('/', async (req, res) => {
  let widgets;
  try {
    widgets = await utils.db.conn.collection('widgets').find({ enabled: true }).toArray();
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL
    });
  }
  return res.send({
    status: 'ok',
    widgets,
  });
});

/**
 * Get all widgets.
 * GET /api/widget/all
 */
router.get('/all', async (req, res) => {
  let widgets;
  try {
    widgets = await utils.db.conn.collection('widgets').find().toArray();
  } catch (e) {
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL
    });
  }
  return res.send({
    status: 'ok',
    widgets,
  });
});

/**
 * Update one widget by it's ObjectID.
 * POST /widget/:id
 */
router.post('/:id', async (req, res) => {
  if (req.query.token !== utils.token) {
    return res.status(400).send({
      status: 'error',
      message: utils.messages.ERR_ACCESS_DENIED,
    });
  }

  try {
    await utils.db.conn.collection('widgets').findAndModify(
      { _id: ObjectID(req.params.id) },
      [],
      { $set: { title: req.body.title, content: req.body.content, enabled: req.body.enabled }}
    );
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL,
    });
  }

  res.send({ status: 'ok' });
});

/**
 * Add a new widget.
 * PUT /api/widget
 */
router.put('/', async (req, res) => {
  if (req.query.token !== utils.token) {
    return res.status(400).send({
      status: 'error',
      message: utils.messages.ERR_ACCESS_DENIED,
    });
  }

  let r;
  try {
    r = await utils.db.conn.collection('widgets').insert({
      title: req.body.title,
      content: req.body.content,
      enabled: !!req.body.enabled
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL,
    });
  }

  res.send({ status: 'ok', _id: r.insertedIds[0] });
});

/**
 * Delete a widget.
 */
router.delete('/:id', async (req, res) => {
  if (req.query.token !== utils.token) {
    return res.status(400).send({
      status: 'error',
      message: utils.messages.ERR_ACCESS_DENIED,
    });
  }

  try {
    await utils.db.conn.collection('widgets').remove(
      { _id: ObjectID(req.params.id) }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      status: 'error',
      message: utils.messages.ERR_MONGO_FAIL,
    });
  }

  res.send({ status: 'ok' });
});

module.exports = router;
