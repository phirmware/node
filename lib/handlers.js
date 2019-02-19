// Dependencies
var _data = require('./data');
var helpers = require('./helpers');



var handlers = {};

// Handler methods ** start


/*
*
*   HTML Handlers
*
*/

handlers.index = function (data, callback) {

    // Check if method is valid
    if (data.method == 'get') {
        helpers.getTemplate('index', function (err, str) {
            if (!err && str) {
                callback(200, str, 'html');
            } else {
                callback(400, undefined, 'html');
            }
        })
    } else {
        callback(405, undefined, 'html');
    }
}


handlers.public = function (data, callback) {
    if (data.method == 'get') {
        var trimmedPath = typeof (data.trimmedPath) == 'string' && data.trimmedPath.length > 0 ? data.trimmedPath : false;
        if (trimmedPath) {
            var trimmedAssetPath = trimmedPath.replace('public/', '');
            helpers.getStaticAssets(trimmedAssetPath, function (err, str, contentType) {
                if (!err && str && str.length > 0 && contentType) {
                    callback(200, str, contentType);
                } else {
                    callback(404);
                }
            })
        } else {
            callback(400);
        }
    } else {
        callback(405);
    }
}






/*
*
*   API Handlers
*
*/


// ping handler
handlers.ping = function (data, callback) {
    callback(200);
}

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
}

// users
handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Token handler
handlers.token = function (data, callback) {
    var methods = ['get', 'post', 'put', 'delete'];
    var presentMethod = methods.indexOf(data.method) > -1 ? data.method : false;
    if (presentMethod) {
        handlers._token[presentMethod](data, callback);
    } else {
        callback(405);
    }
}

// Handler methods **end




// Handler sub-Methods
// Container for users
handlers._users = {};

// users - get
// Required data : phone
// Optional data : none
handlers._users.get = function (data, callback) {
    // Get the phone number from the queryObject
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
    // check if phone number is valid and read file
    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (err) {
                callback(404, { 'Error': 'User doesnt exist' });
            } else {
                delete data.hashedPassword;
                callback(200, data);
            }
        })
    } else {
        callback(404, { 'Error': 'Missing required fields' });
    }
}

// users - post
// Required fields : firstname , lastname , phone , password , tosAgreement
// optional data: none
handlers._users.post = function (data, callback) {
    // check if all required fields are filled out
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure the user doesnt already exist
        _data.read('users', phone, function (err, data) {
            if (err) {
                // Hash the passsword
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create user object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create new user' });
                        }
                    })
                } else {
                    callback(500, { 'Error': 'Could not hash the user password' });
                }


            } else {
                // User already exists
                callback(400, { 'Error': 'A user with that phone number already exists' });
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
}

// users - update
// Required : phone
// Optional : firstName lastName Password
handlers._users.put = function (data, callback) {

    // Check for the required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone : false;

    // Check for optional field
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // Update the user data
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the new Updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not update request' });
                        }
                    })
                } else {
                    callback(400, { 'Error': 'The specified user doesnt exist' });
                }
            })
        }
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
}


// users - delete
handlers._users.delete = function (data, callback) {
    // Get the phone number from the queryObject
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
    // check if phone number is valid and read file
    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (err) {
                callback(404, { 'Error': 'User doesnt exist' });
            } else {
                _data.delete('users', phone, function (err) {
                    if (err) {
                        callback(404, { 'Error': 'Couldnt delete user' });
                    } else {
                        callback(200);
                    }
                })
            }
        })
    } else {
        callback(404, { 'Error': 'Missing required fields' });
    }
}


// Handlers container for token
handlers._token = {};


// sub token get method
handlers._token.get = function (data, callback) {
    var tokenId = typeof (data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.length == 20 ? data.queryStringObject.tokenId : false;
    if (tokenId) {
        _data.read('tokens', tokenId, function (err, data) {
            if (!err) {
                callback(200, data);
            } else {
                callback(404, { 'Error': 'Incorrect tokenId' });
            }
        });
    } else {
        callback(404, { 'Error': 'Missing or invalid required parameters' });
    };
};

// sub token post method
handlers._token.post = function (data, callback) {
    // create a token using users phone and password
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone && password) {
        // Lookup the user who matches that phone number
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                // Hash the sent password
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid , create new token with expiry date set to 1hr
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, function (err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { 'Error': 'Could not create token' });
                        }
                    })
                } else {
                    callback(400, { 'Error': 'Invalid Password' })
                }
            } else {
                callback(400, { 'Error': 'Specified user doesnt exist' });
            }
        })
    }
};

// sub token put method
handlers._token.put = function (data, callback) {
    // check if required fields are present
    var tokenId = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
    var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if (tokenId && extend) {
        // Check if token is valid
        _data.read('tokens', tokenId, function (err, data) {
            if (!err) {
                if (Date.now() < data.expires) {
                    data.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', tokenId, data, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(400, { 'Error': 'Couldnt update token' });
                        }
                    })
                } else {
                    callback(400, { 'Error': 'Token has expired' });
                }
            } else {
                callback(404, { 'Error': 'Token not found' });
            }
        })
    } else {
        callback(404, { 'Error': 'Missing or incorrect parameters' });
    }
};

// sub token delete method
handlers._token.delete = function (data, callback) { };



// Handler sub-Methods

// Export 
module.exports = handlers;