---
title: "Project 2: Use transfer learning to create a motion-controlled UI"
description: "Project 2: transfer learning"
keywords:
  - AI
  - transfer learning
  - TensorFlow.js
  - JavaScript
  - Machine learning
  - Charlie Gerard
---

# {% $markdoc.frontmatter.title %}

## Set up the project

The code for the first project is in the `exercises/project-2` folder so change directory to it with:

```bash
cd exercises/project-2
```

Install the dependencies with:

```bash
npm install
```

Start the demo app with:

```bash
npm run watch
```

A browser window should open at `http://localhost:1234`

## Train a model online

Navigate to the [Teachable Machine website](https://teachablemachine.google.com), record a few image samples and download the model to your computer.

## Load the model

```js
const URL = "./my_model/";

const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

let model = await tmImage.load(modelURL, metadataURL);
let maxPredictions = model.getTotalClasses();
```

## Start the webcam

If you look at the index.html file, you will see a script tag importing the teachable machine library.

This library exposes a method that makes it easy to set up the webcam feed:

```js
webcam = new tmImage.Webcam(200, 200, true); // width, height, flip the webcam
await webcam.setup(); // request access to the webcam
await webcam.play();
```

## Predict

Then, use `requestAnimationFrame` to continuously call a function that will predict the output of the webcam.

```js
window.requestAnimationFrame(loop);

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}
```

This function calls `predict` on the model. The output can then be used to extract the label with the highest probability.

```js
async function predict() {
  // predict can take in an image, video or canvas html element
  const predictions = await model.predict(webcam.canvas);

  const topPrediction = Math.max(...predictions.map((p) => p.probability));

  const topPredictionIndex = predictions.findIndex(
    (p) => p.probability === topPrediction
  );
  console.log(predictions[topPredictionIndex].className);
}
```

## Enjoy! 🎉

Try to train your model with different input from the webcam and experiment making interactive UIs!

## Step 2: Train the model in the browser

You can run transfer learning on the mobilenet model without using Teachable Machine (see the part2.js file).

### Import the packages

```js
import * as tf from "@tensorflow/tfjs";
import * as tfd from "@tensorflow/tfjs-data";
```

### Load the model

You can load the mobilenet model in your application and return its internal function to use when re-training your custom model.

```js
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
```

### Add examples

When implementing the functionality yourself, you need to add examples that the model can be trained with. In the index.html file, there are 2 buttons to record images with the label 'left' and 'right'.
When the user presses these buttons, images are being kept in memory to train the model.

```js
buttonsContainer.onmousedown = (e) => {
  if (e.target === recordButtons[0]) {
    // left
    handleAddExample(0);
  } else if (e.target === recordButtons[1]) {
    // right
    handleAddExample(1);
  }
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

const addExample = async (index) => {
  let img = await getImage(); // Gets a snapshot from the webcam
  let example = initialModel.predict(img);

  // One-hot encode the label.
  // Turns categorical data (e.g. colors) into numerical data
  const y = tf.tidy(() =>
    tf.oneHot(tf.tensor1d([index]).toInt(), labels.length)
  );

  if (xs == null) {
    // For the first example that gets added, keep example and y so that we own the memory of the inputs.
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
```

### Train

After gathering new examples, we need to create a new model to train with the samples recorded.

```js
const train = () => {
  isTraining = true;
  if (!xs) {
    throw new Error("Add some examples before training!");
  }

  newModel = tf.sequential({
    layers: [
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

  const optimizer = tf.train.adam(learningRate);
  newModel.compile({ optimizer: optimizer, loss: "categoricalCrossentropy" });

  const batchSize = Math.floor(xs.shape[0] * batchSizeFraction);
  if (!(batchSize > 0)) {
    throw new Error(
      `Batch size is 0 or NaN. Please choose a non-zero fraction.`
    );
  }

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
```

### Predict

After the new model has been trained, we can run predictions with live input from the webcam.

```js
predictButton.onclick = async () => {
  isPredicting = true;
  while (isPredicting) {
    const img = await getImage();
    const embeddings = initialModel.predict(img);
    const predictions = newModel.predict(embeddings);
    const predictedClass = predictions.as1D().argMax();
    const classId = (await predictedClass.data())[0];
    img.dispose();

    console.log(labels[classId]);
    await tf.nextFrame();
  }
};
```

That's it!

## Additional resources

- [Teachable machine](https://teachablemachine.withgoogle.com/)
- [Acoustic activity recognition](https://charliegerard.dev/project/acoustic-activity-recognition/)
- [Teachable keyboard](https://charliegerard.dev/project/teachable-keyboard/)
- [Motion-controlled mini game](https://charliegerard.dev/project/whoosh/)
- [WashOS](https://charliegerard.dev/project/washos/)
- [Dark mode clap extension](https://charliegerard.dev/project/dark-mode-clap-extension/)
