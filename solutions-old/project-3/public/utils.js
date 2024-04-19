let clickX = new Array();
let clickY = new Array();
let clickDrag = new Array();
let paint;
const labels = ["square", "triangle"];
const canvas = document.getElementsByTagName("canvas")[0];
const context = document.getElementsByTagName("canvas")[0].getContext("2d");
const link = document.getElementById("download-link");

export const resetCanvas = () => {
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  paint;
};

export const displayPrediction = (label) => {
  let prediction = labels[label];

  var predictionParagraph = document.getElementsByClassName("prediction")[0];
  predictionParagraph.textContent = prediction;
};

canvas.addEventListener("mousedown", function (e) {
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

const addClick = (x, y, dragging) => {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
};

const redraw = () => {
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
};

link.addEventListener(
  "click",
  function () {
    link.href = canvas.toDataURL();
    link.download = "drawing.png";
  },
  false
);

export const clearRect = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
};

export const getCanvas = () => {
  return canvas;
};
