const express = require('express');
const utils = require('../utils');

const { eventBus } = utils;
const router = express.Router();

/**
 * Print access token to stdout.
 */
router.get('/forgot', (req, res) => {
  eventBus.emit(eventBus.EVENT_TOKEN_FORGOT, {
    ipAddr: req.headers['x-real-ip'] || req.ip,
    userAgent: req.headers['user-agent']
  });

  console.log(`Your access token is ${utils.token}`);
  res.send({ status: 'ok' });
});

/**
 * Check one access token is valid or not.
 */
router.get('/check', (req, res) => {
  res.send({
    status: 'ok',
    result: (req.query.token ? req.query.token === utils.token : false)
  });
});

module.exports = router;
