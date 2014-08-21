var google = {
	"request1" : {
		request 	: {
			method 	: "GET",
			url 	: "http://google.com",
		},
		response 	: {
			// headers 	: {},
			statusCode 	: 200,
			// body 		: {}
		},
		callback: function(err,response,body) {
			response.should.have.property("statusCode").with.a("number").and.equal(200);
		}
	}
}

module.exports = google;