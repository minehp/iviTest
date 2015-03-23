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
    var testProcess = this;
    var retVal = {};
        retVal[fileName] = {
            topic : function () {
                console.log("\n====================================================");
                console.log("file : " + fileName + " executing....");
                console.log("====================================================\n");

                testProcess.process(testProcess.data[fileName], this.callback);
            },
            "result" : function (err, res) {
                console.log("\n====================================================");
                console.log("file : " + fileName + " executed!!");
                if (err) {
                    console.log("test count : " + err.testCase.count);
                    console.log("list of context : ");
                    console.log("\033[36m" + err.testCase.context.join(" || ") + "\033[0m");
                    console.log("context error : \033[33m" + err.fault + "\033[0m");
                    console.log("error message : \033[33m" + err.err + "\033[0m");
                    console.log("====================================================");
                    testProcess.emit("error",err.err);
                    assert(!err, err.err);
                } else {
                    console.log("test count : " + res.count);
                    console.log("list of context : ");
                    console.log("\033[36m" + res.context.join(" || ") + "\033[0m");
                    console.log("====================================================");
                    testProcess.emit("success");
                }
            }
        }
    return retVal;
}

test.prototype.process = function (params, callback) {
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
    var testCase = {
        count : 0,
        context : []
    }
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
                    arg.globPar = globPar;
                console.log("\033[35mrun testCase : " + arg.head + "\033[0m");
                processReq(arg, function (err,nextArg) {
                    console.log(err);
                    index++;
                    cb();
                })
            } catch (e) {
                cb(e.message)
            }
        },
        function (err) {
            var errMsg = undefined;
            if (err) {
                errMsg = {
                    err : err,
                    testCase : testCase,
                    fault : listOfKeys[index]
                }
            }
            callback(errMsg, testCase);
        }
    )
}

module.exports = test;