/* Circuit breaking constant*/
var backendDissabled = false;

/* TODO - Replace with valid baseUrl */
var baseUrl = 'http://signature-verification.us-east-1.elasticbeanstalk.com';
var loginUrl =  baseUrl+ '/oauth/token';

/**
 * Communicates with back-end and performs login procedure.
 *
 * @param username
 * @param password
 * @returns {object} token or string "invalid"
 */
function login(username, password) {
  Logger.log("Username and password: %s, %s", username,password);

  // circuit breaker
  if(backendDissabled){
    Logger.log('fakeToken saved');
    return 'token1234';
  }


  // construct the POST headers
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic c3ZzOnNlY3JldA=='
  };

  // construct the POST request body
  var body =  {
    'username': username,
    'password': password,
    'scope': 'svs',
    'grant_type': 'password',
    'client_id': 'svs',
    'secret': 'secret',
    'validateHttpsCertificates': false
  };

  // send POST request to endpoint and retrieve token
  var response = httpPOSTRequest(loginUrl, headers, body);

  Logger.log('After the POST made: %s',response);

  if( response.getResponseCode() == '200'){

    // return token
    var accessToken = getAttributeFromHTTPResponse(response, 'access_token');
    Logger.log('The extracted token: %s',accessToken);
    return accessToken;
  } else {

    // return 'invalid'
    return 'invalid';
  }

}
