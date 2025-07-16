import { Game } from './game.js';
import { MenuManager } from './menuManager.js';
import { CharacterCarouselManager } from './characterSelectionManager.js';

// Global reference to game instance
let gameInstance = null;
let menuManager = null;
let characterCarouselManager = null;

// Make start game function available globally immediately
window.startGame = () => {
    console.log('Global startGame called'); // Debug log
    if (gameInstance) {
        gameInstance.startGame();
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
                
                console.log('Menu manager and character carousel initialized');
                
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
