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

  /* - TODO fake login - */
  //console.log('fakeLogin on');
  Logger.log('fakeToken saved');
  return 'token1234';
  /* --- */


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
    var responseBodyJSON  = response.getContentText();
    var data = JSON.parse(responseBodyJSON);
    return data.accessToken;
  } else {

    // return 'invalid'
    return 'invalid';
  }

}
