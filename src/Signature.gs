/**
 * Request the signature status periodically.
 * Uses a signatureRequestID.
 *
 * @param {object} user, some data about the user
 */
function signDocument(user) {
    Logger.log("signDocument for user: %s", user);
    var timeout = 12; // 12 * 5000ms = 1 minute
    var preferredHeight = 60;

    for (var timer = 0; timer < timeout; timer++) {
        var signature = getSignature(user);

        if (signature.getResponseCode() === 200) {
            Logger.log("signDocument -> Success");

            // var signatureId = JSON.parse(response.getContentText()).signatureId; // TODO Uncomment when start using the real end-point for the signatures
            var signatureId = null;
            var signatureImage = getSignatureImage(signatureId);

            placeSignature(signatureImage, preferredHeight);
            break;
        } else if (signature.getResponseCode() === 404) {
            Logger.log("signDocument -> Declined");
            // TODO Alert user that an error has occurred
            break;
        }

        Utilities.sleep(5000);
    }

    if (timer === timeout) {
        DocumentApp.getUi().alert('getSignature request timeout');
    }
}

/**
 * Get signature from the server.
 * Server should return status of signature readiness and id, in case if it is ready.
 *
 * @param {object} user, some data about the user
 * @returns {object} signature response
 */
function getSignature(user) {
    // TODO Perhaps we should also send id of the document, then server can handle signatures for several documents of one user at the same time.
    // var documentId = DocumentApp.getActiveDocument().id;
    Logger.log("getSignature for user: %s", user);
    return httpGETRequest("http://blog.stackexchange.com/", user); // TODO Change to real end-point
}

/**
 * Fetch the signature image from the back end using the ID.
 *
 * @param {object} signatureId, the unique identifier of a user signature.
 * @returns {object} signature image
 */
function getSignatureImage(signatureId, user) {
    Logger.log("getSignatureImage for id: %s", signatureId);
    // TODO Use signatureId in the link here
    var response = httpGETRequest("https://raw.githubusercontent.com/ww6015132/SilkySignature/master/signature.png", user);
    return response.getBlob();
}

/**
 * Place a signature image.
 *
 * @param {Blob} signatureImage, signature image in Blob object
 * @param {Integer} preferredHeight, preferred height of an image in a document
 */
function placeSignature(signatureImage, preferredHeight) {
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
 * Execute HTTP GET on a given url.
 *
 * @param {object} url, request url in string format.
 * @returns {object} HTTP response
 */
function httpGETRequest(url, user) {
    // TODO Add user credentials and/or token to the request
    var options = {
        "method": "GET",
        "followRedirects": true,
        "muteHttpExceptions": true
    };

    var response = UrlFetchApp.fetch(url, options);

    Logger.log("GET %s : %s", url, response.getResponseCode());
    return response;
}