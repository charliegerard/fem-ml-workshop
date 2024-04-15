# Building a custom model

## How to run

```bash
npm install
```

```bash
npm run watch
```

## Step 1: Generate your data

Run the app, draw in the canvas using your mouse and download each of your drawings.

Label each image with its class name. For example, if you're building an image classification to recognise a square VS. a triange, label your images `0-square.png`, `1-square.png`, `2-square.png`, etc... and `0-triangle`, `1-triangle`, etc..

## Step 2: Build the model

```bash
node train-drawings.js
```

The model will be trained and saved in the `public/model` folder.

## Step 3: Use your model in your app

```bash
npm run watch
```

The app should run on `http://localhost:1234`

Draw a square or triangle in the canvas, click the `Predict` button and the class predicted will display on the screen!
