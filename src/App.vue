<template>
  <nav>
    <router-link to="/">Dashboard</router-link> |
    <router-link to="/settings">Settings</router-link>
  </nav>
  <router-view :ros="ros"/>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ROSLIB from 'roslib';

const ros = ref(null);

onMounted (() => {
    // Creates a new ROS connection
    ros.value = new ROSLIB.Ros({
        url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'ws://localhost:9090'
        : 'ws://37.157.77.203:9090',
    });

    ros.value.on("connection", () => {
        console.log("Connected to ROS!");
        
        // subscribeToTopics();
    });

    // Handle errors
    ros.value.on("error", (error) => {
        console.error("Error connecting to ROS: ", error);
    });

    // Handle disconnection
    ros.value.on("close", () => {
        console.warn("Disconnected from ROS!");
    });
});

onUnmounted(() =>{
  if(ros.value){
    // ros.value.close();
  }
});

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
