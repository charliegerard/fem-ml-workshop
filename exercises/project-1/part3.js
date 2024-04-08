import "@tensorflow/tfjs";
// Part 3: Face detection model ⬇️
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";

const IMAGE_SIZE = 224;

let model;
let detector;

const predictButton = document.getElementById("predict");
const webcamButton = document.getElementById("webcam");
const pauseButton = document.getElementById("pause");
const canvas = document.getElementById("canvas");
const video = document.querySelector("video");
const width = 320; // We will scale the photo width to this
const height = 185;

const init = async () => {
  model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detectorConfig = {
    runtime: "tfjs",
  };
  detector = await faceDetection.createDetector(model, detectorConfig);
};

if (webcamButton) {
  webcamButton.onclick = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { width: 320, height: 185 },
      })
      .then((stream) => {
        video.srcObject = stream;
        track = stream.getTracks()[0];
        video.onloadedmetadata = () => video.play();
      })
      .catch((err) => {
        /* handle the error */
      });
  };
}

if (pauseButton) {
  pauseButton.onclick = () => takepicture();
}

function takepicture() {
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  const data = canvas.toDataURL("image/png");
  const photo = document.createElement("img");
  photo.setAttribute("src", data);
  photo.width = IMAGE_SIZE;
  photo.height = IMAGE_SIZE;

  const outputEl = document.getElementsByClassName("output")[0];
  outputEl.appendChild(photo);

  predictButton.disabled = false;

  predictButton.onclick = async () => {
    const estimationConfig = { flipHorizontal: false };
    const faces = await detector.estimateFaces(photo, estimationConfig);
    console.log("FACES: ", faces);

    // Draw box around the face detected ⬇️
    // ------------------------------------
    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = IMAGE_SIZE;
    faceCanvas.height = IMAGE_SIZE;
    faceCanvas.style.position = "absolute";
    faceCanvas.style.left = photo.offsetLeft;
    faceCanvas.style.top = photo.offsetTop;
    const ctx = faceCanvas.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.strokeRect(
      faces[0].box.xMin,
      faces[0].box.yMin,
      faces[0].box.width,
      faces[0].box.height
    );

    const webcamSection = document.getElementById("webcam-section");
    webcamSection.appendChild(faceCanvas);
  };
}

init();
