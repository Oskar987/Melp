//this array for markers on the map, this array also use to bind handler to marker
// arrays to hold copies of the markers and html used by the side_bar 
// because the function closure trick doesnt work there 
var gmarkers = [];
// this variable for google map, I use it globally because we need use map not only knockout,
//of course you use it as parameter and incapsulate it if it is necessary.
var map = null;

//this is address objects, probably you may get it from everywhere, database, api etc.
var addresses = [{"categoryId": 1, "name" : "25 S Main St, Belmont, NC 28012"},
	{"categoryId": 1, "name" : "5000 Whitewater Center Pkwy, Charlotte, NC 28214"},
	{"categoryId": 1, "name" : "8400 Bellhaven Blvd, Charlotte, NC 28216"},
	{"categoryId": 2, "name" : "1115 S Mint St, Charlotte, NC 28203"},
	{"categoryId": 2, "name" : "1224 Commercial Ave, Charlotte, NC 28205"},
	{"categoryId": 2, "name" : "3301 Freedom Dr, Charlotte, NC 28208"}];

//this is knockout viewmodel for binding our logic and data with markup
//http://knockoutjs.com/documentation/observables.html
var melpModel = function(){
	var self = this;
	//this is call of yelp data provider form file yelp.js
	var yelp = new YelpDataProvider();

	//we put categories to observable property because it needs for categories filter, if this data doesnt need for markup you can 
	//define it outside the viewmodel or inside but as private property
	self.categories = [{"id": 1,"name" : "Bars"}, {"id": 2,"name" : "Gyms"}];
	//mark this property as observableArray
	self.places = ko.observableArray();
	//mark this property as observable
	self.selectCategory  = ko.observable();

	self.showMarker = function(event,item){
		if(gmarkers.length){
			var _marker = _.find(gmarkers, function(marker){ return marker.name == item.currentTarget.dataset.name; });
			google.maps.event.trigger(_marker, 'click');	
		}
		
	};

	// this function used for open/close sidebar, I use jquery in this place because I need manipulation with dom's elements
	//you know, markup
	self.toggleBar = function(item, event) {
		var _this = $(event.currentTarget);
		if(_this.children('span').hasClass("glyphicon-eye-close")){
			_this.children('span').removeClass("glyphicon-eye-close");
			_this.children('span').addClass("glyphicon-eye-open");
		}else{
			_this.children('span').removeClass("glyphicon-eye-open");
			_this.children('span').addClass("glyphicon-eye-close");
		}

		var myWrapper = $("#wrapper");
	    $("#wrapper").toggleClass("toggled");
	    $('.locations').hide()
	    myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
	      // code to execute after transition ends
	      google.maps.event.trigger(map, 'resize');
	      if($('.toggled').length == 0){
	        $('.locations').show()
	      }
	    });	
	}

	//this is handler for filter select in the our page, I also use jquery in it
    self.selectCategory.subscribe(function(category) {
	      var adItems = $('.locations li');
	      _.each(adItems, function(aditem){
	          $(aditem).hide();
	      });

	      if(typeof category != "undefined"){
	        _.each(adItems, function(aditem){
	        if($(aditem).data('cat') == category)
	          $(aditem).show();
	        });  
	      }else{
	        _.each(adItems, function(aditem){
	          $(aditem).show();
	        });
	      }
	      
	    });

    	//Get our locations from yelp 
		yelp.getDataForPlaces(addresses).then(function(place){
			self.places(place);
		})
	};

//it is custom binding for bind google map to the our markup element 
//we need write data-bind="googlemap: parameters" in the element(div, p, what ever you want)
//parameters for this binding our places from yelp

ko.bindingHandlers.googlemap = {
    update: function (element, valueAccessor) {
    	//this property is our locations from yelp, and we need to unwrap it because we use it like data for manipulation further
        var value = ko.utils.unwrapObservable(valueAccessor());
        var places = value.locations();

        //we check places for sure that this data is available, because we get it via asinchronous request.
		if(places.length){
			//it is place for centering a map
			var firstplace = places[0];
			//it is settings for google map
		    var mapOptions = {
		    zoom: 12,
	        center: new google.maps.LatLng(firstplace.businesses[0].location.coordinate.latitude,
	        firstplace.businesses[0].location.coordinate.longitude),
		    mapTypeControl: true,
		    mapTypeControlOptions: {
		      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		    },
		    navigationControl: true,
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		  	}

		  	//create map here
	        map = new google.maps.Map(element, mapOptions);

	        //it is variable for get an address, we need address for mapping categoryId and items from the collapsible list
	        var x = 0;


	        //it is loop for creating the markers on the google map
			_.each(places, function(place){
				//it is like point on the map
				var point = new google.maps.LatLng(place.businesses[0].location.coordinate.latitude,
				 				place.businesses[0].location.coordinate.longitude);

				var address  = addresses[x];
				//it is our template for collapsible list and popup window on the map at the same time
				var info = '<div class="media item" data-cat="'+ address.categoryId +'">' +
                    '<div class="media-left">' +
                        '<a data-bind="'+  place.businesses[0].url +'">'+
                            '<img class="media-object" src="'+ place.businesses[0].image_url+'" >'+
                        '</a>'+
                     '</div>'+
                      '<div class="media-body">'+
                        '<h5 style="text-transform:uppercase" class="media-heading">'+
                        '<a target="_blank" href="'+place.businesses[0].url+'">'+place.businesses[0].name+'</a></h4>'+
                        '<p>'+place.businesses[0].display_phone+'</p>'+
                        '<p>'+place.businesses[0].snippet_text+'</p>'+
                      '</div>'+
                   '</div>';

                 //Create marker here
	            var marker = createMarker(point, place.businesses[0].name,info);
	            //increment the value for getting next categoryId for our itemList
	            x++;
			});	
		}
	}
};



// it is a function to create the marker and set up the event window function 
function createMarker(latlng, name, html) {
  var contentString = html;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    name:name,
    zIndex: Math.round(latlng.lat() * -100000) << 5
  });

  // add listener click for marker on the map
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
  // save the info we need to use later for the side_bar
  gmarkers.push(marker);
}

var infowindow = new google.maps.InfoWindow({
  size: new google.maps.Size(100, 200)
});

//bind our viewmodel to murkup
ko.applyBindings(melpModel);


