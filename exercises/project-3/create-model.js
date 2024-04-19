const tf = require("@tensorflow/tfjs");

const kernelSize = [3, 3];
const filter = 32;
const numClasses = 2;

const model = tf.sequential();
model.add(
  tf.layers.conv2d({
    inputShape: [28, 28, 4],
    filters: filter,
    kernelSize,
    activation: "relu",
  })
);

model.add(
  tf.layers.maxPooling2d({
    poolSize: [2, 2],
  })
);

model.add(tf.layers.flatten());

model.add(tf.layers.dense({ units: 10, activation: "relu" }));

model.add(tf.layers.dense({ units: numClasses, activation: "softmax" }));

const optimizer = tf.train.adam(0.0001);
model.compile({
  optimizer,
  loss: "categoricalCrossentropy",
  metrics: ["accuracy"],
});

module.exports = model;
