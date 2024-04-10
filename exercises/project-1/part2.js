import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { showResult, startWebcam, takePicture } from "./utils";

let model;

const webcamButton = document.getElementById("webcam");
const pauseButton = document.getElementById("pause");
const video = document.querySelector("video");

const init = async () => {
  model = await cocoSsd.load();
};

webcamButton.onclick = () => startWebcam(video);

pauseButton.onclick = () => takePicture(video, predict);

const predict = async (img) => {
  const predictions = await model.detect(img);
  console.log(predictions);
  showResult(predictions);
};

init();
