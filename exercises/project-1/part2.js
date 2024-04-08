import "@tensorflow/tfjs";
// Part 2: CocoSSD model ⬇️
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { showResult } from "./utils";

const IMAGE_SIZE = 224;
let model;
const predictButton = document.getElementById("predict");
const webcamButton = document.getElementById("webcam");
const pauseButton = document.getElementById("pause");
const canvas = document.getElementById("canvas");
const video = document.querySelector("video");
const width = 320; // We will scale the photo width to this
const height = 185;

const init = async () => {
  model = await cocoSsd.load();
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
  photo.style.display = "none";
  const outputEl = document.getElementsByClassName("output")[0];
  outputEl.appendChild(photo);

  predictButton.disabled = false;

  predictButton.onclick = async () => {
    const predictions = await model.detect(photo);
    console.log(predictions);
    showResult(predictions);
  };
}

init();
