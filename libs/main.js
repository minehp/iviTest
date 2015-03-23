var test = require('./test.js');
var main = function (data) {
    this.data = data;
}

main.prototype.runOnce = function (index) {
    console.log(index)
}

main.prototype.runAll = function () {
    var async = require("async");
    var index = 0;
    async.until(
        function () {
            return index == this.data.length;
        }.bind(this),
        function (cbLoop) {
            if (this.data[index]) {
                var TCD = new test(this.data[index]);
                TCD.on("error", function (err) {
                    cbLoop(err);
                })
                TCD.on("success", function () {
                    index++;
                    cbLoop();
                })
                TCD.run();
            }
        }.bind(this),
        function (err) {
            console.log("done");
        }
    );
}


module.exports = main;