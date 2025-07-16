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
        // Always show the old coin value immediately when returning to menu
        const menuPoints = document.getElementById('menuPoints');
        if (menuPoints && this.gameState.getCoinsEarnedThisGame() > 0) {
            menuPoints.textContent = this.gameState.getCoins() - this.gameState.getCoinsEarnedThisGame();
            setTimeout(() => this.animateCoinFallToMenu(), 700);
        }
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

    /**
     * Animate coins falling from the top of the screen to the menuPoints counter.
     * Starts after a delay to ensure the main menu is visible.
     */
    animateCoinFallToMenu() {
        const menuPoints = document.getElementById('menuPoints');
        if (!menuPoints) return;

        // Always show the old value before animation starts
        const oldValue = this.gameState.getCoins() - this.gameState.getCoinsEarnedThisGame();

        // Get where to land
        const endRect = menuPoints.getBoundingClientRect();
        const container = document.body;
        const coinsToAnimate = Math.min(16, Math.max(6, Math.floor(this.gameState.getCoinsEarnedThisGame() / 2)));
        const screenWidth = window.innerWidth;

        let lastCoinDelay = 0;
        menuPoints.textContent = oldValue; // Force old value to be shown until animation is done
        for (let i = 0; i < coinsToAnimate; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin-fall-anim';
            coin.innerHTML = '<i class="fas fa-coins"></i>';
            coin.style.position = 'fixed';
            // Random X position across the screen
            const startX = Math.random() * (screenWidth - 40) + 20;
            coin.style.left = `${startX}px`;
            coin.style.top = `-40px`;
            coin.style.zIndex = 9999;
            coin.style.pointerEvents = 'none';
            coin.style.fontSize = '2em';
            coin.style.opacity = '0.92';
            coin.style.transition = 'transform 1.2s cubic-bezier(0.23,1,0.32,1), opacity 0.5s';
            container.appendChild(coin);

            // Animate to menuPoints
            setTimeout(() => {
                const endX = endRect.left + endRect.width/2 - 16;
                const endY = endRect.top + endRect.height/2 - 16;
                coin.style.transform = `translate(${endX - startX}px, ${endY + 40}px) scale(1.1)`;
                coin.style.opacity = '0.2';
            }, 80 + i * 90);

            // Remove and pop menuPoints
            const coinDelay = 1400 + i * 90;
            if (i === coinsToAnimate - 1) lastCoinDelay = coinDelay;
            setTimeout(() => {
                coin.remove();
                if (i === coinsToAnimate - 1) {
                    menuPoints.classList.add('coin-pop-anim');
                    setTimeout(() => menuPoints.classList.remove('coin-pop-anim'), 700);
                }
            }, coinDelay);
        }
        // Update coin counter after all coins and pop animation are done
        setTimeout(() => {
            menuPoints.textContent = this.gameState.getCoins();
        }, lastCoinDelay + 700);
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
