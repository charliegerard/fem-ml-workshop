import {
  resetCanvas,
  clearRect,
  getCanvas,
  displayPrediction,
} from "./utils.js";

const clearButton = document.getElementById("clear-button");
const predictButton = document.getElementById("check-button");

clearButton.onclick = () => {
  resetCanvas();
  const predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = "";
  clearRect();
};

let model;
const modelPath = "./model/model.json";

const loadModel = async (path) => {
  if (!model) model = await tf.loadLayersModel(path);
};

predictButton.onclick = () => {
  const canvas = getCanvas();

  const drawing = canvas.toDataURL();
  const newImg = document.getElementsByClassName("imageToCheck")[0];
  newImg.src = drawing;

  newImg.onload = () => {
    predict(newImg);
  };

  resetCanvas();
};

const predict = async (img) => {
  img.width = 200;
  img.height = 200;

  const processedImg = await tf.browser.fromPixelsAsync(img, 4);
  const resizedImg = tf.image.resizeNearestNeighbor(processedImg, [28, 28]);

  const updatedImg = tf.cast(resizedImg, "float32");
  let shape;
  const predictions = await model
    .predict(tf.reshape(updatedImg, (shape = [1, 28, 28, 4])))
    .data();

  const label = predictions.indexOf(Math.max(...predictions));
  displayPrediction(label);
};

loadModel(modelPath);
