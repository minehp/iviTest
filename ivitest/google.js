module.exports = {
   "request1" : {
       request : {
           url : "http://google.com"
       },
       response : {
           statusCode : 200
       },
       callback: function (err, response, body) {
       },
       before : function (data, done) {
           data["request1"].request.method = "GET";
           done();
       },
       after : function (data, done) {
           done();
       },
   }
}