const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const COLORS = {
  I: "#54d6ff",
  J: "#5c82ff",
  L: "#ff9b42",
  O: "#ffcf48",
  S: "#62d878",
  T: "#c77dff",
  Z: "#ff5f6d"
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]]
};

const boardCanvas = document.querySelector("#board");
const boardContext = boardCanvas.getContext("2d");
const nextCanvas = document.querySelector("#next");
const nextContext = nextCanvas.getContext("2d");
const scoreNode = document.querySelector("#score");
const linesNode = document.querySelector("#lines");
const levelNode = document.querySelector("#level");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");

let board;
let piece;
let nextPiece;
let score;
let lines;
let level;
let dropCounter;
let lastTime;
let running = false;
let paused = false;
let gameOver = false;
let touchStart = null;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const matrix = SHAPES[type].map((row) => [...row]);
  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0
  };
}

function resetGame() {
  board = createBoard();
  piece = randomPiece();
  nextPiece = randomPiece();
  score = 0;
  lines = 0;
  level = 1;
  dropCounter = 0;
  lastTime = 0;
  paused = false;
  gameOver = false;
  running = true;
  overlay.classList.add("hidden");
  pauseButton.textContent = "II";
  updateHud();
  requestAnimationFrame(update);
}

function collide(testPiece = piece, offsetX = 0, offsetY = 0, matrix = testPiece.matrix) {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      const boardX = testPiece.x + x + offsetX;
      const boardY = testPiece.y + y + offsetY;
      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
      if (boardY >= 0 && board[boardY][boardX]) return true;
    }
  }
  return false;
}

function merge() {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && piece.y + y >= 0) {
        board[piece.y + y][piece.x + x] = piece.type;
      }
    });
  });
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }
  if (!cleared) return;
  lines += cleared;
  level = Math.floor(lines / 10) + 1;
  score += [0, 100, 300, 500, 800][cleared] * level;
  updateHud();
}

function spawn() {
  piece = nextPiece;
  piece.x = Math.floor((COLS - piece.matrix[0].length) / 2);
  piece.y = 0;
  nextPiece = randomPiece();
  if (collide()) {
    gameOver = true;
    running = false;
    showOverlay("Game Over", `Score ${score}`);
  }
}

function move(dx) {
  if (!canPlay()) return;
  if (!collide(piece, dx, 0)) {
    piece.x += dx;
    draw();
  }
}

function softDrop() {
  if (!canPlay()) return;
  if (!collide(piece, 0, 1)) {
    piece.y += 1;
    score += 1;
  } else {
    merge();
    clearLines();
    spawn();
  }
  dropCounter = 0;
  updateHud();
  draw();
}

function hardDrop() {
  if (!canPlay()) return;
  let distance = 0;
  while (!collide(piece, 0, 1)) {
    piece.y += 1;
    distance += 1;
  }
  score += distance * 2;
  merge();
  clearLines();
  spawn();
  updateHud();
  draw();
}

function rotatePiece() {
  if (!canPlay()) return;
  const rotated = piece.matrix[0].map((_, index) => piece.matrix.map((row) => row[index]).reverse());
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(piece, kick, 0, rotated)) {
      piece.matrix = rotated;
      piece.x += kick;
      draw();
      return;
    }
  }
}

function canPlay() {
  return running && !paused && !gameOver;
}

function dropInterval() {
  return Math.max(90, 760 - (level - 1) * 60);
}

function update(time = 0) {
  if (!running) return;
  const delta = time - lastTime;
  lastTime = time;
  if (!paused) {
    dropCounter += delta;
    if (dropCounter > dropInterval()) {
      softDrop();
    }
    draw();
  }
  requestAnimationFrame(update);
}

function drawCell(context, x, y, size, color) {
  context.fillStyle = color;
  context.fillRect(x, y, size, size);
  context.fillStyle = "rgba(255,255,255,0.18)";
  context.fillRect(x + 2, y + 2, size - 4, 4);
  context.strokeStyle = "rgba(0,0,0,0.34)";
  context.lineWidth = 2;
  context.strokeRect(x + 1, y + 1, size - 2, size - 2);
}

