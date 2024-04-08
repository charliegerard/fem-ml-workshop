---
title: "Project 1: Image classification with a pre-trained model"
description: "Project 1: using pre-trained models."
keywords:
  - Pre-trained models
  - TensorFlow.js
  - JavaScript
  - Machine learning
  - Charlie Gerard
---

# {% $markdoc.frontmatter.title %}

## Set up the project

Clone the exercise repository:

```bash
git clone https://github.com/charliegerard/fem-ml-workshop.git
```

The code for the first project is in the `exercises/project-1` folder so change directory to it with:

```bash
cd exercises/project-1
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

You should see a demo app that looks like this:

![Screenshot of the demo website for project 1](/static/project1-demo.png#project-thumbnail)

## Import the pre-trained model

Import TensorFlow.js, the list of classes and the model:

```js
import * as tf from "@tensorflow/tfjs";

import { IMAGENET_CLASSES } from "./classes";

const MOBILENET_MODEL_PATH =
  "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1";
```

## Load the model

```js
let model;
const loadModel = async () => {
  model = await tf.loadGraphModel(MOBILENET_MODEL, {
    fromTFHub: true,
  });
  // Warmup the model. Not necessary, but makes the first prediction
  // faster. Call `dispose` to release the WebGL memory allocated for the return
  // value of `predict`.
  model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();
};
```

## Run the prediction

First, get the image data

```js
const catElement = document.getElementById("cat");
```

Then, feed it to the model

```js
async function predict(imgElement) {
  const logits = tf.tidy(() => {
    // tf.browser.fromPixels() returns a Tensor from an image element.
    const img = tf.cast(tf.browser.fromPixels(imgElement), "float32");

    const offset = tf.scalar(127.5);
    // Normalize the image from [0, 255] to [-1, 1].
    const normalized = img.sub(offset).div(offset);

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
    return model.predict(batched);
  });

  // Convert logits to probabilities and class names.
  const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);

  showResults(classes);
}
```

Finally, get the prediction output

```js
export async function getTopKClasses(logits, topK) {
  const values = await logits.data();

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({ value: values[i], index: i });
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: IMAGENET_CLASSES[topkIndices[i]],
      probability: topkValues[i],
    });
  }
  return topClassesAndProbs;
}

function showResults(classes) {
  const predictionContainer = document.createElement("div");
  predictionContainer.className = "pred-container";

  const probsContainer = document.createElement("div");
  for (let i = 0; i < classes.length; i++) {
    const row = document.createElement("div");
    row.className = "row";

    const classElement = document.createElement("div");
    classElement.className = "cell";
    classElement.innerText = classes[i].className;
    row.appendChild(classElement);

    const probsElement = document.createElement("div");
    probsElement.className = "cell";
    probsElement.innerText = classes[i].probability.toFixed(3);
    row.appendChild(probsElement);

    probsContainer.appendChild(row);
  }
  predictionContainer.appendChild(probsContainer);

  predictionsElement.insertBefore(
    predictionContainer,
    predictionsElement.firstChild
  );
}
```

## Enjoy! 🎉

Try different images and experiment!

## Live webcam feed

Let's go a step further and replace the image data with a live feed from the webcam:

```js
const video = document.querySelector("video");

navigator.mediaDevices
  .getUserMedia({
    audio: false,
    video: { width: 320, height: 185 },
  })
  .then((stream) => {
    video.srcObject = stream;
    track = stream.getTracks()[0];
    video.onloadedmetadata = () => {
      video.play();
    };
  })
  .catch((err) => {
    /* handle the error */
  });
```

As the model still works with images and not videos, we need to write a function to take a picture from the webcam feed and feed that to the model to get predictions:

```js
function takepicture() {
  const context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const data = canvas.toDataURL("image/png");
    const photo = document.createElement("img");
    photo.setAttribute("src", data);
    photo.width = IMAGE_SIZE;
    photo.height = IMAGE_SIZE;
    const outputEl = document.getElementsByClassName("output")[0];
    outputEl.appendChild(photo);

    predictButton.disabled = false;
    predictButton.onclick = () => predict(photo);
  }
}
```

Try the flow again and you should now be able to get predictions from custom images taken from your webcam!

## Try different models

- Object detection: [CocoSSD](https://www.kaggle.com/models/tensorflow/ssd-mobilenet-v2/frameworks/tfJs)
- [Face detection](https://github.com/tensorflow/tfjs-models/tree/master/face-detection)
- [Pose detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
- [Hand pose detection](https://github.com/tensorflow/tfjs-models/tree/master/handpose)
- [Face landmark detection](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection) To do gaze detection
- [Toxicity detection](https://github.com/tensorflow/tfjs-models/tree/master/toxicity)
- [Depth estimation model](https://github.com/tensorflow/tfjs-models/tree/master/depth-estimation)
- [GPT2](https://github.com/tensorflow/tfjs-models/tree/master/gpt2)

## Additional info

- What's in a model?
- How does image recognition work?

## Other projects

- Indoor position detection using WiFi data
- Red light, green light
- Figma hand built UI
- Hands-free coding
- Beat pose
- [Gaze keyboard](github.com/charliegerard/gaze-detection)
