const Airtable = require('airtable')

const getCalendarEvents = async (request, response) => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)
  const now = new Date()
  const filter = "AND(" + 
    "IS_AFTER({Start Date},DATETIME_PARSE(\"" + now.toISOString().slice(0,10) + "\",\"YYYY-MM-DD\")), " +
    "Type = \"" + "Voyage" + "\"" +
  ")"

  let scheduledVoyages = []

  base('Schedules').select({ 
    // fields: ['Name', 'Type', 'Start Date', 'End Date'],
    filterByFormula: filter,
    view: 'Schedules' 
  })
  .firstPage(async (error, records) => {
    if (error) {
      response.code(501).send(error)
    }
    for (let record of records) {
      try {
        const voyageName = record.get('Name')
        const voyageStartDt = record.get('Start Date')
        const voyageEndDt = record.get('End Date')
        scheduledVoyages.push({
          voyageName: voyageName,
          startDt: voyageStartDt,
          endDt: voyageEndDt,
        })
      } catch (error) {
        console.log('Error in loop: ')
        response.code(501).send(error)
      }
    }
    response.code(200).send({ scheduledVoyages })
  })
}

module.exports = {
  getCalendarEvents,
}
