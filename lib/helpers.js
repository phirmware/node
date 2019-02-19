/**
 * Helpers for various tasks
 * 
 */

// Dependencies
var cypto = require('crypto');
var config = require('./config');
var path = require('path');
var fs = require('fs');


var helpers = {};


helpers.hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        var hash = cypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

helpers.parseJsonToObject = function (str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
}

helpers.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    var possibleCharacters = '123456789abcdefghijklmnopqrstuvwxyz';
    var generatedStr = '';
    for (var i = 0; i < strLength; i++) {
        var chosen = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        generatedStr += chosen;
    }
    return generatedStr;
}

helpers.getTemplate = function (name, callback) {
    // validate name
    name = typeof (name) == 'string' && name.trim().length > 0 ? name.trim() : false;

    if (name) {
        var templatePath = path.join(__dirname, '/../templates/');
        fs.readFile(templatePath + name + '.html', 'utf8', function (err, data) {
            if (!err && data && data.length > 0) {
                callback(false, data);
            } else {
                callback('Couldnt read file,  file may not exist');
            }
        })
    } else {
        callback('Invalid template name');
    }
}

helpers.getStaticAssets = function (assetName, callback) {
    assetName = typeof (assetName) == 'string' && assetName.trim().length > 0 ? assetName.trim() : false;
    if (assetName) {

        // Get path
        var assetPath = path.join(__dirname, '/../public/');

        // Read file
        fs.readFile(assetPath + assetName, function (err, data) {
            console.log(assetPath + assetName);
            if (!err && data) {
                // get content type
                // if css
                if (assetName.indexOf('css') > -1) {
                    var contentType = 'css';
                    callback(false, data, contentType);
                }
                if (assetName.indexOf('js') > -1) {
                    var contentType = 'js';
                    callback(false, data, contentType);
                }
            } else {
                callback(400);
            }
        })
    } else {
        callback(400);
    }
}


// Export
module.exports = helpers;