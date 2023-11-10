import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css"

export default function App() {
  const [latLong,setLatLong] = useState([])
  const [timer,setTimer] = useState()
  const constructMap = () => {

    let coords = latLong.map(ll => [ll.latitude,ll.longitude])
    var container = L.DomUtil.get("map");

    if (container != null) {
      container._leaflet_id = null;
    }

    console.log(coords[coords.length-1][0],
      coords[coords.length-1][1])
    var map = L.map("map").setView([
      coords[coords.length-1][0],
      coords[coords.length-1][1]
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
  
  var polyline = L.polyline(coords, {color: 'blue'}).addTo(map);
  
  // zoom the map to the polyline
  // map.fitBounds(polyline.getBounds());
  }

  function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            // Success function
            updatePosition, 
            // Error function
            null, 
            // Options. See MDN for details.
            {
               enableHighAccuracy: true,
               timeout: 5000,
               maximumAge: 0
            });
    } else { 
        // x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
const updatePosition = (position) => {
 setLatLong((previos)=>{
  return [...previos,position.coords]
})
}


  const startTracking = ()=>{
    let interval = setInterval(()=>{
      getLocation()
    },1000) 
    setTimer(interval)
  }
  
  const stopTracking = ()=>{
    clearInterval(timer)
    console.log(latLong)
    constructMap()
  }

  

  return (
    <>
      <button onClick={startTracking}>Start</button>
      <button onClick={stopTracking}>Stop</button>
      <div id="map" style={{ height: "100vh" }}></div>
    </>
  );
}
