<!-- 
 Author:        Dhanushka Liyanage
 Description:   Home page showing dashboard
 -->

<template>
  <div class="container">
    <div id="visual_feeds">
      <!-- Camera feed style="width: 100%; height: calcl(100% - 5px);"-->
      <div class="dashboard">
        <h2>Dashboard</h2>
        <RgbVideoFeed/>
      </div>

      <!-- Thermal video -->
      <div class="video" id="thermal_camera" >
        <div style="flex: 1; border: 0px solid #CCC; position: relative;">
          <img v-if="thermal_camera_feed" :src="thermal_camera_feed" :type="type" alt="Thernal camera Feed"/>
          <p v-else style="text-align: center; width: 400px; height: 300px;">Loading thermal camera feed</p>
          <div class="floating-label">Thermal</div>
        </div>
      </div>

      <!-- Satellite image -->
      <div class="video" id="sat_image" >
        <div style="flex: 1; border: 0px solid #CCC; position: relative;">
          <img v-if="sat_image" :src="sat_image_preview" :type="type" alt="Satellite image" style="width: 300px; height: 300px;"/>
          <p v-else style="text-align: center; width: 300px; height: 300px;">Satellite image</p>
          <div class="floating-label">Thermal</div>
        </div>
      </div>

    </div>

    <!-- Left section - The Map-->
    <div id="map"></div>
  </div>
</template>

<script setup>
  import {onMounted} from 'vue'
  import RgbVideoFeed from '@/components/RgbVideoFeed.vue';
  import "leaflet/dist/leaflet.css";    // Leaflet CSS
  import L from "leaflet";

  let map = null;

  const initializeMap = () => {
    // Create leaflet map instance
    map = L.map("map").setView([59.3922, 24.65], 13);

    //Addtile layer to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Leaflet',
    }).addTo(map);
  }

  onMounted(() => {
    initializeMap();
  })


</script>

<style scoped>
*{
    margin: 0px;
    padding: 0px;
}

.container{
  height: 100vh;
  display: grid;
  grid-template-rows: 300px 1fr;
}

#visual_feeds{
  display: grid;
  justify-items: center;
  grid-template-columns: 4fr 4fr 3fr 2fr;
  background-color: aqua;
}

#map{
  flex:1;
  height: 100%;
}
</style>