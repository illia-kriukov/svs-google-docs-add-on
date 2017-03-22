/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start SVS', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Signature Addon');
  DocumentApp.getUi().showSidebar(ui);
}


/**
 * Fetch the signature image from the back end using the ID.
 *
 * @param {object} signatureId, the unique identifier of a user signature.
 */
function getSignature(signatureId){

  var resp = UrlFetchApp.fetch("https://raw.githubusercontent.com/ww6015132/SilkySignature/master/signature.png"); //TODO use signatureId in the link here
  Logger.log("getSignature : %s", signatureId);
  return resp.getBlob();
}

/**
 * Request the signature status periodically. Uses a signatureRequestID.
 *
 * @param {object} user, some data form the user
 */
function requestSignature(user){
  Logger.log("-requestSignature STARTED");

  var timeout = 12; // 12 * 5000ms = 1minute

  Logger.log("requestSignature for user: %s",user);

  for(var timer = 0; timer < timeout ; timer++){

    var requestResult = httpGETRequest("http://blog.stackexchange.com/");  // DUMMY API ENDPOINT

    if(requestResult.getResponseCode() ===  200){
      Logger.log("requestSignature->Success");

      var sigId = null; // TODO request the signature id
      var imgBlob = getSignature(sigId);
      placeSignature(imgBlob, 60);
      break;
    } else if(requestResult.getResponseCode() === 404){
      Logger.log("requestSignature->Declined");

      // alert user that an error has occurred
      break;
    }
    Utilities.sleep(5000);
  }

  //check timeout
  if(timer === timeout)
    DocumentApp.getUi().alert('SVS request timeout');

  Logger.log("-requestSignature FINISHED");
}



/**
* Execute HTTP GET on a given url.
*
* @param {object} url, request url in string format.
*/
function httpGETRequest(url) {

  var options =
      {
        "method"  : "GET",
        "followRedirects" : true,
        "muteHttpExceptions": true
      };

  var result = UrlFetchApp.fetch(url, options);

  Logger.log("GET %s : %s", url, result.getResponseCode());

  return result;
}

/**
* Place a signature image.
*
* @param {Blob} imgBlob, signature image in Blob object
* @param {Integer} prefHeight, preferred height of an image in a document 
*/
function placeSignature(imgBlob, prefHeight){
	   
	  var doc = DocumentApp.getActiveDocument();
	  var body = doc.getBody();
	  var cursor = doc.getCursor();
	  var element = cursor.getElement();
	  var parent = element.getParent();
	  
	  var image = body.insertImage(parent.getChildIndex(element)+1, imgBlob);
	  var width = image.getWidth();
	  var height = image.getHeight();
	  var resize = (prefHeight*1.0)/height;
	  image.setHeight(prefHeight);
	  image.setWidth(width*resize);
	  
}
