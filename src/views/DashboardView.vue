<!-- 
 Author:        Dhanushka Liyanage
 Description:   Home page showing dashboard
 -->

<template>
  <div class="container">
    <div id="visual_feeds">
      <!-- Camera feed style="width: 100%; height: calcl(100% - 5px);"-->
      <div class="dashboard">
        <RgbVideoFeed :ros="ros"/>
      </div>

      <!-- Thermal video -->
      <div class="video" id="thermal_camera" >
        <div style="flex: 1; border: 0px solid #CCC; position: relative;">
          <!-- <img v-if="thermal_camera_feed" :src="thermal_camera_feed" :type="type" alt="Thernal camera Feed"/> -->
          <!-- <p v-else style="text-align: center; width: 400px; height: 300px;">Loading thermal camera feed</p> -->
          <div class="floating-label">Thermal</div>
        </div>
      </div>

      <!-- Satellite image -->
      <div class="video" id="sat_image" >
        <div style="flex: 1; border: 0px solid #CCC; position: relative;">
          <!-- <img v-if="sat_image" :src="sat_image_preview" :type="type" alt="Satellite image" style="width: 300px; height: 300px;"/> -->
          <!-- <p v-else style="text-align: center; width: 300px; height: 300px;">Satellite image</p> -->
          <div class="floating-label">Thermal</div>
        </div>
      </div>

    </div>

    <!-- Left section - The Map-->
    <div id="map"></div>
  </div>
</template>

<script setup>
  import { onMounted} from 'vue'
  import RgbVideoFeed from '../components/RgbVideoFeed.vue';
  // import ROSLIB from 'roslib';
  import "leaflet/dist/leaflet.css";    // Leaflet CSS
  import L from "leaflet";


  let map = null;

  const props = defineProps({
    ros: {
        type: Object,
        required: true,
    },
  });

  const initializeMap = () => {
    // Create leaflet map instance
    map = L.map("map").setView([59.3922, 24.65], 13);

    //Addtile layer to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Leaflet',
    }).addTo(map);
  }


  //---------------
//   let ros = null;
// let left_camera_image_Topic = null;
// let right_camera_image_Topic = null;

// const left_image_canvas = ref(null);
// const right_image_canvas = ref(null);

// let canvas = null;
// let image = new Image();
// let img_context = null;
// let prviousFrameData = null;

// function arrayBufferToBase64(buffer){
//     const binaryString = atob(buffer);
//     const len = binaryString.length;

//     const bytes = new Uint8Array(len);

//     for(let i=0; i< len; i++){
//     bytes[i] = binaryString.charCodeAt(i);
//     }

//     return bytes;
// }

// const frameRate = 10;
// let lastFrameTime = 0;

// function renderImage(imageData, canvasRef){
//     if (!imageData){
//         return;
//     }

//     // if (prviousFrameData == imageData){
//     //     console.log('Duplicated frame');
//     //     return;
//     // }

//     // const rawData = arrayBufferToBase64(imageData);

//     // const blob = new Blob([rawData], {type: "image/jpeg"});

//     // const url = URL.createObjectURL(blob);
//     const now = performance.now();

//     if (now - lastFrameTime < 1000 / frameRate) return;
//     lastFrameTime = now;

//     canvas = canvasRef.value;
//     img_context = canvas.getContext("2d");

//     if(image){
//         image.onload = null;
//         image.src = '';
//     }

//     image.onload = () => {

//         img_context.clearRect(0 ,0, 600, 300);
//         img_context.drawImage(image, 0 ,0, 600, 300); 

//         // URL.revokeObjectURL(url);
//         image.src = '';
//         imageData = null;
//     }

//     image.src = `data:image/jpeg;base64,${imageData}`;

// }

// const subscribeToTopics = () => {

//     left_camera_image_Topic = new ROSLIB.Topic({
//         ros: ros,
//         name: "/cam1_image_preview",
//         messageType: "sensor_msgs/CompressedImage",
//     });

//     left_camera_image_Topic.subscribe((message) => {


//         try{
//             // console.log(`Message format=${message.format}`);   

//             renderImage(message.data, left_image_canvas)
//             message.data = null;

//         }
//         catch (error)
//         {
//             console.error("Failed to decode message");
//         }


//     });

//     right_camera_image_Topic = new ROSLIB.Topic({
//         ros: ros,
//         name: "/cam2_image_preview",
//         messageType: "sensor_msgs/CompressedImage",
//     });

//     right_camera_image_Topic.subscribe((message) => {

//         try{
//             // console.log(`Message format=${message.format}`);   
            
//             renderImage(message.data, right_image_canvas)
//             message.data = null;
//         }
//         catch (error)
//         {
//             console.error("Failed to decode message");
//         }

//         });
// };

// const ConnectToRos = () => {
//     //Creates a new ROS connection
//     ros = new ROSLIB.Ros({
//         url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
//         ? 'ws://localhost:9090'
//         : 'ws://37.157.77.203:9090',
//     });

//     rosHost.value = ros;

//     ros.on("connection", () => {
//         console.log("Connected to ROS!");
//         // subscribeToTopics();
//     });

//     // Handle errors
//     ros.on("error", (error) => {
//         console.error("Error connecting to ROS: ", error);
//     });

//     // Handle disconnection
//     ros.on("close", () => {
//         console.warn("Disconnected from ROS!");
//     });
// };
  //---------------
  onMounted(() => {

    // ConnectToRos();
    // subscribeToTopics();

    initializeMap();

  })

//   onBeforeUnmount(() => {
//     // Clear image canvases
//     const canvasRefs = {left_image_canvas, right_image_canvas}

//     for (let n = 1; n <  canvasRefs.length; n++){
//         if (canvasRefs(n)){
//             const ctx = canvasRefs(n).getContext('2d');
//             ctx.clearRect(0, 0, 600, 300);
//         }

//         canvasRefs(n).value = '';

//     }

//     // Unsubscribe
//     left_camera_image_Topic.unsubscribe();
//     right_camera_image_Topic.unsubscribe();

// });

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
}

#map{
  flex:1;
  height: 100%;
}

</style>