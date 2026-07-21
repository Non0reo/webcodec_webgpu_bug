const amplitude = 5;
const canvas = document.getElementsByClassName('2d')[0] as HTMLCanvasElement;
const ctx = canvas?.getContext('2d')!;

type vec2 = { x: number; y: number; };

function resetCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  pos = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
  }

  vel = {
    x: (Math.random() - 0.5) * amplitude,
    y: (Math.random() - 0.5) * amplitude,
  }
}



let pos: vec2, vel: vec2;
const clamp = (v: number, min: number, max: number) => v = Math.max(min, Math.min(v, max));
const spreadRandom = (spread: number, mean: number = 0) => Math.random() * spread - spread / 2 + mean;


function init() {
  resetCanvas();
  canvas.addEventListener('click', resetCanvas)
  requestAnimationFrame(animate);
}

function animate() {
  ctx.strokeStyle = `hsl(${Math.random() * 180}, 100%, 57%)`

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, Math.random() * 20, 0, 2 * Math.PI);
  ctx.stroke();

  pos.x += vel.x;
  pos.y += vel.y;

  if(pos.x < 0 || canvas.width < pos.x) {
    clamp(pos.x, 0, canvas.width)
    vel.x *= spreadRandom(0.5, -1)
  }

  if(pos.y < 0 || canvas.height < pos.y) {
    clamp(pos.y, 0, canvas.height)
    vel.y *= spreadRandom(0.5, -1);
  }

  requestAnimationFrame(animate);
}

init()