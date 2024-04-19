import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import { showResult, handleFilePicker } from "./utils";

let model;

const init = async () => {
  model = await cocoSsd.load();

  handleFilePicker(predict);
};

const predict = async (imgElement) => {
  const predictions = await model.detect(imgElement);
  showResult(predictions);
};

init();
