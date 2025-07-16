import { Game } from './game.js';
import { MenuManager } from './menuManager.js';
import { CharacterCarouselManager } from './characterSelectionManager.js';
import { AchievementManager } from './achievementManager.js';

// Global reference to game instance
let gameInstance = null;
let menuManager = null;
let characterCarouselManager = null;
let achievementManager = null;

// Make start game function available globally immediately
window.startGame = () => {
    console.log('Global startGame called'); // Debug log
    if (gameInstance) {
        gameInstance.startGame();
    } else {
        console.log('Game instance not ready yet');
    }
};

// Debug function to add coins
window.addDebugCoins = async () => {
    console.log('Adding 10,000 debug coins...');
    if (gameInstance) {
        const gameState = gameInstance.getGameState();
        await gameState.addCoins(10000);
        
        // Check achievements after adding coins
        if (achievementManager) {
            await achievementManager.checkAchievements();
        }
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'debug-notification';
        notification.innerHTML = `
            <div class="debug-icon">💰</div>
            <div class="debug-text">
                <h3>Debug Coins Added!</h3>
                <p>+10,000 Coins</p>
                <small>Total: ${gameState.getCoins()} coins</small>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, #32CD32, #228B22);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInLeft 0.5s ease-out;
            max-width: 300px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Nunito', sans-serif;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        console.log('Debug coins added successfully');
    } else {
        console.log('Game instance not ready yet');
    }
};

// Initialize game when page loads
window.addEventListener('load', () => {
    try {
        console.log('Initializing game...');
        gameInstance = new Game();
        
        // Make character UI available globally for onclick handlers
        window.characterUI = gameInstance.getCharacterUI();
        
        // Initialize menu manager with a slight delay to ensure DOM is ready
        setTimeout(() => {
            try {
                menuManager = MenuManager.initialize(
                    gameInstance.getCharacterUI().getCharacterManager(),
                    gameInstance.getGameState()
                );
                
                // Initialize character carousel manager
                characterCarouselManager = new CharacterCarouselManager(
                    gameInstance.getCharacterUI().getCharacterManager()
                );
                
                // Initialize achievement manager
                achievementManager = new AchievementManager(gameInstance.getGameState());
                
                // Make achievement manager available globally for testing
                window.achievementManager = achievementManager;
                
                console.log('Menu manager, character carousel, and achievement manager initialized');
                
                // Update menu with initial character selection
                const currentCharacter = gameInstance.getCharacterUI().getCurrentCharacter();
                if (currentCharacter && menuManager) {
                    console.log('Updating menu bird display for:', currentCharacter.name);
                    menuManager.updateMenuBirdDisplay(currentCharacter);
                }
                
                // Update high score display
                const highScore = gameInstance.getGameState().getHighScore();
                menuManager.updateHighScore(highScore);
                
                // Listen for character changes
                document.addEventListener('characterChanged', (e) => {
                    if (menuManager) {
                        menuManager.updateMenuBirdDisplay(e.detail.character);
                    }
                });
                
                // Listen for game over events to check achievements
                document.addEventListener('gameOver', async (e) => {
                    if (achievementManager) {
                        await achievementManager.checkAchievements();
                    }
                });
                
                // Listen for game start events to check achievements
                document.addEventListener('startGame', async (e) => {
                    if (achievementManager) {
                        await achievementManager.checkAchievements();
                    }
                });
                
                // Initial silent achievement check (no notifications)
                if (achievementManager) {
                    (async () => {
                        await achievementManager.silentCheckAchievements();
                    })();
                }
                
                console.log('Game initialization complete');
            } catch (error) {
                console.error('Error initializing menu manager:', error);
            }
        }, 100);
        
    } catch (error) {
        console.error('Error initializing game:', error);
        // Fallback initialization
        gameInstance = new Game();
        window.characterUI = gameInstance.getCharacterUI();
    }
});
