const balls = [];
const adjacentPairs = [];
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const maxRepelDistance = 30;
const ballSize = 10;
const spacing = 15;
const neighborRadius = spacing * 1.5;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

document
  .getElementById("textInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      updateText();
    }
  });

function updateText() {
  const textInput = document.getElementById("textInput").value;
  if (textInput) {
    init(textInput);
  }
}

function getTextShapePoints(text) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 200px sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const xOffset = canvas.width / 2;
  const yOffset = canvas.height / 2;
  ctx.fillText(text, xOffset, yOffset);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const points = [];
  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x += spacing) {
      const index = (y * canvas.width + x) * 4;
      if (data[index + 3] > 128) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

function createBallsFromPoints(points) {
  points.forEach((point) => {
    const ball = {
      originalX: point.x,
      originalY: point.y,
      currentX: point.x,
      currentY: point.y,
      element: createBallElement(point.x, point.y),
    };
    balls.push(ball);
    document.body.appendChild(ball.element);
  });

  findAdjacentDots();
}

function createBallElement(x, y) {
  const ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.left = `${x}px`;
  ball.style.top = `${y}px`;
  return ball;
}

function findAdjacentDots() {
  balls.forEach((ball1, index1) => {
    balls.forEach((ball2, index2) => {
      if (index1 !== index2) {
        const dx = ball1.originalX - ball2.originalX;
        const dy = ball1.originalY - ball2.originalY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= neighborRadius) {
          adjacentPairs.push([ball1, ball2]);
        }
      }
    });
  });
}

document.addEventListener("mousemove", (e) => {
  balls.forEach((ball) => {
    const dx = e.clientX - ball.originalX;
    const dy = e.clientY - ball.originalY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      const angle = Math.atan2(dy, dx);
      const repelDistance = Math.min((150 - dist) / 5, maxRepelDistance);
      const newX = ball.originalX + Math.cos(angle) * -repelDistance;
      const newY = ball.originalY + Math.sin(angle) * -repelDistance;
      ball.currentX = newX;
      ball.currentY = newY;
      ball.element.style.transform = `translate(${
        Math.cos(angle) * -repelDistance
      }px, ${Math.sin(angle) * -repelDistance}px)`;
    } else {
      ball.currentX = ball.originalX;
      ball.currentY = ball.originalY;
      ball.element.style.transform = "translate(0, 0)";
    }
  });

  drawLines();
});

function drawLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;

  adjacentPairs.forEach((pair) => {
    const [ball1, ball2] = pair;
    const dx = ball1.currentX - ball2.currentX;
    const dy = ball1.currentY - ball2.currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo(ball1.currentX + ballSize / 2, ball1.currentY + ballSize / 2);
    ctx.lineTo(ball2.currentX + ballSize / 2, ball2.currentY + ballSize / 2);
    ctx.stroke();
  });
}

function init(text = "GUHH") {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balls.forEach((ball) => ball.element.remove());
  balls.length = 0;
  adjacentPairs.length = 0;

  const points = getTextShapePoints(text);
  createBallsFromPoints(points);
  drawLines();
}

// Changed the initialization to wait for DOM content to load
document.addEventListener("DOMContentLoaded", () => {
  init("GUHH"); // Explicitly pass "GUHH" as the default text
});

// Adjust canvas on window resize
window.addEventListener("resize", () => {
  resizeCanvas();

  // Retrieve current text from textInput
  const currentText = document.getElementById("textInput").value;
  init(currentText);
});
