// const canvasIn = document.querySelector('.webgpu') as HTMLCanvasElement;
const canvasIn = document.getElementsByClassName('webgpu')[0] as HTMLCanvasElement;
const canvasOut = document.querySelector('.out') as HTMLCanvasElement;

// canvasOut.addEventListener('click', drawToOut);

function drawToOut() {
  // const videoFrame = new VideoFrame(canvasIn, {
  //   timestamp: 0
  // });
  // console.log(videoFrame)

  const canvasOutCtx = canvasOut.getContext('2d')!;
  console.log(canvasOutCtx)
  canvasOutCtx.drawImage(canvasIn, 0, 0, canvasOut.width, canvasOut.height);
}

setInterval(drawToOut, 1000)