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

Navigate to https://teachablemachine.google.com, record a few image samples and download the model to your computer.

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

## Use transfer learning with audio

Let's replace the image data with a audio data!

```js

```

## Additional resources

- [Teachable machine](https://teachablemachine.withgoogle.com/)
- [Acoustic activity recognition](https://charliegerard.dev/project/acoustic-activity-recognition/)
