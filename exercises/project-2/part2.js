import * as tf from "@tensorflow/tfjs";
import * as tfd from "@tensorflow/tfjs-data";

const NUM_CLASSES = 4;
let webcam;
let truncatedMobileNet;
let model;
const CONTROLS = ["left", "right", "up", "down"];
let addExampleHandler;
let isPredictingBoolean = false;
const trainStatusElement = document.getElementById("train-status");
const learningRate = 0.0001;
const batchSizeFraction = 0.4;
const epochs = 30;
const denseUnits = 100;
const statusElement = document.getElementById("status");

class ControllerDataset {
  constructor(numClasses) {
    this.numClasses = numClasses;
  }

  addExample(example, label) {
    // One-hot encode the label.
    const y = tf.tidy(() =>
      tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses)
    );

    if (this.xs == null) {
      // For the first example that gets added, keep example and y so that the
      // ControllerDataset owns the memory of the inputs. This makes sure that
      // if addExample() is called in a tf.tidy(), these Tensors will not get
      // disposed.
      this.xs = tf.keep(example);
      this.ys = tf.keep(y);
    } else {
      const oldX = this.xs;
      this.xs = tf.keep(oldX.concat(example, 0));

      const oldY = this.ys;
      this.ys = tf.keep(oldY.concat(y, 0));

      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
  }
}

const controllerDataset = new ControllerDataset(NUM_CLASSES);

async function loadTruncatedMobileNet() {
  const mobilenet = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
}

function setExampleHandler(handler) {
  addExampleHandler = handler;
}

setExampleHandler(async (label) => {
  let img = await getImage();

  controllerDataset.addExample(truncatedMobileNet.predict(img), label);
  img.dispose();
});

async function train() {
  if (controllerDataset.xs == null) {
    throw new Error("Add some examples before training!");
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({
        inputShape: truncatedMobileNet.outputs[0].shape.slice(1),
      }),
      tf.layers.dense({
        units: denseUnits,
        activation: "relu",
        kernelInitializer: "varianceScaling",
        useBias: true,
      }),
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: "varianceScaling",
        useBias: false,
        activation: "softmax",
      }),
    ],
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(learningRate);
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({ optimizer: optimizer, loss: "categoricalCrossentropy" });

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize = Math.floor(
    controllerDataset.xs.shape[0] * batchSizeFraction
  );
  if (!(batchSize > 0)) {
    throw new Error(
      `Batch size is 0 or NaN. Please choose a non-zero fraction.`
    );
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: epochs,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        trainStatus("Loss: " + logs.loss.toFixed(5));
      },
    },
  });
}

async function predict() {
  isPredicting();
  while (isPredictingBoolean) {
    const img = await getImage();

    // Make a prediction through mobilenet, getting the internal activation of
    // the mobilenet model, i.e., "embeddings" of the input images.
    const embeddings = truncatedMobileNet.predict(img);

    // Make a prediction through our newly-trained model using the embeddings
    // from mobilenet as input.
    const predictions = model.predict(embeddings);

    // Returns the index with the maximum probability. This number corresponds
    // to the class the model thinks is the most probable given the input.
    const predictedClass = predictions.as1D().argMax();
    const classId = (await predictedClass.data())[0];
    img.dispose();

    predictClass(classId);
    await tf.nextFrame();
  }
  donePredicting();
}

/**
 * Captures a frame from the webcam and normalizes it between -1 and 1.
 * Returns a batched image (1-element batch) of shape [1, w, h, c].
 */
async function getImage() {
  const img = await webcam.capture();
  const processedImg = tf.tidy(() =>
    img.expandDims(0).toFloat().div(127).sub(1)
  );
  img.dispose();
  return processedImg;
}

document.getElementById("train").onclick = async () => {
  trainStatus("Training...");
  await tf.nextFrame();
  await tf.nextFrame();
  isPredictingBoolean = false;
  train();
};

document.getElementById("predict").onclick = () => {
  isPredictingBoolean = true;
  predict();
};

async function init() {
  try {
    webcam = await tfd.webcam(document.getElementById("webcam"));
  } catch (e) {
    console.log(e);
    document.getElementById("no-webcam").style.display = "block";
  }
  truncatedMobileNet = await loadTruncatedMobileNet();

  uiinit();

  // Warm up the model. This uploads weights to the GPU and compiles the WebGL
  // programs so the first time we collect data from the webcam it will be
  // quick.
  const screenShot = await webcam.capture();
  truncatedMobileNet.predict(screenShot.expandDims(0));
  screenShot.dispose();
}

function uiinit() {
  document.getElementById("controller").style.display = "";
  statusElement.style.display = "none";
}

function predictClass(classId) {
  console.log(CONTROLS[classId]);
  document.body.setAttribute("data-active", CONTROLS[classId]);
}

function isPredicting() {
  statusElement.style.visibility = "visible";
}
function donePredicting() {
  statusElement.style.visibility = "hidden";
}
function trainStatus(status) {
  trainStatusElement.innerText = status;
}

let mouseDown = false;
const totals = [0, 0, 0, 0];

async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label];
  const total = document.getElementById(className + "-total");
  while (mouseDown) {
    addExampleHandler(label);
    document.body.setAttribute("data-active", CONTROLS[label]);
    total.innerText = ++totals[label];
    await tf.nextFrame();
  }
  document.body.removeAttribute("data-active");
}

const recordButtons = document.getElementsByClassName("record-button");
const buttonsContainer = document.getElementById("buttons-container");

buttonsContainer.onmousedown = (e) => {
  if (e.target === recordButtons[0]) {
    // left
    handler(0);
  } else if (e.target === recordButtons[1]) {
    handler(1);
  }
};

buttonsContainer.onmouseup = (e) => {
  mouseDown = false;
};

init();
