/* Menu Manager - Handles menu updates and animations */
export class MenuManager {
    constructor(characterManager, gameState) {
        this.characterManager = characterManager;
        this.gameState = gameState;
        this.init();
    }

    init() {
        this.setupMenuUpdates();
        this.setupAnimations();
        this.populateCharacterGallery();
        this.updateCoinsDisplay();
    }

    setupMenuUpdates() {
        // Update menu when character changes
        document.addEventListener('characterChanged', (event) => {
            this.updateMenuBirdDisplay(event.detail.character);
            this.updateCharacterGallery();
            this.updateCoinsDisplay();
        });
    }

    setupAnimations() {
        // Add particle effects and enhanced animations
        this.createFloatingParticles();
        this.setupInteractiveAnimations();
    }

    populateCharacterGallery() {
        const showcase = document.getElementById('birdsShowcase');
        if (!showcase) return;

        const allCharacters = this.characterManager.getAllCharacters();
        const selectedChar = this.characterManager.selectedCharacter;

        showcase.innerHTML = '';

        allCharacters.forEach(character => {
            const birdElement = document.createElement('div');
            birdElement.className = `showcase-bird ${character.id}`;
            
            // Add status classes
            if (character.owned) {
                birdElement.classList.add('owned');
            } else {
                birdElement.classList.add('locked');
            }
            
            if (character.id === selectedChar) {
                birdElement.classList.add('selected');
            }

            // Use the sprite for better representation
            birdElement.innerHTML = `
                ${character.sprite || character.icon}
                <div class="showcase-bird-tooltip">
                    ${character.name}
                    ${character.owned ? '' : `<br>💰 ${character.price}`}
                </div>
            `;

            // Add click handler
            birdElement.addEventListener('click', () => {
                this.handleBirdClick(character);
            });

            showcase.appendChild(birdElement);
        });
    }

    handleBirdClick(character) {
        if (character.owned) {
            // Select the character
            if (this.characterManager.selectCharacter(character.id)) {
                this.showBirdMessage(`${character.name} selected!`, 'success');
                
                // Dispatch event to update other parts of the UI
                document.dispatchEvent(new CustomEvent('characterChanged', {
                    detail: { character }
                }));
            }
        } else {
            // Show purchase dialog or redirect to character screen
            this.showBirdMessage(`${character.name} costs ${character.price} points`, 'info');
            
            // Optionally open character selection screen
            setTimeout(() => {
                if (window.characterUI) {
                    window.characterUI.showCharacterScreen();
                }
            }, 1000);
        }
    }

    updateCharacterGallery() {
        const showcase = document.getElementById('birdsShowcase');
        if (!showcase) return;

        const selectedChar = this.characterManager.selectedCharacter;
        const birds = showcase.querySelectorAll('.showcase-bird');

        birds.forEach(bird => {
            const birdId = bird.className.split(' ').find(cls => 
                this.characterManager.characters[cls]
            );
            
            if (birdId) {
                const character = this.characterManager.characters[birdId];
                
                // Update ownership status
                bird.classList.toggle('owned', character.owned);
                bird.classList.toggle('locked', !character.owned);
                
                // Update selection status
                bird.classList.toggle('selected', birdId === selectedChar);
            }
        });
    }

