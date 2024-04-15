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
