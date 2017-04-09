/* TODO - Replace with valid baseUrl */
var baseUrl = 'https://www.google.se';
var signatureRequestUrl = baseUrl + '/signature_requests/';
var signatureImageUrl = baseUrl + '/images/'; // base/images/{imageId}.png

/**
 * Request the signature status id and query the status periodically (using 'signatureRequestId').
 *
 * @param {object} token, user's access token
 * @returns {object} signatureImageId
 */
function requestSignature(token) {
    Logger.log("signDocument with toke: %s", token);
    var timeout = 20; // 20 * 3000ms = 1 minute
    var signatureRequestId  = null;
    var signatureImageId = null;


    // request signature -> get signatureRequestId
    var auth =  "Bearer "+token;
    var response = httpPOSTRequest(signatureRequestUrl, auth, null);

    if( response.getResponseCode() === 200){

      signatureRequestId =  getAttributeFromHTTPResponse(response, 'id');

    } else {

      return 'invalid';
    }


    // request the signature request status every 3s for 1 minute
    for (var timer = 0; timer < timeout; timer++) {
        var url = signatureImageUrl + signatureRequestId;
        response = httpGETRequest(url, token, null);

        // extract body and filter (status is nested in body)
        var status = getAttributeFromHTTPResponse(response, 'status');

        // analyze status

        if( status === 'denied'){
          return 'invalid';
        }

        if( status === 'approved'){
          // signature image ready
          signatureImageId = getAttributeFromHTTPResponse(response, 'imageId');
          return signatureImageId;
        }

        Utilities.sleep(3000);
    }

    // should not reach
    if (timer === timeout)
        DocumentApp.getUi().alert('getSignature request timeout');

    return 'invalid';
}

/**
 * Fetch signature from a server and place it into a document.
 *
 * @param {object} signatureImageId
 */
function signDocument(token, signatureImageId) {
    var preferredHeight = 60;

    /* TODO  dummy code until api ready */
    var signatureImage = oldGetSignatureImage(signatureImageId);
    placeSignature(signatureImage,preferredHeight);
    return;
    /* --- */

    var url = signatureImageUrl + signatureImageId + '.png';
    var image  = httpGETRequest(url, token, null);

    placeSignature(image,preferredHeight);
}


/**
*
* Prevent the bug of new chrome tab open when button clicked
*
*/
function emptyFunc(){
}






/* OLD AND UN-USED METHODS */


/**
 * Request signature request status from server
 * Server returns status and signatureImageId
 *
 * @param {object} token, user token
 * @param {object} signatureRequestId, signature request ID
 * @returns {object} imageId
 */
function _getSignatureRequestStatus(token, signatureRequestId) {
    // POST request
    httpPOSTRequest();

    // TODO Perhaps we should also send id of the document, then server can handle signatures for several documents of one user at the same time.
    // var documentId = DocumentApp.getActiveDocument().id;
    Logger.log("getSignature for user: %s", user);
    return oldHttpGETRequest("http://blog.stackexchange.com/", user); // TODO Change to real end-point
}

/**
 * Fetch the signature image from the back end using the ID.
 *
 * @param {object} signatureId, the unique identifier of a user signature.
 * @returns {object} signature image
 */
function oldGetSignatureImage(signatureId, user) {
    Logger.log("oldGetSignatureImage for id: %s", signatureId);
    // TODO Use signatureId in the link here
    var response = oldHttpGETRequest("https://raw.githubusercontent.com/ww6015132/SilkySignature/master/signature.png", user);
    return response.getBlob();
}

/**
 * Place a signature image.
 *
 * @param {Blob} signatureImage, signature image in Blob object
 * @param {Integer} preferredHeight, preferred height of an image in a document
 */
function placeSignature(signatureImage, preferredHeight) {
    if(signatureImage==null){
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
 * TODO deprecated old method
 *
 * Execute HTTP GET on a given url.
 *
 * @param {object} url, request url in string format.
 * @returns {object} HTTP response
 */
function oldHttpGETRequest(url, user) {
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
