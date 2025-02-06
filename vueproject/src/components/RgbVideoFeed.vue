<template>
    <div class="video-strip">
        <h2>ROS Video Feed</h2>
        <div class="video-container">
            <div>
                <img :src="left_camera_src" alt="ROS video" v-if="left_camera_src"/>
                <p v-else>Loading</p>
            </div>
            <div>
                <img :src="right_camera_src" alt="ROS video" v-if="right_camera_src"/>
                <p v-else>Loading</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ROSLIB from 'roslib';

let ros = null;
let left_camera_image_Topic = null;
let right_camera_image_Topic = null;

const left_camera_src = ref('')
const right_camera_src = ref('')

function arrayBufferToBase64(buffer){
    const binaryString = atob(buffer);
    const len = binaryString.length;

    const bytes = new Uint8Array(len);

    for(let i=0; i< len; i++){
    bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}

const subscribeToTopics = () => {
    left_camera_image_Topic = new ROSLIB.Topic({
        ros: ros,
        name: "/cam1_image_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    left_camera_image_Topic.subscribe((message) => {

        try{
            console.log(`Message format=${message.format}`);   
            
            const rawData = arrayBufferToBase64(message.data);

            const blob = new Blob([rawData], {type: "image/jpeg"});

            const url = URL.createObjectURL(blob);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const image = new Image();

            image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            context.drawImage(image, 0 ,0);

            left_camera_src.value = canvas.toDataURL("image/jpeg");

            URL.revokeObjectURL(url);
            }

            image.src = url;
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
            console.log(`Message format=${message.format}`);   
            
            const rawData = arrayBufferToBase64(message.data);

            const blob = new Blob([rawData], {type: "image/jpeg"});

            const url = URL.createObjectURL(blob);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const image = new Image();

            image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            context.drawImage(image, 0 ,0);

            right_camera_src.value = canvas.toDataURL("image/jpeg");

            URL.revokeObjectURL(url);
            }

            image.src = url;
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