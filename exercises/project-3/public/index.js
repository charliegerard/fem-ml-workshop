import { resetCanvas, clearRect } from "./utils.js";

const clearButton = document.getElementById("clear-button");

clearButton.onclick = () => {
  resetCanvas();
  const predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = "";
  clearRect();
};
