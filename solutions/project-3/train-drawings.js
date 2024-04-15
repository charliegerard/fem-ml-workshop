const tf = require("@tensorflow/tfjs-node-gpu");

const { loadData, getTrainData, getTestData } = require("./get-data");
const model = require("./create-model");

async function run(epochs, batchSize, modelSavePath) {
  loadData();

  const { images: trainImages, labels: trainLabels } = getTrainData();
  console.log("Training Images (Shape): " + trainImages.shape);
  console.log("Training Labels (Shape): " + trainLabels.shape);

  model.summary();

  const validationSplit = 0.2;
  await model.fit(trainImages, trainLabels, {
    epochs,
    batchSize,
    validationSplit,
  });

  const { images: testImages, labels: testLabels } = getTestData();
  const evalOutput = model.evaluate(testImages, testLabels);

  console.log(
    `\nEvaluation result:\n` +
      `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
      `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`
  );

  if (modelSavePath != null) {
    await model.save(`file://${modelSavePath}`);
    console.log(`Saved model to path: ${modelSavePath}`);
  }
}

// run(10, 4, "./model");
run(10, 5, "./public/model");
