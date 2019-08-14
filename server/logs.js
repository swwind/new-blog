const express = require('express');
const utils = require('../utils');

const router = express.Router();

/**
 * Get lastest 50 records of logs.
 */
router.get('/', async (req, res) => {
  if (req.query.token !== utils.token) {
    return res.status(403).send({
      status: 'error',
      message: utils.messages.ERR_ACCESS_DENIED
    });
  }

  return res.send({
    status: 'ok',
    logs: utils.logger.logs
  });
});

module.exports = router;
