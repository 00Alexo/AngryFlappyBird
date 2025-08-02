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
            characterElement.className = `carousel-character ${character.id}`;
            
            // Mark current character
            if (character.id === currentCharacter.id) {
                characterElement.classList.add('current');
            }
            
            // Mark locked characters
            if (!character.owned) {
                characterElement.classList.add('locked');
            }
            
            // Create the same structure as character selection screen
            let avatarContent = '';
            if (character.id === 'stella') {
                avatarContent = `
                    <div class="bubble"></div>
                    <div class="eye"></div>
                    <div class="beak"></div>
                `;
            } else if (character.id === 'chuck') {
                // Special triangular Chuck with custom positioned elements
                avatarContent = `
                    <div class="chuck-triangle-body"></div>
                    <div class="chuck-triangle-belly"></div>
                    <div class="chuck-triangle-eyes"></div>
                    <div class="chuck-triangle-beak"></div>
                    <div class="chuck-triangle-eyebrow"></div>
                `;
            } else if (character.id === 'blues') {
                // The Blues - Three birds with eyes and beaks
                avatarContent = `
                    <div class="blues-eyes"></div>
                    <div class="blues-beaks"></div>
                `;
            } else {
                // All other characters get standard eyes and beak
                avatarContent = `
                    <div class="eye"></div>
                    <div class="beak"></div>
                `;
            }
            
            characterElement.innerHTML = `
                <div class="character-avatar ${character.id}">
                    ${avatarContent}
                </div>
            `;

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
