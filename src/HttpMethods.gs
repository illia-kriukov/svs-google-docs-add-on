/**
 * Execute HTTP GET on a given url.
 *
 * @param {object} url, request url in string format
 * @param {object} auth, authentication header in string format
 * @param {object} body, request body in JS object format
 * @returns {object} HTTP response
 */
function httpGETRequest(url, headers) {
    var options = {
        'method': 'GET',
        'headers': headers,
        'contentType': 'application/json',
        'followRedirects': true,
        'muteHttpExceptions': true,
        'crossDomain': true,
        'async': true,
        'validateHttpsCertificates': false
    };

    var response = UrlFetchApp.fetch(url, options);

    Logger.log("GET %s : %s", url, response.getResponseCode());
    Logger.log("GET %s : %s", url, response);

    return response;
}

/**
 * Execute HTTP POST on a given url.
 *
 * @param {object} url, request url in string format
 * @param {object} auth, authentication header in string format
 * @param {object} body, request body in JS object format
 * @returns {object} HTTP response
 */
function httpPOSTRequest(url, headers, body) {
    if (body) {
        var options = {
            'method': 'POST',
            'headers': headers,
            'payload': body,
            'followRedirects': true,
            'muteHttpExceptions': true
        };
    } else {
        var options = {
            'method': 'POST',
            'headers': headers,
            'followRedirects': true,
            'muteHttpExceptions': true
        };
    }

    var response = UrlFetchApp.fetch(url, options);

    Logger.log("POST %s : %s", url, response.getResponseCode());
    Logger.log("POST %s : %s", url, response);

    return response;
}

/**
 * Extract body attribute value from HTTPResponse.
 *
 * @param {object} response, HTTPResponse object
 * @param {object} attribute, string key of attribute
 * @returns {object} attribute value
 */
function getAttributeFromHTTPResponse(response, attribute) {
    var responseBodyJSON = JSON.parse(response);

    Logger.log('From: %s', response);
    Logger.log('Extracting: %s', responseBodyJSON['' + attribute]);

    return responseBodyJSON['' + attribute];
}
