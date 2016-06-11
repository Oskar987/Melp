'use strict'

function YelpDataProvider(){

//start --settings for auth
var auth = {
            // Update with your auth tokens.
            consumerKey : "Jif1HUbQtE_RsW_BhOPj8w",
            consumerSecret : "o0ATrXPitb8uzwZKR5KhmUBn_3c",
            accessToken : "fySWzJuPiMDG7PTBMJkk4AkqvVKsOc5J",
            // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
            // You wouldn't actually want to expose your access token secret like this in a real application.
            accessTokenSecret : "z_ZzViY5QWml95X5wEn9PxkGUgE",
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };

var accessor = {
    consumerSecret : auth.consumerSecret,
    tokenSecret : auth.accessTokenSecret
};
//end --settings for auth 


//start --settings for query by default
var sort=1;
var limit=1;
var radius_filter=50;
var actionlinks=true;
//end --settings for query by default

//public function for getting locations
this.getDataForPlaces = function(addresses){
	return Promise.all(Array.prototype.map.call(addresses, function(address) {
        return getLocationDesc(address);
   }));
	
};


// console.log(places);
//         if(places.length){
//             _.each(places, function(place){
//                 place.businesses[0].cat = address.categoryId;
//                 console.log(place.businesses[0].cat);
//             });    
//         }

//private function for getting one location
var getLocationDesc = function(address){
	return new Promise(function(resolve, reject) {
			var parameters = [];
            parameters.push(['sort', sort]);
            parameters.push(['limit', limit]);
            parameters.push(['radius_filter', radius_filter]);
            parameters.push(['actionlinks', actionlinks]);
            parameters.push(['location', address.name]);
            parameters.push(['callback', 'callback']);
            //it is parameters for connecting and authorization with yelp, you can get it your own if you go to the page
            //https://www.yelp.com/developers/manage_api_keys, of course you need a registration
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

            var message = {
                'action' : 'http://api.yelp.com/v2/search',
                'method' : 'GET',
                'parameters' : parameters
            };



            //this is extra functions for sigin on the yelp
            //I use third-party library for OAuth signIn oauth.js, also for oauth.js ypu need to provide one more lib sha1.js
            //sha1.js it is library for generating security tokens with encription https://ru.wikipedia.org/wiki/HMAC
            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            var parameterMap = OAuth.getParameterMap(message.parameters);
            //it is our request with yelp
            $.ajax({
                url : message.action,
                cache : true,
                method : message.method,
                data : parameterMap,
                dataType : 'jsonp',
                jsonp : 'callback',
                success : resolve,
                error : reject
            }).done(function(data){
                data.businesses[0].categoryId = address.categoryId;
            });
        });
	};

}
