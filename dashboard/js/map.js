/*
 * 5 ways to customize the infowindow
 * 2015 - en.marnoto.com
*/

// map center
var center = new google.maps.LatLng(41.5585288, -8.3987357);


// marker position
var factory = new google.maps.LatLng(41.5585288, -8.3987357);

function initialize() {
  var mapOptions = {
    center: center,
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);

  var content = '<div id="iw-container">' +
                '<div class="iw-image"> <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk56Cbq7qV86n0wtPMQFKzp3021IImfhz_yIZQ4z-rDYnpm70D" alt="Porcelain Factory of Vista Alegre" height="100%" width="100%"></div>' +                               
                '<div class="iw-title">D4 - Rotunda</div>' +                                      
                '<div class="iw-content">' +    
                '<div class="iw-subTitle">Coordenadas:</div>' +
                '<p><b>Latitude</b>: 41.5585288</p>' + 
                '<p><b>Longitude</b>: -8.3987357 </p>' + 
                '<hr>' + 
                '<p><b>Timestamp</b>: 2017-11-25 18:38:54 </p>' + 
                '<p><b>Precisão</b>: 80%</p>' + 
                '<p><b>Nota</b>:</p>' + 
                '</div>' + 
                '<div class="iw-bottom-gradient"></div>' +
              '</div>';
  
  var iconBase = 'https://github.com/taniaesteves/UCE15/blob/master/Code/Model/Catalogs/sinais_de_transito/icons/';
  var iconBaseEnd = '.png?raw=true';
  var icons = {
      D1A: {
      icon: iconBase + 'D1A' + iconBaseEnd,
      title: 'D1A - Sentido obrigatorio'
    },
    D4: {
      icon: iconBase + 'D4' + iconBaseEnd,
      title: 'D4 - Rotunda'
    },
    B2: {
      icon: iconBase + 'B2' + iconBaseEnd,
      title: 'B2 - Paragem obrigatoria no cruzamento ou entroncamento'
    },
    H7: {
        icon: iconBase + 'H7' + iconBaseEnd,
        title: 'H7 - Passagem para peoes'
    }
  };

  var markers = [
    {
        position: new google.maps.LatLng(41.1473503, -8.3996456),
        type: 'D4',
        contentString: content
    }, {
        position: new google.maps.LatLng(41.5580039, -8.3983606),
        type: 'H7',
        contentString: content
    }, {
        position: new google.maps.LatLng(41.5580278, -8.3979252),
        type: 'H7',
        contentString: content
    }, {
        position: new google.maps.LatLng(41.5580606, -8.3981922),
        type: 'D4',
        contentString: content
    }, {
        position: new google.maps.LatLng(41.5580814, -8.3976456),
        type: 'D1A',
        contentString: content
    }, {
        position: new google.maps.LatLng(41.556813, -8.3998552),
        type: 'B2',
        contentString: content
    }
    ];

  // A new Info Window is created and set content
  var infowindow = new google.maps.InfoWindow({
    //content: content,

    // Assign a maximum value for the width of the infowindow allows
    // greater control over the various content elements
    maxWidth: 350
  });
   
  // marker options
  /*var marker = new google.maps.Marker({
    position: factory,
    map: map,
    title:"Fábrica de Porcelana da Vista Alegre"
  });
  */
  markers.forEach(function(element) {
      var marker = new google.maps.Marker({
          position: element.position,
          icon: { 
              url: icons[element.type].icon,  
              scaledSize: new google.maps.Size(30, 30), // scaled size
              origin: new google.maps.Point(0,0), // origin
              anchor: new google.maps.Point(0, 0) // anchor 
          },
          title: icons[element.type].title,
          map: map
      });

      google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(element.contentString);    
          infowindow.open(map, marker); //take care with case-sensitiveness
      });
      
  });


  // This event expects a click on a marker
  // When this event is fired the Info Window is opened.


/*  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });*/

  // Event that closes the Info Window with a click on the map
  google.maps.event.addListener(map, 'click', function() {
    infowindow.close();
  });

  // *
  // START INFOWINDOW CUSTOMIZE.
  // The google.maps.event.addListener() event expects
  // the creation of the infowindow HTML structure 'domready'
  // and before the opening of the infowindow, defined styles are applied.
  // *
  google.maps.event.addListener(infowindow, 'domready', function() {

    // Reference to the DIV that wraps the bottom of infowindow
    var iwOuter = $('.gm-style-iw');

    /* Since this div is in a position prior to .gm-div style-iw.
     * We use jQuery and create a iwBackground variable,
     * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
    */
    var iwBackground = iwOuter.prev();

    // Removes background shadow DIV
    iwBackground.children(':nth-child(2)').css({'display' : 'none'});

    // Removes white background DIV
    iwBackground.children(':nth-child(4)').css({'display' : 'none'});

    // Moves the infowindow 115px to the right.
    iwOuter.parent().parent().css({left: '30px'});

    // Moves the shadow of the arrow 76px to the left margin.
    iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 85px !important;'});

    // Moves the arrow 76px to the left margin.
    iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 85px !important;'});

    // Changes the desired tail shadow color.
    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

    // Reference to the div that groups the close button elements.
    var iwCloseBtn = iwOuter.next();

    // Apply the desired effect to the close button
    iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #1B8496', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

    // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
    if($('.iw-content').height() < 140){
      $('.iw-bottom-gradient').css({display: 'none'});
    }

    // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
    iwCloseBtn.mouseout(function(){
      $(this).css({opacity: '1'});
    });
  });
}
google.maps.event.addDomListener(window, 'load', initialize);