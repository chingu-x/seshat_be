const facilitatorsController = require('../controllers/facilitators')

const routes = [
  {
    method: 'GET',
    url: '/api/facilitators',
    handler: facilitatorsController.getAllFacilitators
  }
]

module.exports = routes