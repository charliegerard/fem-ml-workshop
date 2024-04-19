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
// Learning rate: how frequently the model's weights are changed during training.
const learningRate = 0.0001;
// Number of training examples used to perform one step of stochastic gradient descent (SGD).
const batchSizeFraction = 0.4;
// Iterations. The one entire passing of training data through the algorithm
const epochs = 30;
// Number of outputs of the layer
const denseUnits = 100;
let isTraining = false;
let isPredicting;

const loadModel = async () => {
  const mobilenet = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  // Return a model that outputs an internal activation: function that is added into an artificial neural network in order to help the network learn complex patterns in the data.
  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
};

const init = async () => {
  webcam = await tfd.webcam(document.getElementById("webcam"));

  initialModel = await loadModel();
  statusElement.style.display = "none";
  document.getElementById("controller").style.display = "block";

  // optional
  // const screenshot = await webcam.capture();
  // initialModel.predict(screenshot.expandDims(0));
  // screenshot.dispose();
};

buttonsContainer.onmousedown = (e) => {
  if (e.target === recordButtons[0]) {
    // left
    handleAddExample(0);
  } else if (e.target === recordButtons[1]) {
    // right
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
    // Returns a promise that resolve when a requestAnimationFrame has completed
    await tf.nextFrame();
  }
};

let xs, ys;

const addExample = async (index) => {
  let img = await getImage();
  let example = initialModel.predict(img);

  // One-hot encode the label.
  // Turns categorical data (e.g. colors) into numerical data
  const y = tf.tidy(() =>
    tf.oneHot(tf.tensor1d([index]).toInt(), labels.length)
  );

  if (xs == null) {
    // For the first example that gets added, keep example and y so that we own the memory of the inputs. This makes sure that
    // if addExample() is called in a tf.tidy(), these Tensors will not get disposed.
    xs = tf.keep(example);
    ys = tf.keep(y);
  } else {
    const oldX = xs;
    xs = tf.keep(oldX.concat(example, 0));

    const oldY = ys;
    ys = tf.keep(oldY.concat(y, 0));

    oldX.dispose();
    oldY.dispose();
    y.dispose();
  }

  img.dispose();
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
  // await tf.nextFrame();
  train();
  statusElement.style.display = "block";
  statusElement.innerHTML = "Training...";
};

const train = () => {
  isTraining = true;
  if (!xs) {
    throw new Error("Add some examples before training!");
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  newModel = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While technically a layer, this only performs a reshape (and has no training parameters).
      tf.layers.flatten({
        inputShape: initialModel.outputs[0].shape.slice(1),
      }),
      // units is the output shape of the dense layer
      tf.layers.dense({
        units: denseUnits,
        activation: "relu",
        kernelInitializer: "varianceScaling",
        useBias: true,
      }),
      // The neural network should have 2 outputs so the last layer should have 2 units
      tf.layers.dense({
        units: labels.length,
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
  newModel.compile({ optimizer: optimizer, loss: "categoricalCrossentropy" });

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize = Math.floor(xs.shape[0] * batchSizeFraction);
  if (!(batchSize > 0)) {
    throw new Error(
      `Batch size is 0 or NaN. Please choose a non-zero fraction.`
    );
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  newModel.fit(xs, ys, {
    batchSize,
    epochs: epochs,
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

    // Make a prediction through mobilenet, getting the internal activation of
    // the mobilenet model, i.e., "embeddings" of the input images.
    const embeddings = initialModel.predict(img);

    // Make a prediction through our newly-trained model using the embeddings
    // from mobilenet as input.
    const predictions = newModel.predict(embeddings);

    // Returns the index with the maximum probability. This number corresponds
    // to the class the model thinks is the most probable given the input.
    const predictedClass = predictions.as1D().argMax();
    const classId = (await predictedClass.data())[0];
    img.dispose();

    console.log(labels[classId]);
    await tf.nextFrame();
  }
};

init();
