var context = document.getElementsByTagName("canvas")[0].getContext("2d");
var canvas = document.getElementsByTagName("canvas")[0];

let model;
// const modelURL = "./tfjs_model/model.json";
const modelURL = "./model/model.json";

loadTsfModel(modelURL);

const labels = ["square", "triangle"];

async function loadTsfModel(modelURL) {
  // if (!model) model = await tf.loadModel(modelURL);
  if (!model) model = await tf.loadLayersModel(modelURL);
}

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function resetCanvas() {
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  paint;
}

canvas.addEventListener("mousedown", function (e) {
  // resetCanvas();
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;

  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

canvas.addEventListener("mousemove", function (e) {
  if (paint) {
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});

canvas.addEventListener("mouseup", function (e) {
  paint = false;
});

function addClick(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

  context.strokeStyle = "#000000";
  context.lineJoin = "round";
  context.lineWidth = 5;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < clickX.length; i++) {
    context.beginPath();
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i - 1], clickY[i - 1]);
    } else {
      context.moveTo(clickX[i] - 1, clickY[i]);
    }
    context.lineTo(clickX[i], clickY[i]);
    context.closePath();
    context.stroke();
  }
}

var button = document.getElementById("check-button");

button.onclick = function () {
  var doodle = canvas.toDataURL();

  var newImageTag = document.getElementsByClassName("imageToCheck")[0];
  newImageTag.src = doodle;

  newImageTag.onload = function () {
    predict(this);
  };

  resetCanvas();
  // context.clearRect(0, 0, canvas.width, canvas.height);
};

var clearButton = document.getElementById("clear-button");

clearButton.onclick = function () {
  resetCanvas();
  var predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = "";
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const predict = async (newImage) => {
  newImage.height = 200;
  newImage.width = 200;

  const processedImage = await tf.browser.fromPixelsAsync(newImage, 4);
  const smallImg = tf.image.resizeBilinear(processedImage, [28, 28]);
  // const smallImg = tf.image.resizeBilinear(processedImage, [96, 96]);
  const resized = tf.cast(smallImg, "float32");
  let shape;
  const predictions = await model
    .predict(
      tf.reshape(resized, (shape = [1, 28, 28, 4]))
      // tf.reshape(resized, (shape = [1, 96, 96, 3]))
    )
    .data();

  // let orderedPredictions = Array.from(predictions)
  //   .map(function (p, i) {
  //     // this is Array.map
  //     return {
  //       probability: p,
  //       className: labels[i], // we are selecting the value from the obj
  //     };
  //   })
  //   .sort(function (a, b) {
  //     return b.probability - a.probability;
  //   });
  // // .slice(0, 2);
  // console.log(orderedPredictions);

  const label = predictions.indexOf(Math.max(...predictions));

  displayPrediction(label);
};

const displayPrediction = (label) => {
  let prediction;
  switch (label) {
    case 0:
      // prediction = 'baseball';
      prediction = "Square!";
      break;
    case 1:
      prediction = "Triangle!";
      break;
    default:
      break;
  }

  var predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = prediction;
};

var link = document.getElementById("download-link");
link.addEventListener(
  "click",
  function (ev) {
    link.href = canvas.toDataURL();
    link.download = "drawing.png";
  },
  false
);
