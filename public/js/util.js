var objToArray = function(obj){
	var ret = []
	for(var i in obj){
		ret.push({key: i, val: obj[i]})
	}
	return ret;
}