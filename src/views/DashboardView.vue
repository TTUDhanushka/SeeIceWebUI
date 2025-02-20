<!-- 
 Author:        Dhanushka Liyanage
 Description:   Home page showing dashboard
 -->

<template>
  <div class="container">
    <div id="status-container">
      <div id="logo">
        <h3>SeeIce</h3>
        <p class="status-text">{{ ros_status ? "Connected" : "Disconnected" }}</p>
        <p class="status-text">{{ gnss_status ? "GNSS : healthy" : "GNSS : weak" }}</p>
      </div>
      <div id="ice-status">
        <p class="status-text">Ice condition: ICE FREE</p>
      </div>
      <div id="system-status">
        <p class="status-text">Speed, {{ speed }} knots</p>
        <p class="status-text">Heading, {{ heading }} degrees</p>
        <p class="status-text">Travelled, {{travelled}} km</p>
        <p class="status-text">Time elapsed, {{time_elapsed}} min</p>
      </div>
    </div>
    <div id="visual_feeds">
      <!-- Camera feed style="width: 100%; height: calcl(100% - 5px);"-->
      <div class="dashboard">
        <RgbVideoFeed :ros="ros"/>
      </div>

      <!-- Thermal video -->
      <div id="visual_feeds" >
        <div>
          <ThermalVideoFeed :ros="ros"/>
          <div class="floating-label">Thermal</div>
        </div>
      </div>

      <!-- Satellite image -->
      <div class="video" id="sat_image" >
        <div>
          <SatImage :ros="ros"/>
          <div class="floating-label">Satellite</div>
        </div>
      </div>

    </div>

    <!-- Left section - The Map-->
    <div id="map"></div>
  </div>
</template>

<script setup>
  import {ref, onMounted, onBeforeUnmount} from 'vue'
  import RgbVideoFeed from '../components/RgbVideoFeed.vue';
  import ThermalVideoFeed from '../components/ThermalVideoFeed.vue';
  import SatImage from '../components/SatImage.vue';
  import nav_marker_png from '../assets/nav_marker.png'
  import ROSLIB from 'roslib';
  import "leaflet/dist/leaflet.css";    // Leaflet CSS
  import L from "leaflet";


  let map = null;

  const pitch = ref(0);
  const roll = ref(0);
  const heading = ref(0)
  const speed = ref(0);
  const longitude = ref(0);
  const latitude = ref(0);

  const gnss_status = ref(null);
  const travelled = ref(null);
  const time_elapsed = ref(null);
  let marker = null;

  const props = defineProps({
    ros: {
        type: Object,
        required: true,
    },

    ros_status: {
      type: Boolean,
    }
  });

  const initializeMap = () => {
    // Create leaflet map instance
    map = L.map("map").setView([59.3922, 24.65], 13);

    //Addtile layer to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Leaflet',
    }).addTo(map);
  }

  const nav_marker = L.icon({
    iconUrl: nav_marker_png,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
  });

  function processMapFeature(feature){
    const verticesProp = feature.props.find((prop) => prop.key === 'vertices');

    if (!verticesProp){
      console.warn('No vertices found in MapFeature');
      return;
    }

    // Parse vertices
    const vertices = JSON.parse(verticesProp.value);

    const polygon = L.polygon(vertices, {color: 'blue'}).addTo(map);

    map.fitBounds(polygon.getBounds());

  };

function UpdateMarker(lng, lat){

  if (marker !== null){
    map.removeLayer(marker);
    marker = null;
  }

  if ((lng == null) || (lat == null)){
    return;
  } 

  marker = L.marker([lat, lng], {icon: nav_marker}).addTo(map);
}

const subscribeToTopics = () => {

      // Subscribe to Pitch topic
      const pitchTopic = new ROSLIB.Topic({
        ros: props.ros,
        name: "/pitch",
        messageType: "std_msgs/Float32",
      });

      pitchTopic.subscribe((message) => {
        // console.log("Received pitch:", message.data);
        pitch.value = message.data.toFixed(2);
      });

      // Subscribe to roll topic
      const rollTopic = new ROSLIB.Topic({
        ros: props.ros,
        name: '/roll',
        messageType: 'std_msgs/Float32',
      });

      rollTopic.subscribe((message) => {
        // console.log("Received roll:", message.data);
        roll.value = message.data.toFixed(2);
      });

      // Subscribe to heading topic
      const hdtTopic = new ROSLIB.Topic({
        ros: props.ros,
        name: '/heading',
        messageType: 'std_msgs/Float32',
      });

      hdtTopic.subscribe((message) => {
        console.log("Received hdt:", message.data);
        heading.value = message.data.toFixed(2);
      });


      // Subscribe to longitude topic
      const longitudeTopic = new ROSLIB.Topic({
        ros: props.ros,
        name: '/longitude',
        messageType: 'std_msgs/Float32',
      });

      longitudeTopic.subscribe((message) => {
        // console.log("Received lng:", message.data);
        longitude.value = message.data.toFixed(6);

        UpdateMarker(longitude.value, latitude.value);

        if (longitude.value === 0){
          gnss_status.value = false;
        }
        else{
          gnss_status.value = true;
        }
      });


      // Subscribe to heading topic
      const latitudeTopic = new ROSLIB.Topic({
        ros: props.ros,
        name: '/latitude',
        messageType: 'std_msgs/Float32',
      });

      latitudeTopic.subscribe((message) => {
        // console.log("Received lat:", message.data);
        latitude.value = message.data.toFixed(6);

        if (latitude.value === 0){
          gnss_status.value = false;
        }
        else{
          gnss_status.value = true;
        }
      });

      const mapFeatureTopic = new ROSLIB.Topic({
        ros: props.ros,
        name: '/water_layer',
        messageType: 'geographic_msgs/MapFeature'
      });

      mapFeatureTopic.subscribe((message) => {
        console.log('Received map feature:', message);
        processMapFeature(message);
      });

};

// const ConnectToRos = () => {

// };
  //---------------
  onMounted(() => {

    // ConnectToRos();
    subscribeToTopics();

    initializeMap();

  })

  onBeforeUnmount(() => {

    // map = null;

  });

</script>

<style scoped>
*{
    margin: 0px;
    padding: 0px;
}

.container{
  height: 100vh;
  display: grid;
  grid-template-rows: 40px 310px 1fr;
}

#status-container{
  display: grid;
  justify-self: auto;
  grid-template-columns: 1fr 1fr 1fr;
  min-height: 40px;
  column-gap: 5px;
  background-color: rgb(48, 49, 56);
  justify-content: center;
  align-items: center;
  color: beige;
}

#ice-status{
  height: 30px;
  width: 300px;
  border-radius: 8px;
  background-color: forestgreen;
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  align-items: center;
  justify-self: center;
  align-self: center;
}

#logo{
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  column-gap: 40px;
  padding-left: 50px;
}

#system-status{
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-content: center;
  column-gap: 30px;
}

#visual_feeds{
  display: grid;
  justify-items: flex-start;
  margin: 0;
  padding: 0;
  grid-template-columns: 8fr 3fr 2fr;
}

#map{
  flex:1;
  height: 100%;
}

</style>