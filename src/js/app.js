
/*global google:true*/

$(() => {

  const $threeWordsLocation = $('#three-words-location');
  const $country = $('#country');


  const $lat = $('#lat');
  const $lng = $('#lng');
  const $currency = $('#currency');


  //tesing JS works
  console.log(`JS is working fine`);

  //setup the map and infoWindow constiable
  let map, infoWindow, newLat, newLng = null;



  if($('#map').length > 0) initMap();

  //google maps initialization
  function initMap() {
    const lat = $('#map').data('lat');
    const lng = $('#map').data('lng');

    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: latLng
    });

    //infoWindow
    infoWindow = new google.maps.InfoWindow;

    google.maps.event.addListener(map, 'dragend', function() {
      newLat = map.getCenter().lat();
      newLng = map.getCenter().lng();

      getThreeWords(newLat, newLng);
      geocodeCountry(newLat, newLng);
    });


    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);

        infoWindow.setContent(`Your current location.`);
        infoWindow.open(map);
        map.setCenter(pos);

        //update the three words based on lat lng
        getThreeWords(pos.lat, pos.lng);
        //update the currency based on lat lng
        geocodeCountry(pos.lat, pos.lng);

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

  //geocode the lat lng and make ajax call to countries API to get country name
  function geocodeCountry(lat, lng) {
    $.ajax({
      url: `http://ws.geonames.org/countryCodeJSON?lat=${lat}&lng=${lng}&username=obfusticatedcode`,
      method: 'GET'
    })
    .done((response) => {
      const country = response.countryCode;
      console.log(`This country is ${country}`);
      getCurrency(country);
      getCountryName(country);

    });
  }

  //make api call to get currency based on country name then currency
  function getCurrency(country) {
    $.ajax({
      url: `https://restcountries.eu/rest/v2/alpha/${country}`,
      method: 'GET'
    })
    .done((response) => {
      const currency = response.currencies[0].code;
      console.log(`The currency in ${country} is: ${currency}`);
      $currency.val(currency);
    });
  }

  //make api call to get the CountryName
  function getCountryName(country){
    $.ajax({
      url: `https://restcountries.eu/rest/v2/alpha/${country}`,
      method: 'GET'
    })
    .done((response) => {
      const countryName = response.nativeName;
      $country.val(countryName);

    });
  }

  //get the CityName




  //get the current exchange rate and map it to the Country name
  function getExchangeRate() {
    $.ajax({
      url: 'http://www.apilayer.net/api/live?access_key=9349182f47c0d493c3853badcdce3cfc',
      method: 'GET'
    })
    .done((response) => {
      //to be used on post show page
      console.log(response.quotes);
    });
  }

  //send email to poster
  const $emailLink = $('.email-link');
  $emailLink.on('click', () => {
    console.log(`clicked`);

  });

});//end of JS load
