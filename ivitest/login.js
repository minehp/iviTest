module.exports = {
    request : {
        host : "192.168.7.54",
        port : 54321
    },
    response : {
        statusCode : 200
    },
    "login" : {
        request : {
            path : "/users/login",
            form : {
                username : "admin",
                password : "admin"
            }
        },
        response : { body : "test" },
        before : function (data, done) {
            data["login"].request.method = "POST";
            done();
        },
        callback : function(err,res,body) {
            // res.should.have.property("statusCode").with.a("number").and.equal(300);
        },
        after: function (data, done) {
            data.save = true;
            done();
        }
    },
    "login 2" : {
        request : {
            path : "/users/login",
            form : {
                username : "admin",
                password : "admin"
            }
        },
        response : { body : "test" },
        before : function (data, done) {
            data["login 2"].request.method = "POST";
            done();
        },
        callback : function(err,res,body) {
            // res.should.have.property("statusCode").with.a("number").and.equal(300);
        },
        after: function (data, done) {
            done();
        }
    }
}