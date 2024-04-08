---
title: "Project 3: Create a custom image classification model"
description: "Project 3: Create a custom image classification model."
keywords:
  - AI
  - Artificial intelligence
  - Neural networks
  - TensorFlow.js
  - JavaScript
  - Machine learning
  - Charlie Gerard
---

# {% $markdoc.frontmatter.title %}

## Set up

Install the following packages:

```js
    "@tensorflow/tfjs": "^4.17.0",
    "@tensorflow/tfjs-node": "^4.17.0",
    "@tensorflow/tfjs-node-gpu": "^4.17.0",
```

## Collect the data

In the front-end, use the Canvas Web API to create a drawing area and add the functionality to save each drawing as a png:

```html
<div class="canvas-container">
  <canvas
    id="myCanvas"
    width="200"
    height="200"
    style="display: block"
  ></canvas>
</div>
```

```js
var context = document.getElementsByTagName("canvas")[0].getContext("2d");
var canvas = document.getElementsByTagName("canvas")[0];

canvas.addEventListener("mousedown", function (e) {
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;

  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

canvas.addEventListener("mousemove", function (e) {
  if (paint) {
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});

canvas.addEventListener("mouseup", function (e) {
  paint = false;
});

function redraw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

  context.strokeStyle = "#000000";
  context.lineJoin = "round";
  context.lineWidth = 5;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < clickX.length; i++) {
    context.beginPath();
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i - 1], clickY[i - 1]);
    } else {
      context.moveTo(clickX[i] - 1, clickY[i]);
    }
    context.lineTo(clickX[i], clickY[i]);
    context.closePath();
    context.stroke();
  }
}

function addClick(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}
```

In Node.js, load the images downloaded, and split them between a training set and a test set:

```js
const tf = require("@tensorflow/tfjs-node-gpu");
const fs = require("fs");
const path = require("path");

const TRAIN_IMAGES_DIR = "./data/train";
const TEST_IMAGES_DIR = "./data/test";

function loadImages(dataDir) {
  const images = [];
  const labels = [];

  var files = fs.readdirSync(dataDir);
  for (let i = 0; i < files.length; i++) {
    if (!files[i].toLocaleLowerCase().endsWith(".png")) {
      continue;
    }

    var filePath = path.join(dataDir, files[i]);

    var buffer = fs.readFileSync(filePath);
    var imageTensor = tf.node
      .decodeImage(buffer)
      // .resizeNearestNeighbor([96, 96])
      .resizeNearestNeighbor([28, 28])
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims();
    images.push(imageTensor);

    var square = files[i].toLocaleLowerCase().endsWith("square.png");
    var triangle = files[i].toLocaleLowerCase().endsWith("triangle.png");

    if (square == true) {
      labels.push(0);
    } else if (triangle == true) {
      labels.push(1);
    }
  }
  console.log("Labels are");
  console.log(labels);
  return [images, labels];
}

class ImageDataset {
  constructor() {
    this.trainData = [];
    this.testData = [];
  }

  loadData() {
    console.log("Loading images...");
    this.trainData = loadImages(TRAIN_IMAGES_DIR);
    this.testData = loadImages(TEST_IMAGES_DIR);
    console.log("Images loaded successfully.");
  }

  getTrainData() {
    return {
      images: tf.concat(this.trainData[0]),
      labels: tf.oneHot(tf.tensor1d(this.trainData[1], "int32"), 2).toFloat(), // 2 is the number of classes
    };
  }

  getTestData() {
    return {
      images: tf.concat(this.testData[0]),
      labels: tf.oneHot(tf.tensor1d(this.testData[1], "int32"), 2).toFloat(),
    };
  }
}

module.exports = new ImageDataset();
```

## Data transformation

```js

```

## Create the model

- Import Tensorflow.js
- Choose your type of machine learning architecture (here sequential)
- Add layers
- Optimize

```js
const tf = require("@tensorflow/tfjs");

const kernel_size = [3, 3];
const pool_size = [2, 2];
const first_filters = 32;
const second_filters = 64;
const third_filters = 128;
const dropout_conv = 0.3;
const dropout_dense = 0.3;
const numClasses = 2;

const model = tf.sequential();
model.add(
  tf.layers.conv2d({
    // inputShape: [96, 96, 1],
    // inputShape: [96, 96, 4],
    inputShape: [28, 28, 4],
    filters: first_filters,
    kernelSize: kernel_size,
    activation: "relu",
  })
);
model.add(
  tf.layers.conv2d({
    filters: first_filters,
    kernelSize: kernel_size,
    activation: "relu",
  })
);
model.add(tf.layers.maxPooling2d({ poolSize: pool_size }));
model.add(tf.layers.dropout({ rate: dropout_conv }));

model.add(tf.layers.flatten());

// model.add(tf.layers.dense({ units: 256, activation: "relu" }));
model.add(tf.layers.dense({ units: 10, activation: "relu" }));

model.add(tf.layers.dropout({ rate: dropout_dense }));
// model.add(tf.layers.dense({ units: 7, activation: "softmax" }));
model.add(tf.layers.dense({ units: numClasses, activation: "softmax" }));

const optimizer = tf.train.adam(0.0001);
model.compile({
  optimizer: optimizer,
  loss: "categoricalCrossentropy",
  metrics: ["accuracy"],
});

module.exports = model;
```

## Train

```js
data.loadData();

const { images: trainImages, labels: trainLabels } = data.getTrainData();
console.log("Training Images (Shape): " + trainImages.shape);
console.log("Training Labels (Shape): " + trainLabels.shape);

model.summary();

const validationSplit = 0.2;
await model.fit(trainImages, trainLabels, {
  epochs,
  batchSize,
  validationSplit,
});

const { images: testImages, labels: testLabels } = data.getTestData();
const evalOutput = model.evaluate(testImages, testLabels);

console.log(
  `\nEvaluation result:\n` +
    `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
    `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`
);
```

## Save the model

```js
if (modelSavePath != null) {
  await model.save(`file://${modelSavePath}`);
  console.log(`Saved model to path: ${modelSavePath}`);
}
```

## Use it in the frontend

```js
const modelURL = "./model/model.json";

const labels = ["square", "triangle"];

async function loadTsfModel(modelURL) {
  // if (!model) model = await tf.loadModel(modelURL);
  if (!model) model = await tf.loadLayersModel(modelURL);
}

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

const displayPrediction = (label) => {
  let prediction;
  switch (label) {
    case 0:
      // prediction = 'baseball';
      prediction = "Square!";
      break;
    case 1:
      prediction = "Triangle!";
      break;
    default:
      break;
  }

  var predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = prediction;
};
```

## Enjoy! 🎉

Go wild! Try to create a model using different types architectures, layers, parameters, or inputs, and have fun experimenting!

## Additional resources

- Gesture recognition with Arduino, Daydream controller and phone
- Brain blink detection
- [Tiny Motion trainer](https://experiments.withgoogle.com/tiny-motion-trainer/view/)
