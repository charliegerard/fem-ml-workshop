import "@tensorflow/tfjs";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
import { startWebcam, takePicture, drawFaceBox } from "./utils";

let model;
let detector;

const webcamButton = document.getElementById("webcam");
const pauseButton = document.getElementById("pause");
const video = document.querySelector("video");

const init = async () => {
  model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detectorConfig = {
    runtime: "tfjs",
  };
  detector = await faceDetection.createDetector(model, detectorConfig);
};

webcamButton.onclick = () => startWebcam(video);

pauseButton.onclick = () => takePicture(video, predict);

const predict = async (photo) => {
  const estimationConfig = { flipHorizontal: false };
  const faces = await detector.estimateFaces(photo, estimationConfig);
  console.log("FACES: ", faces);

  drawFaceBox(photo, faces);
};

init();
