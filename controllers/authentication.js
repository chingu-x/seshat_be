const tokenURL = 'https://github.com/login/oauth/access_token'
const userURL = 'https://api.github.com/user'
const clientId = import.meta.env.VITE_CLIENT_ID
const secret = import.meta.env.VITE_CLIENT_SECRET

const getUser = async (token) => {
  return fetch(userURL, { 
    headers: { 
      Accept: 'application/json',
      Authorization: `Bearer ${ token }`,
    }
  })
  .then(response => response.json())
}

const getToken = async (code) => {
  return fetch(tokenURL, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: secret,
      code
    })
  })
  .then(response => response.json())
  .then(response => response.access_token)
}

const getAuthToken = async (request, response) => {
  console.log('getAuthToken - request: ', request)
  const token = await getToken(code)
  const user = await getUser(token)

  response.code(200).send({ user })

}

module.exports = {
  getAuthToken,
}
