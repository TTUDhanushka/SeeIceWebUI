<template>
    <div class="video-strip">
        <div class="video-container">
            <div>
                <div class="video-label">
                    <img src="" style="background-color: black; width: 30px;">
                    <p>Forward</p>
                </div>
                <canvas ref="thermal_image_canvas" height="280" width="375" ></canvas>
            </div>
        </div>
    </div>
</template>


<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import ROSLIB from 'roslib';


let thermal_video_topic = null;

const thermal_image_canvas = ref(null);

let canvas = null;
let image = new Image();
let img_context = null;

const props = defineProps({
    ros: {
        type: Object,
        required: true,
    },
});

function renderImage(imageData, canvasRef){
    if (!imageData){
        return;
    }

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

onMounted(()=>{

    thermal_video_topic = new ROSLIB.Topic({
        ros: props.ros,
        name: "/image_topic_thermal",
        // name: "/cam1_seg_preview",
        messageType: "sensor_msgs/Image",
        // messageType: "sensor_msgs/CompressedImage",
    });

    thermal_video_topic.subscribe((message) => {

        try{
            renderImage(message.data, thermal_image_canvas)
            message.data = null;
        }
        catch (error)
        {
            console.error("Failed to decode message");
        }
    });
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
    background: linear-gradient( 90deg, rgba(241, 91, 64, 0.9), rgba(26, 46, 29, 0.226));
    display: flex;
    justify-items: flex-start;
    align-items: center;
    font-family: inherit;
    left: 20px;
}
</style>