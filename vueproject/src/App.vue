<template>
  <div id="app">
    <div id="main-container">

      <div id="visual_feeds">
        <!-- Camera feed style="width: 100%; height: calcl(100% - 5px);"-->
        <div class="video" id="camera1" >
          <div style="flex: 1; border: 0px solid #CCC; position: relative;">
            <img v-if="left_camera_feed" :src="left_camera_feed" alt="Camera Feed" />
            <p v-else style="text-align: center;">Loading camera feed</p>
            <div class="floating-label">Left</div>
          </div>
        </div>
        <div class="video" id="camera2" >
          <div style="flex: 1; border: 0px solid #CCC; position: relative;">
            <img v-if="right_camera_feed" :src="right_camera_feed" :type="type" alt="Camera Feed" style="width: 600px; height: 300px;"/>
            <p v-else style="text-align: center;">Loading camera feed</p>
            <div class="floating-label">Right</div>
          </div>
        </div>
        <div class="video" id="thermal_camera" >
          <div style="flex: 1; border: 0px solid #CCC; position: relative;">
            <img v-if="right_camera_feed" :src="thermal_camera_feed" :type="type" alt="Camera Feed" style="width: 400px; height: 300px;"/>
            <p v-else style="text-align: center;">Loading thermal camera feed</p>
            <div class="floating-label">Thermal</div>
          </div>
        </div>

        <div class="video" id="sat_image" >
          <div style="flex: 1; border: 0px solid #CCC; position: relative;">
            <img v-if="right_camera_feed" :src="sat_image_preview" :type="type" alt="Satellite image" style="width: 300px; height: 300px;"/>
            <p v-else style="text-align: center;">Satellite image</p>
            <div class="floating-label">Thermal</div>
          </div>
        </div>
      </div>

      <div id="map-sidebar">
        <!-- Left section - The Map-->
        <div id="map"></div>

        <!-- Right side bar - ROS info-->
        <div id="sidebar">
          <h2>Telemetry</h2>
          <p>Connected to ROS: {{ isConnected ? "yes" : "no" }}</p>
          <p>Pitch: {{ pitch }}</p>
          <p>Roll: {{ roll }}</p>
          <p>Heading: {{ heading }}</p>

          <div id="position" style="margin: 10px; text-align: left;">
            <H5>Position</H5>
            <p>Longitude: {{ lng }}</p>
            <p>Latitude: {{ lat }}</p>
          </div>
          <div style="margin: 10px; text-align: left;">
            <H5>Map source</H5>
            <select name="map_source">
              <option value="OpenSeaMap">OpenSeaMap</option>
              <option value="Nutimeri">Nutimeri</option>
            </select>
          </div>

          <div style="margin: 10px; text-align: left;">
            <H5>Video options</H5>
            <input type="checkbox" value="1" name="overlay_onboard_segmentation">
            <label>Enable overlay</label>
          </div>

          <div style="margin: 10px; text-align: left;">
            <H5>Map options</H5>
            <div>
              <div class="class_color water"></div>
              <input type="checkbox" value="1" name="water_layer">
              <label>Ice free</label>
            </div>
            <div>
              <div class="class_color ice_floes"></div>
              <input type="checkbox" value="1" name="ice_floes_layer"> 
              <label>Level ice</label>
            </div>
            <div>
              <div class="class_color broken_ice"></div>
              <input type="checkbox" value="1" name="broken_ice_layer"> 
              <label>Broken ice</label>
            </div>
            <div>
              <div class="class_color underwater_ice"></div>
              <input type="checkbox" value="1" name="underwater_ice_layer"> 
              <label>Underwater ice</label>
            </div>
            <div>
              <div class="class_color ice_ridges"></div>
              <input type="checkbox" value="1" name="ice_ridges_layer"> 
              <label>Ice ridges</label>
            </div>
            <div>
              <div class="class_color others"></div>
              <input type="checkbox" value="1" name="others_layer"> 
              <label>Others(Ridges)</label>
            </div>
            <div>
              <div class="class_color terrain"></div>
              <input type="checkbox" value="1" name="terrain_layer"> 
              <label>Terrain</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ROSLIB from "roslib";          // import the roslibjs library
