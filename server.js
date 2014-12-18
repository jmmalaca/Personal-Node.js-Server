var express = require('express'); //express module
var request = require('request'); //request module
var url = require('url'); //url module

//get a express app started...
var serverApp = express();

//route definitio:... home
serverApp.get('/', function (req, response) {
    console.log("\n -Hello request");

    request(url, function(err, res, body) {
        response.render('hello.ejs');//file on views folder
    });
});

//Start listen on port...
var server = serverApp.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    if (host == "0.0.0.0")
        host = "localhost";
    console.log('\nApp listening at http://%s:%s', host, port);
});
