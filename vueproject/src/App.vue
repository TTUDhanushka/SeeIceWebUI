<template>
  <div id="app">
    <div id="main-container">

      <div class="row">
        <!-- Camera feed -->
        <div class="video" id="camera1" style="display: flex;">
          <div style="flex: 1; border: 0px solid #CCC; position: relative;">
            <!-- <h3 style="text-align: center;">Left</h3> -->
            <img v-if="left_camera_feed" :src="left_camera_feed" alt="Camera Feed" style="width: 50%; height: calcl(50% - 40px);"/>
            <p v-else style="text-align: center;">Loading camera feed</p>
            <div class="floating-label">Left</div>
          </div>
        </div>
        <div class="video" id="camera2" style="display: flex;">
          <div style="flex: 1; border: 0px solid #CCC; position: relative;">
            <!-- <h3 style="text-align: center;">Right</h3> -->
            <img v-if="right_camera_feed" :src="right_camera_feed" alt="Camera Feed" style="width: 50%; height: calcl(50% - 40px);"/>
            <p v-else style="text-align: center;">Loading camera feed</p>
            <div class="floating-label">Right</div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Left section - The Map-->
        <div id="map"></div>

        <!-- Right side bar - ROS info-->
        <div id="sidebar">
          <h2>ROS Data</h2>
          <p>Connected to ROS: {{ isConnected ? "yes" : "no" }}</p>
          <p>Pitch value: {{ pitch }}</p>
          <p>Roll value {{ roll }}</p>
          <p>Yaw value {{ yaw }}</p>
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
      yaw: "N/A",
      map: null,
      left_camera_feed: null,
      right_camera_feed: null,
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

      const left_camera_image_Topic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/cam1_image",
        messageType: "sensor_msgs/Image",
      });

      left_camera_image_Topic.subscribe((message) => {
        // Decode ROS image data (base64 encoding)
        const {width, height, data, encoding} = message;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        const imageData = context.createImageData(width, height);
 
        // Convert to base64
        const rawData = this.arrayBufferToBase64(data);

        console.log(`Received image with width=${width}, height=${height}, encoding=${encoding} and rawDatalength=${data.length}`)      

        if(data){
          console.log("Data receiving", rawData.length);
        }

        // Decode image data.
        if (encoding === "bgr8"){

          for(let i = 0; i < rawData.length; i+=3){
            const index = (i / 3) * 4;
            imageData.data[index] = rawData[i + 2];
            imageData.data[index + 1] = rawData[i + 1];
            imageData.data[index + 2] = rawData[i];
            imageData.data[index + 3] = 255;
          }
          console.log("RGB converted", imageData.size);
          
          context.putImageData(imageData, 0, 0);
          this.left_camera_feed = canvas.toDataURL("image/jpeg");

        }
        else if (encoding === "rgb8"){
          this.left_camera_feed = `data:image/jpeg;base64,${this.arrayBufferToBase64(data)}`; 
        }
        else{
          console.warn("Unsupported image encoding", encoding);
        }
      });

      const right_camera_image_Topic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/cam2_image",
        messageType: "sensor_msgs/Image",
      });

      right_camera_image_Topic.subscribe((message) => {
        // Decode ROS image data (base64 encoding)
        const {width, height, data, encoding} = message;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        const imageData = context.createImageData(width, height);
 
        // Convert to base64
        const rawData = this.arrayBufferToBase64(data);

        console.log(`Received image with width=${width}, height=${height}, encoding=${encoding} and rawDatalength=${data.length}`)      

        if(data){
          console.log("Data receiving", rawData.length);
        }

        // Decode image data.
        if (encoding === "bgr8"){

          for(let i = 0; i < rawData.length; i+=3){
            const index = (i / 3) * 4;
            imageData.data[index] = rawData[i + 2];
            imageData.data[index + 1] = rawData[i + 1];
            imageData.data[index + 2] = rawData[i];
            imageData.data[index + 3] = 255;
          }
          console.log("RGB converted", imageData.size);
          
          context.putImageData(imageData, 0, 0);
          this.right_camera_feed = canvas.toDataURL("image/jpeg");

        }
        else if (encoding === "rgb8"){
          this.right_camera_feed = `data:image/jpeg;base64,${this.arrayBufferToBase64(data)}`; 
        }
        else{
          console.warn("Unsupported image encoding", encoding);
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
  color: #2c3e50;
}

#main-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  flex-direction: column;
}

.row{
  display: flex;
  flex: 1;
}

#map {
  flex: 3;
  height: 100%;
  padding: 0;
  margin: 0;
}

#camera1 {
  flex: 1;
  height: 50%;
  padding: 0;
  margin: 0;
}

#camera2 {
  flex: 1;
  height: 50%;
  padding: 0;
  margin: 0;
}

.floating-label {
  position: absolute;
  top: 10px;
  left: 350px;
  background-color: rgba(0, 0, 0, 0.7);
  color: wheat;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
}
</style>