import "leaflet/dist/leaflet.css";    // Leaflet CSS
import L from "leaflet";

export default {
  name: 'App',  
  data(){
    return {
      ros: null,          // ROS connection object
      isConnected: false,
      pitch: "N/A",
      roll: "N/A",
      heading: 0.0,
      lng: "N/A",
      lat: "N/A",
      map: null,
      left_camera_feed: null,
      right_camera_feed: null,
      type: null,
    };
  },
  
  methods:{
    connectToROS(){
      //Creates a new ROS connection
      this.ros = new ROSLIB.Ros({
            url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'ws://localhost:9090'
            : 'ws://37.157.77.203:9090',
        });

      this.ros.on("connection", () => {
        console.log("Connected to ROS!");
        this.isConnected = true;
        this.subscribeToTopics();
      });

      // Handle errors
      this.ros.on("error", (error) => {
        console.error("Error connecting to ROS: ", error);
        this.isConnected = false;
      });

      // Handle disconnection
      this.ros.on("close", () => {
        console.warn("Disconnected from ROS!");
        this.isConnected = false;
      });
    },

    subscribeToTopics(){
      // Subscribe to Pitch topic
      const pitchTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/pitch",
        messageType: "std_msgs/Float32",
      });

      pitchTopic.subscribe((message) => {
        console.log("Received pitch:", message.data);
        this.pitch = message.data.toFixed(2);
      });

      // Subscribe to roll topic
      const rollTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/roll',
        messageType: 'std_msgs/Float32',
      });

      rollTopic.subscribe((message) => {
        console.log("Received roll:", message.data);
        this.roll = message.data.toFixed(2);
      });

      // Subscribe to heading topic
      const hdtTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/heading',
        messageType: 'std_msgs/Float32',
      });

      hdtTopic.subscribe((message) => {
        console.log("Received hdt:", message.data);
        this.heading = message.data.toFixed(2);
      });


      // Subscribe to longitude topic
      const longitudeTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/longitude',
        messageType: 'std_msgs/Float32',
      });

      longitudeTopic.subscribe((message) => {
        console.log("Received lng:", message.data);
        this.lng = message.data.toFixed(6);
      });


      // Subscribe to heading topic
      const latitudeTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/latitude',
        messageType: 'std_msgs/Float32',
      });

      latitudeTopic.subscribe((message) => {
        console.log("Received lat:", message.data);
        this.lat = message.data.toFixed(6);
      });

      const left_camera_image_Topic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/cam1_image_preview",
        messageType: "sensor_msgs/CompressedImage",
      });

      left_camera_image_Topic.subscribe((message) => {

        this.type = message.type;

        try{
          console.log(`Message format=${message.format}`);   
          
          const rawData = this.arrayBufferToBase64(message.data);

          const blob = new Blob([rawData], {type: "image/jpeg"});

          const url = URL.createObjectURL(blob);

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          const image = new Image();

          image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            context.drawImage(image, 0 ,0);

            this.left_camera_feed = canvas.toDataURL("image/jpeg");

            URL.revokeObjectURL(url);
          }

          image.src = url;
        }
        catch (error)
        {
          console.error("Failed to decode message");
        }

      });

      const right_camera_image_Topic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/cam2_image_preview",
        messageType: "sensor_msgs/CompressedImage",
      });

      right_camera_image_Topic.subscribe((message) => {

        try{
          console.log(`Message format=${message.format}`);   
          
          const rawData = this.arrayBufferToBase64(message.data);

          const blob = new Blob([rawData], {type: "image/jpeg"});

          const url = URL.createObjectURL(blob);

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          const image = new Image();

          image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            context.drawImage(image, 0 ,0);

            this.right_camera_feed = canvas.toDataURL("image/jpeg");

            URL.revokeObjectURL(url);
          }

          image.src = url;
        }
        catch (error)
        {
          console.error("Failed to decode message");
        }
      });

      const mapFeatureTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/water_layer',
        messageType: 'geographic_msgs/MapFeature'
      });

      mapFeatureTopic.subscribe((message) => {
        console.log('Received map feature:', message);
        this.processMapFeature(message);
      });

    },

    bgr8Torgb8(bgrData){
      
      // Convert bgr to rgb
      const rgbData = new Uint8Array(bgrData.length);

      for(let i = 0, j = 0; i < bgrData.length; i+= 3, j += 4){
        rgbData[j] = bgrData[i];
        rgbData[j + 1] = bgrData[i + 1];
        rgbData[j + 2] = bgrData[i + 2];
        rgbData[j + 3] = 255;
      }

      return rgbData;
    },

    arrayBufferToBase64(buffer){
      const binaryString = atob(buffer);
      const len = binaryString.length;

      const bytes = new Uint8Array(len);

      for(let i=0; i< len; i++){
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes;
    },

    initializeMap(){
      // Create leaflet map instance
      this.map = L.map("map").setView([59.3922, 24.65], 13);

      //Addtile layer to the map
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'who ever needs to be',
      }).addTo(this.map);
    },

    processMapFeature(feature){
      const verticesProp = feature.props.find((prop) => prop.key === 'vertices');

      if (!verticesProp){
        console.warn('No vertices found in MapFeature');
        return;
      }

      // Parse vertices
      const vertices = JSON.parse(verticesProp.value);

      const polygon = L.polygon(vertices, {color: 'blue'}).addTo(this.map);

      this.map.fitBounds(polygon.getBounds());

    },
  },

  mounted(){
    // Connect to ROS and initialize map on the component mount
    this.connectToROS();
    this.initializeMap();
  },
};
</script>

