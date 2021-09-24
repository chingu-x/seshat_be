const soloprojectsController = require('../controllers/soloprojects')

const routes = [
  {
    method: 'GET',
    url: '/api/soloproject/calendarevents',
    handler: soloprojectsController.getCalendarEvents
  }
]

module.exports = routes
