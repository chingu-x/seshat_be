// Try this! https://www.digitalocean.com/community/tutorials/how-to-set-up-a-graphql-server-in-node-js-with-apollo-server-and-sequelize

import express from 'express'
import bodyParser from 'body-parser'
import router from './routes/routes.js'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/', router)

const serverPort = process.env.PORT || 3100
app.listen(serverPort, () => {
  console.log(`🚀 Server is listening on port: ${serverPort}`)
})