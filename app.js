var http = require('http')
var koa = require('koa')
var swig = require('swig')
var router = require('koa-router')
var serve = require('koa-static')
var views = require('co-views');

var config = {appPort: process.env.PORT || 3000}
var render = views('view', { map: { html: 'swig' } });
var app = koa()

//ROUTES
app.use(router(app))
app.get('/', function*(){ this.body = yield render("index") })
app.get(/\/public\/*/, serve('.'))
app.get(/\/bower_components\/*/, serve('.'))

//Start server and listen on port
var server = http.createServer(app.callback())
server.listen(config.appPort);
console.log('Started ----------------------------------------------' + config.appPort)
