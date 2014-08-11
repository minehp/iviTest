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
			console.log(response.statusCode)
			this.assert(response.statusCode==200,"error bu");
		}
	}
}

module.exports = google;