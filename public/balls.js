// Initialize canvas and variables
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
  const textInput = document.getElementById("textInput");
  const text = textInput.value;
  if (text) {
    saveLastTextInput(text); // Save input
    updateCounter(); // Update input counter
    init(text); // Reinitialize points with new text
    textInput.value = ""; // Clear the input box after submission
  }
}

// Save input to localStorage
function saveLastTextInput(text) {
  localStorage.setItem("lastInput", text); // Save input locally
  console.log("Last text input saved locally.");
}

// Retrieve input from localStorage on page load and initialize with it
function retrieveLastTextInput() {
  const lastText = localStorage.getItem("lastInput");
  if (lastText) {
    document.getElementById("textInput").value = lastText;
    init(lastText); // Initialize canvas with the last saved input
  } else {
    init("GUHH"); // Default text if no saved input
  }
}

// Initialize counter in localStorage if it doesn’t exist
function initializeCounter() {
  if (localStorage.getItem("inputCount") === null) {
    localStorage.setItem("inputCount", 0);
  }
  updateCounterDisplay();
}

// Increment and update input count
function updateCounter() {
  let count = parseInt(localStorage.getItem("inputCount"), 10);
  if (isNaN(count)) {
    count = 0;
  }
  count++;
  localStorage.setItem("inputCount", count);
  updateCounterDisplay();
}

// Display counter from localStorage
function updateCounterDisplay() {
  const count = localStorage.getItem("inputCount");
  document.getElementById("counter").textContent = count;
}

// Draw text as balls
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

// Create balls from text shape points
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

// Find adjacent dots for lines
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

// Mouse movement effect
document.addEventListener("mousemove", (e) => {
  balls.forEach((ball) => {
    const dx = e.clientX - ball.originalX;
    const dy = e.clientY - ball.originalY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      const angle = Math.atan2(dy, dx);
      const repelDistance = Math.min((150 - dist) / 5, maxRepelDistance);
      ball.currentX = ball.originalX + Math.cos(angle) * -repelDistance;
      ball.currentY = ball.originalY + Math.sin(angle) * -repelDistance;
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

// Draw lines between adjacent dots
function drawLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;

  adjacentPairs.forEach((pair) => {
    const [ball1, ball2] = pair;
    ctx.strokeStyle = "#fff";

    ctx.beginPath();
    ctx.moveTo(ball1.currentX + ballSize / 2, ball1.currentY + ballSize / 2);
    ctx.lineTo(ball2.currentX + ballSize / 2, ball2.currentY + ballSize / 2);
    ctx.stroke();
  });
}

// Initialize text effect
function init(text = "GUHH") {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balls.forEach((ball) => ball.element.remove()); // Clear previous balls
  balls.length = 0; // Clear balls array
  adjacentPairs.length = 0; // Clear adjacent pairs

  const points = getTextShapePoints(text); // Get new points based on text
  createBallsFromPoints(points); // Create balls with new points
  drawLines(); // Draw lines based on new points
}

// DOMContentLoaded event to initialize with saved text or default text
document.addEventListener("DOMContentLoaded", () => {
  retrieveLastTextInput(); // Retrieve and initialize with last saved input
  initializeCounter(); // Initialize counter
});

// Resize canvas and reinitialize on window resize
window.addEventListener("resize", () => {
  resizeCanvas();
  const currentText = document.getElementById("textInput").value;
  init(currentText);
});
