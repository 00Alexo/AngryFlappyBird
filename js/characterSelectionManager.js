/* Character Carousel Display Manager */
export class CharacterCarouselManager {
    constructor(characterManager) {
        this.characterManager = characterManager;
        this.carouselTrack = null;
        this.init();
    }

    init() {
        this.setupCarousel();
        this.updateCarousel();
        
        // Listen for character changes to update the carousel
        document.addEventListener('characterChanged', () => {
            this.updateCarousel();
        });
    }

    setupCarousel() {
        this.carouselTrack = document.getElementById('characterCarouselTrack');
        if (!this.carouselTrack) {
            console.error('Character carousel track not found');
            return;
        }
    }

    updateCarousel() {
        if (!this.carouselTrack) return;

        const characters = this.characterManager.getAllCharacters();
        const currentCharacter = this.characterManager.getCurrentCharacter();
        
        // Clear existing characters
        this.carouselTrack.innerHTML = '';

        // Create double set of characters for seamless looping
        const doubleCharacters = [...characters, ...characters];
        
        doubleCharacters.forEach(character => {
            const characterElement = document.createElement('div');
            characterElement.className = 'carousel-character';
            
            // Add character-specific styling
            characterElement.classList.add(`carousel-bird-${character.id}`);
            
            // Mark current character
            if (character.id === currentCharacter.id) {
                characterElement.classList.add('current');
            }
            
            // Mark locked characters
            if (!character.owned) {
                characterElement.classList.add('locked');
            }
            let birdVisualContent = `<div class="carousel-bird-visual"></div>`;
            if (character.id === 'red') {
                birdVisualContent = `
                    <div class="carousel-bird-visual">
                        <div class="eye"></div>
                        <div class="beak"></div>
                    </div>
                `;
            } else if (character.id === 'stella') {
                birdVisualContent = `
                    <div class="carousel-bird-visual">
                        <div class="bubble"></div>
                        <div class="stella-eye"></div>
                    </div>
                `;
            }

            characterElement.innerHTML = birdVisualContent;

            this.carouselTrack.appendChild(characterElement);
        });
    }

    hide() {
        const carouselDisplay = document.querySelector('.character-carousel-display');
        if (carouselDisplay) {
            carouselDisplay.style.display = 'none';
        }
    }

    show() {
        const carouselDisplay = document.querySelector('.character-carousel-display');
        if (carouselDisplay) {
            carouselDisplay.style.display = 'block';
        }
    }
}
