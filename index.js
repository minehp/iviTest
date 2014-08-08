var init = {
	base 	: __dirname,
	modPath : __dirname+"/node_modules"
}
console.log("value")
var loadAllModule = function() {
	require("fs").readdirSync(init.modPath).forEach(function(value) {
		console.log(value)
	})
}