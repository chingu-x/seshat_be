const express = require('express')
const { getDiscordChannelMsgs } = require('../controllers/getDiscordChannelMsgs.js')
const { wakeUp } = require('../controllers/wakeup')

const router = express.Router();

router.route('/resources')
  .get(getDiscordChannelMsgs)
router.route('/wakeup')
  .get(wakeUp)    

module.exports = router