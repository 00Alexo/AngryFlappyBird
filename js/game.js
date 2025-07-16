import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATES } from './constants.js';
import { GameState } from './gameState.js';
import { Bird } from './bird.js';
import { PipeManager } from './pipes.js';
import { ParticleSystem } from './particles.js';
import { Renderer } from './renderer.js';
import { UIManager } from './uiManager.js';
import { CharacterUI } from './characterUI.js';
import { AbilityManager } from './abilityManager.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.gameState = new GameState();
        this.characterUI = new CharacterUI(this.gameState);
        this.bird = new Bird(CANVAS_WIDTH * 0.2, CANVAS_HEIGHT / 2, this.characterUI.getCharacterManager());
        this.pipeManager = new PipeManager(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.particleSystem = new ParticleSystem();
        this.renderer = new Renderer(this.canvas);
        this.uiManager = new UIManager(this.gameState);
        this.abilityManager = new AbilityManager(this);
        
        this.gameLoop = null;
        this.backgroundLoop = null;
        
        this.setupEventListeners();
        this.resizeCanvas();
        this.showStartScreen();
        this.startBackgroundAnimation();
    }

    setupEventListeners() {
        // Game events
        document.addEventListener('startGame', () => {
            console.log('startGame event received'); // Debug log
            this.startGame();
        });
        document.addEventListener('restartGame', () => this.restartGame());
        document.addEventListener('goToMainMenu', () => this.goToMainMenu());
        document.addEventListener('flap', () => this.flap());

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.resizeCanvas(width, height);
        
        // Adjust bird position if needed
        if (this.bird.x) {
            this.bird.x = Math.min(this.bird.x, width * 0.2);
        }
    }

    showStartScreen() {
        this.gameState.setState(GAME_STATES.START);
        this.uiManager.showStartScreen();
        this.uiManager.updateIcons();
        this.abilityManager.hideAbilityTimer();
    }

    startGame() {
        console.log('Starting game...'); // Debug log
        this.gameState.setState(GAME_STATES.PLAYING);
        this.gameState.resetScore();
        this.pipeManager.reset();
        this.particleSystem.clear();
        this.bird.reset(this.canvas.width * 0.2, this.canvas.height / 2);
        
        this.uiManager.hideStartScreen();
        this.stopBackgroundAnimation();
        
        // Show ability timer when game starts
        this.abilityManager.updateCooldownDisplay();
        
        // Start game loop
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    restartGame() {
        this.uiManager.hideGameOverScreen();
        this.renderer.generateBackgroundElements();
        this.startGame();
    }

    goToMainMenu() {
        this.uiManager.hideGameOverScreen();
        this.particleSystem.clear();
        this.pipeManager.reset();
        this.bird.reset(this.canvas.width * 0.2, this.canvas.height / 2);
        this.renderer.generateBackgroundElements();
        this.abilityManager.hideAbilityTimer();
        this.showStartScreen();
        this.startBackgroundAnimation();
    }

    flap() {
        if (this.gameState.getState() !== GAME_STATES.PLAYING) return;
        
        this.bird.flap();
        this.particleSystem.addFlapParticles(
            this.bird.x - 20, // BIRD_SIZE / 2
            this.bird.y
        );
    }

    startBackgroundAnimation() {
        if (this.backgroundLoop) clearInterval(this.backgroundLoop);
        this.backgroundLoop = setInterval(() => {
            if (this.gameState.getState() === GAME_STATES.START) {
                this.renderer.updateBackgroundElements();
                this.renderer.renderBackground();
            }
        }, 1000 / 60);
    }

    stopBackgroundAnimation() {
        if (this.backgroundLoop) {
            clearInterval(this.backgroundLoop);
            this.backgroundLoop = null;
        }
    }

    update() {
        if (this.gameState.getState() !== GAME_STATES.PLAYING) return;

        // Update ability manager
        this.abilityManager.update();

        // Update bird
        this.bird.update();

        // Check ground/ceiling collision
        if (this.bird.checkBounds(this.canvas.height)) {
            this.gameOver();
            return;
        }

        // Update particles
        this.particleSystem.update();

        // Update pipes
        this.pipeManager.update(this.bird);

        // Check pipe collisions
        if (this.abilityManager.isRageModeActive()) {
            // During rage mode, smash through pipes
            if (this.pipeManager.checkAndSmashCollisions(this.bird)) {
                console.log('Pipe smashed by rage mode!');
                // Add smash effect
                this.particleSystem.addExplosionParticles(this.bird.x, this.bird.y);
                // Trigger ability end on pipe hit
                this.abilityManager.onPipeHit();
            }
        } else {
            // Normal collision detection
            if (this.pipeManager.checkCollisions(this.bird)) {
                this.gameOver();
                return;
            }
        }

        // Check scoring
        if (this.pipeManager.checkScoring(this.bird)) {
            // Simple scoring - increment by 1 for all characters
            this.gameState.incrementScore();
            
            // Add score particles
            const scorePos = this.pipeManager.getScoreParticlePosition();
            if (scorePos) {
                this.particleSystem.addScoreParticles(scorePos.x, scorePos.y);
            }
        }

        // Render everything
        this.renderer.render(this.bird, this.pipeManager, this.particleSystem);
    }

    async gameOver() {
        this.gameState.setState(GAME_STATES.GAME_OVER);
        clearInterval(this.gameLoop);

        // Reset ability timer
        this.abilityManager.resetAbility();

        // Create explosion effect
        this.particleSystem.addExplosionParticles(this.bird.x, this.bird.y);

        // Continue rendering particles for explosion effect
        const explosionLoop = setInterval(() => {
            this.renderer.render(this.bird, this.pipeManager, this.particleSystem);
            this.particleSystem.update();
            
            if (!this.particleSystem.hasParticles()) {
                clearInterval(explosionLoop);
            }
        }, 1000 / 60);

        // Check for new high score
        const isNewHighScore = await this.gameState.checkAndUpdateHighScore();
        console.log(`Game Over - Score: ${this.gameState.getScore()}, High Score: ${this.gameState.getHighScore()}, New High Score: ${isNewHighScore}`);

        // Dispatch game over event for achievement checking
        document.dispatchEvent(new CustomEvent('gameOver', {
            detail: {
                score: this.gameState.getScore(),
                highScore: this.gameState.getHighScore(),
                isNewHighScore: isNewHighScore
            }
        }));

        // Show game over screen after a delay
        setTimeout(() => {
            this.uiManager.showGameOverScreen(isNewHighScore);
        }, 1000);
    }

    getCharacterUI() {
        return this.characterUI;
    }

    getGameState() {
        return this.gameState;
    }
}
