<template>
  <div id="app">
    <div class="main-container">
      <router-view :ros="ros" :ros_status="ros_connection_status"/>
    </div>
    <div class="nav_bar">
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/settings">Settings</router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ROSLIB from 'roslib';

const ros = ref(null);
const ros_connection_status = ref(false);

onMounted (() => {
    // Creates a new ROS connection
    ros.value = new ROSLIB.Ros({
        url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'ws://localhost:9090'
        : 'ws://37.157.77.203:9090',
    });

    ros.value.on("connection", () => {
        console.log("Connected to ROS!");
        ros_connection_status.value = true;
        // subscribeToTopics();
    });

    // Handle errors
    ros.value.on("error", (error) => {
        console.error("Error connecting to ROS: ", error);
        ros_connection_status.value = false;
    });

    // Handle disconnection
    ros.value.on("close", () => {
        console.warn("Disconnected from ROS!");
        ros_connection_status.value = false;
    });
});

onUnmounted(() =>{
  if(ros.value){
    // ros.value.close();
  }
});

</script>

<style>
*{
  padding: 0;
  margin: 0;
}

#app {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: rgb(33, 34, 45);
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.main-container{
  flex: 1;
}

.nav_bar{
  height: 40px;
  width: 16%;
  background-color: rgba(32, 32, 32, 0.568);
  border-radius: 5px;
  display: flex;
  justify-content: center;
  justify-self: center;
  align-items: center;
  align-self: center;
  position: fixed;
  bottom: 10px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
}

nav {
  padding: 10px;
  font-family: inherit;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
