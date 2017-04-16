[![Stories in Ready](https://badge.waffle.io/minehp/iviTest.png?label=ready&title=Ready)](https://waffle.io/minehp/iviTest)
# iviTest
[![NPM version](https://badge.fury.io/js/ivitest.png)](http://badge.fury.io/js/ivitest)
[![Stories in Ready](https://badge.waffle.io/minehp/iviTest.png?label=ready&title=Ready)](https://waffle.io/minehp/iviTest)

[![NPM](https://nodei.co/npm/ivitest.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ivitest/)

Simple REST API unit test, based from [vowsjs](http://vowsjs.org/) and [request](https://github.com/mikeal/request).  
Use [chaijs](http://chaijs.com/api/bdd/) to find BDD & TDD documentation.

## Simple to use

just place your code in test folder inside **ivitest** main folder, or you can create custom folder anywhere.

```javascript
    {
        request     : {}, // GLOBAL
        response    : {}, // GLOBAL
        "a context" : {  // LOCAL
            request     : {},
            response    : {},
            callback    : function(err,res,body) {},
            before      : function(data,done) {},
            after       : function(data,done) {}
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


if you want to use first response as second request

```javascript
    var google = {
        "request1" : {
            request     : { 
                method  : "GET",
                url     : "http://google.com",
            },
            response    : {
                statusCode  : 200
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
            request     : {
                method  : "POST",
                url     : "http://custom.com/getstatus",
                body    : {
                    detail : "status from google"
                }
            },
            response    : {
                statusCode  : 200
            }
        }
    }

    module.exports = google;
```

### Before & After
```javascript
    var mongoose = require("mongoose");
    mongoose.connect("mongodb://localhost/mydb");
    var user = mongoose.model("users",{},"users);
    var google = {
        "request1" : {
            request     : { 
                method  : "GET",
                url     : "http://google.com",
            },
            response    : {
                statusCode  : 200
            },
            callback    : function(err,res,body) {
            },
            before : function(data,done) {
                var su = new user({name:"yuda"});
                su.save(function(err) {
                    data.name = "yuda";
                    done();
                })
            },
            after : function(data,done) {
                su.remove({name:data.name},function() {
                    done();
                })
            }
        }
    }

    module.exports = google;
```

then execute them : `ivitest`  
if you want to run test in other folder : `ivitest -t /foldername`   
if you want to know all file to run : `ivitest -l`  
if you want to execute just one file ( not all in one hit ) : `ivitest -c 1`  
( number `1` can change with other number or string file name ) 

to see help : `ivitest -h`