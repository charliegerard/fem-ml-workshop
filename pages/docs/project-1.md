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

Import TensorFlow.js and the model:

```js
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
```

## Load the model

To be able to use the model, it needs to be loaded:

```js
let model = await cocoSsd.load();
```

## Predict the image's label

First, let's import the `handleFilePicker` function from the `utils.js` file to be able to select a local file from the browser:

```js
import { handleFilePicker } from "./utils";
```

This function opens a file picker to let you select a file you want to run the predictions on. It takes a callback as parameter to predict when the image is loaded.

```js
handleFilePicker(predict);
```

Now, this `predict` function used as callback will call the `.detect` method on the model.

```js
const predict = async (imgElement) => {
  const predictions = await model.detect(imgElement);
};
```

Now, you can either simply log the predictions in the browser's console or import the `showResult` function from the utils file as well.

```js
showResult(predictions);
```

You should now be able to select a local image from your computer and see the label predicted from the machine learning model displayed on the page.

## Enjoy! 🎉

Try different images and experiment!

## Part 2: Live webcam feed

Let's go a step further and replace the image data with a live feed from the webcam. To make it easier, you can import the `startWebcam` function from the utils file. This function uses the `getUserMedia` web API to start the webcam.

```js
import { showResult, startWebcam } from "./utils";

const webcamButton = document.getElementById("webcam");
webcamButton.onclick = () => startWebcam(video);
```

Because the `detect` method used in the previous section takes an image as parameter, we need to transform the webcam feed into a single image. To do this, you can import the `takePicture` function from the utils as well.
This function uses the Canvas API to take the input from the webcam and append it to the canvas element.
This function takes a video element and a callback as parameter, that will be called when the user clicks on the `predict` button.

```js
import { showResult, startWebcam, takePicture } from "./utils";

const pauseButton = document.getElementById("pause");
pauseButton.onclick = () => takePicture(video, predict);
```

The `predict` function is the same as the one used previously.

```js
const predict = async (img) => {
  const predictions = await model.detect(img);
  console.log(predictions);
  showResult(predictions);
};
```

## Part 3: Try a different model

One of the great things about TensorFlow.js is that you can change model and make minimal changes to your code to make it work. Let's try a face detection model!

### Import the required packages

For this model, you need to import a few more pakages

```js
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
```

### Load the model

```js
let model = faceDetection.SupportedModels.MediaPipeFaceDetector;
const detectorConfig = {
  runtime: "tfjs",
};
let detector = await faceDetection.createDetector(model, detectorConfig);
```

### Run the predictions

One the model is loaded, you only need to change a couple of lines in the `predict` function.

```js
const predict = async (photo) => {
  const estimationConfig = { flipHorizontal: false };
  const faces = await detector.estimateFaces(photo, estimationConfig);
  console.log("FACES: ", faces);
};
```

Then, as an option (and a cool thing to do), you can use the data returned from the model to draw a box surrounding the faces found in the image. To make it easier, you can import the `drawFaceBox` function from the utils file and pass it the photo/video element as well as the faces data returned from the model.

## Other models

- Object detection: [MobileNet](https://github.com/tensorflow/tfjs-models/blob/master/mobilenet/README.md)
- [Face detection](https://github.com/tensorflow/tfjs-models/tree/master/face-detection)
- [Pose detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
- [Hand pose detection](https://github.com/tensorflow/tfjs-models/tree/master/handpose)
- [Face landmark detection](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection) To do gaze detection
- [Toxicity detection](https://github.com/tensorflow/tfjs-models/tree/master/toxicity)
- [Depth estimation model](https://github.com/tensorflow/tfjs-models/tree/master/depth-estimation)
- [GPT2](https://github.com/tensorflow/tfjs-models/tree/master/gpt2)

## Other projects

- [Red light, green light](https://charliegerard.dev/project/red-light-green-light/)
- [Figma hand built UI](https://charliegerard.dev/project/figma-plugin-hand-controlled/)
- [Hands-free coding](https://charliegerard.dev/project/hands-free-coding/)
- [Beat pose](https://charliegerard.dev/project/beat-pose/)
- [Gaze keyboard](github.com/charliegerard/gaze-detection)
- [TFJS recycling](https://charliegerard.dev/project/tfjs-recycling/)
- [Rainbrow](https://charliegerard.dev/project/rainbrow/)
- [Fruit Ninja clone](https://charliegerard.dev/project/splat/)
