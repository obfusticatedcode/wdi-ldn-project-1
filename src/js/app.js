
/* global google:true */

$(() => {

  //let's validate all forms nicely
  $('form').validate();

  //testing JS works
  console.log(`JS is working fine`);

  const $threeWordsLocation = $('#three-words-location');
  const $country = $('#country');


  const $lat = $('#lat');
  const $lng = $('#lng');
  const $currency = $('#currency');
  const $currencylabel = $('#currency-label');
  const lat = $('#map').data('lat'); // lat and lng of current post (show page)
  const lng = $('#map').data('lng');

  //setup the map and infoWindow constiable
  let map, infoWindow, newLat, newLng , exchangeRates = null;


  if($('#map').length > 0) initMap();

  //google maps initialization
  function initMap() {

    //mapping route
    const directionsService = new google.maps.DirectionsService;
    const directionsDisplay = new google.maps.DirectionsRenderer;

    //find the current location origin and then
    //find the destination where the item is posted.

    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: latLng
    });

    //mapping route
    directionsDisplay.setMap(map);
    const lat1 = 30.0;
    const lng1 = 40.3;
    const origin = (`${lat},${lng}`);
    console.log(origin);
    const destination = (`${lat1},${lng1}`);
    console.log(destination);

    //mapping route
    //add eventListener to the item location
    $('#item-location').on('click', (event) => {
      //testing
      console.log(`clicking works on the item-location`);
      $(event.target).mouseover().css('background-color', 'yellow');
      displayRoute(directionsService);
    });

    function displayRoute(directionsService){
      //mapping route
      directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING'
      }, function(response, status) {
        console.log(response);
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
          const route = response.routes[0];
          const summaryPanel = $('#directions-panel');
          // For each route, display summary information.
          for (let i = 0; i < route.legs.length; i++) {
            const routeSegment = i + 1;
            summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
            '</b><br>';
            const travelDistance = (route.legs[i].distance.text);
            summaryPanel.append(`<p>${travelDistance}</p>`);

            console.log(travelDistance);
            summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
            summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
            summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
          }
        } else {
          console.log('Directions request failed due to ' + status);
        }
      });

    }


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
      const currencyName = response.currencies[0].name;
      $currency.val(`${currency}`); // This should happen on posts/new page
      $currencylabel.text(`${currency}, ${currencyName}`);//This should happen on the posts/show page

      calculateExchangeRate(currency); // This should happen on post/show page
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




  //get the current exchange rate and map it to the Country name
  function getExchangeRate() {
    $.ajax({
      url: 'http://www.apilayer.net/api/live?access_key=9349182f47c0d493c3853badcdce3cfc',
      method: 'GET'
    })
    .done((response) => {
      exchangeRates = response.quotes;
    });
  }

  function calculateExchangeRate(currency) {

    const newCurrency = currency; // Currency to convert to
    // Update the DOM with the currency you're converting to
    // grab the current
    // grab the value
    const currentCurrency = $('#item-currency').text(); // Currency the post was created with
    const price = $('#item-price').text();
    const convertedPriceDisplay = $('#converted-price-display');
    //convert the value into dollars
    //convert the value into the new currency based on location
    const conversionRate = exchangeRates['USD' + currentCurrency];
    const priceInDollars = price/conversionRate;
    const convertedPrice = priceInDollars  * exchangeRates['USD' + newCurrency];
    // Update the DOM with the converted price
    // update the display
    convertedPriceDisplay.html(convertedPrice.toFixed(0));

  }

  //getting the exchangeRates from the currencylayer API
  getExchangeRate();

  //searching
  $('#search').typeahead({
    name: 'typeahead',
    remote: 'http://localhost:3000/search?key=%QUERY',
    limit: 10
  });

//using select 2 for the categories dropdown
  function chooseCategory(){
    $('select').select2();
    const categories = [{ id: 'Electronics', text: 'Electronics'}, { id: 'Food', text: 'Food' }, { id: 'Furniture', text: 'Furniture' }, { id: 'Hardware', text: 'Hardware' }, { id: 'Health and beauty', text: 'Health and beauty' }];

    $('#category').select2({
      placeholder: 'Choose a category',
      allowClear: true,
      data: categories

    });

  }

  chooseCategory();



});//end of JS load
