var request = require("request"),
    deepmerge = require("deepmerge"),
    assert = require("assert"),
    querystring = require("querystring");
var testResponse = function(fromServer,fromTest,topic,part) {
    try {
        if((typeof fromTest)=="object"){
            try {
                fromServer = JSON.parse(fromServer);
            }catch(e) {}

            var varType = ["array","string","number","object","boolean"]
            for(var i in fromTest) {
                if(i=="exists") {
                    for(var j in fromTest[i]) {
                        fromServer.should.have.property(fromTest[i][j]);
                    }
                }else if(varType.indexOf(i)>-1) {
                    for(var j in fromTest[i]) {
                        fromServer[fromTest[i][j]].should.be.a(varType[varType.indexOf(i)])
                    }
                }else if(i=="each") {
                    init._.map(fromServer,function(valueFServer){
                        init._.map(fromTest[i],function(valueFTest){
                            expect(valueFServer[valueFTest]).to.exists;
                            expect(valueFServer[valueFTest]).to.not.equal(null);
                        })
                    })
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

var processReq = function (params, cb) {
    try {
        var reqArg = {
            headers : {}
        };
        
        if (params.arg) {
            if (params.arg.headers) {
                reqArg.headers = deepmerge(reqArg.headers, params.arg.headers);
            }
            
            if (params.arg[params.head]) {
                reqArg = deepmerge(reqArg, params.arg[params.head]);
            }
        }

        if (params.request) {
            var curReq = JSON.parse(JSON.stringify(params.request));
            reqArg = deepmerge(reqArg, curReq)
        }
        
        if (params.global)
            reqArg = deepmerge(params.global.request, reqArg);
        
        if (reqArg.host) {
            reqArg.url = "";
            if (reqArg.protocol) {
                reqArg.url += reqArg.protocol;
                delete reqArg.protocol;
            } else {
                reqArg.url += "http://";
            }
            
            reqArg.url += reqArg.host;
            delete reqArg.host;
            if (reqArg.port) {
                reqArg.url += ":" + reqArg.port;
                delete reqArg.port;
            }
            if (reqArg.pathname) {
                reqArg.url += reqArg.pathname;
                delete reqArg.pathname;
            }
            if (reqArg.path) {
                reqArg.url += reqArg.path;
                delete reqArg.path;
            }
            
            if (reqArg.query) {
                reqArg.url += "?";
                if ((typeof reqArg.query) == "object") {
                    reqArg.query = querystring.stringify(reqArg.query);
                }
                reqArg.url += reqArg.query;
                delete reqArg.query;
            }
        }

        var option = reqArg;
        
        if (option.method == "POST") {
            if (!reqArg.headers)
                reqArg.headers = {};
            
            if (reqArg.body && !reqArg.headers) {
                option.headers["Content-Type"] = "text/plain";
            } else if (reqArg.body && reqArg.headers) {
                if (!reqArg.headers["Content-Type"])
                    option.headers["Content-Type"] = "text/plain";
            }
        }

        should.exist(option.method,"Empty request method");
        
        if (option.body) {
            if ((typeof option.body) == "object") {
                option.body = JSON.stringify(option.body);
            }
        }

        request(option, function (err, res, body) {
            try {
                should.not.exist(err);
                var response = params.response?params.response:{};
                
                if (params.global.response) {
                    response = deepmerge(params.global.response, response);
                }
                if (Object.keys(response).length > 0) {
                    if (response.statusCode) {
                        should.exist(res.statusCode);
                        res.statusCode.should.equal(response.statusCode);
                    }
                    
                    if (response.body) {
                        testResponse(body, response.body, params.head, "body");
                    }
                    
                    if (response.headers) {
                        testResponse(res.headers, response.headers, params.head, "headers");
                    }
                }
                
                if (!params.arg) params.arg = {};
                if (params.callback) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) { }
                    var returnData = params.callback(err, res, body);
                    if (returnData) {
                        returnData.should.be.a("object");
                        for (var i in returnData) {
                            should.exist(returnData[i]);
                            if (i != "headers") {
                                if (params.arg[i]) {
                                    params.arg[i] = deepmerge(params.arg[i], returnData[i]);
                                } else {
                                    params.arg[i] = returnData[i];
                                }
                            }
                        }
                        
                        if (returnData.headers) {
                            params.arg.headers = returnData.headers;
                        }
                    }
                }
                                
                if (res.headers["set-cookie"]) {
                    if (params.arg.headers) {
                        if (!params.arg.headers.Cookie) {
                            params.arg.headers.Cookie = res.headers["set-cookie"][0];
                        }
                    } else {
                        params.arg.headers = {
                            Cookie : res.headers["set-cookie"][0]
                        }
                    }
                }
                
                cb(null, params.arg);
            } catch (e) {
                cb(e.message);
            }
        })
    } catch (e) {
        cb(e.message);
    }
}

module.exports = processReq;