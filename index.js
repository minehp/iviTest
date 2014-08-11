try {

	// global variable
	global.sp		= process.platform=="win32"?"\\":"/";
	global.base 	= __dirname;
	global.log 		= console.log;

	// initial config
	var init = {
		modPath : base+sp+"node_modules",
		fs 		: require("fs"),
		assert 	: require("assert"),
	}

	// function to load module
	var loadAll = function(path,dest) {
		init
		.fs
		.readdirSync(path)
		.forEach(function(value,key) {
			try {
				if(!dest) {
					init[value] = require(path+sp+value);
				}else {
					init[dest] = {};
					init[dest][value] = require(path+sp+value);
				}
			}catch(e) { }
		});
	}

	// load all module in node_modules
	loadAll(init.modPath);

	// read package.json
	init.package = JSON.parse(
		init.fs.readFileSync(
			base+sp+"package.json"
		)
		.toString()
	);


	// ============================ (VIC) Very Important Code ====================================
	// ===========================================================================================

	var readArg = function() {
		// read parameter
		init.commander
		.version(init.package.version)
		.option("-t, --testpath [testpath]","folder path place for test file",base+sp+"test")
		.parse(process.argv);
	}

	var checkArgument = function(params) {
		if(params.testpath) {
			var checkDir = init.fs.existsSync(params.testpath);
			init.assert(checkDir,"folder "+params.testpath+" doesn't exists");
			init.commander.testpath = params.testpath;
		}
	}

	var waterfallReq = function(params,callback){
		var firstArg = [];
		for(var i in params) {
			firstArg.push(
				eachWaterfall(
					(firstArg.length>0?true:false),
					params[i]
				)
			)
		}

		init.async.waterfall(
			firstArg,
			function(err,res) {
				callback(err,res);
			}
		);
	}

	var eachWaterfall = function(withArg,params) {
		if(withArg) {
			return function(arg,cb) {

			}
		}else {
			return function(cb) {
				var option = {
					url 		: params.request.url,
					headers 	: params.request.headers || {},
					method 		: params.request.method=="post"?"POST":(params.request.method=="get"?"GET":params.request.method)
				}

				if(option.method=="POST") {
					if(params.request.body && !params.request.headers) {
						option.headers["Content-Type"] = "text/plain";
					}else if(params.request.body && params.request.headers) {
						if(!params.request.headers["Content-Type"])
							option.headers["Content-Type"] = "text/plain";
					}
				}

				init.request(option,function(err,res,body) {
					try {
						if(params.response) {
							if(params.response.statusCode) {
								init.assert(res.statusCode);
								init.assert.equal(res.statusCode,params.response.statusCode,"statusCode not :"+params.response.statusCode);
							}
						}

						if(params.callback) {
							params.callback.apply(init,[err,res,body]);
						}

						cb();
					}catch(e) {
						cb(e.message);
					}
				})
			}
		}
	}

	var exportsThis = function(params) {
		try {
			if(params) {
				init.assert((typeof params)=="object","invalid parameter ( must be a json )");
				checkArgument(params);
			}else {
				readArg();
				checkArgument(init.commander);
			}

			// load all test file
			loadAll(init.commander.testpath,"testList");
			init.assert(init.testList,"test list empty");

			var count 		= 0;
			var allKeys 	= Object.keys(init.testList);
			init.async
			.until(
				function() { return count==allKeys.length; },
				function(cb) {
					var currentFile 	= allKeys[count];
					if(currentFile) {

						var listBatch = {}
							listBatch[currentFile] = {
								topic : function() {
									waterfallReq(init.testList[currentFile],this.callback)
								},
								"result" : function(err,res) {
									init.assert(!err,err);
								}
							}
						init.vows
						.describe("run file : "+currentFile)
						.addBatch(listBatch)
						.run(function() {
							count++;
							cb();
						});
					}else {
						count++;
						cb();
					}
				},
				function(err) {
					if(err) {
						log(err);
					}else {
						log("done")
					}
				}
			)
		}catch(e) {
			log(e.message);
			process.exit();
		}
	}

	module.exports = exportsThis;
}catch(e) {
	console.log(e);
	process.exit();
}

