import chalk from 'chalk'
import Discord from '../util/Discord.js'
import { GUILD_TEXT, GUILD_FORUM } from '../util/constants.js'

let discordIntf

// Extract team message metrics from the Discord channels
const getMessageTags = async (req, res) => {
  console.log(chalk.white(`...Connecting to Discord...`))
  discordIntf = new Discord()
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN
  const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID
  const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID

  const client = discordIntf.getDiscordClient()
  await client.login(DISCORD_TOKEN)
  console.log(chalk.white(`...Discord client established...`))

  const guild = await client.guilds.fetch(DISCORD_GUILD_ID)
  discordIntf.setGuild(guild)
  console.log(chalk.white(`...Connection to Discord established...`))

  try {
    client.on('ready', async () => {
      console.time(chalk.white(`...Fetching all tags`))

      // Retrieve all tags in the channel.
      const channel = await discordIntf.getChannel(DISCORD_CHANNEL_ID)
      //console.log(`channel: `, channel)
      console.log(`getMessageTags - channel:`, channel)
      let tags = []
      channel.availableTags.forEach(tag => {
        console.log(`...tag:`, tag.name)
        tags.push({tag: tag.name})
      })

      console.timeEnd(chalk.white(`...Fetching all tags`))
      res.status(200).json(tags)
      
      // Terminate processing
      discordIntf.commandResolve('done')
    })
  }
  catch(err) {
    console.log(err)
    await client.destroy() // Terminate this Discord bot
    discordIntf.commandReject('fail')
  }

  // Login to Discord
  try {
    await client.login(DISCORD_TOKEN)
    return discordIntf.commandPromise
  }
  catch (err) {
    console.error(`Error logging into Discord. Token: ${ DISCORD_TOKEN }`)
    console.error(err)
    //overallProgress.stop()
    discordIntf.commandReject('fail')
  }
}

export default getMessageTags
