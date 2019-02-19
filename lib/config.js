var enviroments = {};

// staging (default) enviroment
enviroments.staging = {
    'httpPort': 3000,
    'httpsPort':3001,
    'envName' : 'staging enviroment',
    'hashingSecret': 'This is a secret'
};

// Production enviroment
enviroments.production = {
    'httpPort':5000,
    'httpsPort':5001,
    'envName':'production enviroment',
    'hashingSecret': 'This is also a secret'
};

// Determine which env to pass out
var currentEnviroment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check if env is one of defined env above
var enviromentToExport = typeof(enviroments[currentEnviroment]) == 'object' ? enviroments[currentEnviroment] : enviroments.staging; 

// Export chosen enviroment
module.exports = enviromentToExport;

// openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem 
