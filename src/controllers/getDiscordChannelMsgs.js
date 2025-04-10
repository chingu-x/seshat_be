import chalk from 'chalk'
import Discord from '../util/Discord.js'
import { GUILD_TEXT, GUILD_FORUM } from '../util/constants.js'

let discordIntf
let messageSummary = []

// Invoked as a callback from Discord.fetchAllMessages this fills in the
// `messageSummary` object for each voyage, team, sprint, and team member.
const collectMessages = async (message, messageSummary) => {
  return new Promise(async (resolve, reject) => {
    console.log('extractDiscordChannelMsgs - summarizeMessages - message:', message)
    const discordUserName = message.author.username
      try {
        // Update the array of messages 
        messageSummary.push({
          message: message, 
          createdAt: message.createdAt
        })
        resolve()
      } catch (error) {
        console.log(chalk.white(`extractDiscordChannelMsgs - summarizeMessages: Error processing teamNo: ${ chalk.green(teamNo) } sprintNo: ${ chalk.green(sprintNo) }`))
        console.log(chalk.white(error))
        reject(error)
      }
  })
}

// Extract team message metrics from the Discord channels
const getDiscordChannelMsgs = async (req, res) => {
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
      console.time(chalk.white(`...Fetching all messages`))

      // Retrieve all messages in the channel. There is one row in the channel
      // messageSummary array for each team and within each row there is
      // an embedded array with one cell per Sprint.
      const channel = discordIntf.getChannel(DISCORD_CHANNEL_ID)
      if (channel.type === GUILD_TEXT) {
        await discordIntf.fetchAllMessages(channel, collectMessages, messageSummary)
      } else if (channel.type === GUILD_FORUM) {
        const threads = await channel.threads.fetch()
        const forumThreads = Array.from(threads.threads).map(thread => thread[1])
        for (let thread of forumThreads) {
        await discordIntf.fetchAllMessages(thread, collectMessages, messageSummary)
        }
      } else {
        console.log(chalk.white(`Skipping unsupported channel type - ${ chalk.green(channel.type) } / ${ chalk.green(channel.id) } / ${ chalk.green(channel.name) }`))
      }

      console.timeEnd(chalk.white(`...Fetching all messages`))

      console.timeEnd(chalk.white(`...Updating Voyage Status...`))

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

export default getDiscordChannelMsgs