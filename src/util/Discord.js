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
  async fetchAllMessages(thread, callback, messageSummary) {
    let isMoreMessages = true
    let fetchOptions = { limit: 100 }
    let lastMessageID = null
    try {
      // Fetch messages in the channel
      do {
        const messages = await thread.messages.fetch(fetchOptions)
        if (messages.size > 0) {
          for (let [messageID, message] of messages) {
            // Invoke the callback function to process messages
            await callback(message, thread.name, thread.appliedTags,  messageSummary)
            lastMessageID = messageID
          }
          fetchOptions = { limit: 100, cache: false, before: lastMessageID}
        } else {
          isMoreMessages = false // Stop fetching messages for this channel
        }
      } while (isMoreMessages)
      // Resolve the command promise
      return
    } catch (error) {
      console.error(error)
      throw new Error(`Error retrieving messages for channel: ${ thread.name } ${ error }`)
    }
  }

  getDiscordClient() {
    return this.client
  }

  // Get a specific channel which matches the caller-supplied regular expression
  async getChannel(channelID) {
    let channel = await this.guild.channels.fetch(channelID, {force: true})
    return channel
  }

  setGuild(guild) {
    this.guild = guild
  }

}