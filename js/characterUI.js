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
        
        // Special handling for Red's visual elements
        let avatarContent = '';
        if (character.id === 'red') {
            avatarContent = `
                <div class="eye"></div>
                <div class="beak"></div>
            `;
        }
        
        card.innerHTML = `
            <div class="character-avatar ${character.id}">
                ${avatarContent}
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
                <button class="character-btn info" onclick="characterUI.showCharacterInfo('${character.id}')">
                    <i class="fas fa-info-circle"></i> Info
                </button>
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
            }));        } else {
            this.showMessage(result.message, 'error');
        }
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `character-message ${type}`;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            animation: messageSlide 0.3s ease-out;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            if (message.parentNode) message.parentNode.removeChild(message);
        }, 2000);
    }

    showCharacterInfo(id) {
        const character = this.characterManager.getCharacter(id);
        if (!character) return;

        // Get ability info
        const abilityInfo = this.getAbilityInfo(character.id);
        
        // Special handling for Red's visual elements in info popup
        let avatarContent = '';
        if (character.id === 'red') {
            avatarContent = `
                <div class="eye"></div>
                <div class="beak"></div>
            `;
        }
        
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'character-info-overlay';
        overlay.innerHTML = `
            <div class="character-info-popup">
                <div class="character-info-header">
                    <div class="character-info-avatar ${character.id}">
                        ${avatarContent}
                    </div>
                    <div class="character-info-title">
                        <h2>${character.name}</h2>
                        <p class="character-subtitle">${character.description}</p>
                    </div>
                    <button class="close-info-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="character-info-content">
                    <div class="character-stats-detailed">
                        <h3><i class="fas fa-chart-bar"></i> Character Stats</h3>
                        <div class="stat-bars">
                            <div class="stat-bar">
                                <span class="stat-label">Speed</span>
                                <div class="stat-progress">
                                    <div class="stat-fill" style="width: ${character.stats.speed * 10}%"></div>
                                </div>
                                <span class="stat-number">${character.stats.speed}/10</span>
                            </div>
                            <div class="stat-bar">
                                <span class="stat-label">Power</span>
                                <div class="stat-progress">
                                    <div class="stat-fill" style="width: ${character.stats.power * 10}%"></div>
                                </div>
                                <span class="stat-number">${character.stats.power}/10</span>
                            </div>
                            <div class="stat-bar">
                                <span class="stat-label">Agility</span>
                                <div class="stat-progress">
                                    <div class="stat-fill" style="width: ${character.stats.agility * 10}%"></div>
                                </div>
                                <span class="stat-number">${character.stats.agility}/10</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="character-ability-info">
                        <h3><i class="fas fa-magic"></i> Special Ability: ${character.stats.special}</h3>
                        <div class="ability-details">
                            <div class="ability-description">
                                <p>${abilityInfo.description}</p>
                            </div>
                            <div class="ability-stats">
                                <div class="ability-stat">
                                    <i class="fas fa-clock"></i>
                                    <span class="ability-label">Duration:</span>
                                    <span class="ability-value">${abilityInfo.duration}</span>
                                </div>
                                <div class="ability-stat">
                                    <i class="fas fa-hourglass-half"></i>
                                    <span class="ability-label">Cooldown:</span>
                                    <span class="ability-value">${abilityInfo.cooldown}</span>
                                </div>
                                <div class="ability-stat">
                                    <i class="fas fa-keyboard"></i>
                                    <span class="ability-label">Activation:</span>
                                    <span class="ability-value">Press E during gameplay</span>
                                </div>
                            </div>
                            <div class="ability-effects">
                                <h4>Effects:</h4>
                                <ul>
                                    ${abilityInfo.effects.map(effect => `<li>${effect}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="character-gameplay-tips">
                        <h3><i class="fas fa-lightbulb"></i> Gameplay Tips</h3>
                        <ul>
                            ${abilityInfo.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    getAbilityInfo(characterId) {
        const abilityData = {
            red: {
                description: "Red enters an unstoppable rage mode, surrounded by a fierce dark red aura with lightning sparks. His anger fuels incredible power and speed!",
                duration: "8 seconds",
                cooldown: "30 seconds",
                effects: [
                    "🔥 150% increased falling speed",
                    "⚡ 100% stronger flap power",
                    "💥 Can smash through ONE pipe",
                    "🌟 Dramatic visual aura with particles",
                    "⚠️ Ability ends immediately after hitting a pipe"
                ],
                tips: [
                    "Use when approaching a difficult pipe section",
                    "Time your activation carefully - you only get one pipe smash",
                    "The speed boost makes you fall faster, so be ready to flap more",
                    "Best used when you have room to maneuver after the pipe smash"
                ]
            },
            chuck: {
                description: "Chuck's lightning-fast speed ability - coming soon!",
                duration: "Coming soon",
                cooldown: "Coming soon",
                effects: ["⚡ Not yet implemented"],
                tips: ["Stay tuned for Chuck's speed ability!"]
            },
            bomb: {
                description: "Bomb's explosive ability - coming soon!",
                duration: "Coming soon", 
                cooldown: "Coming soon",
                effects: ["💥 Not yet implemented"],
                tips: ["Stay tuned for Bomb's explosive ability!"]
            },
            blues: {
                description: "The Blues' triple split ability - coming soon!",
                duration: "Coming soon",
                cooldown: "Coming soon", 
                effects: ["🔵 Not yet implemented"],
                tips: ["Stay tuned for The Blues' split ability!"]
            },
            matilda: {
                description: "Matilda's unique resurrection ability! When she dies, two pipes ahead fall down and an egg drops from the sky to respawn her. This ability can only be used once per life.",
                duration: "One-time use per life",
                cooldown: "Resets 1 minute after death",
                effects: [
                    "🥚 Egg drops from sky when Matilda dies",
                    "🏗️ Two pipes ahead fall down",
                    "🔄 Automatic respawn at egg location",
                    "⏰ Ability resets 90 seconds after death",
                    "💀 Only works when Matilda dies"
                ],
                tips: [
                    "This is a passive ability - no manual activation needed",
                    "The ability only triggers when you die",
                    "Use it strategically - you only get one chance per life",
                    "The falling pipes clear your path ahead",
                    "Time your death carefully to maximize the advantage"
                ]
            }
        };
        
        return abilityData[characterId] || {
            description: "Special ability coming soon!",
            duration: "TBD",
            cooldown: "TBD",
            effects: ["Not yet implemented"],
            tips: ["Stay tuned for updates!"]
        };
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
