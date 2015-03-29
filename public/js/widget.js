function Widget(options){
	this.stories = []
	this.status = ""
	this.name = options.name
	this.seenIds = []
	var self = this;
	
	//Local Storage
	this.storeObj = function(name,obj){
		localStorage[this.name+name] = JSON.stringify(obj)
	}

	this.getStoredObj = function(name){
		var retrievedObject = localStorage[this.name+name]
		if(!retrievedObject){
			return null;
		}
		return JSON.parse(retrievedObject)
	}

	//options callback initiators
	this.updateStatus = function(){
		self.status = options.getStatus(self)
	}

	this.updateStories = function(){
		return $.Deferred(function( defer ) {
           		options.getStories(self).then(function(data){
           			self.stories = options.filterStories(self, data);
           			self.updateStatus();
           			defer.resolve(data);
           		})
        }).promise()
	}

	this.markRead = function(event, binding){
		console.log(self.name+" b")
		console.log(this)
		options.markRead(self, binding)
		self.stories = options.filterStories(self, self.stories);
		self.updateStatus();
	}

	this.save = function(){
		options.save(self);
	}

	this.setDefaultOptions = function(opt){
		if(!opt.markRead){
			opt.markRead = function(widget, binding){
	            widget.seenIds.push(binding.story.id)
	            widget.stories = widget.stories.filter(function(i){
	                 return widget.seenIds.indexOf(i.id) == -1
	            })
	        }
		}

		if(!opt.load){
			opt.load = function(widget){
	            if(!widget.getStoredObj(widget.name+"seenIds")){
	                widget.storeObj([])
	            }else{
	                widget.seenIds = widget.getStoredObj(widget.name+"seenIds")
	            }
	        }
		}

		if(!opt.getStatus){
			opt.getStatus = function(widget){
	            return ""+widget.stories.length
	        }
		}

		if(!opt.save){
			opt.save = function(widget){
		        widget.storeObj(widget.name+"seenIds", widget.seenIds)
		    }
		}

		if(!opt.filterStories){
			opt.filterStories = function(widget, stories){
				return stories.filter(function(i){
	                        return widget.seenIds.indexOf(i.id) == -1
	                     })
			}
		}

		return opt
	}
	options = this.setDefaultOptions(options)
	options.load(self)
	
}