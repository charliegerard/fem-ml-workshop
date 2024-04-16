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

The first step to creating a custom machine learning model is to gather a dataset. For this project, we're going to create our own by drawing on a canvas and downloading the images.
Navigate to the folder `exercises/project-3` and run `npm run watch`.
Open your browser at `http://localhost:1234` and select the public folder.

This UI displays an area where you can draw and 3 buttons, one to download the image, one to predict the label of the image and one to clear the canvas.

To create your dataset, pick 2 shapes you'd like to use with your model, for example "square" and "triangle". Draw a square, download the image, rename it with the format `number-shape` (`0-square.png`), clear the canvas and repeat until you have at least 20 squares and 20 triangles.

Place these images in a folder called `data` and create two subfolders `train` and `test`. Move about 20% of your images to the `test` folder and the other 80% to the `train` folder.

## Load the data

Now that your dataset is created, we need to load it in Node.js to use it to train the model.

In Node.js, load the images downloaded, and split them between a training set and a test set:

```js
const tf = require("@tensorflow/tfjs-node-gpu");
const fs = require("fs");
const path = require("path");

const TRAIN_IMAGES_DIR = "./data/train";
const TEST_IMAGES_DIR = "./data/test";
const trainData = [];
const testData = [];

const loadImages = (dataDir) => {
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
  console.log("Labels are: ", labels);
  return [images, labels];
};

const loadData = () => {
  console.log("Loading images...");
  trainData = loadImages(TRAIN_IMAGES_DIR);
  testData = loadImages(TEST_IMAGES_DIR);
  console.log("Images loaded successfully.");
};

const getTrainData = () => {
  return {
    images: tf.concat(trainData[0]),
    labels: tf.oneHot(tf.tensor1d(trainData[1], "int32"), 2).toFloat(), // 2 is the number of classes
  };
};

const getTestData = () => {
  return {
    images: tf.concat(testData[0]),
    labels: tf.oneHot(tf.tensor1d(testData[1], "int32"), 2).toFloat(),
  };
};

module.exports = { loadData, getTestData, getTrainData };
```

## Create the model

```js
// Import Tensorflow.js
const tf = require("@tensorflow/tfjs");

const kernel_size = [3, 3];
const pool_size = [2, 2];
const first_filters = 32;
const second_filters = 64;
const third_filters = 128;
const dropout_conv = 0.3;
const dropout_dense = 0.3;
const numClasses = 2;

// Choose your type of machine learning architecture (here sequential)
const model = tf.sequential();
// Add layers to the neural network
model.add(
  tf.layers.conv2d({
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
model.add(tf.layers.dense({ units: 10, activation: "relu" }));

model.add(tf.layers.dropout({ rate: dropout_dense }));
model.add(tf.layers.dense({ units: numClasses, activation: "softmax" }));

// Optimize
const optimizer = tf.train.adam(0.0001);
model.compile({
  optimizer: optimizer,
  loss: "categoricalCrossentropy",
  metrics: ["accuracy"],
});

module.exports = model;
```

## Train and save

```js
const tf = require("@tensorflow/tfjs-node-gpu");

const { loadData, getTrainData, getTestData } = require("./get-data");
const model = require("./create-model");

async function run(epochs, batchSize, modelSavePath) {
  loadData();

  const { images: trainImages, labels: trainLabels } = getTrainData();
  console.log("Training Images (Shape): " + trainImages.shape);
  console.log("Training Labels (Shape): " + trainLabels.shape);

  model.summary();

  const validationSplit = 0.2;
  await model.fit(trainImages, trainLabels, {
    epochs,
    batchSize,
    validationSplit,
  });

  const { images: testImages, labels: testLabels } = getTestData();
  const evalOutput = model.evaluate(testImages, testLabels);

  console.log(
    `\nEvaluation result:\n` +
      `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
      `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`
  );

  if (modelSavePath != null) {
    await model.save(`file://${modelSavePath}`);
    console.log(`Saved model to path: ${modelSavePath}`);
  }
}

run(10, 5, "./public/model");
```

## Use it in the frontend

```js
const modelURL = "./model/model.json";

const labels = ["square", "triangle"];

async function loadTsfModel(modelURL) {
  if (!model) model = await tf.loadLayersModel(modelURL);
}

const predict = async (newImage) => {
  newImage.height = 200;
  newImage.width = 200;

  const processedImage = await tf.browser.fromPixelsAsync(newImage, 4);
  const smallImg = tf.image.resizeBilinear(processedImage, [28, 28]);
  const resized = tf.cast(smallImg, "float32");
  let shape;
  const predictions = await model
    .predict(tf.reshape(resized, (shape = [1, 28, 28, 4])))
    .data();

  const label = predictions.indexOf(Math.max(...predictions));

  console.log(labels[label]);
};
```

## Enjoy! 🎉

Go wild! Try to create a model using different types architectures, layers, parameters, or inputs, and have fun experimenting!

## Additional resources

- [Air Street fighter](https://charliegerard.dev/project/street-fighter-ml/) recognition with Arduino, Daydream controller and phone
- [Brain blink detection](https://twitter.com/devdevcharlie/status/1387095042733580291)
- [Tiny Motion trainer](https://experiments.withgoogle.com/tiny-motion-trainer/view/)
