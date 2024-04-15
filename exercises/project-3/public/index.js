import {
  resetCanvas,
  displayPrediction,
  clearRect,
  getCanvas,
} from "./utils.js";

const clearButton = document.getElementById("clear-button");
const predictButton = document.getElementById("check-button");

let model;
const modelURL = "./model/model.json";

loadTsfModel(modelURL);

async function loadTsfModel(modelURL) {
  // if (!model) model = await tf.loadModel(modelURL);
  if (!model) model = await tf.loadLayersModel(modelURL);
}

predictButton.onclick = function () {
  const canvas = getCanvas();
  var doodle = canvas.toDataURL();

  var newImageTag = document.getElementsByClassName("imageToCheck")[0];
  newImageTag.src = doodle;

  newImageTag.onload = function () {
    predict(this);
  };

  resetCanvas();
};

clearButton.onclick = function () {
  resetCanvas();
  var predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = "";
  clearRect();
};

const predict = async (newImage) => {
  newImage.height = 200;
  newImage.width = 200;

  const processedImage = await tf.browser.fromPixelsAsync(newImage, 4);
  const smallImg = tf.image.resizeBilinear(processedImage, [28, 28]);
  // const smallImg = tf.image.resizeBilinear(processedImage, [96, 96]);
  const resized = tf.cast(smallImg, "float32");
  let shape;
  const predictions = await model
    .predict(
      tf.reshape(resized, (shape = [1, 28, 28, 4]))
      // tf.reshape(resized, (shape = [1, 96, 96, 3]))
    )
    .data();

  // let orderedPredictions = Array.from(predictions)
  //   .map(function (p, i) {
  //     // this is Array.map
  //     return {
  //       probability: p,
  //       className: labels[i], // we are selecting the value from the obj
  //     };
  //   })
  //   .sort(function (a, b) {
  //     return b.probability - a.probability;
  //   });
  // // .slice(0, 2);
  // console.log(orderedPredictions);

  const label = predictions.indexOf(Math.max(...predictions));

  displayPrediction(label);
};
