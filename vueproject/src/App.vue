<template>
  <!-- <div id="app">
    <div id="main-container"> -->
      <!-- <div id="status-container">
        <div id="logo">
          <h3>SeeIce</h3>
          <p class="status-text">Connected, {{ isConnected ? "yes" : "no" }}</p>
        </div>
        <div id="ice-status"><p class="status-text">Ice condition: ICE FREE</p></div>
        <div id="system-status">
          <p class="status-text">Speed, {{ windowHeight }}</p>
          <p class="status-text">Heading, {{ windowWidth }}</p>
          <p class="status-text">Travelled, 0 km</p>
          <p class="status-text">Time elapsed, 0 min</p>
        </div>

      </div> -->

      <nav >
        <router-link to="/">Dashboard</router-link> |
        <router-link to="/settings">Settings</router-link>
      </nav>
      <!-- <div v-if="$route.path === '/settings'" class="dashboard-container">
        <h2>Settings layout</h2> -->
      <router-view/>
      <!-- </div> -->
      <!-- <div v-else class="settings-container">
        <h2>Dashboard layout</h2> -->
        <!-- <router-view/>
      </div> -->

      <!-- <RgbVideoFeed/> -->
      <!-- <div id="menu-container">
        <button class="status-text" type="button">Cameras</button>
        <button class="status-text" type="button">Overview</button>
        <button class="status-text" type="button">Map view</button>
      </div> -->
    <!-- </div>
  </div> -->
</template>

<script setup>
// import { ref, onMounted, onUnmounted } from "vue";
// import RgbVideoFeed from "./components/RgbVideoFeed.vue";
// import ROSLIB from "roslib";          // import the roslibjs library
// import "leaflet/dist/leaflet.css";    // Leaflet CSS
// import L from "leaflet";

