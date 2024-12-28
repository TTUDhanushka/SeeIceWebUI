<template>
  <div id="app">
    <div id="main-container">
      <!-- Left section - The Map-->
      <div id="map"></div>

      <!-- Camera feed -->
      <div id="camera" style="display: flex; height: 50%;">
        <div style="flex: 1; border: 1px solid #CCC; position: relative;">
          <h3 style="text-align: center;">Camera feed</h3>
          <img v-if="cameraFeed" :src="cameraFeed" alt="Camera Feed" style="width: 100%; height: calcl(100% - 40px);"/>
          <p v-else style="text-align: center;">Loading camera feed</p>
        </div>
      </div>

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
      cameraFeed: null,
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

      const cameraTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: "/cam2_image",
        messageType: "sensor_msgs/Image",
      });

      cameraTopic.subscribe((message) => {
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
          this.cameraFeed = canvas.toDataURL("image/jpeg");

        }
        else if (encoding === "rgb8"){
          this.cameraFeed = `data:image/jpeg;base64,${this.arrayBufferToBase64(data)}`; 
        }
        else{
          console.warn("Unsupported image encoding", encoding);
        }
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
        attribution: 'Contributors',
      }).addTo(this.map);
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
}

#map {
  flex: 3;
  height: 50%;
}

#camera {
  flex: 3;
  height: 50%;
}

</style>