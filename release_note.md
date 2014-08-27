## release note

### 0.9.1
    - fix headers send
    - auto set cookie for request if exists
### 0.9.2
    - fix request priority
### 0.9.3
    - fix cookie save
    - fix race condition error
### 0.9.4
    - json response check
    - check each array
### 0.9.5
    - fix response return value
### 0.9.6
    - add badge
### 0.9.7
    - fix badge

## target

####version 1.0.0 :
	- use vows (http://vowsjs.org/) as test library (done)
	- use request (https://github.com/mikeal/request) as http request client (done)
	- can test to google (done)
	- can choose what file to test (done)
	- return function to test file ( done )
    - global parameter to prevent write request url or header repeatedly (done)
    - recursively check json response (done)
	- try to test with custom server (done)
	- create documentation

####version 2.0.0 :
    - create as execute apps ( in /usr/bin )
        + just execute current file
    - add configuration file