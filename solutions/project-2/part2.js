import * as tf from "@tensorflow/tfjs";
import * as tfd from "@tensorflow/tfjs-data";

const recordButtons = document.getElementsByClassName("record-button");
const buttonsContainer = document.getElementById("buttons-container");

const trainButton = document.getElementById("train");
const predictButton = document.getElementById("predict");
const statusElement = document.getElementById("status");

let webcam, initialModel, mouseDown, newModel;

const totals = [0, 0];
const labels = ["left", "right"];
const learningRate = 0.0001;
const batchSizeFraction = 0.4;
const epochs = 30;
const denseUnits = 100;

let isTraining = false;
let isPredicting = false;

const loadModel = async () => {
  const mobilenet = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
};

const init = async () => {
  webcam = await tfd.webcam(document.getElementById("webcam"));

  initialModel = await loadModel();
  statusElement.style.display = "none";
  document.getElementById("controller").style.display = "block";
};

init();

buttonsContainer.onmousedown = (e) => {
  if (e.target === recordButtons[0]) {
    handleAddExample(0);
  } else {
    handleAddExample(1);
  }
};

buttonsContainer.onmouseup = () => {
  mouseDown = false;
};

const handleAddExample = async (labelIndex) => {
  mouseDown = true;
  const total = document.getElementById(labels[labelIndex] + "-total");

  while (mouseDown) {
    addExample(labelIndex);
    total.innerText = ++totals[labelIndex];

    await tf.nextFrame();
  }
};

let xs, xy;

const addExample = async (index) => {
  let img = await getImage();
  let example = initialModel.predict(img);

  const y = tf.tidy(() =>
    tf.oneHot(tf.tensor1d([index]).toInt(), labels.length)
  );

  if (xs == null) {
    xs = tf.keep(example);
    xy = tf.keep(y);
  } else {
    const previousX = xs;
    xs = tf.keep(previousX.concat(example, 0));

    const previousY = xy;
    xy = tf.keep(previousY.concat(y, 0));

    previousX.dispose();
    previousY.dispose();
    y.dispose();
    img.dispose();
  }
};

const getImage = async () => {
  const img = await webcam.capture();
  const processedImg = tf.tidy(() =>
    img.expandDims(0).toFloat().div(127).sub(1)
  );
  img.dispose();

  return processedImg;
};

trainButton.onclick = async () => {
  train();
  statusElement.style.display = "block";
  statusElement.innerHTML = "Training...";
};

const train = () => {
  isTraining = true;
  if (!xs) {
    throw new Error("You forgot to add examples before training");
  }

  newModel = tf.sequential({
    layers: [
      tf.layers.flatten({
        inputShape: initialModel.outputs[0].shape.slice(1),
      }),
      tf.layers.dense({
        units: denseUnits,
        activation: "relu",
        kernelInitializer: "varianceScaling",
        useBias: true,
      }),
      tf.layers.dense({
        units: labels.length,
        kernelInitializer: "varianceScaling",
        useBias: true,
        activation: "softmax",
      }),
    ],
  });

  const optimizer = tf.train.adam(learningRate);
  newModel.compile({ optimizer: optimizer, loss: "categoricalCrossentropy" });

  const batchSize = Math.floor(xs.shape[0] * batchSizeFraction);

  newModel.fit(xs, xy, {
    batchSize,
    epochs,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        statusElement.innerHTML = "Loss: " + logs.loss.toFixed(5);
      },
    },
  });

  isTraining = false;
};

predictButton.onclick = async () => {
  isPredicting = true;
  while (isPredicting) {
    const img = await getImage();

    const initialModelPrediction = initialModel.predict(img);
    const predictions = newModel.predict(initialModelPrediction);

    const predictedClass = predictions.as1D().argMax();
    const classId = (await predictedClass.data())[0];
    console.log(labels[classId]);

    img.dispose();
    await tf.nextFrame();
  }
};
