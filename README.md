[![Stories in Ready](https://badge.waffle.io/minehp/iviTest.png?label=ready&title=Ready)](https://waffle.io/minehp/iviTest)
# iviTest


simple REST API unit test, based from [vowsjs](http://vowsjs.org/) and [request](https://github.com/mikeal/request).  
use [chaijs](http://chaijs.com/api/bdd/) to find BDD documentation.

## Simple to use

just place your code in test folder inside **ivitest** main folder, or you can create custom folder anywhere.

```javascript
    {
        request     : {}, // GLOBAL
        response    : {}, // GLOBAL
        "a context" : {
            request     : {}, // LOCAL
            response    : {}, // LOCAL
            callback    : function(err,res,body) {} // LOCAL
        }
    }
```

### [Request](https://github.com/mikeal/request)

```javascript
    {
        url     : "http://google.com",
        method  : "GET", // POST, GET, PUT, & etc
        headers : {
            'Content-Type': 'text/plain'
        }
    }
```

### Response

#### Check data type

```javascript
    // sample response
    // {
    //      data : [],
    //      list : [],
    //      body : {},
    //      foo  : {},
    //      "check the child" : {
    //          name    : "",
    //          address : "",
    //          years   : 2014,
    //          age     : 26,
    //      }
    // }
    {
        array   : ["data","list"],
        object  : ["body","foo"],
        "check the child"  : {
            string  : ["name","address"],
            number  : ["years","age"],
        }
    }
```

#### Check object inside array

```javascript
    //  sample response
    //  [
    //      {
    //          "name"      : "yuda",
    //          "adress"    : "surabaya",
    //      }
    //  ]
    {
        each   : ["name","address"] // each response has property name and address
    }
```

## callback

[assert](http://chaijs.com/api/assert/), [should or expect](http://chaijs.com/api/bdd/) can directly call from this function

```javascript
    // sample response
    // {
    //      data : [],
    //      list : [],
    //      foo  : {},
    //      "check the child" : {
    //          name    : "",
    //          address : "",
    //          years   : 2014,
    //          age     : 26,
    //      }
    // }
    callback: function(err,response,body) {
        body.should.have.property("data").be.a("array");
        expect(body).to.have.property("list").to.be.a("array");
        assert((typeof body.foo)=="object")
    }
```

## to google


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

