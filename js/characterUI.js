/* Character Selection UI */
import { CharacterManager } from './characterManager.js';

export class CharacterUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.characterManager = new CharacterManager();
        this.characterScreen = null;
        this.init();
    }
    
    init() {
        this.createCharacterScreen();
        // Remove the bindEvents call since we handle events in other methods
    }
    
    createCharacterScreen() {
        this.characterScreen = document.createElement('div');
        this.characterScreen.id = 'characterScreen';
        this.characterScreen.innerHTML = `
            <div class="character-header">
                <h1><i class="fas fa-users"></i> Choose Your Bird</h1>
                <p>Select your angry bird and unlock new characters with coins!</p>
            </div>
            <div class="character-grid" id="characterGrid">
                <!-- Characters will be populated here -->
            </div>
            <div class="character-nav">
                <button class="menu-btn" onclick="window.characterUI.closeCharacterScreen()">
                    <i class="fas fa-arrow-left"></i> Back to Menu
                </button>
            </div>
        `;
        document.body.appendChild(this.characterScreen);
        
        // Make available globally for onclick handlers
        window.characterUI = this;
        
        console.log('Character screen created and characterUI set globally');
    }
    
    populateCharacters() {
        const grid = document.getElementById('characterGrid');
        if (!grid) return;
        
        const characters = this.characterManager.getAllCharacters();
        const currentCoins = this.gameState.getCoins();
        const selectedChar = this.characterManager.selectedCharacter;
        
        grid.innerHTML = '';
        
        characters.forEach(character => {
            const card = this.createCharacterCard(character, currentCoins, selectedChar);
            grid.appendChild(card);
        });
    }
    
    createCharacterCard(character, playerCoins, selectedChar) {
        const card = document.createElement('div');
        card.className = `character-card ${character.owned ? 'owned' : 'locked'}`;
        
        if (character.id === selectedChar) {
            card.classList.add('selected');
        }
        
        const canBuy = this.characterManager.canBuyCharacter(character.id, playerCoins);
        const isSelected = character.id === selectedChar;
        
        card.innerHTML = `
            <div class="character-avatar ${character.id}">
                <div class="bird-visual-${character.id}"></div>
            </div>
            <div class="character-info">
                <h3>${character.name}</h3>
                <p>${character.description}</p>
                <div class="character-stats">
                    <div class="stat">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${character.stats.speed}/10</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Power</span>
                        <span class="stat-value">${character.stats.power}/10</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Agility</span>
                        <span class="stat-value">${character.stats.agility}/10</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Special</span>
                        <span class="stat-value">${character.stats.special}</span>
                    </div>
                </div>
                ${!character.owned ? `
                    <div class="price">
                        <i class="fas fa-coins"></i> ${character.price}
                    </div>
                ` : ''}
            </div>
            <div class="character-actions">
                ${this.getCharacterButtons(character, canBuy, isSelected)}
            </div>
        `;
        
        return card;
    }
    
    getCharacterButtons(character, canBuy, isSelected) {
        if (character.owned) {
            if (isSelected) {
                return `
                    <button class="character-btn select" disabled>
                        <i class="fas fa-check"></i> Selected
                    </button>
                `;
            } else {
                return `
                    <button class="character-btn select" onclick="characterUI.selectCharacter('${character.id}')">
                        <i class="fas fa-hand-pointer"></i> Select
                    </button>
                `;
            }
        } else {
            return `
                <button class="character-btn buy" ${canBuy ? '' : 'disabled'} 
                        onclick="characterUI.buyCharacter('${character.id}')">
                    <i class="fas fa-shopping-cart"></i> 
                    ${canBuy ? 'Buy' : 'Not Enough Coins'}
                </button>
            `;
        }
    }
    
    selectCharacter(id) {
        if (this.characterManager.selectCharacter(id)) {
            this.showMessage(`${this.characterManager.getCharacter(id).name} selected!`, 'success');
            this.populateCharacters();
            
            // Dispatch event to update menu
            const character = this.characterManager.getCurrentCharacter();
            document.dispatchEvent(new CustomEvent('characterChanged', {
                detail: { character }
            }));
        }
    }
    
    buyCharacter(id) {
        const currentCoins = this.gameState.getCoins();
        const result = this.characterManager.buyCharacter(id, currentCoins);
        
        if (result.success) {
            // Deduct coins from player's balance
            this.gameState.spendCoins(result.cost);
            this.showMessage(result.message, 'success');
            this.populateCharacters();
            
            // Dispatch event to update menu
            const character = this.characterManager.getCurrentCharacter();
            document.dispatchEvent(new CustomEvent('characterChanged', {
                detail: { character }
            }));
        } else {
            this.showMessage(result.message, 'error');
        }
    }
    
    showMessage(text, type = 'info') {
        // Create temporary message element
        const message = document.createElement('div');
        message.className = `character-message ${type}`;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#4CAF50' : '#FF4444'};
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 1000;
            animation: messageSlide 0.3s ease-out;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
    
    showCharacterScreen() {
        this.characterScreen.style.display = 'block';
        this.populateCharacters();
        
        // Add CSS animation keyframes if not already added
        if (!document.getElementById('characterAnimations')) {
            const style = document.createElement('style');
            style.id = 'characterAnimations';
            style.textContent = `
                @keyframes messageSlide {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                    50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    closeCharacterScreen() {
        this.characterScreen.style.display = 'none';
    }
    
    getCurrentCharacter() {
        return this.characterManager.getCurrentCharacter();
    }
    
    getCharacterManager() {
        return this.characterManager;
    }
}
