//API about tweets data requests...
var OAuth = require('OAuth');//oauth module

//Constructor
function TwitterConnector(searchString) {

    console.log(" -Twitter Connector up and running...");
    this.searchString = searchString;
}

//Methods
TwitterConnector.prototype.CallTwitterVersionOne = function(){
    //var oauth = new OAuth.OAuth(
    //    'https://api.twitter.com/oauth/request_token',
    //    'https://api.twitter.com/oauth/access_token',
    //    'pxza4SS4CRtD8uSSzQLgTA',
    //    'cLBhzg65BmtoDZAXMAZvFOHK2nIMlzx277fk335YnGQ',
    //    '1.0A',
    //    null,
    //    'HMAC-SHA1'
    //);

    //oauth.get(
    //    'https://api.twitter.com/1.1/search/tweets.json?q=' + searchString + '&lang=eng&count=10',
    //    '91327431-7IwG2LsOtc62JU3StzdcIImdylq8TYr86YS517P0I', 
    //    'fy2TBb0cI3UdmTweQtOPHIXtKW5fGPNF2jGGUPnyPS8', 
    //    function (e, data, res) {
    //        if (e) console.error('ERROR: ' + e);
    //        console.log(require('util').inspect(data));
    //});

    //options = {
    //    protocol: 'https:',
    //    host: 'api.twitter.com',
    //    pathname: '/1.1/search/tweets.json?q=' + searchString + '&lang=eng&count=10',
    //    oauth: {
    //        oauth_consumer_key: 'pxza4SS4CRtD8uSSzQLgTA',
    //        oauth_consumer_secret: 'cLBhzg65BmtoDZAXMAZvFOHK2nIMlzx277fk335YnGQ',
    //        token: '91327431-7IwG2LsOtc62JU3StzdcIImdylq8TYr86YS517P0I',
    //        tokensecret: 'fy2TBb0cI3UdmTweQtOPHIXtKW5fGPNF2jGGUPnyPS8'
    //    }
    //}

    //var twitterUrl = url.format(options);
    //request(twitterUrl).pipe(response);

    //var oauth2 = new OAuth.OAuth2(
    //    'pxza4SS4CRtD8uSSzQLgTA',
    //    'cLBhzg65BmtoDZAXMAZvFOHK2nIMlzx277fk335YnGQ',
    //    'https://api.twitter.com/',
    //    null,
    //    'oauth2/token',
    //    null
    //);

    //oauth2.getOAuthAccessToken(
    //    '',
    //    { 'grant_type': 'client_credentials' },
    //    function(e, access_token, refresh_token, results) {
    //        console.log('bearer: ', access_token);
    //        oauth2.get('protected url',
    //        access_token, function(e, data, res) {

    //            if (e) response.send(e);

    //            if (res.statusCode != 200)
    //                response.send('OAuth2 request failed: ' + res.statusCode);

    //            try {
    //                data = JSON.parse(data);
    //            } catch (e) {
    //                response.send(e);
    //            }

    //            response.send(e + ' | ' + data);
    //        });
    //});
};

//Export the class
module.exports = TwitterConnector;