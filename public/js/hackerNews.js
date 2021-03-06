var hn = {}

hn.getDetails = function(data){
    var deff = $.map(data, function(obj, num){
        return $.Deferred(function( defer ) {
                hn.getItem(obj)
                .then(function(data) {
                    defer.resolve(data);
                });
        }).promise()
    })
    return $.Deferred(function( defer ) {
        $.when.apply($, deff).then(function(){
            defer.resolve(Array.prototype.slice.call(arguments))
        })
    }).promise()
}

hn.getItem = function(id){
    return $.Deferred(function( defer ) {
        $.getJSON("https://hacker-news.firebaseio.com/v0/item/"+id+".json")
        .then(function(data) {
            defer.resolve(data);
        });
    }).promise()
}

hn.getTopStoriesIds = function(){
    return $.Deferred(function( defer ) {
        $.getJSON("https://hacker-news.firebaseio.com/v0/topstories.json")
        .then(function(data) {
          return defer.resolve(data)
        })
    }).promise()
}

hn.getTopStories = function(numOfStories){
    return $.Deferred(function( defer ) {
        hn.getTopStoriesIds()
        .then(function(data) {
            data = data.slice(0, numOfStories)
          return hn.getDetails(data)
        }).then(function(data){
            defer.resolve(data);
        });
    }).promise()
}