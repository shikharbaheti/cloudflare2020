async function handleRequest(request) {
  const init = {
    headers: {
      'content-type': type,
    },
  }
  const HTML = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }
  const responses = await Promise.all([fetch(url1, init), fetch(url2, init)])
  const results = await Promise.all([gatherResponse(responses[0]), gatherResponse(responses[1])])
  const firstURL = results[1].variants[0];
  const secondURL = results[1].variants[1]
  const responsesTwo = await Promise.all([fetch(firstURL, init), fetch(secondURL, init)])
  const resultsTwo = await Promise.all([gatherResponse(responsesTwo[0]), gatherResponse(responsesTwo[1])])
  let doc1 = resultsTwo[0]
  let doc2 = resultsTwo[1]
  const NAME = 'shikhar-cloudflare'
  const VAR1 = new Response(doc1, HTML)
  const VAR2 = new Response(doc2, HTML)
  const cookie = request.headers.get('cookie')
  if (cookie && cookie.includes(`${NAME}=var1`)) {
    return VAR1
  } else if (cookie && cookie.includes(`${NAME}=var2`)) {
    return VAR2
  } else {
    let group = Math.random() < 0.5 ? 'var1' : 'var2'
    let response = group === 'var1' ? VAR1 : VAR2
    response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)
    return response
  }
}
addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})
/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get('content-type')
  if (contentType.includes('application/json')) {
    return await response.json()
  } else if (contentType.includes('application/text')) {
    return await response.text()
  } else if (contentType.includes('text/html')) {
    return await response.text()
  } else {
    return await response.text()
  }
}
/**
 * Example someHost is set up to return JSON responses
 * Replace url1 and url2  with the hosts you wish to
 * send requests to
 * @param {string} url the URL to send the request to
 */
const host = 'https://cfw-takehome.developers.workers.dev'
const url1 = host + '/api/variants'
const url2 = host + '/api/variants'
const type = 'application/json;charset=UTF-8'

function delete_cookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}