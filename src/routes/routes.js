import express from 'express'
import getDiscordChannelMsgs from '../controllers/getDiscordChannelMsgs.js'
import wakeUp from '../controllers/wakeup.js'
import getMessageTags from '../controllers/getMessageTags.js'

const router = express.Router()

router.route('/resources')
  .get(getDiscordChannelMsgs)
router.route('/tags')
  .get(getMessageTags)
router.route('/wakeup')
  .get(wakeUp)    

export default router