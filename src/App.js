import React, { useEffect, useState } from "react";
import L, { icon } from "leaflet";
import "leaflet/dist/leaflet.css"
import "./App.css"
import axios from "axios";

var watchId,stopwatch;
export default function App() {
  const [latLong, setLatLong] = useState([])
  const [time, setTime] = useState({
    seconds: 0,
    minutes:0,
    hours: 0
  })

  const [isTracking, setIsTracking] = useState(null)
  const [sourceLocation, setSourceLocation] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [totalDistance, setTotalDistance] = useState(0)
  const defaultIcon = new L.icon({
    iconUrl: require('../node_modules/leaflet/dist/images/marker-icon.png'),
  });

  const getGeoLocation = (lat,lng,isSource=false) => {
    axios.get("https://nominatim.openstreetmap.org/reverse?lat="+lat+"&lon="+lng+"&format=json").then(response=>{
      if(isSource)
        setSourceLocation(response.data.display_name)
      else
        setDestinationLocation(response.data.display_name)
    })
  }

  const constructMap = () => {
    let coords = latLong.map(ll => [ll.latitude, ll.longitude])
    getGeoLocation(coords[0][0],coords[0][1],true)
    getGeoLocation(coords[coords.length - 1][0],coords[coords.length - 1][1])
    var container = L.DomUtil.get("map");

    if (container != null) {
      container._leaflet_id = null;
    }
    var map = L.map("map").setView([
      coords[coords.length - 1][0],
      coords[coords.length - 1][1]
    ], 16);

    L.marker(coords[0],{icon:defaultIcon}).addTo(map)
    .bindPopup("Starting Point")
    .openPopup();
    
    
    L.marker(coords[coords.length-1],{icon:defaultIcon}).addTo(map)
    .bindPopup('Ending Point')
    .openPopup();


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
          "pk.eyJ1IjoidHJhdmVsb3JlIiwiYSI6ImNrYWd2OGduaDBhaXQycnFidjI5OHRtZW0ifQ.gHyo-vBUSPqAUsTB77uUvQ",
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
    setSourceLocation(null)
    setDestinationLocation(null)
    setTime({
      seconds:0,
      minutes:0,
      hours:0
    })
    stopwatch = setInterval(() => {
      setTime((previous)=>{
        let seconds = previous.seconds
        let hours = previous.hours
        let minutes = previous.minutes
        seconds+=1
        if(seconds === 60){
          minutes+=1;
          seconds = 0;
        }

        if(minutes === 60){
          hours+=1;
          minutes = 0
        }

        return {
          seconds,
          minutes,
          hours
        }
      })
    },1000)

    setLatLong([])
    getLocation()
    setIsTracking(true)
  }

  const stopTracking = () => {
    clearInterval(stopwatch)
    setIsTracking(false)
    navigator.geolocation.clearWatch(watchId);
    constructMap()
    calculateTotalDistance()
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
    setTotalDistance(Math.round(distance))
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <div className="container">
      <div className="btn-container">
        <button className="btn" onClick={startTracking} disabled={isTracking}>Start</button>
        <div>{(time.hours<10?"0"+time.hours:time.hours) + " : " + (time.minutes<10?"0"+time.minutes:time.minutes) + " : " + (time.seconds<10?"0"+time.seconds:time.seconds)}</div>
        <button className="btn" onClick={stopTracking} disabled={!isTracking}>Stop</button>
      </div>
      <div className="info">
        {isTracking ? 'Tracking...':''}
        {isTracking!=null && sourceLocation && destinationLocation ? <div>
          Distance Travelled: {totalDistance} kms<br/>
          Start Location: {sourceLocation}<br/>
          Destination Location: {destinationLocation}<br/>
        </div>:isTracking === false?'Analyzing...':''}
      </div>
      <div id="map"></div>
    </div>
  );
}
