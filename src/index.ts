/* global google:true */
/// <reference types="@types/google.maps" />

import $ from "jquery";
import { OpenLocationCode } from "open-location-code";
import "select2";
import "jquery-validation";

interface UserLocation {
  lat: number;
  lng: number;
}

$(() => {
  $("form").removeAttr("novalidate");

  const $plusCodeLocation = $(".plus-code-location");
  const $locationHidden  = $("#location-hidden");
  const $toggleSwitch    = $("#toggle-switch");
  const $directionsPanel = $("#directions-panel");
  const $lat             = $("#lat");
  const $lng             = $("#lng");
  const $currency        = $("#currency");
  const $currencyLabel   = $("#currency-label");
  const postLat = parseFloat(String($("#map").data("lat")));
  const postLng = parseFloat(String($("#map").data("lng")));
  let userLocation: UserLocation | null = null;

  let map: google.maps.Map | undefined;
  let infoWindow: google.maps.InfoWindow | undefined;

  if ($("#map").length > 0) initMap();

  function initMap() {
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer();

    const center = {
      lat: isNaN(postLat) ? 51.501476 : postLat,
      lng: isNaN(postLng) ? -0.140634 : postLng,
    };

    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
      zoom: 14,
      center,
    });

    directionsDisplay.setMap(map);
    infoWindow = new google.maps.InfoWindow();

    // Show route from item location to viewer's location on show page
    $("#item-location").one("click", () => {
      if (!userLocation) return;
      displayRoute(
        directionsService,
        directionsDisplay,
        `${postLat},${postLng}`,
        `${userLocation.lat},${userLocation.lng}`
      );
    });

    // When the map is dragged, update the Plus Code
    google.maps.event.addListener(map, "dragend", () => {
      const center = map!.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        updatePlusCode(lat, lng);
        geocodeCountry(lat, lng);
      }
    });

    // Try to get the user's real location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          userLocation = pos;
          infoWindow!.setPosition(pos);
          infoWindow!.setContent("Your current location.");
          infoWindow!.open(map);
          map!.setCenter(pos);
          updatePlusCode(pos.lat, pos.lng);
          geocodeCountry(pos.lat, pos.lng);
        },
        () => {
          infoWindow!.setPosition(map!.getCenter());
          infoWindow!.setContent("Could not get your location.");
          infoWindow!.open(map);
        }
      );
    }

    // Drop a marker on the post location (show page)
    if (!isNaN(postLat) && !isNaN(postLng)) {
      new google.maps.Marker({ position: center, map });
    }
  }

  function displayRoute(
    service: google.maps.DirectionsService,
    display: google.maps.DirectionsRenderer,
    origin: string,
    destination: string
  ) {
    service.route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
      (response, status) => {
        if (status === "OK" && response) {
          display.setDirections(response);
          response.routes[0]?.legs.forEach((leg) => {
            $directionsPanel.append(
              `<p>${leg.distance?.text} away from ${leg.start_address}</p>`
            );
          });
        }
      }
    );
  }

  // Encode lat/lng to a Plus Code locally — no API call needed
  function updatePlusCode(lat: number, lng: number) {
    const code = OpenLocationCode.encode(lat, lng);
    $plusCodeLocation.val(code);
    $locationHidden.val(code);
    $lat.val(lat);
    $lng.val(lng);
  }

  // Get the country code for a lat/lng via GeoNames (our backend proxy)
  function geocodeCountry(lat: number, lng: number) {
    $.ajax({ url: `/country?lat=${lat}&lng=${lng}`, method: "GET" })
      .done((response) => {
        const countryCode: string = response.countryCode;
        if (countryCode) fetchCountryData(countryCode);
      });
  }

  // Fetch currency + country name from restcountries.com v3.1
  function fetchCountryData(countryCode: string) {
    $.ajax({
      url: `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,currencies`,
      method: "GET",
    }).done((response) => {
      const currencies: Record<string, { name: string; symbol: string }> =
        response.currencies ?? {};
      const code = Object.keys(currencies)[0];
      if (!code) return;
      $currency.val(code);
      $currencyLabel.text(`${code}, ${currencies[code].name}`);
      calculateExchangeRate(code);
    });
  }

  // Convert the post price to the viewer's local currency
  function calculateExchangeRate(targetCurrency: string) {
    const sourceCurrency = $("#item-currency").text().trim();
    const price = parseFloat($("#item-price").text());
    if (!sourceCurrency || isNaN(price)) return;

    $.ajax({ url: "/currency", method: "GET" }).done((response) => {
      const quotes: Record<string, number> = response.quotes ?? {};
      const toUSD   = quotes[`USD${sourceCurrency}`];
      const fromUSD = quotes[`USD${targetCurrency}`];
      if (toUSD && fromUSD) {
        $("#converted-price-display").text(
          ((price / toUSD) * fromUSD).toFixed(2)
        );
      }
    });
  }

  // Category dropdown via select2
  const categories = [
    { id: "Electronics",       text: "Electronics" },
    { id: "Food",              text: "Food" },
    { id: "Furniture",         text: "Furniture" },
    { id: "Hardware",          text: "Hardware" },
    { id: "Health and Beauty", text: "Health and Beauty" },
    { id: "Clothes",           text: "Clothes" },
    { id: "Cars",              text: "Cars" },
    { id: "Books",             text: "Books" },
    { id: "Property",          text: "Property" },
    { id: "Other",             text: "Other" },
  ];

  ($("#category") as unknown as JQuery).select2({
    placeholder: "Choose a category",
    allowClear: true,
    data: categories,
  });

  $toggleSwitch.on("click", () => $(".map-marker").toggle());
});
