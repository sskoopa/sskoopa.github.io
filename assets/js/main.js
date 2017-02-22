var myLat, myLong; //will store users latitude and longitude
var maxHits = 3;
var showMoreHelper;

var geoOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function geoSuccess(pos) {
  var crd = pos.coords;
  myLat = crd.latitude;
  myLong = crd.longitude;
};

function geoError(err) {
  //do nothing, we are just not setting latitude and longitude
};

$(function () {
  if (navigator.geolocation) { //attempt to get the geolocation of the user
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  }
  $('#showMore').click(function(){ //incrementally add more search results to the page
    maxHits += 5;
    showMoreHelper.setQueryParameter('hitsPerPage', maxHits).search();
  })
})

//custom widget to add geolocation to the algolia instantsearch widgets
instantsearch.widgets.geoLocate = function geoLocate(container) {

  return {
    getConfiguration: function(currentParams) {
      return {}
    },
    init: function(params) {
      if (myLat && myLong) {
        params.helper.setQueryParameter('aroundLatLng', myLat, myLong);
      } else {
        params.helper.setQueryParameter('aroundLatLngViaIP', true);
      }
      params.helper.setQueryParameter('aroundPrecision', 300)
    },
    render: function(params) {
      //do nothing
    }
  }
}

//custom widget to add geolocation to the algolia instantsearch widgets
instantsearch.widgets.showMore = function showMore(container) {

  return {
    getConfiguration: function(currentParams) {
      return {
        hitsPerPage: maxHits
      }
    },
    init: function(params) {
      showMoreHelper = params.helper;
    },
    render: function(params) {
      //do nothing
    }
  }
}


var search = instantsearch({
  appId: 'G25069ZST3',  //replace with your appid
  apiKey: 'b529eded62b3d1bfe8e02096d7328744', //replace with your apiKey (search only)
  indexName: 'restaurants', //replace with your index
  urlSync: {}
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#q'
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    transformData : {
      body: function(data) {
        data.processTimeSecs = data.processingTimeMS * 0.001;
        return data;
      }
    },
    templates: {
      body: `{{nbHits}} results found <span class=\'smaller\'>in {{processTimeSecs}} seconds`
    }
  })
);

var hitTemplate =
  '<div class="hit clear"><div><img class="media-left" src="{{image_url}}" />' +
    '<div class="title">{{name}}</div>' +
    '<div><span class="orange">{{stars_count}}</span>' + 
    '<span class="star {{ratingclass}}"></span>' + 
    '<span class="gray">({{reviews_count}} reviews)</span></div>' +
    '<div class="gray">{{food_type}} | {{neighborhood}} | {{price_range}}</div>' +
  '</div></div>';

var noResultsTemplate =
  '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    hitsPerPage: 3,
    templates: {
      empty: noResultsTemplate,
      item: hitTemplate
    },
    transformData: function(hit) {
      hit.stars = [];
      for (var i = 1; i <= 5; ++i) {
        hit.stars.push(i <= hit.stars_count);
      }
      return hit;
    }
  })
);



search.addWidget(
  instantsearch.widgets.starRating({
    container: '#rating',
    attributeName: 'rating',
    max: 5,
    labels: {
      andUp: ''
    }
  })
);


search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#cuisine',
    attributeName: 'food_type',
    limit: 7,
    operator: 'or',
    cssClasses: {
      list: 'nav nav-list',
      count: 'badge pull-right',
      active: 'active'
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#payment',
    attributeName: 'payment_options',
    operator: 'or',
    limit: 5,
    cssClasses: {
      list: 'nav nav-list',
      count: 'badge pull-right',
      active: 'active'
    }
  })
);

//add geolocation to the search, remove this if you want plain search
search.addWidget(
  instantsearch.widgets.geoLocate()
);
search.addWidget(
  instantsearch.widgets.showMore()
);

search.start();