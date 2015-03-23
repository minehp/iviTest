module.exports = {
    "request1" : {
        request : {
            url : "http://google.com"
        },
        response : {
            statusCode : 200
        },
        before : function (data, done) {
            data["request1"].request.method = "GET";
            done();
        },
        after: function (err, response, body) {
            //response.should.have.property("statusCode").with.a("number").and.equal(300);
        }
    }
}