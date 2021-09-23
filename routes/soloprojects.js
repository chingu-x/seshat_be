const soloprojectsController = require('../controller/soloprojects')

const routes = [
  {
    method: 'GET',
    url: '/api/soloprojects/calendarevents',
    handler: soloprojectsController.getCalendarEvents
  }
]

module.exports = routes