<style>

*{
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: rgb(23, 24, 33);
}

#main-container {
  background-color: beige;
  display: flex;
  height: 100vh;
  overflow: hidden;
  flex-direction: column;
  justify-items: flex-start;
}

#visual_feeds{
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  gap: 1px;
}

#map-sidebar {
  display: flex;
  flex-direction: row;
  gap: 1px;
}

#map {
  flex: 1;
  height: 100vh;
  min-width: 100px;
  border-radius: 10px;
  padding: 0;
  background-color: aquamarine;
}

#sidebar {
  flex-grow: 0;
  background-color: rgb(33, 34, 45);
  border-radius: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
}



.video{
  background-color: gray;
  height: 300px;
  border-radius: 10px;
}

#camera1 {
  padding: 0;
  margin: 0;
  width: 600px;

}

#camera2 {
  padding: 0;
  margin: 0;
  width: 600px;
}

#thermal_camera {
  padding: 0;
  margin: 0;
  width: 600px;
}

#sat_image {
  padding: 0;
  margin: 0;
  width: 300px;
}
.class_color{
  height: 15px;
  width: 15px;
  margin-right: 10px;
  border-radius: 3px;
  float: left;
}

.water{
  background-color: rgb(109, 158, 235);
}

.ice_floes{
  background-color: rgb(147, 196, 125);
}

.fast_ice{
  background-color: rgb(0, 162, 122);
}

.ice_slush{
  background-color: rgb(152, 72, 6);
}

.broken_ice{
  background-color: rgb(255, 255, 0);
}

.underwater_ice{
  background-color: rgb(194, 126, 160);
}

.ice_ridges{
  background-color: rgb(255, 217, 102);
}

.others{
  background-color: rgb(204, 0, 0);
}

.terrain{
  background-color: rgb(51, 51, 51);
}

.floating-label {
  position: absolute;
  top: 10px;
  left: 350px;
  background-color: rgba(33, 34, 40, 0.7);
  color: rgb(255, 255, 255);
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 14px;
}
</style>