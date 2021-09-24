const Airtable = require('airtable')

const getAllFacilitators = async (request, response) => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE)
  const filter = "Status = \"" + "Accepted" + "\""

  let facilitators = []

  base('Facilitator Signups').select({ 
    fields: ['Discord ID', 'Role'],
    filterByFormula: filter,
    view: 'Facilitator Signups' 
  })
  .firstPage(async (error, records) => {
    if (error) {
      response.code(501).send(error)
    }
    for (let record of records) {
      try {
        const discordID = record.get('Discord ID')
        const role = record.get('Role')
        facilitators.push({
          discordID: discordID,
          role: role,
        })
      } catch (error) {
        console.log('Error in loop: ')
        response.code(501).send(error)
      }
    }
    response.code(200).send({ facilitators })
  })
}

module.exports = {
  getAllFacilitators,
}
