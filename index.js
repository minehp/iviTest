try {

	// global variable
	global.sp		= process.platform=="win32"?"\\":"/";
	global.base 	= __dirname;
	global.log 		= console.log;
		global.assert	= require("assert");

	// initial config
	var init = {
		modPath 		: base+sp+"node_modules",
		fs 				: require("fs"),
		url 			: require("url"),
		querystring 	: require("querystring")
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

	if(init.underscore) {
		init._ = init.underscore;
		delete init.underscore;
	}

	global.should = init.chai.should();
	global.expect = init.chai.expect;


	// read package.json
	init.package = JSON.parse(
		init.fs.readFileSync(
			base+sp+"package.json"
		)
		.toString()
	);

	init.parseCookies = function (par) {
	    var list = {},
	        rc = par.headers["set-cookie"][0];

	    rc && rc.split(';').forEach(function( cookie ) {
	        var parts = cookie.split('=');
	        list[parts.shift().trim()] = unescape(parts.join('='));
	    });
	    return list;
	}


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
			assert(checkDir,"folder "+params.testpath+" doesn't exists");
			init.commander.testpath = params.testpath;
		}

		if(params.list) {
			init.commander.list = params.list;
		}

		if(params.choose) {
			init.commander.choose = params.choose;
		}
	}

	var testResponse = function(fromServer,fromTest,topic,part) {
		try {
			if((typeof fromTest)=="object"){
				try {
					fromServer = JSON.parse(fromServer);
				}catch(e) {}

				for(var i in fromTest) {
					if(i=="exists") {
						for(var j in fromTest[i]) {
							fromServer.should.have.property(fromTest[i][j]);
						}
					}else {
						fromServer.should.have.property(i);
						if((typeof fromTest[i])=="object") {
							testResponse(fromServer[i],fromTest[i],topic,part)
						}else {
							fromServer[i].should.equal(fromTest[i]);
						}
					}
				}
			}else {
				fromServer.should.equal(fromTest);
			}
		}catch(e) {
			assert(false,e.message)
		}
	}

	var processReq = function(params,cb) {
		try {
			var request = {
				headers : {}
			};

			if(params.arg) {
				if(params.arg.headers) {
					request.headers = init.deepmerge(request.headers,params.arg.headers)
				}

				if(params.arg[params.head]) {
					request = init.deepmerge(request,params.arg[params.head]);
				}
			}
			if(params.request) {
				var curReq 	= JSON.parse(JSON.stringify(params.request));
				request 	= init.deepmerge(request,curReq)
			}

			request = init.deepmerge(params.globPar.request,request);

			if(request.host) {
				request.url = "";
				if(request.protocol) {
					request.protocol += "http://";
					delete request.protocol;
				}

				request.url+=request.host;
				delete request.host;
				if(request.port) {
					request.url+=":"+request.port;
					delete request.port;
				}
				if(request.pathname) {
					request.url+=request.pathname;
					delete request.pathname;
				}

				if(request.query) {
					if((typeof request.query)=="object"){
						request.query = init.querystring.stringify(request.query);
					}
					request.url+=request.query;
					delete request.query;
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
					var error = false;
					try {
						should.not.exist(err);
						var response = params.response?params.response:{};
						if(params.globPar.response) {
							response = init.deepmerge(params.globPar.response,response);
						}

						if(Object.keys(response).length>0) {
							if(response.statusCode) {
								should.exist(res.statusCode);
								res.statusCode.should.equal(response.statusCode);
							}

							if(response.body) {
								testResponse(body,response.body,params.head,"body");
							}

							if(response.headers) {
								testResponse(res.headers,response.headers,params.head,"headers");
							}
						}
					}catch(e) {
						error = e.message;
					}

					if(!params.arg) params.arg={};
					if(params.callback) {
						try {
							body = JSON.parse(body);
						}catch(e) {}
						var returnData = params.callback.apply(init,[err,res,body]);
						if(returnData) {
							returnData.should.be.a("object");
							for(var i in returnData) {
								should.exist(returnData[i]);
								if(i!="headers") {
									if(params.arg[i]) {
										params.arg[i] = init.deepmerge(params.arg[i],returnData[i]);
									}else {
										params.arg[i] = returnData[i];
									}
								}
							}

							if(returnData.headers) {
								params.arg.headers = returnData.headers;
							}
						}
					}

					if(res.headers["set-cookie"]) {
						if(params.arg.headers) {
							if(!params.arg.headers.Cookie) {
								if(!params.arg.headers) params.arg.headers = {};
								// params.arg.headers.Cookie = "connect.sid="+init.parseCookies(res)["connect.sid"];
								params.arg.headers.Cookie = res.headers["set-cookie"];
							}
						}else {
							params.arg.headers = {
								// Cookie : "connect.sid="+init.parseCookies(res)["connect.sid"]
								Cookie : res.headers["set-cookie"]
							}
						}
					}

					error.should.equal(false);
					cb(null,params.arg);
				}catch(e) {
					cb(e.message);
				}
			})
		}catch(e) {
			cb(e.message);
		}
	}

	var waterfallReq = function(params,callback){

		var globPar 	=  {
			request 	: {},
			response 	: {}
		};

		if(params.request) {
			globPar.request = params.request;
			delete params.request;
		}
		if(params.response) {
			globPar.response = params.response;
			delete params.response;
		}

		var listOfKeys = Object.keys(params);
		var index = 0;
		var headers = false;
		init.async.until(
			function() {
				return index==listOfKeys.length;
			},
			function(cb,arg) {
				try {
					var arg 		= params[listOfKeys[index]];
						arg.head 	= listOfKeys[index];
						arg.globPar = globPar;


					processReq(arg,function(err,res){
						index++;
						try {
							assert(!err,err);
							if(res) {
								res.should.be.a("object","return value not an object");
								if(res.headers) {
									headers = res.headers;
									delete res.headers
								}

								if(Object.keys(res)>0) {
									init._.map(res,function(value,key) {
										if(params[key]) {
											params[key].request = init.deepmerge(params[key].request,value)
										}
									})
								}
								if(headers) {
									init._.map(params,function(value,key) {
										if(!params[key].request.headers) params[key].request.headers = {};
										params[key].request.headers = init.deepmerge(params[key].request.headers,headers);
									})
								}
								cb();
							}else {
								cb();
							}
						}catch(e) {
							cb(e.message);
						}
					});
				}catch(e) {
					index++;
					cb(e.message)
				}
			},
			function(err) {
				callback(err);
			}
		)

	}

	var createList = function(testList) {
		assert(testList,"no file to test");
		assert((typeof testList)=="object","testList not an object");

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
				assert((typeof params)=="object","invalid parameter ( must be a json )");
				checkArgument(params);
			}else {
				readArg();
				checkArgument(init.commander);
			}

			// load all test file
			loadAll(init.commander.testpath,"testList");
			assert(init.testList,"test list empty");

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
				assert(count<allKeys.length, "choose number more than total file, or file doesn't exists");
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
										assert(!err,err);
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

