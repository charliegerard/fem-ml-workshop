import "@tensorflow/tfjs";
// Part 2: CocoSSD model ⬇️
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import { showResult } from "./utils";

const IMAGE_SIZE = 224;
let model;

const init = async () => {
  model = await cocoSsd.load();
};

const predict = async (imgElement) => {
  const predictions = await model.detect(imgElement);

  showResult(predictions);
};

const fileElement = document.getElementById("file");
fileElement.addEventListener("change", (evt) => {
  let file = evt.target.files;
  let f = file[0];

  if (!f.type.match("image.*")) {
    return;
  }

  let reader = new FileReader();
  reader.onload = (e) => {
    let img = document.createElement("img");
    img.src = e.target.result;
    img.width = IMAGE_SIZE;
    img.height = IMAGE_SIZE;
    const loadedImgElement = document.getElementById("loaded-image");
    loadedImgElement.appendChild(img);

    img.onload = () => predict(img);
  };
  reader.readAsDataURL(f);
});

init();
