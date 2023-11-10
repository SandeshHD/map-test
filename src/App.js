import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css"
import "./App.css"
var timer;
export default function App() {
  const [latLong,setLatLong] = useState([])
  const constructMap = () => {

    let coords = latLong.map(ll => [ll.latitude,ll.longitude])
    var container = L.DomUtil.get("map");

    if (container != null) {
      container._leaflet_id = null;
    }
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
  map.fitBounds(polyline.getBounds());
  }

  function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
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
 setLatLong((previos)=>{
  return [...previos,position.coords]
})
}

useEffect(()=>{
  getLocation()
},[])


  const startTracking = ()=>{
    timer = setInterval(()=>{
      getLocation()
    },30000) 
  }
  
  const stopTracking = ()=>{
    clearInterval(timer)
    console.log(latLong)
    constructMap()
  }

  

  return (
    <div className="container">
    <div className="btn-container">
      <button className="btn" onClick={startTracking}>Start</button>
      <button className="btn" onClick={stopTracking}>Stop</button>
    </div>
      <div id="map"></div>
    </div>
  );
}
