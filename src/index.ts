/* global google:true */
/// <reference types="@types/google.maps" />

import * as $ from "jquery";
import "googlemaps";

import "select2";
import "jquery-validation";

interface ExchangeRate {
  [key: string]: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

$(() => {
  // $("form").validate();
  $("form").removeAttr("novalidate");
  console.log(`JS is working fine`);

  const $threeWordsLocation = $(".three-words-location");
  const $country = $("#country");
  const $mapMarker = $(".map-marker");
  const $toggleSwitch = $("#toggle-switch");
  const $directionsPanel = $("#directions-panel");
  const $lat = $("#lat");
  const $lng = $("#lng");
  const $currency = $("#currency");
  const $currencylabel = $("#currency-label");
  const lat = $("#map").data("lat"); // lat and lng of current post (show page)
  const lng = $("#map").data("lng");
  let userLocation: UserLocation | null = null;

  //setup the map and infoWindow variables
  let map: google.maps.Map | undefined;
  let infoWindow: google.maps.InfoWindow | undefined;
  let exchangeRates: ExchangeRate | null = null;
  let newLat,
    newLng = null;

  if ($("#map").length > 0) initMap();

  //google maps initialization
  function initMap() {
    //mapping route
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer();

    //find the current location origin and then
    //find the destination where the item is posted.

    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      return;
    }
    map = new google.maps.Map(mapElement, {
      zoom: 14,
      scrollwheel: false,
      center: latLng,
    });

    //mapping route
    directionsDisplay.setMap(map);

    //mapping route
    function generateRoute() {
      //add eventListener to the item location
      //one time action
      $("#item-location").one("click", () => {
        const latUser = userLocation?.lat;
        const lngUser = userLocation?.lng;
        const origin = `${lat},${lng}`;
        const destination = `${latUser},${lngUser}`;
        displayRoute(directionsService, origin, destination);
      });
    }

    generateRoute();

    function displayRoute(
      directionsService: google.maps.DirectionsService,
      origin: string,
      destination: string
    ) {
      //mapping route
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        function (
          response: google.maps.DirectionsResult | null,
          status: google.maps.DirectionsStatus
        ) {
          if (status === "OK") {
            directionsDisplay.setDirections(response);
            const route = response?.routes[0];
            const summaryPanel = $directionsPanel;
            // For each route, display summary information.
            if (route) {
              for (let i = 0; i < route.legs.length; i++) {
                const travelDistance = route.legs[i].distance?.text;
                const startAddress = route.legs[i].start_address;

                // Appending it only once
                summaryPanel.append(
                  `<p>${travelDistance} away at ${startAddress}</p>`
                );
              }
            }
          } else {
            console.log("Directions request failed due to " + status);
          }
        }
      );
    }

    //infoWindow
    infoWindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, "dragend", function () {
      if (infoWindow) {
        infoWindow.close();
      }

      if (map) {
        newLat = map.getCenter()?.lat();
        newLng = map.getCenter()?.lng();
        if (newLat && newLng) {
          getThreeWords(newLat, newLng);
          geocodeCountry(newLat, newLng);
        } else {
          console.log("Error: newLat and newLng are undefined");
        }
      }
    });

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          //current userLocation
          userLocation = pos;

          if (infoWindow) {
            infoWindow.setPosition(pos);
            infoWindow.setContent("Your current location.");
            infoWindow.open(map);
          }

          if (map) {
            map.setCenter(pos);
          }

