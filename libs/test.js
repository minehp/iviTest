var util = require("util"),
    event = require("events"),
    async = require("async"),
    vows = require("vows"),
    assert = require("assert"),
    processReq = require("./processReq.js");
var test = function (data) {
    event.EventEmitter.call(this);
    this.data = data;
}
util.inherits(test, event.EventEmitter);

test.prototype.run = function () { // create vows test
    var fileName = Object.keys(this.data)[0];

    vows
    .describe("run file : " + fileName)
    .addBatch(this.batch(fileName))
    .run();
}

test.prototype.batch = function (fileName) { // defined batch
    var ini = this;
    var retVal = {};
        retVal[fileName] = {
            topic : function () {
                console.log("\n\033[32m\t"+fileName + " execute...\033[0m");
                ini.process(ini.data[fileName], this.callback);
            },
            "result" : function (err, count) {
                console.log("\033[32m\t"+count + " context executed\033[0m");
                if (err) {
                    ini.emit("error",err.err);
                    assert(!err, err.err);
                } else {
                    ini.emit("success");
                }
            }
        }
    return retVal;
}

test.prototype.process = function (params, callback) {
    var ini = this;
    var globPar = {
        request 	: {},
        response 	: {}
    };
    
    if (params.request) {
        globPar.request = params.request;
        delete params.request;
    }
    if (params.response) {
        globPar.response = params.response;
        delete params.response;
    }
    
    var listOfKeys = Object.keys(params);
    var count = 0;
    var fault = "";
    var index = 0;
    var headers = false;
    async.until(
        function () {
            return index == listOfKeys.length;
        },
        function (cb, arg) {
            try {
                var arg = params[listOfKeys[index]];
                    arg.head = listOfKeys[index];
                    arg.global = globPar;
                if(arg.before) {
                    arg.before(params,function(){
                        processReq(arg, function (err,nextArg) {
                            count++;
                            if(err) {
                                fault+= arg.head;
                                cb(err);
                            }else if(arg.after){
                                arg.after(params,function(){
                                    index++;
                                    cb();  
                                });
                            }else {
                                index++;
                                cb();                                
                            }
                        })
                    });
                }else {
                    processReq(arg, function (err,nextArg) {
                        count++;
                        if(err) {
                            fault+= arg.head;
                            cb(err);
                        }else if(arg.after){
                            arg.after(params,function(){
                                index++;
                                cb();  
                            });
                        }else {
                            index++;
                            cb();                                
                        }
                    })                    
                }
            } catch (e) {
                cb(e.message)
            }
        },
        function (err) {
            var errMsg = undefined;
            if (err) {
                errMsg = {
                    err : err,
                    fault : fault
                }
            }
            callback(errMsg, count);
        }
    )
}

module.exports = test;