function drawGrid() {
  boardContext.fillStyle = "#05090b";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.strokeStyle = "rgba(255,255,255,0.055)";
  boardContext.lineWidth = 1;
  for (let x = 1; x < COLS; x += 1) {
    boardContext.beginPath();
    boardContext.moveTo(x * BLOCK, 0);
    boardContext.lineTo(x * BLOCK, ROWS * BLOCK);
    boardContext.stroke();
  }
  for (let y = 1; y < ROWS; y += 1) {
    boardContext.beginPath();
    boardContext.moveTo(0, y * BLOCK);
    boardContext.lineTo(COLS * BLOCK, y * BLOCK);
    boardContext.stroke();
  }
}

function drawMatrix(context, matrix, originX, originY, size, type) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawCell(context, originX + x * size, originY + y * size, size, COLORS[type]);
    });
  });
}

function drawGhost() {
  const ghost = { ...piece, matrix: piece.matrix };
  while (!collide(ghost, 0, 1)) ghost.y += 1;
  boardContext.globalAlpha = 0.28;
  drawMatrix(boardContext, ghost.matrix, ghost.x * BLOCK, ghost.y * BLOCK, BLOCK, ghost.type);
  boardContext.globalAlpha = 1;
}

function draw() {
  drawGrid();
  board.forEach((row, y) => {
    row.forEach((type, x) => {
      if (type) drawCell(boardContext, x * BLOCK, y * BLOCK, BLOCK, COLORS[type]);
    });
  });
  if (piece) {
    drawGhost();
    drawMatrix(boardContext, piece.matrix, piece.x * BLOCK, piece.y * BLOCK, BLOCK, piece.type);
  }
  drawNext();
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextContext.fillStyle = "#071013";
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!nextPiece) return;
  const size = 20;
  const width = nextPiece.matrix[0].length * size;
  const height = nextPiece.matrix.length * size;
  drawMatrix(nextContext, nextPiece.matrix, (nextCanvas.width - width) / 2, (nextCanvas.height - height) / 2, size, nextPiece.type);
}

function updateHud() {
  scoreNode.textContent = score.toLocaleString();
  linesNode.textContent = lines;
  levelNode.textContent = level;
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startButton.textContent = gameOver ? "Restart" : "Start";
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (!running || gameOver) return;
  paused = !paused;
  pauseButton.textContent = paused ? "▶" : "II";
  if (paused) {
    showOverlay("Paused", "Tap resume to continue.");
    startButton.textContent = "Resume";
  } else {
    overlay.classList.add("hidden");
    lastTime = performance.now();
  }
}

function handleAction(action) {
  if (action === "left") move(-1);
  if (action === "right") move(1);
  if (action === "rotate") rotatePiece();
  if (action === "drop") hardDrop();
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handleAction(button.dataset.action);
  });
});

startButton.addEventListener("click", () => {
  if (paused) {
    togglePause();
    return;
  }
  resetGame();
});

pauseButton.addEventListener("click", togglePause);

document.addEventListener("keydown", (event) => {
  const keys = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "rotate",
    " ": "drop"
  };
  if (event.key === "ArrowDown") softDrop();
  if (event.key.toLowerCase() === "p") togglePause();
  if (keys[event.key]) handleAction(keys[event.key]);
});

boardCanvas.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
}, { passive: true });

boardCanvas.addEventListener("touchend", (event) => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < 18) {
    rotatePiece();
  } else if (ay > ax && dy > 0) {
    hardDrop();
  } else if (ax > ay) {
    move(dx > 0 ? 1 : -1);
  }
  touchStart = null;
}, { passive: true });

board = createBoard();
piece = randomPiece();
nextPiece = randomPiece();
score = 0;
lines = 0;
level = 1;
updateHud();
draw();
