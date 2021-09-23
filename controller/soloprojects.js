const Airtable = require('airtable')

const getCalendarEvents = (req, res) => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)
  const filter = "Type = \"" + "Voyage" + "\""

  let scheduledVoyages = []

  base('Schedules').select({ 
    pageSize: 12,
    fields: ['Name', 'Type', 'Start Date', 'End Date'],
    filterByFormula: filter,
    view: 'Schedules' 
  })
  .firstPage(function page(err, records) {
    if (err) { console.error(err); return; }

    records.forEach(function(record) {
      try {
        const voyageName = record.get('Name')
        const voyageStartDt = record.get('Start Date')
        const voyageEndDt = record.get('End Date')
        console.log('Retrieved', record.get('Name'))
        scheduledVoyages.push({
          voyageName: voyageName,
          startDt: voyageStartDt,
          endDt: voyageEndDt,
        })
      } catch (e) {
        console.log(e);
      }
    })
      return scheduledEvents
  })
}

module.exports = {
  getCalendarEvents,
}
