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
			params[i].head = i;
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
		try {
			var request = JSON.parse(JSON.stringify(params.request));

			if(params.arg) {
				if(params.arg[params.head]) {
					request = init.deepmerge(request,params.arg[params.head]);
				}
			}

			var option = request;

			if(option.method=="POST") {
				if(!request.headers)
					request.headers = {};

				if(request.body && !request.headers) {
					option.headers["Content-Type"] = "text/plain";
				}else if(request.body && request.headers) {
					if(!request.headers["Content-Type"])
						option.headers["Content-Type"] = "text/plain";
				}
			}

			if(option.body) {
				if((typeof option.body)=="object") {
					option.body = JSON.stringify(option.body);
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

					if(!params.arg) params.arg={};
					if(params.callback) {
						var returnData = params.callback.apply(init,[err,res,body]);
						if(returnData) {
							init.assert((typeof returnData)=="object","request :"+params.head+" callback return not object");
							for(var i in returnData) {
								init.assert(returnData[i],"request :"+params.head+" callback invalid json");
								if(params.arg[i]) {
									params.arg[i] = init.deepmerge(params.arg[i],returnData[i]);
								}else {
									params.arg[i] = returnData[i];
								}
							}
						}
					}

					cb(null,params.arg);
				}catch(e) {
					cb(e.message);
				}
			})
		}catch(e) {
			cb(e.message);
		}
	}

	var eachWaterfall = function(withArg,params) {

		if(withArg) {
			return function(arg,cb) {
				params.arg = arg;
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

