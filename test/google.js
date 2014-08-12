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
			this.assert(response.statusCode==200,"error with status code");
		}
	}
}

module.exports = google;