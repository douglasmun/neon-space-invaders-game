const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const livesElement = document.getElementById('lives');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Mobile control variables
let mobileLeftPressed = false;
let mobileRightPressed = false;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Game state
const gameState = {
    player: {
        x: 400, y: 550, width: 50, height: 30, color: '#00FF00', speed: 5,
        lives: 3, score: 0, isAlive: true, invulnerableUntil: 0
    },
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    particles: [],
    score: 0,
    level: 1,
    frameCount: 0,
    enemyHorizontalDirection: 1,
    gameOver: false,
    gameStarted: false,
    invulnerabilityDuration: 3000
};

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false
};

// Setup mobile controls if needed
function setupMobileControls() {
    if (isMobile) {
        const mobileControls = document.getElementById('mobile-controls');
        mobileControls.style.display = 'block';
        
        document.getElementById('left-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileLeftPressed = true;
        }, { passive: false });
        
        document.getElementById('left-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileLeftPressed = false;
        }, { passive: false });
        
        document.getElementById('right-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileRightPressed = true;
        }, { passive: false });
        
        document.getElementById('right-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileRightPressed = false;
        }, { passive: false });
        
        document.getElementById('shoot-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys[' '] = true;
        }, { passive: false });
        
        document.getElementById('shoot-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[' '] = false;
        }, { passive: false });
    }
}

// Handle window resize
function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const targetRatio = 800 / 600; // Original game aspect ratio
    
    let canvasWidth = windowWidth;
    let canvasHeight = windowWidth / targetRatio;
    
    if (canvasHeight > windowHeight) {
        canvasHeight = windowHeight;
        canvasWidth = windowHeight * targetRatio;
    }
    
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    // Set the actual canvas buffer size
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    ctx.scale(scale, scale);
    
    // Adjust game elements for new size
    if (gameState.gameStarted) {
        const scaleX = canvas.width / 800;
        const scaleY = canvas.height / 600;
        
        // Scale player position
        gameState.player.x *= scaleX;
        gameState.player.y *= scaleY;
        gameState.player.width *= scaleX;
        gameState.player.height *= scaleY;
        gameState.player.speed *= scaleX;
        
        // Scale enemies
        gameState.enemies.forEach(enemy => {
            enemy.x *= scaleX;
            enemy.y *= scaleY;
            enemy.width *= scaleX;
            enemy.height *= scaleY;
        });
        
        // Scale projectiles
        gameState.projectiles.forEach(proj => {
            proj.x *= scaleX;
            proj.y *= scaleY;
            proj.width *= scaleX;
            proj.height *= scaleY;
            proj.speed *= scaleY;
        });
        
        gameState.enemyProjectiles.forEach(proj => {
            proj.x *= scaleX;
            proj.y *= scaleY;
            proj.width *= scaleX;
            proj.height *= scaleY;
            proj.speed *= scaleY;
        });
    }
}

// Input handling
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Game controls
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    resetGame(true);
});

restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    resetGame(true);
});

// Initialize game
function initGame() {
    resizeCanvas();
    setupMobileControls();
    resetGame(false);
}

// Game loop
function gameLoop() {
    updateGameState();
    renderGame();
    
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    livesElement.textContent = gameState.player.lives;

    if (gameState.gameOver) {
        gameOverScreen.style.display = 'flex';
        finalScoreElement.textContent = gameState.score;
        startScreen.style.display = 'none';
    } else if (!gameState.gameStarted) {
        startScreen.style.display = 'flex';
        gameOverScreen.style.display = 'none';
    } else {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
    }

    requestAnimationFrame(gameLoop);
}

