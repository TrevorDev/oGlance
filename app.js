var http = require('http')
var koa = require('koa')
var swig = require('swig')
var router = require('koa-router')
var serve = require('koa-static')
var views = require('co-views');
var jsonResp = require('koa-json-response')
var request = require('co-request');

var config = {appPort: process.env.PORT || 3000}
var render = views('view', { map: { html: 'swig' } });
var app = koa()

//ROUTES
app.use(jsonResp())
app.use(router(app))
app.get('/', function*(){ this.body = yield render("index") })
app.get(/\/public\/*/, serve('.'))
app.get(/\/bower_components\/*/, serve('.'))

app.get('/api/xkcd/latest', function *(){
	var result = yield request('http://xkcd.com/info.0.json');
	return this.jsonResp(200, {latest: JSON.parse(result.body).num});
})

app.get('/api/cAndH/latest', function *(){
	var result = yield request('http://explosm.net/comics/latest');
	var num = result.body.match(/<a href=\"\/comics\/(\d+)\/\" class=\"previous-comic\">/)[1]; //HACKY WAY BECAUSE THEY DONT HAVE API
	return this.jsonResp(200, {latest: parseInt(num)+1});
})

app.get('/api/tv/:show', function *(){
	var show = this.params.show
	var result = yield request('http://www.solarmovie.is/tv/'+show);
	var regex = new RegExp('<a href="/tv/'+show+'/season-(\\d+)/episode-(\\d+)/" class="linkCount typicalGrey">\\s*(\\d+) links</a>', "g")
	var matches, output = [];
	while (matches = regex.exec(result.body)) {
	    output.push({
	    	season: parseInt(matches[1]),
	    	episode: parseInt(matches[2]),
	    	links: parseInt(matches[3]),
	    	link: "http://www.solarmovie.is/tv/"+show+"/season-"+matches[1]+"/episode-"+matches[2]
	    });
	}
	output = output.filter(function(e){
		return e.links != 0;
	})
	console.log(output)
	return this.jsonResp(200, output);
})

app.post('/deploy', function*(){
	var sys = require('sys')
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { 
      sys.puts(stdout)
    }
    exec(". "+__dirname+"/deploy.sh", puts); // command to be execute
})

//Start server and listen on port
var server = http.createServer(app.callback())
server.listen(config.appPort);
console.log('Started ----------------------------------------------' + config.appPort)
