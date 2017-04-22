var baseUrl = 'http://signature-verification.us-east-1.elasticbeanstalk.com';
var signatureRequestUrl = baseUrl + '/signature_requests';
var signatureImageUrl = baseUrl + '/images/';

/**
 * Request the signature status id and query the status periodically (using 'signatureRequestId').
 *
 * @param {object} token, user's access token
 * @returns {object} signatureImageId
 */
function requestSignature(token) {
    Logger.log("Sign Request with token: %s", token);
    var signatureRequestId = null;
    var signatureImageId = null;

    // circuit breaker
    if (backendDissabled) {
        return 'fakeSignatureImageId';
    }

    var headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    Logger.log("Request signatureRequestId");
    Logger.log("POST on: %s", signatureRequestUrl);
    Logger.log("POST with: %s", headers);

    var response = httpPOSTRequest(signatureRequestUrl, headers, "");

    if (response.getResponseCode() == 200 || response.getResponseCode() == 201) {
        Logger.log("GOOD signatureRequestId");

        signatureRequestId = getAttributeFromHTTPResponse(response, 'id');
        Logger.log("Signature Request Id: %s ", signatureRequestId);

        var url = signatureRequestUrl + '/' + signatureRequestId;
        signatureImageId = periodicSignatureStatusPull(url, token);
    } else {
        Logger.log("INVALID signatureRequestId");
        signatureImageId = 'invalid';
    }

    return signatureImageId;
}

/**
 * Request the signature image id periodically from a given url.
 *
 * @param {object} url, url of the resource
 * @returns {object} signatureImageId, the id of the siganture's image
 */
function periodicSignatureStatusPull(url, token) {
    var timeout = 40; // 40 * 3000ms = 2 minute

    for (var timer = 0; timer < timeout; timer++) {
        Logger.log('Periodically pull status');

        var headers = {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        response = httpGETRequest(url, headers);
        var status = getAttributeFromHTTPResponse(response, 'status');

        if (status === 'denied') {
            return 'invalid';
        } else if (status === 'approved') {
            signatureImageId = getAttributeFromHTTPResponse(response, 'imageId');
            return signatureImageId;
        }

        Utilities.sleep(3000);
    }

    // should not reach
    DocumentApp.getUi().alert('getSignature request timeout');
    return 'invalid';
}

/**
 * Fetch signature from a server and place it into a document.
 *
 * @param {object} signatureImageId
 */
function signDocument(token, signatureImageId) {
    Logger.log("SignDoc: %s || %s", token, signatureImageId);
    var preferredHeight = 60;

    // circuit breaker
    if (backendDissabled) {
        var signatureImage = getFakeSignatureImage(signatureImageId);
        placeSignature(signatureImage, preferredHeight);
        return;
    }

    var headers = {
        'Authorization': 'Bearer ' + token
    };
    var url = signatureImageUrl + signatureImageId + '.png';
    var response = httpGETRequest(url, headers);
    var image = response.getBlob();

    placeSignature(image, preferredHeight);
}

/**
 * Prevent the bug of new chrome tab open when button clicked.
 */
function emptyFunc() {}

/**
 * Fetch the signature image from the back end using the ID.
 *
 * @param {object} signatureId, the unique identifier of a user signature
 * @returns {object} signature image
 */
function getFakeSignatureImage(signatureId) {
    var response = oldHttpGETRequest("https://raw.githubusercontent.com/ww6015132/SilkySignature/master/signature.png");
    return response.getBlob();
}

/**
 * Place a signature image.
 *
 * @param {Blob} signatureImage, signature image in Blob object
 * @param {Integer} preferredHeight, preferred height of an image in a document
 */
function placeSignature(signatureImage, preferredHeight) {
    if (signatureImage == null) {
        Logger.log("Signature image is null");
    }
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();
    var cursor = doc.getCursor();
    var element = cursor.getElement();
    var parent = element.getParent();

    var image = body.insertImage(parent.getChildIndex(element) + 1, signatureImage);
    var width = image.getWidth();
    var height = image.getHeight();
    var resize = (preferredHeight * 1.0) / height;

    image.setHeight(preferredHeight);
    image.setWidth(width * resize);
}

/**
 * Deprecated.
 *
 * Execute HTTP GET on a given url.
 *
 * @param {object} url, request url in string format
 * @returns {object} HTTP response
 */
function oldHttpGETRequest(url) {
    var options = {
        "method": "GET",
        "followRedirects": true,
        "muteHttpExceptions": true
    };

    return UrlFetchApp.fetch(url, options);
}
