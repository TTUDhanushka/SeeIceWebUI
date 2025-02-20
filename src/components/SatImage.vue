<template>
    <div class="video-strip">
        <div class="image-container">
            <div>
                <div class="image-label">
                    <img src="" style="background-color: black; width: 30px;">
                    <p>Satellite</p>
                </div>
                <canvas ref="sat_image_canvas" height="280" width="280" ></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import ROSLIB from 'roslib';


let sat_image_preview_Topic = null;
const sat_image_canvas = ref(null);

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

        img_context.clearRect(0 ,0, 280, 280);
        img_context.drawImage(image, 0 ,0, 280, 280); 

        // URL.revokeObjectURL(url);
        image.src = '';
        imageData = null;
        }

    image.src = `data:image/jpeg;base64,${imageData}`;
};

onMounted(() => {


    if (props.ros){
        console.log('Ros reached to the sat image onMounted');
    }else{
        console.log('Ros has not reached to the component level');
    }

    sat_image_preview_Topic = new ROSLIB.Topic({
        ros: props.ros,
        name: "/sat_image_preview",
        messageType: "sensor_msgs/CompressedImage",
    });

    sat_image_preview_Topic.subscribe((message) => {
        console.log("Satellite image received");
        
        try{
            renderImage(message.data, sat_image_canvas)
            message.data = null;
        }
        catch (error)
        {
            console.error("Failed to decode message");
        }
    });

});

onBeforeUnmount(() => {
    sat_image_preview_Topic.unsubscribe();
});
</script>

<style scoped>
*{
    padding: 0px;
    margin: 0px;

    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.image-container{
    display: inline-flex;
    flex-direction: row;
    justify-items: center;
}

.image-label{
    color:white;
    height: 30px;
    background: linear-gradient( 90deg, rgba(64, 135, 241, 0.9), rgba(26, 46, 29, 0.226));
    display: flex;
    justify-items: flex-start;
    align-items: center;
    font-family: inherit;
    left: 20px;
}
</style>