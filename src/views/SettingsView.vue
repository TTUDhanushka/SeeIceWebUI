<template>
    <div class="Settings-page">
        <h2 style="color: aquamarine;">Video settings</h2>
        <RgbVideoFeed :ros="ros"/>
        <div style="padding: 5px;">

            <button @click="OnClickCaptureOneImage">Capture</button>
            <p>Images captured: {{ capturedImagesCount }}</p>
            <button @click="OnClickStartCalibration">Start camera calibration</button>
        </div>
        <div id="feedback-container">
            <div>
                <canvas ref="calibrationImages" width="1024" height="512"></canvas>
            </div>
            <div>
                <p>Images loading {{ inputsForDisplay }}</p>
                <p>Distortion coefficient {{ distortion_coefficients_result }}</p>
                <p>Camera matrix: {{ camera_matrix_result }}</p>
                <p>Image encode {{ imageType }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
    import{ref, onMounted} from 'vue'
    import RgbVideoFeed from '../components/RgbVideoFeed.vue';
    import ROSLIB from 'roslib';
    import {Buffer} from 'buffer';

    let captureClient = null;
    let calibrationClient = null;
    let captureGoal = null;
    let calibrationGoal = null;
    let captureImage = ref(false);

    const capturedImagesCount = ref(0)
    const noOfImagesToBeCaptured = ref(10)
    const calibrationStart = ref(false)
    const calibrationStatus = ref(false)

    const calibrationImages = ref(null)
    const distortion_coefficients_result = ref(null)
    const camera_matrix_result =  ref(null)

    const imageType = ref(null)

    const inputsForDisplay = ref(null)

    const props = defineProps({
        ros: {
            type: Object,
            required: true,
        },
    });

    const OnClickStartCalibration = () => {
        // Send calibration start command
        calibrationStart.value = true;
        calibrationGoal.send();
        console.log('Sending goal to capture 10 images');
    };

    const OnClickCaptureOneImage = () => {
        captureImage.value = true;
        
        setCaptureGoal();
        captureGoal.send();
        console.log('Sending goal to capture');
    };

    const setCaptureGoal= () => {

    captureGoal = new ROSLIB.Goal({
        actionClient: captureClient,
        goalMessage: {
            capture: captureImage.value
        }
    });

    captureGoal.on('result', function(result){
        if(result.success){
            captureImage.value = false;
            capturedImagesCount.value += 1;
        }
    });
    }

    onMounted(()=>{

        captureClient = new ROSLIB.ActionClient({
            ros:props.ros,
            serverName: '/capture_action',
            actionName: 'camera_streamer/CaptureAction'
        });

        calibrationClient = new ROSLIB.ActionClient({
            ros:props.ros,
            serverName: '/calibration_action',
            actionName: 'camera_streamer/CalibrationAction'
        });



        calibrationGoal = new ROSLIB.Goal({
            actionClient: calibrationClient,
            goalMessage: {
                num_images: noOfImagesToBeCaptured.value
            }
        });

        calibrationGoal.on('feedback', function(feedback){
            if(feedback.calib_input_image){
                let imageData = feedback.calib_input_image.data;

                inputsForDisplay.value = feedback.calib_input_image.data.length;

                imageType.value = feedback.calib_input_image.encoding === 'bgr8' ? 'image/png' : 'image/jpeg';
                const chunkSize = 0x8000;
                let base64 = '';

                // for(let i =0; i<imageData.length; i+=chunkSize){
                //     const chunk = imageData.subarray(i, i + chunkSize);
                //     base64 += String.fromCharCode.apply(null, chunk);
                // }

                const ctx = calibrationImages.value.getContext('2d');
                base64 = imageData;
                const bgrData = atob(base64);

                const uint8Array = new Uint8Array(bgrData.length);

                for(let i = 0; i < bgrData.length; i ++){
                    uint8Array[i] = bgrData.charCodeAt(i);
                }

                const rgbData = new Uint8ClampedArray(imageData.length)

                for(let i = 0; i < uint8Array.length; i += 3){
                    let j = (i / 3) * 4;
                    rgbData[j] = uint8Array[i + 2];
                    rgbData[j + 1] = uint8Array[i + 1];
                    rgbData[j + 2] = uint8Array[i];
                    rgbData[j + 3] = 255;
                }

                const imageRawData = new ImageData(
                    rgbData,
                    feedback.calib_input_image.width,
                    feedback.calib_input_image.height
                );

                ctx.putImageData(imageRawData, 0, 0)

                // calibrationImages.value = `data:${imageType}; base64, ${btoa(base64)}`;
                console.log('Feedback received!')
            }
        });

        calibrationGoal.on('result', function(result){
            if(result.success){
                calibrationStatus.value = true;
                console.log('All the calibration images captured.')
            }

            if(result.camera_matrix){
                camera_matrix_result.value = result.camera_matrix.length;
            }

            if(result.distortion_coefficients){
                distortion_coefficients_result.value = result.distortion_coefficients;
            }

        });
    });
</script>

<style scoped>
*{
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #252525;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h2 {
  font-size: 3.2em;
  line-height: 1.1;
}

button 
{
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
}

button:hover 
{
    border-color: #646cff;
}

button:focus,
button:focus-visible 
{
    outline: 4px auto -webkit-focus-ring-color;
}

#feedback-container{
    display: flex;
    justify-content: center;
}
</style>