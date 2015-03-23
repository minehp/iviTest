var base = global.base = __dirname;
var fs = require("fs"),
    assert = require("assert"),
    path = require("path"),
    util = require("util"),
    chai = require("chai"),
    libsPath = path.resolve(base, "./libs"),
    main = require(path.resolve(libsPath, "main.js")),
    helper = require(path.resolve(libsPath,"helper.js"));

global.expect = chai.expect;
global.should = chai.should();

module.exports = function (params) {
    try {
        assert(params, "Invalid parameter");
        assert(params.path, "Test path require");
        assert(fs.existsSync(params.path), "Test folder not exist");
        
        var LOTF = []; // List Of Test File
        helper.reqAll(params.path, LOTF);
        if (params.list) { // print list file
            LOTF.forEach(function (value,key) {
                console.log(key+" = "+Object.keys(value))
            })
            console.log("\n")
            process.exit();
        } else if (params.test!=undefined) { // test one file
            var testNaN = Number(params.test);
            var index = params.test;
            if (Number.isNaN(testNaN)) {
                LOTF.forEach(function (value, key) {
                    if (Object.keys(value)[0] == params.test) {
                        index = key;
                    }
                })
            }
            var execute = new main(LOTF);
                execute.runOnce(index);
        } else { // test all file
            var execute = new main(LOTF);
            execute.runAll();
        }

    }catch(e) { console.error(e.message); }
}