// //   name: 'App',  
// //   data(){
// //     return {
// //       ros: null,          // ROS connection object
// //       isConnected: false,
// //       pitch: "N/A",
// //       roll: "N/A",
// //       heading: 0.0,
// //       speed: 0.0,
// //       lng: "N/A",
// //       lat: "N/A",
// //       map: null,
// //       left_camera_feed: null,
// //       right_camera_feed: null,
// //       thermal_camera_feed: null,
// //       sat_image: null,
// //       type: null,
// //       windowWidth: window.innerWidth,
// //       windowHeight: window.innerHeight
// //     };
//   },
    // let windowWidth = 0;
    // let windowHeight = 0;  

  // methods:{

  //   connectToROS(){
  //     //Creates a new ROS connection
  //     this.ros = new ROSLIB.Ros({
  //           url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  //           ? 'ws://localhost:9090'
  //           : 'ws://37.157.77.203:9090',
  //       });

  //     this.ros.on("connection", () => {
  //       console.log("Connected to ROS!");
  //       this.isConnected = true;
  //       this.subscribeToTopics();
  //     });

  //     // Handle errors
  //     this.ros.on("error", (error) => {
  //       console.error("Error connecting to ROS: ", error);
  //       this.isConnected = false;
  //     });

  //     // Handle disconnection
  //     this.ros.on("close", () => {
  //       console.warn("Disconnected from ROS!");
  //       this.isConnected = false;
  //     });
  //   },

  //   subscribeToTopics(){
  //     // Subscribe to Pitch topic
  //     const pitchTopic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: "/pitch",
  //       messageType: "std_msgs/Float32",
  //     });

  //     pitchTopic.subscribe((message) => {
  //       console.log("Received pitch:", message.data);
  //       this.pitch = message.data.toFixed(2);
  //     });

  //     // Subscribe to roll topic
  //     const rollTopic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: '/roll',
  //       messageType: 'std_msgs/Float32',
  //     });

  //     rollTopic.subscribe((message) => {
  //       console.log("Received roll:", message.data);
  //       this.roll = message.data.toFixed(2);
  //     });

  //     // Subscribe to heading topic
  //     const hdtTopic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: '/heading',
  //       messageType: 'std_msgs/Float32',
  //     });

  //     hdtTopic.subscribe((message) => {
  //       console.log("Received hdt:", message.data);
  //       this.heading = message.data.toFixed(2);
  //     });


  //     // Subscribe to longitude topic
  //     const longitudeTopic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: '/longitude',
  //       messageType: 'std_msgs/Float32',
  //     });

  //     longitudeTopic.subscribe((message) => {
  //       console.log("Received lng:", message.data);
  //       this.lng = message.data.toFixed(6);
  //     });


  //     // Subscribe to heading topic
  //     const latitudeTopic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: '/latitude',
  //       messageType: 'std_msgs/Float32',
  //     });

  //     latitudeTopic.subscribe((message) => {
  //       console.log("Received lat:", message.data);
  //       this.lat = message.data.toFixed(6);
  //     });

  //     const left_camera_image_Topic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: "/cam1_image_preview",
  //       messageType: "sensor_msgs/CompressedImage",
  //     });

  //     left_camera_image_Topic.subscribe((message) => {

  //       this.type = message.type;

  //       try{
  //         console.log(`Message format=${message.format}`);   
          
  //         const rawData = this.arrayBufferToBase64(message.data);

  //         const blob = new Blob([rawData], {type: "image/jpeg"});

  //         const url = URL.createObjectURL(blob);

  //         const canvas = document.createElement("canvas");
  //         const context = canvas.getContext("2d");
  //         const image = new Image();

  //         image.onload = () => {
  //           canvas.width = image.width;
  //           canvas.height = image.height;

  //           context.drawImage(image, 0 ,0);

  //           this.left_camera_feed = canvas.toDataURL("image/jpeg");

  //           URL.revokeObjectURL(url);
  //         }

  //         image.src = url;
  //       }
  //       catch (error)
  //       {
  //         console.error("Failed to decode message");
  //       }

  //     });

  //     const right_camera_image_Topic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: "/cam2_image_preview",
  //       messageType: "sensor_msgs/CompressedImage",
  //     });

  //     right_camera_image_Topic.subscribe((message) => {

  //       try{
  //         console.log(`Message format=${message.format}`);   
          
  //         const rawData = this.arrayBufferToBase64(message.data);

  //         const blob = new Blob([rawData], {type: "image/jpeg"});

  //         const url = URL.createObjectURL(blob);

  //         const canvas = document.createElement("canvas");
  //         const context = canvas.getContext("2d");
  //         const image = new Image();

  //         image.onload = () => {
  //           canvas.width = image.width;
  //           canvas.height = image.height;

  //           context.drawImage(image, 0 ,0);

  //           this.right_camera_feed = canvas.toDataURL("image/jpeg");

  //           URL.revokeObjectURL(url);
  //         }

  //         image.src = url;
  //       }
  //       catch (error)
  //       {
  //         console.error("Failed to decode message");
  //       }
  //     });

  //     const mapFeatureTopic = new ROSLIB.Topic({
  //       ros: this.ros,
  //       name: '/water_layer',
  //       messageType: 'geographic_msgs/MapFeature'
  //     });

  //     mapFeatureTopic.subscribe((message) => {
  //       console.log('Received map feature:', message);
  //       this.processMapFeature(message);
  //     });

  //   },

  //   bgr8Torgb8(bgrData){
      
  //     // Convert bgr to rgb
  //     const rgbData = new Uint8Array(bgrData.length);

  //     for(let i = 0, j = 0; i < bgrData.length; i+= 3, j += 4){
  //       rgbData[j] = bgrData[i];
  //       rgbData[j + 1] = bgrData[i + 1];
  //       rgbData[j + 2] = bgrData[i + 2];
  //       rgbData[j + 3] = 255;
  //     }

  //     return rgbData;
  //   },

  //   arrayBufferToBase64(buffer){
  //     const binaryString = atob(buffer);
  //     const len = binaryString.length;

  //     const bytes = new Uint8Array(len);

  //     for(let i=0; i< len; i++){
  //       bytes[i] = binaryString.charCodeAt(i);
  //     }

  //     return bytes;
  //   },

  //   initializeMap(){
  //     // Create leaflet map instance
  //     this.map = L.map("map").setView([59.3922, 24.65], 13);

  //     //Addtile layer to the map
  //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //       attribution: 'who ever needs to be',
  //     }).addTo(this.map);
  //   },

  //   processMapFeature(feature){
  //     const verticesProp = feature.props.find((prop) => prop.key === 'vertices');

  //     if (!verticesProp){
  //       console.warn('No vertices found in MapFeature');
  //       return;
  //     }

  //     // Parse vertices
  //     const vertices = JSON.parse(verticesProp.value);

  //     const polygon = L.polygon(vertices, {color: 'blue'}).addTo(this.map);

  //     this.map.fitBounds(polygon.getBounds());

  //   },
  // },
  // const windowWidth = ref(window.innerWidth);
  // const windowHeight = ref(window.innerHeight);

  // const handleResize = () => {
  //   windowWidth.value = window.innerWidth;
  //   windowHeight.value = window.innerHeight;
  //   console.log('Window width, %d', window.innerWidth);
  // };

  // onMounted(() => {
  //   // Connect to ROS and initialize map on the component mount
  //   // this.connectToROS();
  //   // this.initializeMap();
  //   window.addEventListener('resize', handleResize);
  // });

  // onUnmounted(() => {
  //   window.removeEventListener('resize', handleResize)
  // });

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
}

#main-container {
  display: grid;
  height: 100vh;
  grid-template-rows: 40px 1fr 40px;
  row-gap: 5px;
  padding: 5px;  
  background-color: rgb(23, 24, 33);
}

#status-container{
  display: grid;
  justify-self: auto;
  grid-template-columns: 1fr 1fr 1fr;
  min-height: 40px;
  column-gap: 5px;
  background-color: rgb(33, 34, 45);
  border-radius: 5px;
  justify-content: center;
  align-items: center;
}

#page-container{
  display: flex;
  flex-direction: row;
  background-color: #f4fe77;
  border-radius: 5px;
}

#menu-container{
  background-color: rgb(33, 34, 45);
  display: flex;
  flex-direction: row;
  column-gap: 20px;
  border-radius: 4px;
  padding: 4px;
  justify-content: center;
}

#map {
  flex: 1;
  /* min-width: 100px; */
  border-radius: 10px;
  padding: 0;
}

#sidebar {
  flex-grow: 0;
  background-color: rgb(33, 34, 45);
  border-radius: 10px;
  color: rgb(255, 255, 255);
  text-align: center;
}

.status-text{
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  font-size: medium;
  color: rgb(230, 230, 230);
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



button{
  width: 160px;
  background-color: #333;
  border-radius: 8px;
  border: none;
  color: #999;
}

button:hover{
  background-color: #ccc;
  color: #222;
}


.video{
  background-color: gray;
  min-height: 300px;
  /* border-radius: 10px; */
}

#sat_image {
  padding: 0;
  margin: 0;

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
  position: relative;
  width: 100px;
  background-color: rgba(33, 34, 40, 0.7);
  color: rgb(255, 255, 255);
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 14px;
}
</style>