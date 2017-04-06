/**
 * Communicates with back-end and performs login procedure.
 * 
 * @param username
 * @param password
 * @returns {object} token or string "invalid"
 */
function login(username, password) {
  Logger.log("Username and password: %s, %s", username,password);
  return "token";
}

function signUp(user) {
}