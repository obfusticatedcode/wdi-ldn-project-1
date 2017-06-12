
/*global google:true*/

$(() => {

  const $threeWordsLocation = $('#three-words-location');
  const $lat = $('#lat');
  const $lng = $('#lng');
  let currentCountryER = null;
  //tesing JS works
  console.log(`JS is working fine`);

  //setup the map and infoWindow constiable
  let map, infoWindow = null;

  if($('#map').length > 0) initMap();

  //testing google maps initialization
  function initMap() {
    const lat = $('#map').data('lat');
    const lng = $('#map').data('lng');

    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: latLng

    });

    google.maps.event.addListener(map, 'dragend', function() {
      const newLat = map.getCenter().lat();
      const newLng = map.getCenter().lng();
      console.log(newLat, newLng);
      getThreeWords(newLat, newLng);
    });
    //infoWindow
    infoWindow = new google.maps.InfoWindow;

    //geoCoder
    const geocoder = new google.maps.Geocoder;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);

        infoWindow.setContent('Your current location.');
        infoWindow.open(map);
        map.setCenter(pos);
        console.log(pos);
        getThreeWords(pos.lat, pos.lng);
        
        //trying geoCoder for reverseGeolocation, getting the Country Name
        geocoder.geocode({'location': pos}, (results) => {
          console.log(results[0].address_components[6].long_name);
        });

      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
    //create a marker
    new google.maps.Marker({
      position: latLng,
      map: map
    });

  }//end of initMap()

  //handleLocationError()
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }//end of handleLocationError()


  // make an ajax request to what3words based on the pos, grab the response, the words, populate the form field using .val()
  // populate hidden form fields for the lat and lng
  // using ajax to get the three-words-location/string
  function getThreeWords(lat, lng){
    $.ajax({
      url: `https://api.what3words.com/v2/reverse?coords=${lat},${lng}&display=full&format=json&key=E0MJL3VQ`,
      method: 'GET'

    })
    .done((response) => {

      //updating the location field
      $threeWordsLocation.val(response.words);
      // update the hidden form fields for lat and lng
      $lat.val(lat);
      $lng.val(lng);

    });
  }

  $.ajax({
    url: 'http://www.apilayer.net/api/live?access_key=9349182f47c0d493c3853badcdce3cfc',
    method: 'GET'

  })
  .done((response) => {
    console.log(response.quotes);
    currentCountryER = response.quotes.USDZAR;

  });


});//end of JS load
