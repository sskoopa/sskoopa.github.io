var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

var myLat, myLong;

function success(pos) {
  var crd = pos.coords;
  myLat = crd.latitude;
  myLong = crd.longitude;
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

instantsearch.widgets.geoLocate = function geoLocate(container) {

  return {
    getConfiguration: function(currentParams) {
      return {
        hitsPerPage: 1
      }
    },
    init: function(params) {
      if (myLat && myLong) {
        params.helper.setQueryParameter('aroundLatLng', myLat, myLong).search();
      } else {
        params.helper.setQueryParameter('aroundLatLngViaIP', true).search();
      }
    },
    render: function(params) {
      //do nothing
    }
  }
}

$(function () {
  console.log('Page loaded')
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
})


var search = instantsearch({
  appId: 'G25069ZST3',
  apiKey: 'b529eded62b3d1bfe8e02096d7328744',
  indexName: 'restaurants',
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
    '<p class="title">{{name}}</p>' +
    '<p><span class="orange">{{stars_count}}</span><span class="gray">({{reviews_count}} reviews)</span></p>' +
    '<p class="gray">{{food_type}} | {{neighborhood}} | {{price_range}}</p>' +
  '</div></div>';

var noResultsTemplate =
  '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    hitsPerPage: 10,
    templates: {
      empty: noResultsTemplate,
      item: hitTemplate
    },
    transformData: function(hit) {
      hit.stars = [];
      for (var i = 1; i <= 5; ++i) {
        hit.stars.push(i <= hit.stars_count);
      }
      console.log('stars', hit.stars)
      return hit;
    }
  })
);



search.addWidget(
  instantsearch.widgets.starRating({
    container: '#rating',
    attributeName: 'stars_count',
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

search.addWidget(
  instantsearch.widgets.geoLocate()
);

search.start();