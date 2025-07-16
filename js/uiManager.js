import { GAME_STATES } from './constants.js';

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Use a more robust approach to wait for elements
        const setupButtons = () => {
            console.log('Setting up event listeners...'); // Debug log
            
            // Wait a bit more to ensure DOM is ready
            setTimeout(() => {
                const startBtn = document.getElementById('startBtn');
                const restartBtn = document.getElementById('restartBtn');
                const mainMenuBtn = document.getElementById('mainMenuBtn');
                const canvas = document.getElementById('gameCanvas');
                
                console.log('StartBtn found:', !!startBtn); // Debug log
                console.log('Canvas found:', !!canvas); // Debug log
                
                if (startBtn) {
                    startBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('Start button clicked'); // Debug log
                        this.dispatchEvent('startGame');
                    });
                    console.log('Start button listener added'); // Debug log
                }

                if (restartBtn) {
                    restartBtn.addEventListener('click', () => {
                        this.dispatchEvent('restartGame');
                    });
                }

                if (mainMenuBtn) {
                    mainMenuBtn.addEventListener('click', () => {
                        this.dispatchEvent('goToMainMenu');
                    });
                }

                // Canvas click listener
                if (canvas) {
                    canvas.addEventListener('click', () => {
                        this.handleCanvasClick();
                    });
                }
            }, 100);
        };

        // Try multiple approaches to ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupButtons);
        } else if (document.readyState === 'interactive') {
            setupButtons();
        } else {
            setupButtons();
        }

        // Also try after window load as backup
        window.addEventListener('load', setupButtons);

        // Keyboard event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleSpacePress();
            }
        });
    }

    handleSpacePress() {
        const state = this.gameState.getState();
        if (state === GAME_STATES.START) {
            this.dispatchEvent('startGame');
        } else if (state === GAME_STATES.PLAYING) {
            this.dispatchEvent('flap');
        }
    }

    handleCanvasClick() {
        const state = this.gameState.getState();
        if (state === GAME_STATES.START) {
            this.dispatchEvent('startGame');
        } else if (state === GAME_STATES.PLAYING) {
            this.dispatchEvent('flap');
        }
    }

    dispatchEvent(eventType) {
        console.log(`Dispatching event: ${eventType}`); // Debug log
        const event = new CustomEvent(eventType);
        document.dispatchEvent(event);
    }

    showStartScreen() {
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';
        this.gameState.updateHighScoreDisplay();
    }

    hideStartScreen() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';
    }

    showGameOverScreen(isNewHighScore) {
        console.log('Showing game over screen'); // Debug log
        console.log('isNewHighScore parameter:', isNewHighScore); // Debug log
        
        const gameOverScreen = document.getElementById('gameOver');
        const startScreen = document.getElementById('startScreen');
        const instructions = document.getElementById('instructions');
        
        // Hide other screens
        if (startScreen) startScreen.style.display = 'none';
        if (instructions) instructions.style.display = 'none';
        
        // Update scores
        const finalScore = document.getElementById('finalScore');
        const finalHighScore = document.getElementById('finalHighScore');
        const coinsEarned = document.getElementById('coinsEarned');
        
        if (finalScore) finalScore.textContent = this.gameState.getScore();
        if (finalHighScore) finalHighScore.textContent = this.gameState.getHighScore();
        if (coinsEarned) coinsEarned.textContent = this.gameState.getCoinsEarnedThisGame();
        
        // Show new high score message if applicable
        const newHighScoreMsg = document.getElementById('newHighScoreMsg');
        if (newHighScoreMsg) {
            if (isNewHighScore) {
                console.log('Showing new high score message');
                newHighScoreMsg.style.display = 'block';
            } else {
                console.log('Hiding new high score message');
                newHighScoreMsg.style.display = 'none';
            }
        }
        
        // Show game over screen
        if (gameOverScreen) {
            gameOverScreen.style.display = 'flex';
            console.log('Game over screen displayed'); // Debug log
        } else {
            console.log('Game over screen element not found'); // Debug log
        }
    }

    hideGameOverScreen() {
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('newHighScoreMsg').style.display = 'none';
    }

    updateIcons() {
        // Update Font Awesome icons
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const mainMenuBtn = document.getElementById('mainMenuBtn');

        if (startBtn) {
            startBtn.innerHTML = '<i class="fas fa-play"></i> START GAME';
        }
        if (restartBtn) {
            restartBtn.innerHTML = '<i class="fas fa-redo"></i> Play Again';
        }
        if (mainMenuBtn) {
            mainMenuBtn.innerHTML = '<i class="fas fa-home"></i> Main Menu';
        }

        // Update title with icon
        const titleElement = document.querySelector('#startScreen h1');
        if (titleElement) {
            titleElement.innerHTML = '<i class="fas fa-dove"></i> Angry Flappy Bird <i class="fas fa-dove"></i>';
        }
    }
}