function updateGameState() {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    gameState.frameCount++;
    const currentTime = Date.now();

    // Player movement
    if ((keys.ArrowLeft || mobileLeftPressed) && gameState.player.x > 0) {
        gameState.player.x -= gameState.player.speed;
    }
    if ((keys.ArrowRight || mobileRightPressed) && gameState.player.x < canvas.width - gameState.player.width) {
        gameState.player.x += gameState.player.speed;
    }
    if (keys[' '] && gameState.player.isAlive) {
        keys[' '] = false;
        gameState.projectiles.push({
            x: gameState.player.x + gameState.player.width / 2 - 2.5, 
            y: gameState.player.y, 
            width: 5, 
            height: 15,
            color: '#FF0000', 
            speed: 7
        });
    }

    // Update projectiles
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const proj = gameState.projectiles[i];
        proj.y -= proj.speed;
        if (proj.y < 0) {
            gameState.projectiles.splice(i, 1);
        }
    }

    // Update enemies movement
    const enemyMoveSpeed = 1 + gameState.level * 0.2;
    let shouldMoveDown = false;

    if (gameState.enemies.length > 0) {
        let minX = Infinity;
        let maxX = -Infinity;
        gameState.enemies.forEach(enemy => {
            if (enemy.x < minX) minX = enemy.x;
            if (enemy.x + enemy.width > maxX) maxX = enemy.x + enemy.width;
        });

        if (gameState.enemyHorizontalDirection === 1 && maxX >= canvas.width) {
            shouldMoveDown = true;
        } else if (gameState.enemyHorizontalDirection === -1 && minX <= 0) {
            shouldMoveDown = true;
        }
    }

    if (shouldMoveDown) {
        gameState.enemies.forEach(enemy => {
            enemy.y += 20;
            if (enemy.y + enemy.height >= canvas.height * 0.9) {
                if (!gameState.gameOver) {
                    triggerGameOver('enemies_landed');
                }
            }
        });
        gameState.enemyHorizontalDirection *= -1;
    } else {
        gameState.enemies.forEach(enemy => {
            enemy.x += gameState.enemyHorizontalDirection * enemyMoveSpeed;
        });
    }

    // Enemy shooting
    if (gameState.frameCount % 60 === 0 && gameState.enemies.length > 0 && !gameState.gameOver) {
        const activeEnemies = gameState.enemies.filter(enemy => enemy.y < canvas.height * 0.8);
        if (activeEnemies.length > 0) {
            const shootingEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
            gameState.enemyProjectiles.push({
                x: shootingEnemy.x + shootingEnemy.width / 2 - 2.5,
                y: shootingEnemy.y + shootingEnemy.height,
                width: 5,
                height: 15,
                color: '#00FFFF',
                speed: 4
            });
        }
    }

    // Update enemy projectiles
    for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
        const proj = gameState.enemyProjectiles[i];
        proj.y += proj.speed;
        if (proj.y > canvas.height) {
            gameState.enemyProjectiles.splice(i, 1);
        }
    }

    // Update particles
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.x += Math.cos(particle.moveAngle) * particle.speed;
        particle.y += Math.sin(particle.moveAngle) * particle.speed;
        if (particle.hasGravity) {
            particle.y += 0.2;
        }
        particle.radius *= 0.98;
        particle.life--;
        if (particle.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }

    checkCollisions();
}

function checkCollisions() {
    const currentTime = Date.now();

    // Player projectiles vs enemies
    for (let projIndex = gameState.projectiles.length - 1; projIndex >= 0; projIndex--) {
        const proj = gameState.projectiles[projIndex];
        let hitEnemy = false;

        for (let enemyIndex = gameState.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
            const enemy = gameState.enemies[enemyIndex];
            if (proj.x < enemy.x + enemy.width &&
                proj.x + proj.width > enemy.x &&
                proj.y < enemy.y + enemy.height &&
                proj.y + proj.height > enemy.y) {
                hitEnemy = true;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                gameState.enemies.splice(enemyIndex, 1);
                gameState.score += 100;
                break;
            }
        }
        if (hitEnemy) {
            gameState.projectiles.splice(projIndex, 1);
        }
    }

    // Enemy projectiles vs player
    for (let epIndex = gameState.enemyProjectiles.length - 1; epIndex >= 0; epIndex--) {
        const enemyProj = gameState.enemyProjectiles[epIndex];
        
        if (gameState.player.isAlive && currentTime > gameState.player.invulnerableUntil) {
            if (enemyProj.x < gameState.player.x + gameState.player.width &&
                enemyProj.x + enemyProj.width > gameState.player.x &&
                enemyProj.y < gameState.player.y + gameState.player.height &&
                enemyProj.y + enemyProj.height > gameState.player.y) {
                
                createExplosion(gameState.player.x + gameState.player.width / 2, 
                              gameState.player.y + gameState.player.height / 2, 
                              'player_hit');
                gameState.player.lives--;
                gameState.player.invulnerableUntil = currentTime + gameState.invulnerabilityDuration;
                gameState.enemyProjectiles.splice(epIndex, 1);

                if (gameState.player.lives <= 0) {
                    gameState.player.isAlive = false;
                    triggerGameOver('player_died');
                } else {
                    gameState.player.x = canvas.width / 2 - gameState.player.width / 2;
                    gameState.player.y = canvas.height - gameState.player.height - 20;
                }
            }
        }
    }

    // Level complete check
    if (gameState.enemies.length === 0 && !gameState.gameOver) {
        gameState.level++;
        spawnEnemies();
        gameState.enemyHorizontalDirection = 1;
    }
}

function createExplosion(x, y, type = 'enemy_hit') {
    const particleCount = type === 'player_hit' ? 40 : 25;
    const colors = type === 'player_hit' ? [
        '#FF0000', '#FF5500', '#FFAA00', '#FFFF00', '#FFCC00', '#FF8800'
    ] : [
        '#FF3E3E', '#FF993E', '#FFE73E', '#FFFFFF', '#FF6666', '#FFAA66'
    ];

    for (let i = 0; i < particleCount; i++) {
        gameState.particles.push({
            x, y, radius: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * (type === 'player_hit' ? 7 : 5) + 2,
            moveAngle: Math.random() * Math.PI * 2,
            angle: Math.random() * Math.PI * 2,
            life: Math.floor(Math.random() * 30 + 20),
            maxLife: 50,
            type: Math.floor(Math.random() * 2),
            hasGravity: Math.random() > 0.7
        });
    }
}

function triggerGameOver(reason) {
    if (gameState.gameOver) return;
    gameState.gameOver = true;
    gameState.gameStarted = false;
}

