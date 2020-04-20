// this class changes HTML that is input into the function.
class handleHTMLChanges {
  element(element) {
    // perform actions only when the tag being passed into is of 'p'.
    if (element.tagName == "p") {
      element.replace("Welcome to Shikhar Baheti's Workers' App! Please click the link below to access my personal website to know more about me!");
    }
    // perform actions only when the tag being passed into is of 'a'.
    if (element.tagName == "a") {
      element.setAttribute("href", "https://whycloudflare.shikharbaheti.net/");
      element.setAttribute("target", "_blank")
      element.setInnerContent("Shikhar's Personal website");
    }
    // perform actions only when the tag being passed into is of 'title'.
    if (element.tagName == "title") {
      element.prepend("Welcome to ");
    }
    // perform actions only when the tag being passed into is of 'h1'.
    if (element.tagName == "h1") {
      element.prepend("This is ");
    }
  }
}
async function handleRequest(request) {
  // INIT is used to make a query with default content-type of JSON
  const init = {
    headers: {
      'content-type': type,
    },
  }
  // HTML is used to respond to the broswer indicating that we'd like to present a HTML webpage to the user
  const HTML = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }
  // making a fetch call to the webpage URL (API) presented initially (twice).
  const variantResponses = await Promise.all([fetch(url1, init), fetch(url2, init)])
  // reciving responses from the initial webpages (as JSON) and storing them in an array. 
  const variantResults = await Promise.all([gatherResponse(variantResponses[0]), gatherResponse(variantResponses[1])])
  //reciving two URLs (two different variant webpages)
  const firstURL = variantResults[1].variants[0];
  const secondURL = variantResults[1].variants[1]

  //making fetch calls to the variant webpage URLs
  const variantWebPageResponse = await Promise.all([fetch(firstURL, init), fetch(secondURL, init)])
  // reciving responses from the variant webpages (as HTML) and storing them in an array. 
  const variantWebPageResult = await Promise.all([gatherResponse(variantWebPageResponse[0]), gatherResponse(variantWebPageResponse[1])])
  //store two differnt webpages into variables from the array. 
  let webPage1 = variantWebPageResult[0]
  let webPage2 = variantWebPageResult[1]
  // making a cookie
  const NAME = 'shikhar-cloudflare'
  // making webpages from the recieved responses. 
  const VARIANT1 = new Response(webPage1, HTML)
  const VARIANT2 = new Response(webPage2, HTML)
  // requesting a cookie from the browser. 
  const cookie = request.headers.get('cookie')

  // PERSISTANT WEB-PAGES

  // if the cookie is already present with variant 1, present it. 
  if (cookie && cookie.includes(`${NAME}=var1`)) {
    return REWRITER.transform(VARIANT1);
    //otherwise, present variant 2. 
  } else if (cookie && cookie.includes(`${NAME}=var2`)) {
    return REWRITER.transform(VARIANT2);
  } // if first time visiting my web-page, create a new cookie with 50/50 change of hitting one of the variants. 
  else {
    let group = Math.random() < 0.5 ? 'var1' : 'var2'
    // ternary operator to determine if the 
    let response = group === 'var1' ? VARIANT1 : VARIANT2
    // create a cookie and store it in the header. 
    response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)

    // RETURN response to the browser with the HTML edited for our purposes. 
    return REWRITER.transform(response);
  }
}

// a rewriter by initiating HTMLRewriter and calling it on various elements of the response HTML
const REWRITER = new HTMLRewriter().on('p#description', new handleHTMLChanges()).on('a#url', new handleHTMLChanges()).on('title', new handleHTMLChanges()).on('head', new handleHTMLChanges()).on('h1#title', new handleHTMLChanges());

// listens for HTTP requests dispatched to a Worker
addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})

// converts the response to respective types. 
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

// describes the intial URLs at which the fetch requests will be made. 
const host = 'https://cfw-takehome.developers.workers.dev'
const url1 = host + '/api/variants'
const url2 = host + '/api/variants'
const type = 'application/json;charset=UTF-8'