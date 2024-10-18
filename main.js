
let test_btn = document.getElementById('test_btn');
let clickedOnce = false;

var ros = new ROSLIB.Ros({
    url:'ws://localhost:9090'
});

console.log('Trying to connect');

ros.on('connection', function(){
    console.log(`Connected`);
});

ros.on('close', function(){
    console.log(`Closed`);
});

ros.on('error', function(){
    console.log(`error`);
});

var imageTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/cam_image',
    messageType: 'sensor_msgs/Image'

});


// var listener = new ROSLIB.Topic({
//     ros: ros,
//     name: '/topic',
//     messageType: 'std_msgs/String'
// });

// listener.subscribe(function(message){
//     console.log(`Received message` + listener.name + `: ` + message.data);
//     document.getElementById('string_value').innerHTML =  message.data;
// });

function convertToUint(data) {
  
    const incomingString = atob(data);

    const charArray = new Uint8Array(incomingString.length);

    // Loop over each character in the binary string
    for (let i = 0; i < incomingString.length; i++) {
        // Get the byte value of each character (0-255) using charCodeAt
        charArray[i] = incomingString.charCodeAt(i);
    }

    return charArray;
  }

function drawRawImage(message) {
    const camera_view_ids = ['camera_view_1', 'camera_view_2', 'camera_view_3'];
    let canvas = [];
    let ctx = [];



    for (let n = 0; n < camera_view_ids.length; n++){
        canvas[n] = document.getElementById(camera_view_ids[n]);
        ctx[n] = canvas[n].getContext('2d');
    }

    console.log('Camera view ids count:', ctx[1]);

    // const canvas = document.getElementById('camera_view_1');
    // const ctx = canvas.getContext('2d');

    // Validate image encoding for BGR
    if (message.encoding !== 'bgr8') {
      console.error('Unsupported image encoding:', message.encoding);
      return;
    }

    const { width, height } = message;
    const imageData = [];
    // const imageDataArray;

    for (let i = 0; i < camera_view_ids.length; i++){
        imageData[i] = ctx[i].createImageData(width, height);
        // const imageDataArray = imageData[0].data;
    }
    // const imageData = ctx.createImageData(width, height);
    const imageDataArray = imageData[0].data;

    data = convertToUint(message.data)

    for (let i = 0; i < data.length; i += 3) {
      const index = (i / 3) * 4; // BGR to RGBA
      imageDataArray[index] = data[i+2];   // Red from BGR
      imageDataArray[index + 1] = data[i + 1]; // Green stays the same
      imageDataArray[index + 2] = data[i ];     // Blue from BGR
      imageDataArray[index + 3] = 255;          // Alpha set to 255 (fully opaque)
    }

    // Draw the ImageData on the canvas
    for (let i = 0; i < camera_view_ids.length; i++){
        ctx[i].putImageData(imageData[0], 0, 0);
    }
    // ctx[0].putImageData(imageData, 0, 0);
  }

// Handle incoming camera image messages
imageTopic.subscribe(function (message) {

    // Make sure the message contains the data field
    if (!message.data || message.data.length === 0) {
    console.error("Image message contains no data");
    return;
    }

    // // Log image properties
    // console.log('Image properties:', {
    //     height: message.height,
    //     width: message.width,
    //     encoding: message.encoding,
    //     dataLength: message.data.length
    //     });

    // console.log('Received image message:', message);

    drawRawImage(message);
});

test_btn.addEventListener('click', printSomething);

function printSomething(){

    if (!clickedOnce){
        console.log(`Button pressed`);
        clickedOnce = true;
    }else{
        console.log(`Clicked before`);
    }

}