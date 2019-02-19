// library for storing data

// Dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// container for the module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data');

// Write data to a file
lib.create = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {

            // Convert data to string
            var stringData = JSON.stringify(data);

            // Write to file and close
            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            })
        } else {
            callback('Could not create new file, It may already exist');
        }
    })
};

// Read data from file
lib.read = function (dir, file, callback) {
    fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf8', function (err, data) {
        if (!err && data) {
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

// Update data on file
lib.update = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            var stringData = JSON.stringify(data);

            // Truncate content
            
            fs.ftruncate(fileDescriptor, function (err) {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing the file');
                                }
                            })
                        } else {
                            callback('Error writing to existing file');
                        }
                    })
                } else {
                    callback('Error truncating file');
                }
            })
        } else {
            callback('Could not open the file for update, file may not exist');
        }
    })
}


// Delete file
lib.delete = function (dir, file, callback) {
    // Unlink the file
    fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, function (err) {
        if (!err) {
            callback(false);
        } else {
            callback('Could not delete file');
        }
    });
}



// Export Module
module.exports = lib;