          //update the three words based on lat lng
          getThreeWords(pos.lat, pos.lng);
          //update the currency based on lat lng
          geocodeCountry(pos.lat, pos.lng);
        },
        function () {
          if (infoWindow && map) {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }

    //create a marker
    new google.maps.Marker({
      position: latLng,
      map: map,
    });
  } //end of initMap()

  function handleLocationError(
    browserHasGeolocation: boolean,
    infoWindow: {
      setPosition: (arg0: any) => void;
      setContent: (arg0: string) => void;
      open: (arg0: any) => void;
    },
    pos: any
  ) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  } //end of handleLocationError()

  // make an ajax request to what3words based on the pos, grab the response, the words, populate the form field using .val()
  // populate hidden form fields for the lat and lng
  // using ajax to get the three-words-location/string
  function getThreeWords(
    lat:
      | string
      | number
      | string[]
      | ((this: HTMLElement, index: number, value: string) => string),
    lng:
      | string
      | number
      | string[]
      | ((this: HTMLElement, index: number, value: string) => string)
  ) {
    $.ajax({
      url: `/getThreeWords?lat=${lat}&lng=${lng}`,
      method: "GET",
    }).done((response) => {
      //updating the location field
      $threeWordsLocation.val(response.words);
      // update the hidden form fields for lat and lng
      $lat.val(lat);
      $lng.val(lng);
    });
  }

  //geocode the lat lng and make ajax call to countries API to get country name
  function geocodeCountry(lat: number, lng: number) {
    $.ajax({
      url: `/country?lat=${lat}&lng=${lng}`,
      method: "GET",
    }).done((response) => {
      console.log(response);
      const country = response.countryCode;
      getCurrency(country);
      getCountryName(country);
    });
  }

  function getCurrency(country: string) {
    console.log(country);
    $.ajax({
      url: `https://restcountries.eu/rest/v2/alpha/${country}`,
      method: "GET",
    }).done((response) => {
      const currency = response.currencies[0].code;
      const currencyName = response.currencies[0].name;
      $currency.val(`${currency}`); // This should happen on posts/new page
      $currencylabel.text(`${currency}, ${currencyName}`); //This should happen on the posts/show page

      calculateExchangeRate(currency); // This should happen on post/show page
    });
  }

  function getCountryName(country: string) {
    $.ajax({
      url: `https://restcountries.eu/rest/v2/alpha/${country}`,
      method: "GET",
    }).done((response) => {
      const countryName = response.nativeName;
      $country.val(countryName);
    });
  }

  function getExchangeRate() {
    $.ajax({
      url: "/currency",
      method: "GET",
    }).done((response) => {
      console.log(response);
      exchangeRates = response.quotes;
    });
  }

  function calculateExchangeRate(currency: string) {
    const newCurrency = currency; // Currency to convert to
    // Update the DOM with the currency you're converting to
    // grab the current
    // grab the value
    const currentCurrency = $("#item-currency").text(); // Currency the post was created with
    const price = parseFloat($("#item-price").text());
    const convertedPriceDisplay = $("#converted-price-display");
    //convert the value into dollars
    //convert the value into the new currency based on location
    let conversionRate = 0;
    if (exchangeRates) {
      conversionRate = exchangeRates["USD" + currentCurrency];
      const priceInDollars = price / conversionRate!;
      const convertedPrice =
        priceInDollars * exchangeRates["USD" + newCurrency];
      // Update the DOM with the converted price
      // update the display
      convertedPriceDisplay.html(convertedPrice.toFixed(0));
    } else {
      console.log("Exchange rates not available");
    }
  }

  //getting the exchangeRates from the currencylayer API
  getExchangeRate();

  //using select 2 for the categories dropdown
  function chooseCategory() {
    $("select").select2();
    const categories = [
      { id: "Electronics", text: "Electronics" },
      { id: "Food", text: "Food" },
      { id: "Furniture", text: "Furniture" },
      { id: "Hardware", text: "Hardware" },
      { id: "Health and beauty", text: "Health and beauty" },
      { id: "Clothes", text: "Clothes" },
      { id: "Cars", text: "Cars" },
      { id: "Books", text: "Books" },
      { id: "Property", text: "Property" },
      { id: "Other", text: "Other" },
    ];

    $("#category").select2({
      placeholder: "Choose a category",
      allowClear: true,
      data: categories,
    });
  }

  chooseCategory();

  // remove the marker on toggle switch
  function removeMarker() {
    $toggleSwitch.on("click", () => {
      $mapMarker.toggle();
    });
  }

  removeMarker();
});
