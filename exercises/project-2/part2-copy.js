import * as tf from "@tensorflow/tfjs";
import * as tfd from "@tensorflow/tfjs-data";

const recordButtons = document.getElementsByClassName("record-button");
const buttonsContainer = document.getElementById("buttons-container");

buttonsContainer.onmousedown = (e) => {
  if (e.target === recordButtons[0]) {
    // left
    handler(0);
  } else if (e.target === recordButtons[1]) {
    // right
    handler(1);
  }
};

const loadModel = async () => {
  const mobilenet = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
};

const init = async () => {
  await loadModel();
};

init();
