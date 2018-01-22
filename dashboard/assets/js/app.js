var map, featureList;
var featuresInfo = {}; 

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

// $("#full-extent-btn").click(function() {
//   //map.fitBounds(boroughs.getBounds()); TODO
//   $(".navbar-collapse.in").collapse("hide");
//   return false;
// });

// $("#legend-btn").click(function() {
//   $("#legendModal").modal("show");
//   $(".navbar-collapse.in").collapse("hide");
//   return false;
// });

// $("#login-btn").click(function() {
//   $("#loginModal").modal("show");
//   $(".navbar-collapse.in").collapse("hide");
//   return false;
// });

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

$.ajaxSetup({ async: false })
$.getJSON("data/featuresinfo.json", function (data) { 
  $.ajaxSetup({ async: true })
  $.each(data, function(i, element) {     
    featuresInfo[element.type] = {      
      'type': element.type,
      'title': element.title,
      'icon': element.icon,
      'search': [],
      'layer': L.geoJson(null),
      'markers': L.geoJson(null, {        
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: L.icon({
              iconUrl: element.icon,
              iconSize: [32, ],
              iconAnchor: [12, 28],
              popupAnchor: [0, -25]
            }),
            title: feature.properties.TITLE,
            riseOnHover: true
          });
        },
        onEachFeature: function (feature, layer) {
          
            if (feature.properties) {
              var content = "<img src='" + feature.properties.IMAGE + "' width='100%'><table class='table table-striped table-bordered table-condensed'>" + "<tr><th>TITLE</th><td>" + element.title + "</td></tr>" + "<tr><th>TIMESTAMP</th><td>" + feature.properties.TIMESTAMP + "</td></tr>" + "<tr><th>PRECISION</th><td>" + feature.properties.PRECISION + "</td></tr>" + "</td></tr>" + "<tr><th>ADDRESS</th><td>" + feature.properties.ADDRESS + "</td></tr><table>";
              layer.on({
                  click: function (e) {
                      $("#feature-title").html(element.title + " [ " + feature.properties.ADDRESS + " ]");
                      $("#feature-info").html(content);
                      $("#featureModal").modal("show");
                      highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
                  }
              });
              $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="' + element.icon + '"></td><td class="feature-name">' + layer.feature.properties.TITLE + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');                
              featuresInfo[element.type]["search"].push({
                  name: layer.feature.properties.TITLE,
                  address: layer.feature.geometry.coordinates[1] + layer.feature.geometry.coordinates[0],
                  source: element.type,
                  id: L.stamp(layer),
                  lat: layer.feature.geometry.coordinates[1],
                  lng: layer.feature.geometry.coordinates[0]
              });
          }
        }        
      }),      
      'bh': {}
    };
    $.getJSON("data/" + element.type + ".geojson", function (data) {
      // console.log("DATA MARKERS " + element.type + ": " + JSON.stringify(data));                    
      featuresInfo[element.type]["markers"].addData(data);                  
    });    
  });
  
});


function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();  

  // console.log("sysncSidebar");  

  /* Loop through signals layer and add only features which are in the map bounds */
  $.each(featuresInfo, function(i, element) {    
    element['markers'].eachLayer(function (layer_x) {        
        if (map.hasLayer(element.layer)) {
            if (map.getBounds().contains(layer_x.getLatLng())) {
                  $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer_x) + '" lat="' + layer_x.getLatLng().lat + '" lng="' + layer_x.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="' + element.icon + '"></td><td class="feature-name">' + layer_x.feature.properties.TITLE + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
            }
        }
    });
});

  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 15,
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};


/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

map = L.map("map", {
  zoom: 10,
  center: [-8.3987357, 41.5585288],
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  $.each(featuresInfo, function(i, element) {
    if (e.layer === element.layer) {  
        console.log("aaaaaaa");
        markerClusters.addLayer(element.markers);
        syncSidebar();
    }
  });
});

map.on("overlayremove", function(e) {
  $.each(featuresInfo, function(i, element) {
    if (e.layer === element.layer) {  
        console.log("oooooooo");
        markerClusters.removeLayer(element.markers);
        syncSidebar();
    }
  });
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://atlas-innovation.pt'>atlas-innovation.pt</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight,
  "Aerial Imagery": usgsImagery
};

var groupedOverlays = {
  "Points of Interest": {}
};

$.each(featuresInfo, function(i, element) {
  groupedOverlays["Points of Interest"]["<img src='" + element.icon + "' width='24' height='28'>&nbsp;" + element.type] = featuresInfo[element.type]["layer"];
});

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
  console.log("search on top!!");
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  console.log("loading");
  sizeLayerControl();
  
  var bounds = new L.LatLngBounds(new L.LatLng(41.5585288, -8.3987357), new L.LatLng(41.5585288, -8.3987357));
    // map.fitBounds(featuresInfo[Object.keys(featuresInfo)[0]].markers.getBounds());
    map.fitBounds(bounds);
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  $.each(featuresInfo, function(i, element) {
    element.bh = new Bloodhound({
        name: element.type,
        datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: element.search,
        limit: 10
    });                
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  $.each(featuresInfo, function(i, element) {    
    element['bh'].initialize();        
  }); 
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {            // TODO
  //   name: "D4",
  //   displayKey: "name",
  //   source: featuresInfo['D4']['bh'].ttAdapter(),
  //   templates: {
  //     header: "<h4 class='typeahead-header'><img src='https://github.com/taniaesteves/UCE15/blob/master/Code/Model/Catalogs/sinais_de_transito/icons/D4.png?raw=true' width='24' height='28'>&nbsp;D4</h4>",
  //     suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
  //   }
  // }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {    
    $.each(featuresInfo, function(i, element) {
      if (datum.source === element.type) {
          if (!map.hasLayer(element.layer)) {
              map.addLayer(element.layer);
              console.log("add layer");
          }
          map.setView([datum.lat, datum.lng], 17);
          if (map._layers[datum.id]) {
              map._layers[datum.id].fire("click");
          }
      }  
    });                    
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 17);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
