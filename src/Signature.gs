/* Circuit breaking constant*/
var backendDissabled = true;

/* TODO - Replace with valid baseUrl */
var baseUrl = 'https://www.google.se';
var signatureRequestUrl = baseUrl + '/signature_requests/';  //base/signature_requests/{signatureRequestId}
var signatureImageUrl = baseUrl + '/images/'; // base/images/{imageId}.png

/**
 * Request the signature status id and query the status periodically (using 'signatureRequestId').
 *
 * @param {object} token, user's access token
 * @returns {object} signatureImageId
 */
function requestSignature(token) {
    Logger.log("signDocument with token: %s", token);
    var signatureRequestId  = null;
    var signatureImageId = null;

    // circuit breaker
    if(backendDissabled){
      return 'fakeSignatureImageId';
    }

    // request signature -> get signatureRequestId
    var auth =  "Bearer "+token;
    var response = httpPOSTRequest(signatureRequestUrl, auth, null);

    if( response.getResponseCode() === 200){

      signatureRequestId =  getAttributeFromHTTPResponse(response, 'id');
      var url = signatureImageUrl + signatureRequestId;

      // pull the request id until answer/timeout
      signatureImageId = periodicSignatureStatusPull(url, token);

    } else {

      signatureImageId = 'invalid';
    }

   return signatureImageId;
}


/**
 * Request the signature image id periodically from a given url
 *
 * @param {object} url, url of the resource
 * @returns {object} signatureImageId, the id of the siganture's image
 */
function periodicSignatureStatusPull(url, token){
    var timeout = 20; // 20 * 3000ms = 1 minute

    for (var timer = 0; timer < timeout; timer++) {

        response = httpGETRequest(url, token, null);

        // extract body and filter (status is nested in body)
        var status = getAttributeFromHTTPResponse(response, 'status');


        // check status
        if( status === 'denied'){

          return 'invalid';
        } else if( status === 'approved'){

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
    var preferredHeight = 60;

    // circuit breaker
    if(backendDissabled){
       var signatureImage = getFakeSignatureImage(signatureImageId);
       placeSignature(signatureImage,preferredHeight);
       return;
    }

    // request image
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


/**
 * Fetch the signature image from the back end using the ID.
 *
 * @param {object} signatureId, the unique identifier of a user signature.
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
 * Deprecated old method
 *
 * Execute HTTP GET on a given url.
 *
 * @param {object} url, request url in string format.
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
