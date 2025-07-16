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
