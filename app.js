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

app.get('/api/comic/xkcd/latest', function *(){
	var result = yield request('http://xkcd.com/info.0.json');
	var num = JSON.parse(result.body).num;
	var latest = []
    for(var i = num-19;i<=num;i++){
        latest.push({link: "http://xkcd.com/"+i, name: i})
    }
	return this.jsonResp(200, {latest: latest});
})

app.get('/api/comic/cAndH/latest', function *(){
	var result = yield request('http://feeds.feedburner.com/Explosm');
	var latest = result.body.match(/www.explosm.net\/comics\/(\d+)/g); //HACKY WAY BECAUSE THEY DONT HAVE API
	latest = latest.map(function(i){
		return i.match(/\d+/)[0];
	})
	latest = latest.reduce(function(p, c)//uniq
	{
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	}, []).map(function(i){
		return {link: "http://explosm.net/comics/"+i, name: i};
	})
	return this.jsonResp(200, {latest: latest});
})

app.get('/api/comic/dilbert/latest', function *(){
	var result = yield request('http://feeds.feedburner.com/DilbertDailyStrip');
	var latest = result.body.match(/\d+\-\d+\-\d+/g); 
	latest = latest.reduce(function(p, c)//uniq
	{
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	}, [])
	.map(function(i){
		return {link: "http://dilbert.com/strip/"+i, name: i};
	})
	return this.jsonResp(200, {latest: latest});
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
	}).slice(0, 5);
	return this.jsonResp(200, output);
})

app.post('/deploy', function*(){
	//TODO filter deployment with secret and filter to only push to master (see npm gith which didnt work when i tried)
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { 
      console.log(stdout)
    }
    exec(". "+__dirname+"/deploy.sh", puts); // command to be execute
})

//Start server and listen on port
var server = http.createServer(app.callback())
server.listen(config.appPort);
console.log('Started ----------------------------------------------' + config.appPort)
