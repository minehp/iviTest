var request = require("request"),
    deepmerge = require("deepmerge"),
    assert = require("assert"),
    querystring = require("querystring");
var processReq = function (params, cb) {
    try {
        var reqArg = {
            headers : {}
        };
        
        if (params.arg) {
            if (params.arg.headers) {
                reqArg.headers = deepmerge(reqArg.headers, params.arg.headers)
            }
            
            if (params.arg[params.head]) {
                reqArg = deepmerge(reqArg, params.arg[params.head]);
            }
        }

        if (params.request) {
            var curReq = JSON.parse(JSON.stringify(params.request));
            reqArg = deepmerge(reqArg, curReq)
        }
        
        if (params.globPar)
            reqArg = deepmerge(params.globPar.request, reqArg);
        
        if (reqArg.host) {
            reqArg.url = "";
            if (reqArg.protocol) {
                reqArg.url += "http://";
                delete reqArg.protocol;
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
            
            if (reqArg.query) {
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
        
        if (option.body) {
            if ((typeof option.body) == "object") {
                option.body = JSON.stringify(option.body);
            }
        }
        
        request(option, function (err, res, body) {
            try {
                var error = false;
                try {
                    should.not.exist(err);
                    var response = params.response?params.response:{};
                    
                    if (params.globPar.response) {
                        response = deepmerge(params.globPar.response, response);
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
                } catch (e) {
                    error = e.message;
                }
                
                if (!params.arg) params.arg = {};
                if (params.after) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) { }
                    var returnData = params.after(err, res, body);
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
                
                assert.equal(error, false, error);
                
                if (res.headers["set-cookie"]) {
                    if (params.arg.headers) {
                        if (!params.arg.headers.Cookie) {
                            if (!params.arg.headers) params.arg.headers = {};
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
                console.log("\033[31m");
                console.log("request =========================");
                console.log(option);
                console.log("\nerror ============================");
                console.log(err);
                console.log("\nbody ============================");
                console.log(body);
                console.log("\033[0m");
                cb(e.message);
            }
        })
    } catch (e) {
        cb(e.message);
    }
}

module.exports = processReq;