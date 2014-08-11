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
		if(dest) {
			init[dest] = {};
		}

		init
		.fs
		.readdirSync(path)
		.forEach(function(value,key) {
			try {
				if(!dest) {
					init[value] = require(path+sp+value);
				}else {
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
		.option("-l, --list","list file tested")
		.option("-c, --choose [number or string]","test specified test file, not all file tested")
		.parse(process.argv);
	}

	var checkArgument = function(params) {
		if(params.testpath) {
			var checkDir = init.fs.existsSync(params.testpath);
			init.assert(checkDir,"folder "+params.testpath+" doesn't exists");
			init.commander.testpath = params.testpath;
		}

		if(params.list) {
			init.commander.list = params.list;
		}

		if(params.choose) {
			init.commander.choose = params.choose;
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

	var processReq = function(params,cb) {
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

	var eachWaterfall = function(withArg,params) {

		if(withArg) {
			return function(arg,cb) {
				processReq(params,cb);
			}
		}else {
			return function(cb) {
				processReq(params,cb);
			}
		}
	}

	var createList = function(testList) {
		init.assert(testList,"no file to test");
		init.assert((typeof testList)=="object","testList not an object");

		log("\n");
		testList.forEach(function(values,keys) {
			log(keys+" = "+values);
		})
		log("\n");
		log("you can run test with argument : -c 0");
		log("\n");
	}

	var exportsThis = function(params) {
		try {
			var startProcess = +(new Date());
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
			var choose 		= false;

			if(init.commander.choose) {
				var getChoose = parseInt(init.commander.choose);
				if(getChoose=="NaN") {
					count = allKeys.indexOf(init.commander.choose);
				}else {
					count 	= getChoose;
				}
				init.assert(count<allKeys.length, "choose number more than total file, or file doesn't exists");
				choose = count+1;
			}

			if(init.commander.list) { // if tester ask about list of test file or want to choose one
				createList(allKeys);
			}else {
				init.async
				.until(
					function() {
						if(choose) {
							return count==choose;
						}else {
							return count==allKeys.length;
						}
					},
					function(cb) {
						var currentFile 	= allKeys[count];
						if(currentFile) {
							var listBatch = {}
								listBatch[currentFile] = {
									topic : function() {
										log("\nrun testfile : "+currentFile);
										waterfallReq(init.testList[currentFile],this.callback)
									},
									"result" : function(err,res) {
										init.assert(!err,err);
										count++;
										cb();
									}
								}

							init.vows
							.describe("run file : "+currentFile)
							.addBatch(listBatch)
							.run();
						}else {
							count++;
							cb();
						}
					},
					function(err) {
						var endProcess = +(new Date());
						log("\n");
						if(err) {
							log(err);
						}else {
							log("done");
						}

						var range = endProcess - startProcess;
						if(range>1000) {
							var second 	= Math.floor(range/1000);
							var mili 	= range-(second*1000);
							range 		= second+" s "+mili+" ms";
						}else {
							range 		= range+" ms";
						}
						log("Total run time :"+range);
					}
				)
			}
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

