var mongoose = require('mongoose');

var env = process.env.NODE_ENV || 'development';

if(env == 'development'){
	process.env.clientID = "someId"
	process.env.clientSecret = "someClientSecret";
	process.env.sessionSecret = "someSessionSecret";
}

process.env.PORT = 5000;

mongoose.Promise = global.Promise;

module.exports = {env, mongoose};

