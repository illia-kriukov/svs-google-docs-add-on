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

  /*TODO - fake login */
  return 'token';

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
  var responseBodyJSON  = response.getContentText();
  var data = JSON.parse(responseBodyJSON);

  var outcome;

  if( response.getResponseCode() === '200'){
    // retrieve token
    outcome = data.accessToken;
  } else {
    // set 'invalid'
    outcome = 'invalid';
  }

  return token;
}
