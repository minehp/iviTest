exports.reqAll = function (folderPath, dest) {
    var fs = require("fs"),
        assert = require("assert"),
        path = require("path"),
        util = require("util");
    assert(dest, "dest parameter required");
    assert(util.isArray(dest), "dest parameter must be an array");
    
    fs
    .readdirSync(folderPath)
    .forEach(function (value, key) {
        try {
            var fileToPush = {};
                fileToPush[value] = require(path.resolve(folderPath, value));
            dest.push(fileToPush);
        } catch (e) { if (e.message.indexOf("Cannot find module") == -1) { console.log(e); } }
    });
}