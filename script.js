const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste de tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Sonidos
const engineSound = new Audio("./sounds/engine.mp3");
const missileSound = new Audio("./sounds/missile.mp3");
const explosionSound = new Audio("./sounds/explosion.mp3");
const backgroundMusic = new Audio("./sounds/background.mp3");
const gameOverSound = new Audio("./sounds/gameover.mp3"); // Sonido de "Game Over"

// Configuración del jugador
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  radius: 25,
  image: new Image(),
  isExploding: false,
  explosionTimer: 0,
};
player.image.src = "./img/eeuu.png"; // Imagen del avión aliado

// Configuración de enemigos
const enemies = [];
const enemyImage = new Image();
enemyImage.src = "./img/ruso.png"; // Imagen del avión enemigo

// Imagen de explosión
const explosionImage = new Image();
explosionImage.src = "./img/explosion.png"; // Imagen de la explosión

// Misiles
const missiles = [];
const missileImage = new Image();
missileImage.src = "./img/misil.png";

let gameOver = false;
let gameStarted = false;

// Crear enemigos
function spawnEnemies() {
  if (enemies.length < 5) {
    const enemy = {
      x: Math.random() * (canvas.width - 50),
      y: -50,
      radius: 25,
      speed: 2 + Math.random() * 2,
      isExploding: false,
      explosionTimer: 0,
    };
    enemies.push(enemy);
  }
}

// Colisiones circulares
function areCirclesColliding(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

// Actualizar enemigos
function updateEnemies() {
  for (let enemy of enemies) {
    if (enemy.isExploding) {
      enemy.explosionTimer++;
      if (enemy.explosionTimer > 10) {
        const index = enemies.indexOf(enemy);
        if (index > -1) {
          enemies.splice(index, 1);
        }
      }
    } else {
      enemy.y += enemy.speed;

      if (
        areCirclesColliding(
          player.x,
          player.y,
          player.radius,
          enemy.x,
          enemy.y,
          enemy.radius
        )
      ) {
        player.isExploding = true;
        player.explosionTimer = 0;
        gameOver = true; // Cambiar el estado del juego a "Game Over"
        gameOverSound.play(); // Reproducir el sonido de "Game Over"
      }

      for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        if (
          missile.x < enemy.x + enemy.radius &&
          missile.x + missile.width > enemy.x - enemy.radius &&
          missile.y < enemy.y + enemy.radius &&
          missile.y + missile.height > enemy.y - enemy.radius
        ) {
          enemy.isExploding = true;
          enemy.explosionTimer = 0;
          missiles.splice(i, 1);
          explosionSound.play(); // Reproducir sonido de explosión
          break;
        }
      }

      if (enemy.y > canvas.height) {
        enemy.y = -50;
        enemy.x = Math.random() * (canvas.width - 50);
      }
    }
  }
}

// Dibujar enemigos
function drawEnemies() {
  for (let enemy of enemies) {
    if (enemy.isExploding) {
      ctx.drawImage(
        explosionImage,
        enemy.x - enemy.radius,
        enemy.y - enemy.radius,
        enemy.radius * 2,
        enemy.radius * 2
      );
    } else {
      ctx.drawImage(
        enemyImage,
        enemy.x - enemy.radius,
        enemy.y - enemy.radius,
        enemy.radius * 2,
        enemy.radius * 2
      );
    }
  }
}

// Dibujar jugador
function drawPlayer() {
  if (player.isExploding) {
    ctx.drawImage(
      explosionImage,
      player.x - player.radius,
      player.y - player.radius,
      player.radius * 2,
      player.radius * 2
    );
  } else {
    ctx.drawImage(
      player.image,
      player.x - player.radius,
      player.y - player.radius,
      player.radius * 2,
      player.radius * 2
    );
  }
}

// Dibujar misiles
function drawMissiles() {
  for (let missile of missiles) {
    ctx.drawImage(
      missileImage,
      missile.x,
      missile.y,
      missile.width,
      missile.height
    );
  }
}

// Actualizar misiles
function updateMissiles() {
  for (let i = missiles.length - 1; i >= 0; i--) {
    missiles[i].y -= missiles[i].speed;
    if (missiles[i].y < 0) {
      missiles.splice(i, 1);
    }
  }
}

// Controles del jugador (Táctiles)
let touchStartX = 0;
let touchStartY = 0;
let touchMoveX = 0;
let touchMoveY = 0;

// Iniciar el juego al hacer clic en el botón "Iniciar"
document.getElementById("startButton").addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    document.getElementById("startScreen").style.display = "none";
    backgroundMusic.loop = true;
    backgroundMusic.play(); // Iniciar música de fondo
    gameLoop(); // Comienza el bucle del juego
  }
});

// Controlar el movimiento del jugador y disparos con las teclas
document.addEventListener("keydown", (e) => {
  if (!gameStarted) {
    return; // El juego no comienza si no se ha iniciado
  }

  if (e.key === "ArrowLeft" && player.x - player.radius > 0) player.x -= 10;
  if (e.key === "ArrowRight" && player.x + player.radius < canvas.width)
    player.x += 10;
  if (e.key === "ArrowUp" && player.y - player.radius > 0) player.y -= 10;
  if (e.key === "ArrowDown" && player.y + player.radius < canvas.height)
    player.y += 10;

  if (e.key === " " || e.key === "Enter") {
    missiles.push({
      x: player.x - 5,
      y: player.y - 20,
      width: 10,
      height: 20,
      speed: 5,
    });
    missileSound.play(); // Reproducir sonido de misil
  }
});

// Evento táctil
canvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
  touchMoveX = e.touches[0].clientX - touchStartX;
  touchMoveY = e.touches[0].clientY - touchStartY;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", () => {
  if (!gameStarted) {
    gameStarted = true;
    document.getElementById("startScreen").style.display = "none";
    backgroundMusic.loop = true;
    backgroundMusic.play(); // Iniciar música de fondo
    gameLoop();
    return;
  }

  if (touchMoveY > 30) {
    missiles.push({
      x: player.x - 5,
      y: player.y - 20,
      width: 10,
      height: 20,
      speed: 5,
    });
    missileSound.play(); // Reproducir sonido de misil
  }
});

// Bucle principal del juego
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    spawnEnemies();
    updateEnemies();
    updateMissiles();
    drawPlayer();
    drawEnemies();
    drawMissiles();
    requestAnimationFrame(gameLoop);
  } else {
    showGameOverScreen();
  }
}

// Mostrar pantalla de Game Over
function showGameOverScreen() {
  const gameOverScreen = document.getElementById("gameOverScreen");
  gameOverScreen.style.display = "flex"; // Mostrar la pantalla de Game Over
}

// Reiniciar el juego
function restartGame() {
  gameOver = false;
  gameStarted = false;
  enemies.length = 0;
  missiles.length = 0;
  player.x = canvas.width / 2;
  player.y = canvas.height - 50;
  player.isExploding = false;
  player.explosionTimer = 0;
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "flex"; // Mostrar la pantalla de inicio
}
