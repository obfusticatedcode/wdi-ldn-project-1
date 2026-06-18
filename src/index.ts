/* global google:true */
/// <reference types="@types/google.maps" />

import $ from "jquery";
import { OpenLocationCode as OLCClass } from "open-location-code";
const olc = new OLCClass();
import "./scss/style.scss";
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

  if ($("#map").length > 0) {
    // Wait for Maps API to be ready before initialising
    if ((window as any)._mapsReady) {
      initMap();
    } else {
      document.addEventListener('mapsready', initMap);
    }
  }

  async function initMap() {
    const center = {
      lat: isNaN(postLat) ? 51.501476 : postLat,
      lng: isNaN(postLng) ? -0.140634 : postLng,
    };

    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const isShowPage = !isNaN(postLat) && !isNaN(postLng);

    map = new google.maps.Map(mapElement, {
      zoom: isShowPage ? 15 : 13,
      center,
      mapId: "DEMO_MAP_ID",
      mapTypeControl: isShowPage,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ["roadmap", "satellite"],
      },
      fullscreenControl: isShowPage,
      fullscreenControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },
      streetViewControl: false,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
    });

    infoWindow = new google.maps.InfoWindow();

    // Show route from item location to viewer's location on show page
    $("#item-location").one("click", () => {
      if (!userLocation) return;
      displayRoute(
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

    const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

    // Show page: price bubble marker
    if (!isNaN(postLat) && !isNaN(postLng)) {
      const mapEl = document.getElementById("map");
      const price    = mapEl?.dataset.price;
      const currency = mapEl?.dataset.currency;

      const bubble = document.createElement("div");
      bubble.className = "price-marker";
      bubble.innerHTML = price
        ? `<span class="price-marker__label">${currency} ${price}</span><span class="price-marker__arrow"></span>`
        : `<span class="price-marker__dot"></span>`;

      new AdvancedMarkerElement({ position: center, map, content: bubble });
    }

    // New post page: pulsing dot marker that follows map centre
    if (isNaN(postLat) && isNaN(postLng)) {
      const dot = document.createElement("div");
      dot.className = "map-pin-dot";
      const dotMarker = new AdvancedMarkerElement({ position: map.getCenter(), map, content: dot });

      google.maps.event.addListener(map, "center_changed", () => {
        dotMarker.position = map!.getCenter();
      });
    }
  }

  function displayRoute(origin: string, destination: string) {
    const service = new google.maps.DirectionsService();
    const display = new google.maps.DirectionsRenderer({ map });
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
    const code = olc.encode(lat, lng);
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
