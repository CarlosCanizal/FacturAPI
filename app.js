
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var signature = require('./routes/signature');
var cert = require('./routes/cert');
Sign = require('./sign.js');
var http = require('http');
var path = require('path');
Fs = require('fs');

var app = express();

app.use(express.bodyParser());


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());

app.use (function (err, req, res, next){
    res.json(err.status,{'error': err.message});
});

app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users', user.list);
app.post('/signatures', signature.signature);
app.post('/certs', cert.upload);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

