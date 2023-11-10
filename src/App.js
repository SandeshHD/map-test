import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css"
import "./App.css"
export default function App() {
  const [latLong, setLatLong] = useState([])
  const [isTracking, setIsTracking] = useState(null)
  var watchId;
  const constructMap = () => {

    let coords = latLong.map(ll => [ll.latitude, ll.longitude])
    var container = L.DomUtil.get("map");

    if (container != null) {
      container._leaflet_id = null;
    }
    var map = L.map("map").setView([
      coords[coords.length - 1][0],
      coords[coords.length - 1][1]
    ], 16);
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoidGFyLWhlbCIsImEiOiJjbDJnYWRieGMwMTlrM2luenIzMzZwbGJ2In0.RQRMAJqClc4qoNwROT8Umg",
      }
    ).addTo(map);

    var polyline = L.polyline(coords, { color: 'blue' }).addTo(map);

    // zoom the map to the polyline
    map.fitBounds(polyline.getBounds());
  }

  function getLocation() {
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        updatePosition,
        null,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
    } else {
    }
  }
  const updatePosition = (position) => {
    setLatLong((previous) => {
      return [...previous, position.coords]
    })
  }
  
  const startTracking = () => {
    setLatLong([])
    getLocation()
    setIsTracking(true)
  }

  const stopTracking = () => {
    setIsTracking(false)
    navigator.geolocation.clearWatch(watchId);
    constructMap()
  }

  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(coord2.latitude - coord1.latitude);
    const dLon = deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coord1.latitude)) *
      Math.cos(deg2rad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const calculateTotalDistance = () => {
    let distance = 0;
    for (let i = 1; i < latLong.length; i++) {
      const prevCoord = latLong[i - 1];
      const currentCoord = latLong[i];
      distance += calculateDistance(prevCoord, currentCoord);
    }
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <div className="container">
      <div className="btn-container">
        <button className="btn" onClick={startTracking}>Start</button>
        <button className="btn" onClick={stopTracking} disabled={!isTracking}>Stop</button>
      </div>
      <div className="info">
        {isTracking ? 'Tracking...' : isTracking != null ? 'Distance Travelled: ' + calculateTotalDistance() + 'kms' : ''}
      </div>
      <div id="map"></div>
    </div>
  );
}
