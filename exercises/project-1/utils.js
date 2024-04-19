// Part 1
// -----------

export const showResult = (classes) => {
  const predictionsElement = document.getElementById("predictions");
  const probsContainer = document.createElement("div");
  for (let i = 0; i < classes.length; i++) {
    probsContainer.innerText = `Prediction: ${classes[i].class}, Probability: ${classes[i].score}`;
  }
  predictionsElement.appendChild(probsContainer);
};

export const IMAGE_SIZE = 224;

export const handleFilePicker = (callback) => {
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
      loadedimg = img;

      img.onload = () => callback(img);

      // img.onload = () => predict(img);
    };
    reader.readAsDataURL(f);
  });
};

// Part 2
// -----------

export const startWebcam = (video) => {
  return navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: { width: 320, height: 185 },
    })
    .then((stream) => {
      video.srcObject = stream;
      track = stream.getTracks()[0];
      video.onloadedmetadata = () => video.play();
    })
    .catch((err) => {
      /* handle the error */
    });
};

export const takePicture = (video, callback) => {
  const predictButton = document.getElementById("predict");
  const canvas = document.getElementById("canvas");
  // const width = 320; // We will scale the photo width to this
  // const height = 185;
  const width = IMAGE_SIZE; // We will scale the photo width to this
  const height = IMAGE_SIZE;
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  const outputEl = document.getElementById("predictions");
  // outputEl.appendChild(photo);
  outputEl.appendChild(canvas);

  predictButton.disabled = false;

  predictButton.onclick = async () => {
    await callback(canvas);
  };
};

// Part 3
// -----------

export const drawFaceBox = (photo, faces) => {
  // Draw box around the face detected ⬇️
  // ------------------------------------
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = IMAGE_SIZE;
  faceCanvas.height = IMAGE_SIZE;
  faceCanvas.style.position = "absolute";
  faceCanvas.style.left = photo.offsetLeft;
  faceCanvas.style.top = photo.offsetTop;
  const ctx = faceCanvas.getContext("2d");
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.strokeRect(
    faces[0].box.xMin,
    faces[0].box.yMin,
    faces[0].box.width,
    faces[0].box.height
  );

  const webcamSection = document.getElementById("webcam-section");
  webcamSection.appendChild(faceCanvas);
};
