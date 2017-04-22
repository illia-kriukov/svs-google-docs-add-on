/* Circuit breaking constant*/
var backendDissabled = false;

var baseUrl = 'http://signature-verification.us-east-1.elasticbeanstalk.com';
var loginUrl = baseUrl + '/oauth/token';

/**
 * Sign in.
 *
 * Communicates with server and performs login procedure.
 * Retrieve access_token.
 *
 * @param username
 * @param password
 * @returns {object} token or string "invalid"
 */
function login(username, password) {
    Logger.log("Username and password: %s, %s", username, password);

    // circuit breaker
    if (backendDissabled) {
        Logger.log('fakeToken saved');
        return 'token1234';
    }

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic c3ZzOnNlY3JldA=='
    };

    var body = {
        'username': username,
        'password': password,
        'scope': 'svs',
        'grant_type': 'password',
        'client_id': 'svs',
        'secret': 'secret',
        'validateHttpsCertificates': false
    };

    var response = httpPOSTRequest(loginUrl, headers, body);

    Logger.log('After the POST made: %s', response);

    if (response.getResponseCode() == '200') {
        var accessToken = getAttributeFromHTTPResponse(response, 'access_token');
        Logger.log('The extracted token: %s', accessToken);
        return accessToken;
    } else {
        return 'invalid';
    }

}