function resetGame(shouldStart = true) {
    // Reset player
    gameState.player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 80,
        width: 50,
        height: 30,
        color: '#00FF00',
        speed: 5,
        lives: 3,
        score: 0,
        isAlive: true,
        invulnerableUntil: 0
    };

    // Reset game state
    gameState.enemies = [];
    gameState.projectiles = [];
    gameState.enemyProjectiles = [];
    gameState.particles = [];
    gameState.score = 0;
    gameState.level = 1;
    gameState.frameCount = 0;
    gameState.enemyHorizontalDirection = 1;
    gameState.gameOver = false;
    gameState.gameStarted = shouldStart;

    if (shouldStart) {
        spawnEnemies();
    }
}

function spawnEnemies() {
    gameState.enemies = [];
    const rows = 5;
    const cols = 11;
    const enemyWidth = 50 * (canvas.width / 800);
    const enemyHeight = 40 * (canvas.height / 600);
    const padding = 15 * (canvas.width / 800);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            gameState.enemies.push({
                x: 100 * (canvas.width / 800) + c * (enemyWidth + padding),
                y: 50 * (canvas.height / 600) + r * (enemyHeight + padding),
                width: enemyWidth,
                height: enemyHeight,
                color: r === 0 ? '#FF5555' : r < 3 ? '#55FF55' : '#5555FF'
            });
        }
    }
}

function renderGame() {
    // Clear canvas with semi-transparent black for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();

    // Draw player if alive
    if (gameState.player.isAlive) {
        const currentTime = Date.now();
        const isInvulnerable = currentTime < gameState.player.invulnerableUntil;
        if (!isInvulnerable || Math.floor(currentTime / 100) % 2 === 0) {
            drawShip(gameState.player);
        }
    }

    // Draw enemies
    gameState.enemies.forEach(enemy => {
        drawEnemy(enemy);
    });

    // Draw projectiles
    gameState.projectiles.forEach(proj => {
        drawProjectile(proj);
    });

    gameState.enemyProjectiles.forEach(proj => {
        drawProjectile(proj);
    });

    // Draw particles
    gameState.particles.forEach(particle => {
        drawParticle(particle);
    });
}

function drawShip(ship) {
    ctx.save();
    ctx.fillStyle = ship.color;

    ctx.beginPath();
    ctx.moveTo(ship.x + ship.width/2, ship.y);
    ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
    ctx.lineTo(ship.x, ship.y + ship.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ship.x + ship.width/2 - 5, ship.y + 5, 10, 5);

    const gradient = ctx.createLinearGradient(
        ship.x, ship.y + ship.height,
        ship.x, ship.y + ship.height + 15
    );
    gradient.addColorStop(0, ship.color);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(ship.x + ship.width/4, ship.y + ship.height,
                 ship.width/2, 15);

    ctx.restore();
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const x = Math.round(enemy.x);
    const y = Math.round(enemy.y);
    const width = Math.round(enemy.width);
    const height = Math.round(enemy.height);

    if (enemy.color === '#FF5555') {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/3, width/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + width/4, y + height/2, width/2, height/4);
    }
    else if (enemy.color === '#55FF55') {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(x + width/4, y + height/6, width/2, height*2/3);
        ctx.fillRect(x + width/6, y + height/3, width/6, height/3);
        ctx.fillRect(x + width*2/3, y + height/3, width/6, height/3);
    }
    else {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(x + width/3, y + height/3, width/6, 0, Math.PI * 2);
        ctx.arc(x + width*2/3, y + height/3, width/6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + width/4, y + height/2, width/2, height/4);
    }

    ctx.restore();
}

function drawProjectile(proj) {
    ctx.save();

    ctx.fillStyle = proj.color;
    ctx.fillRect(
        Math.round(proj.x),
        Math.round(proj.y),
        proj.width,
        proj.height
    );

    const glow = ctx.createRadialGradient(
        proj.x + proj.width/2,
        proj.y + proj.height/2,
        2,
        proj.x + proj.width/2,
        proj.y + proj.height/2,
        10
    );
    glow.addColorStop(0, proj.color);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(
        Math.round(proj.x) - 5,
        Math.round(proj.y) - 5,
        proj.width + 10,
        proj.height + 10
    );

    ctx.restore();
}

function drawParticle(particle) {
    ctx.save();

    const lifeRatio = particle.life / particle.maxLife;
    ctx.globalAlpha = lifeRatio * 0.8;
    ctx.fillStyle = particle.color;

    if (particle.type === 0) {
        ctx.beginPath();
        ctx.arc(
            particle.x,
            particle.y,
            particle.radius * lifeRatio,
            0,
            Math.PI * 2
        );
        ctx.fill();
    } else {
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.fillRect(
            -particle.radius,
            -particle.radius,
            particle.radius * 2 * lifeRatio,
            particle.radius * 2 * lifeRatio
        );
    }
    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        ctx.fillRect(x, y, size, size);
    }

    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 1 + Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1.0;
}

// Initialize and start the game
window.addEventListener('load', initGame);
window.addEventListener('resize', resizeCanvas);
gameLoop();
