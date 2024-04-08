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

## Set up

If you went through the [previous exercise](/ml-in-js/lessons/Intro/project-1), you can use the code you wrote then as the starting point.
If you're starting from here, clone the GitHub repository, navigate to the folder `exercises/transfer-learning`, run `npm install` and `npm run watch`.

```bash
git clone
```

## Import the model

Import TensorFlow.js and the tfjs-data package;

```js
import * as tf from "@tensorflow/tfjs";
import * as tfd from "@tensorflow/tfjs-data";
```

## Load the model

```js
async function loadTruncatedMobileNet() {
  const mobilenet = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
}
```

## Add examples

```js
controllerDataset.addExample(truncatedMobileNet.predict(img), label);
```

## Train

```js

```

## Enjoy! 🎉

Try different images and experiment!

## Use transfer learning with audio

Let's replace the image data with a audio data!

```js

```

## Additional resources

- [Teachable machine](https://teachablemachine.withgoogle.com/)
- [Acoustic activity recognition](https://charliegerard.dev/project/acoustic-activity-recognition/)
