/* Circuit breaking constant*/
var backendDissabled = true;

/* TODO - Replace with valid baseUrl */
var baseUrl = 'https://www.google.se';
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


  // construct the auth type
  var auth = 'c3ZzOnNlY3JldA==';

  // construct the POST request body
  var body =  {
    'username': username,
    'password': password,
    'scope': 'svs',
    'grant_type': 'password',
    'client_id': 'svs',
    'secret': 'secret'
  };

  // send POST request to endpoint and retrieve token
  var response = httpPOSTRequest(loginUrl , auth, body);

  if( response.getResponseCode() === '200'){

    // return token
    var accessToken = getAttributeFromHTTPResponse(response, 'accessToken');
    return accessToken;
  } else {

    // return 'invalid'
    return 'invalid';
  }

}
