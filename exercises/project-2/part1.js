// Start by training your machine learning model at https://teachablemachine.withgoogle.com/

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

const URL = "./my_model/";
const startButton = document.getElementById("start");

startButton.onclick = () => init();

let model, webcam;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  let maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(200, 200, true); // width, height, flip the webcam
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  let labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // predict can take in an image, video or canvas html element
  const predictions = await model.predict(webcam.canvas);

  const topPrediction = Math.max(...predictions.map((p) => p.probability));

  const topPredictionIndex = predictions.findIndex(
    (p) => p.probability === topPrediction
  );
  console.log(predictions[topPredictionIndex].className);
}
