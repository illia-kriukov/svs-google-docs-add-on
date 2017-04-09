/**
 * Execute HTTP GET on a given url.
 *
 * @param {object} url, request url in string format.
 * @param {object} auth, authentication header in string format.
 * @param {object} body, request body in JS object format.
 * @returns {object} HTTP response
 */
function httpGETRequest(url, auth, body) {

  // request headers
  var headers = {
    Authorization: auth
  };

  // requests body
  var data = body;

  // request options
  var options = {
    'method' : 'GET',
    'headers': headers,
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data),
    "followRedirects": true,
    "muteHttpExceptions": true
  };

    var response = UrlFetchApp.fetch(url, options);

    Logger.log("GET %s : %s", url, response.getResponseCode());
    return response;
}



/**
 * Execute HTTP POST on a given url.
 *
 * @param {object} url, request url in string format.
 * @param {object} auth, authentication header in string format.
 * @param {object} body, request body in JS object format.
 * @returns {object} HTTP response
 */
function httpPOSTRequest(url, auth, body) {

  // request headers
  var headers = {
    Authorization: auth
  };

  // requests body
  var data = body;

  // request options
  var options = {
    'method' : 'POST',
    'headers': headers,
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data),
    "followRedirects": true,
    "muteHttpExceptions": true
  };

    var response = UrlFetchApp.fetch(url, options);

    Logger.log("POST %s : %s", url, response.getResponseCode());
    return response;
}


/**
 * Extract body attribute value from HTTPResponse
 *
 * @param {object} response, HTTPResponse object.
 * @param {object} attribute, string key of attribute.
 * @returns {object} attribute value.
 */
function getAttributeFromHTTPResponse(response, attribute){

    var responseBodyJSON  = response.getContentText();
    var data = JSON.parse(responseBodyJSON);
    return data[attribute];
}
