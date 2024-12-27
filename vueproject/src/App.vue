<template>
  <div id="app">
    <div id="main-container">
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
      })

      // Subscribe to roll topic
      const rollTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/roll',
        messageType: 'std_msgs/Float32',
      });

      rollTopic.subscribe((message) => {
        console.log("Received roll:", message.data);
        this.roll = message.data.toFixed(2);
      })
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
  height: 100%;
}
</style>