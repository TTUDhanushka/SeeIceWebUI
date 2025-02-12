<template>
    <div class="video-strip">
        <h2>ROS Video Feed</h2>
        <div class="video-container">
            <div>
                <!-- :src="left_camera_src" alt="ROS video" v-if="left_camera_src"v-else-->
                <canvas ref="left_image_canvas" height="300" width="600" ></canvas>
                <p>Loading</p>
            </div>
            <div>
                <!-- <img :src="right_camera_src" alt="ROS video" v-if="right_camera_src"/> -->
                <canvas ref="right_image_canvas" height="300" width="600" ></canvas>
                <p>Loading</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount } from 'vue';
import ROSLIB from 'roslib';

let ros = null;
let left_camera_image_Topic = null;
let right_camera_image_Topic = null;

const left_image_canvas = ref(null);
const right_image_canvas = ref(null);

let canvas = null;
let image = new Image();
let img_context = null;
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

const frameRate = 10;
let lastFrameTime = 0;

function renderImage(imageData, canvasRef){
    if (!imageData){
        return;
    }

    // if (prviousFrameData == imageData){
    //     console.log('Duplicated frame');
    //     return;
    // }

    // const rawData = arrayBufferToBase64(imageData);

    // const blob = new Blob([rawData], {type: "image/jpeg"});

    // const url = URL.createObjectURL(blob);
    const now = performance.now();

    if (now - lastFrameTime < 1000 / frameRate) return;
    lastFrameTime = now;

    canvas = canvasRef.value;
    img_context = canvas.getContext("2d");

    if(image){
        image.onload = null;
        image.src = '';
    }

    image.onload = () => {

        img_context.clearRect(0 ,0, 600, 300);
        img_context.drawImage(image, 0 ,0, 600, 300); 

        // URL.revokeObjectURL(url);
        image.src = '';
        imageData = null;
    }

    image.src = `data:image/jpeg;base64,${imageData}`;

}

const subscribeToTopics = () => {

    left_camera_image_Topic = new ROSLIB.Topic({
        ros: ros,
        name: "/cam1_image_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    left_camera_image_Topic.subscribe((message) => {


        try{
            // console.log(`Message format=${message.format}`);   

            renderImage(message.data, left_image_canvas)
            message.data = null;

        }
        catch (error)
        {
            console.error("Failed to decode message");
        }


    });

    right_camera_image_Topic = new ROSLIB.Topic({
        ros: ros,
        name: "/cam2_image_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    right_camera_image_Topic.subscribe((message) => {

        try{
            // console.log(`Message format=${message.format}`);   
            
            renderImage(message.data, right_image_canvas)
            message.data = null;
        }
        catch (error)
        {
            console.error("Failed to decode message");
        }

        });
};

const ConnectToRos = () => {
    //Creates a new ROS connection
    ros = new ROSLIB.Ros({
        url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'ws://localhost:9090'
        : 'ws://37.157.77.203:9090',
    });

    ros.on("connection", () => {
        console.log("Connected to ROS!");
        // subscribeToTopics();
    });

    // Handle errors
    ros.on("error", (error) => {
        console.error("Error connecting to ROS: ", error);
    });

    // Handle disconnection
    ros.on("close", () => {
        console.warn("Disconnected from ROS!");
    });
};


onMounted(() => {
    ConnectToRos();
    subscribeToTopics();
});

onBeforeUnmount(() => {
    // Clear image canvases
    const canvasRefs = {left_image_canvas, right_image_canvas}

    for (let n = 1; n <  canvasRefs.length; n++){
        if (canvasRefs(n)){
            const ctx = canvasRefs(n).getContext('2d');
            ctx.clearRect(0, 0, 600, 300);
        }

        canvasRefs(n).value = '';
    }

    // Unsubscribe
    left_camera_image_Topic.unsubscribe();
    right_camera_image_Topic.unsubscribe();

});

</script>

<style scoped>

*{
    padding: 0px;
    margin: 0px;
}

.video-container{
    display: inline-flex;
    flex-direction: row;
    background-color: #688;
    justify-items: center;
}

</style>