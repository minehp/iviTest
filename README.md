# iviTest


simple REST API unit test, based from [vowsjs](http://vowsjs.org/) and [request](https://github.com/mikeal/request).  
use [chaijs](http://chaijs.com/api/bdd/) to find BDD documentation.

## Simple to use

just place your code in test folder inside **ivitest** main folder, or you can create custom folder anywhere.

####try.js

```javascript
    var google = {
	    "request1" : {
    		request 	: { // this parameter can found in https://github.com/mikeal/request
    			method 	: "GET",
    			url 	: "http://google.com",
    		},
    		response 	: {
    			statusCode 	: 200, // code response must have status code 200
    		}
    	}
    }

    module.exports = google;
```

or if you want to use first response as second request

```javascript
    var google = {
	    "request1" : {
    		request 	: { // this parameter can found in https://github.com/mikeal/request
    			method 	: "GET",
    			url 	: "http://google.com",
    		},
    		response 	: {
    			statusCode 	: 200, // code response must have status code 200
    		},
    		callback    : function(err,res,body) {
    		    return {
    		        body : {
    		            status : res.statusCode
    		        }
    		    }
    		}
    	},
    	"request2" : {
    	    request 	: { // this parameter can found in https://github.com/mikeal/request
    			method 	: "POST",
    			url 	: "http://custom.com/getstatus",
    			body    : {
    			    detail : "status from google"
    			}
    		},
    		response 	: {
    			statusCode 	: 200, // code response must have status code 200
    		}
    	}
    }

    module.exports = google;
```

of if you want use BDD test

```javascript
    var showPersistent = {
        request : { // global variable
            method  : "GET",
            host    : "http://localhost:54321"
        },
        response : {
            statusCode : 200,
            body    : {
                status  : "success"
            }
        },
        "request1" : {
            request : { // local variable
                pathname    : "/products/list",
                method      : "POST",
                body        : {}
            },
            callback: function(err,response,body) {
                body.should.have.property("data"); // BDD test
                body.data.should.be.a("array"); // BDD test
                body.data.should.have.property("products_id").with.a("number");
            }
        }
    }

    module.exports = showPersistent;
```

then execute them : `node run.js`  
if you want to run test in other folder : `node run.js -t /foldername`   
if you want to know all file to run : `node run.js -l`  
if you want to execute just one file ( not all in one hit ) : `node run.js -c 1`  
( number `1` can change with other number or string file name ) 

to see help : `node run.js -h`


## release note

### 0.9.1
    - fix headers send
    - auto set cookie for request if exists


## target

####version 1.0.0 :
	- use vows (http://vowsjs.org/) as test library (done)
	- use request (https://github.com/mikeal/request) as http request client (done)
	- can test to google (done)
	- can choose what file to test (done)
	- return function to test file ( done )
	- create as execute apps ( in /usr/bin )
		+ just execute current file
    - recursively check json response (done)
	- try to test with custom server (done)
	- create documentation

####version 2.0.0 :
    - global parameter to prevent write request url or header repeatedly (done)
    - add configuration file