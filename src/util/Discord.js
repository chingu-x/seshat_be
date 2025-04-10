import chalk from 'chalk'
import { Client, GatewayIntentBits } from 'discord.js'
import { GUILD_CATEGORY, GUILD_TEXT, GUILD_PUBLIC_THREAD, GUILD_FORUM} from './constants.js'
export default class Discord {
  
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,      ],
    })
    this.login = null
    this.guild = null

    // Since extraction occurs within the `client.on` block these promises are
    // returned to the extract/audit callers and resolved by calling 
    // `this.commandResolve()` when functions like `createVoyageChannels()` 
    // have completed.
    this.commandResolve = null
    this.commandReject = null
    this.commandPromise = new Promise((resolve, reject) => {
      this.commandResolve = resolve
      this.commandReject = reject
    })
  }

  // Fetch all messages in a Discord channel posted by a specific user
  async fetchMessagesFromUser(channel, posterId) {
    let isMoreMessages = true
    let fetchOptions = { limit: 100 }
    try {
      let shopLogPosts = []
      do {
        const messages = await channel.messages.fetch(fetchOptions)
        if (messages.size > 0) {
          for (let [messageID, message] of messages) {
            const fromChingu = message.author.id === posterId ? true : false
            if (fromChingu) {
              shopLogPosts.push({
                messageId: message.id,
                username: message.author.username,
                authorId: message.author.id,
                createdAt: message.createdTimestamp,
                content: message.content
              })
            }
          }
          fetchOptions = { limit: 100, before: messages.last().id }
        } else {
          isMoreMessages = false // Stop fetching messages for this channel
        }
      } while (isMoreMessages)
      return shopLogPosts
    } catch (error) {
      console.error(error)
      throw new Error(`Error retrieving messages for channel: ${ channel.name } ${ error }`)
    }
  }

  // Fetch all messages from the selected Discord team channels.
  // Note that the `callback` routine is invoked for each message to
  // accumulate any desired metrics.
  async fetchAllMessages(channel, callback, messageSummary) {
    let isMoreMessages = true
    let fetchOptions = { limit: 100 }
    try {
      do {
        const messages = await channel.messages.fetch(fetchOptions)
        if (messages.size > 0) {
          for (let [messageID, message] of messages) {
            await callback(message, messageSummary) // Invoke the callback function to process messages
          }
          fetchOptions = { limit: 100, before: messages.last().id }
        } else {
          isMoreMessages = false // Stop fetching messages for this channel
        }
      } while (isMoreMessages)
      return
    } catch (error) {
      console.error(error)
      throw new Error(`Error retrieving messages for channel: ${ channel.name } ${ error }`)
    }
  }

  getDiscordClient() {
    return this.client
  }
    
  // Retrieve the users Discord name using their unique id
  async getGuildUser(discordId) {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await this.guild.members.fetch()
        for (let user of users) {
          const [id, userInfo] = user
          if (id === discordId) {
            resolve(userInfo)
          }
        }
        reject(null)
      }
      catch(error) {
        console.error('='.repeat(30))
        console.error(`Error retrieving user ${ discordId } from Discord:`)
        console.error(error)
        reject(null)
      }
    })
  }

  // Get a specific channel which matches the caller-supplied regular expression
  async getChannel(channelID) {
    let guildChannels = await this.guild.channels.fetch()

    // Retrieve the requested channel
    for (let [channelId, channel] of guildChannels) {
      if (channelID === channel.id) {
        return channel
      }
    }
    
    return undefined
  }

  // Get the team channels and their parent categories for the specified Voyage. 
  async getTeamChannels(voyageName, categoryRegex, channelRegex) {
    console.log(chalk.white(`getTeamChannels - voyageName:${ chalk.green(voyageName) } categoryRegex:${ chalk.green(categoryRegex) } channelRegex:${ chalk.green(channelRegex) }`))
    // Locate all the categories for this Voyage
    let voyageCategories = []
    let guildChannels = await this.guild.channels.fetch()
    let categoryIds = []
    guildChannels.forEach(guildChannel => {
      if (guildChannel.type === GUILD_CATEGORY && guildChannel.name.toUpperCase().substring(0,3) === voyageName.toUpperCase()) {
        voyageCategories.push(guildChannel)
        categoryIds.push(guildChannel.id)
      }
    })

    // Retrieve the list of channels for this Voyage
    // Start by building a list of all text and forum channels owned by the
    // selected categories
    let voyageChannels = []
    guildChannels.forEach(channel => {
      const categoryFound = categoryIds.includes(channel.parentId)
      if (categoryFound === true) {
        voyageChannels.push(channel)
      }
    })

    // Sort the team channels by their names 
    let sortedChannels = []
    for (let channel of voyageChannels) {
      const result = channel.name.match(channelRegex)
      if (result !== null) {
        sortedChannels.push(channel)
      }
    }
    sortedChannels.sort((a, b) => {
      // Sort in ascending team number sequence
      return parseInt(a.name.substr(a.name.length - 2)) >= parseInt(b.name.substr(b.name.length - 2)) 
        ? 1 
        : -1
    })
    
    return sortedChannels
  }

  setGuild(guild) {
    this.guild = guild
  }

}