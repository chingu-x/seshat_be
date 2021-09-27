const authController = require('../controllers/authentication')

const routes = [
  {
    method: 'GET',
    url: '/api/auth/getauthtoken',
    handler: authenticationController.getAuthToken
  }
]

module.exports = routes