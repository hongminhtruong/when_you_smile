//TODO: MORE COMMENTS, CLEAN-UP
//TODO: Throttle control.
var config = require('./config/config.js');

// Package imports
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const oAuthRoute = require('./routes/facebook_oauth');
const application = require('./routes/application');

var app = express();
var store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    databaseName: 'when-you-smile',
    collection: 'mySessions'
});

store.on('error', function(error) {
});

app.set('trust proxy', true);

app.use(require('express-session')({
    secret: process.env.sessionSecret,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

/*
dev
app.use(session({ 
	secret: process.env.sessionSecret,
	resave: true,
  	saveUninitialized: true,
  	cookie: { secure: true }
}));
*/

app.use(express.static(__dirname + '/public/'));
app.use('/bower_components', express.static(path.join(__dirname, '/../bower_components')));
app.use('/vendor', express.static(path.join(__dirname, '/../vendor')));
app.use('/assets', express.static(path.join(__dirname, '/../assets')));

// FIXME: HTML retrievals through template engine.
// Also for modal.
app.get('/error', (req, res) => {
	res.sendFile(__dirname + '/public/html/information.html');
});

app.get('/userLogin', (req, res) => {
	res.sendFile(__dirname + '/public/html/userLogin.html');
});

// register application routes
app.use(oAuthRoute);
app.use(application);

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('/public/html/index.html', { root: __dirname });
});

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log('Started on port ', process.env.PORT);
});

//module.exports = {app};