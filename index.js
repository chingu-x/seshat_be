const dotenv = require('dotenv')
const app = require('fastify')({logger: true})

dotenv.config( { path: './.env', silent: true } )

// handle CORS
app.register(require('fastify-cors'), { 
  // put your options here
  origin: true,
  methods: ["GET","POST", "DELETE", "PUT", "PATCH"]
})

//Handle Content-Type
app.addContentTypeParser('*', function (request, payload, done) {
  let data = ''
  payload.on('data', chunk => { data += chunk })
  payload.on('end', () => {
    done(null, data)
  })
})  

// Add the index route  
app.get('/', (request, response) => {
  response.send('You are in Index route')
})

// Register routes to handle Solo Project actions
const soloprojectRoutes = require('./routes/soloprojects')
soloprojectRoutes.forEach((route, index) => {
  app.route(route)
})

// Register routes to handle Facilitator actions
const facilitatorRoutes = require('./routes/facilitators')
facilitatorRoutes.forEach((route, index) => {
  app.route(route)
})

app.listen(3000, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening on ${address}`)
})