    showBirdMessage(text, type = 'info') {
        // Create temporary message element
        const message = document.createElement('div');
        message.className = `bird-message ${type}`;
        message.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#FF4444'};
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            font-size: 1.1rem;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: birdMessageSlide 0.3s ease-out;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    updateMenuBirdDisplay(character) {
        if (!character) {
            console.warn('No character provided to updateMenuBirdDisplay');
            return;
        }

        const birdAvatar = document.getElementById('menuBirdAvatar');
        const birdName = document.getElementById('menuBirdName');
        const birdSpecial = document.getElementById('menuBirdSpecial');
        const menuPoints = document.getElementById('menuPoints');

        if (birdAvatar) {
            // Clear existing content
            birdAvatar.innerHTML = '';
            
            // Remove all existing bird classes
            birdAvatar.classList.remove('red', 'chuck', 'bomb', 'blues', 'matilda');
            
            // Add the specific bird class
            birdAvatar.classList.add(character.id);
            
            // Create the bird visual based on character type
            const birdVisual = document.createElement('div');
            birdVisual.className = `bird-visual-${character.id}`;
            birdAvatar.appendChild(birdVisual);
            
            // Reset animation
            birdAvatar.style.animation = 'none';
            birdAvatar.offsetHeight; // Trigger reflow
            birdAvatar.style.animation = 'birdHover 2s ease-in-out infinite';
            
            // Update background gradient based on character
            if (character.colors && character.colors.body) {
                birdAvatar.style.background = `linear-gradient(135deg, ${character.colors.body}, ${character.colors.secondary})`;
            }
        }

        if (birdName) {
            birdName.textContent = character.name;
            if (character.colors && character.colors.body) {
                birdName.style.color = character.colors.body;
            }
        }

        if (birdSpecial) {
            birdSpecial.textContent = character.stats ? character.stats.special : 'Special Power';
        }

        if (menuPoints && this.gameState) {
            menuPoints.textContent = this.gameState.getCoins();
        }

        // Add selection effect
        this.playSelectionAnimation();
    }

    updateCoinsDisplay() {
        const menuPoints = document.getElementById('menuPoints');
        if (menuPoints && this.gameState) {
            menuPoints.textContent = this.gameState.getCoins();
        }
    }

    playSelectionAnimation() {
        const birdDisplay = document.querySelector('.current-bird-display');
        if (birdDisplay) {
            birdDisplay.style.animation = 'none';
            birdDisplay.offsetHeight;
            birdDisplay.style.animation = 'selectionFlash 0.5s ease-out';
        }
    }

    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'floating-particles';
        particleContainer.innerHTML = `
            <div class="particle particle-1">✨</div>
            <div class="particle particle-2">⭐</div>
            <div class="particle particle-3">💫</div>
            <div class="particle particle-4">🌟</div>
            <div class="particle particle-5">✨</div>
        `;
        
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.appendChild(particleContainer);
        }
    }

    setupInteractiveAnimations() {
        // Add hover effects to bird avatar
        const birdAvatar = document.getElementById('menuBirdAvatar');
        if (birdAvatar) {
            birdAvatar.addEventListener('mouseenter', () => {
                birdAvatar.style.transform = 'scale(1.3) rotate(15deg)';
            });

            birdAvatar.addEventListener('mouseleave', () => {
                birdAvatar.style.transform = 'scale(1) rotate(0deg)';
            });

            birdAvatar.addEventListener('click', () => {
                this.playBirdClickAnimation();
            });
        }

        // Add enhanced button hover effects
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.playButtonHoverAnimation(e.target);
            });

            button.addEventListener('click', (e) => {
                this.playButtonClickAnimation(e.target);
            });
        });
    }

    playBirdClickAnimation() {
        const birdAvatar = document.getElementById('menuBirdAvatar');
        if (birdAvatar) {
            birdAvatar.style.animation = 'none';
            birdAvatar.offsetHeight;
            birdAvatar.style.animation = 'birdClickBounce 0.6s ease-out';
        }
    }

    playButtonHoverAnimation(button) {
        const shine = button.querySelector('.button-shine');
        if (shine) {
            shine.style.animation = 'none';
            shine.offsetHeight;
            shine.style.animation = 'buttonShineHover 0.6s ease-out';
        }
    }

    playButtonClickAnimation(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    updateHighScore(score) {
        const startHighScore = document.getElementById('startHighScore');
        if (startHighScore) {
            startHighScore.textContent = score;
            // Add score update animation
            startHighScore.style.animation = 'scoreUpdate 0.5s ease-out';
        }
    }

    showNewHighScoreEffect() {
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            scoreDisplay.style.animation = 'newHighScoreGlow 1s ease-in-out 3';
        }
    }

    // Initialize menu when game starts
    static initialize(characterManager, gameState) {
        return new MenuManager(characterManager, gameState);
    }
}

// Add additional CSS animations for the menu manager
const additionalStyles = `
@keyframes selectionFlash {
    0% { background: rgba(255, 255, 255, 0.2); }
    50% { background: rgba(255, 215, 0, 0.4); }
    100% { background: rgba(255, 255, 255, 0.2); }
}

@keyframes birdClickBounce {
    0% { transform: scale(1) rotate(0deg); }
    30% { transform: scale(1.5) rotate(20deg); }
    60% { transform: scale(1.2) rotate(-10deg); }
    100% { transform: scale(1) rotate(0deg); }
}

@keyframes scoreUpdate {
    0% { transform: scale(1); color: inherit; }
    50% { transform: scale(1.2); color: #FFD700; }
    100% { transform: scale(1); color: inherit; }
}

@keyframes birdMessageSlide {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.floating-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.particle {
    position: absolute;
    font-size: 1.5rem;
    animation: floatParticle 8s linear infinite;
}

.particle-1 {
    left: 10%;
    animation-delay: 0s;
}

.particle-2 {
    left: 20%;
    animation-delay: 2s;
}

.particle-3 {
    left: 70%;
    animation-delay: 4s;
}

.particle-4 {
    left: 80%;
    animation-delay: 6s;
}

.particle-5 {
    left: 50%;
    animation-delay: 1s;
}

@keyframes floatParticle {
    0% {
        transform: translateY(110vh) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-10vh) rotate(360deg);
        opacity: 0;
    }
}
`;

// Inject additional styles when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
});
