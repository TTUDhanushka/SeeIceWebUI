<template>
    <div class="video-strip">
        <div class="video-container">
            <div>
                <div class="video-label">
                    <img src="" style="background-color: black; width: 30px;">
                    <p>Port - Forward</p>
                    <label class="switch">
                        <input type="checkbox" v-model="isView_1_ActiveTopic" @change="switchTopicsView_1" />
                        <span class="slider"></span>
                    </label>
                </div>
                <canvas ref="left_image_canvas" height="280" width="560" ></canvas>
            </div>
            <div>
                <div class="video-label">
                    <img src="" style="background-color: black; width: 30px;">
                    <p>Starboard - Forward</p>
                    <label class="switch">
                        <input type="checkbox" v-model="isView_2_ActiveTopic" @change="switchTopicsView_2" />
                        <span class="slider"></span>
                    </label>
                </div>
                <canvas ref="right_image_canvas" height="280" width="560" ></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import ROSLIB from 'roslib';

// let ros = null;

const props = defineProps({
    ros: {
        type: Object,
        required: true,
    },
});

const isView_1_ActiveTopic = ref(null);
const left_camera_image_Topic = ref(null);
const left_camera_seg_image_Topic = ref(null);

const isView_2_ActiveTopic = ref(null);
const right_camera_seg_image_Topic = ref(null);
const right_camera_image_Topic = ref(null);

const left_image_canvas = ref(null);
const right_image_canvas = ref(null);

let canvas = null;
let image = new Image();
let img_context = null;

const view_1_current_topic = ref(null)
const view_2_current_topic = ref(null)


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

        img_context.clearRect(0 ,0, 560, 280);
        img_context.drawImage(image, 0 ,0, 560, 280); 

        // URL.revokeObjectURL(url);
        image.src = '';
        imageData = null;
    }

    image.src = `data:image/jpeg;base64,${imageData}`;

}

const subscribeToTopics = () => {

    left_camera_image_Topic.value = new ROSLIB.Topic({
        ros: props.ros,
        name: "/cam1_image_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    left_camera_seg_image_Topic.value = new ROSLIB.Topic({
        ros: props.ros,
        name: "/cam1_seg_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    right_camera_image_Topic.value = new ROSLIB.Topic({
        ros: props.ros,
        name: "/cam2_image_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    right_camera_seg_image_Topic.value = new ROSLIB.Topic({
        ros: props.ros,
        name: "/cam2_seg_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    // right_camera_image_Topic.subscribe((message) => {

    //     try{
    //         // console.log(`Message format=${message.format}`);   
            
    //         renderImage(message.data, right_image_canvas)
    //         message.data = null;
    //     }
    //     catch (error)
    //     {
    //         console.error("Failed to decode message");
    //     }

    // });

    view_1_current_topic.value = left_camera_image_Topic.value;
    view_1_current_topic.value.subscribe(handleMessageLeft);

    view_2_current_topic.value = right_camera_image_Topic.value;
    view_2_current_topic.value.subscribe(handleMessageRight);
};

const handleMessageLeft = (message) => {
    try{
            // console.log(`Message format=${message.format}`);   
            
            renderImage(message.data, left_image_canvas)
            message.data = null;
        }
        catch (error)
        {
            console.error("Failed to decode message");
        }

};

const handleMessageRight = (message) => {
    try{
            // console.log(`Message format=${message.format}`);   
            
            renderImage(message.data, right_image_canvas)
            message.data = null;
        }
        catch (error)
        {
            console.error("Failed to decode message");
        }

};

const switchTopicsView_1 = () => {

    if (view_1_current_topic.value){
        view_1_current_topic.value.unsubscribe();
    }

    view_1_current_topic.value = isView_1_ActiveTopic.value ? left_camera_seg_image_Topic.value : left_camera_image_Topic.value;
    view_1_current_topic.value.subscribe(handleMessageLeft);

    console.log(`switching topics ${isView_1_ActiveTopic.value? 'topic_raw' : 'topic_segment'}`);
};

const switchTopicsView_2 = () => {
    if (view_2_current_topic.value){
        view_2_current_topic.value.unsubscribe();
    }

    view_2_current_topic.value = isView_2_ActiveTopic.value ? right_camera_image_Topic.value : right_camera_seg_image_Topic.value;
    view_2_current_topic.value.subscribe(handleMessageRight);
};

// const ConnectToRos = () => {
//     //Creates a new ROS connection
//     ros = new ROSLIB.Ros({
//         url: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
//         ? 'ws://localhost:9090'
//         : 'ws://37.157.77.203:9090',
//     });

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


onMounted(() => {
    // ConnectToRos();
    subscribeToTopics();
});

onBeforeUnmount(() => {
    // Clear image canvases
    const canvasRefs = {left_image_canvas, right_image_canvas}

    for (let n = 1; n <  canvasRefs.length; n++){
        if (canvasRefs(n)){
            const ctx = canvasRefs(n).getContext('2d');
            ctx.clearRect(0, 0, 560, 280);
        }

        canvasRefs(n).value = '';
    }

    // Unsubscribe
    // left_camera_image_Topic.unsubscribe();
    // right_camera_image_Topic.unsubscribe();

});

</script>

<style scoped>

*{
    padding: 0px;
    margin: 0px;

    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.video-container{
    display: inline-flex;
    flex-direction: row;
    justify-items: center;
}

.video-label{
    color:white;
    height: 30px;
    background: linear-gradient( 90deg, rgba(159, 241, 92, 0.9), rgba(26, 46, 29, 0.226));
    display: grid;
    justify-items: flex-start;
    grid-template-columns: 50px 1fr 50px;
    align-items: center;
    font-family: inherit;
    left: 20px;
}
.switch{
    position: relative;
    display: inline-block;
    width: 30px;
    height: 18px;
}

.switch input{
    opacity: 0;
    width: 0;
    height: 0;
}

.slider{
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #555;
    transition: 0.4s;
    border-radius: 18px;
}

.slider::before{
    position: absolute;
    content: "";
    height: 10px;
    width: 10px;
    left: 4px;
    bottom: 4px;
    background-color: antiquewhite;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked + .slider{
    background-color: rgba(159, 241, 92, 1);
}

input:checked + .slider:before{
    transform: translateX(10px);
}

</style>