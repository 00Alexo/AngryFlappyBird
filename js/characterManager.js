/* Character Management */
export class CharacterManager {
    constructor() {
        this.characters = {
            red: {
                id: 'red',
                name: 'Red',
                description: 'The leader of the flock with explosive temper',
                price: 0,
                owned: true,
                stats: {
                    speed: 5,
                    power: 8,
                    agility: 6,
                    special: 'Rage Mode'
                },
                colors: {
                    body: '#FF4444',
                    secondary: '#CC0000',
                    accent: '#FFAA00',
                    beak: '#FFA500',
                    eyebrow: '#8B0000'
                }
            },
            chuck: {
                id: 'chuck',
                name: 'Chuck',
                description: 'The triangular yellow speedster',
                price: 100,
                owned: false,
                stats: {
                    speed: 10,
                    power: 6,
                    agility: 7,
                    special: 'Triangle Dash'
                },
                colors: {
                    body: '#FFD700',
                    secondary: '#FFA500',
                    accent: '#FFFF99',
                    beak: '#FF8C00',
                    eyebrow: '#B8860B'
                }
            },
            bomb: {
                id: 'bomb',
                name: 'Bomb',
                description: 'The explosive black bird with short fuse',
                price: 200,
                owned: false,
                stats: {
                    speed: 4,
                    power: 10,
                    agility: 5,
                    special: 'Explosion'
                },
                colors: {
                    body: '#333333',
                    secondary: '#000000',
                    accent: '#FF4444',
                    beak: '#FFA500',
                    eyebrow: '#8B0000'
                }
            },
            blues: {
                id: 'blues',
                name: 'The Blues',
                description: 'Jay, Jake & Jim - Three times the trouble',
                price: 150,
                owned: false,
                stats: {
                    speed: 9,
                    power: 4,
                    agility: 8,
                    special: 'Triple Split'
                },
                colors: {
                    body: '#4A90E2',
                    secondary: '#0066CC',
                    accent: '#87CEEB',
                    beak: '#FFA500',
                    eyebrow: '#003366'
                }
            },
            matilda: {
                id: 'matilda',
                name: 'Matilda',
                description: 'The White Bird - Drops explosive eggs',
                price: 250,
                owned: false,
                stats: {
                    speed: 5,
                    power: 8,
                    agility: 7,
                    special: 'Egg Bomb'
                },
                colors: {
                    body: '#FFFFFF',
                    secondary: '#E0E0E0',
                    accent: '#FFD700',
                    beak: '#FFA500',
                    eyebrow: '#8B4513'
                }
            }
        };
        
        this.selectedCharacter = 'red';
        this.loadCharacterData();
    }
    
    loadCharacterData() {
        const savedData = localStorage.getItem('angryFlappyCharacters');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Update ownership status
            Object.keys(data.owned || {}).forEach(charId => {
                if (this.characters[charId]) {
                    this.characters[charId].owned = data.owned[charId];
                }
            });
            this.selectedCharacter = data.selected || 'red';
        }
    }
    
    saveCharacterData() {
        const data = {
            owned: {},
            selected: this.selectedCharacter
        };
        
        Object.keys(this.characters).forEach(charId => {
            data.owned[charId] = this.characters[charId].owned;
        });
        
        localStorage.setItem('angryFlappyCharacters', JSON.stringify(data));
    }
    
    getCharacter(id) {
        return this.characters[id];
    }
    
    getCurrentCharacter() {
        return this.characters[this.selectedCharacter];
    }
    
    selectCharacter(id) {
        if (this.characters[id] && this.characters[id].owned) {
            this.selectedCharacter = id;
            this.saveCharacterData();
            return true;
        }
        return false;
    }
    
    buyCharacter(id, playerCoins) {
        const character = this.characters[id];
        if (!character || character.owned) {
            return { success: false, message: 'Character not available' };
        }
        
        if (playerCoins < character.price) {
            return { success: false, message: 'Insufficient coins' };
        }
        
        character.owned = true;
        this.saveCharacterData();
        
        return { 
            success: true, 
            message: `${character.name} purchased!`,
            cost: character.price
        };
    }
    
    canBuyCharacter(id, playerCoins) {
        const character = this.characters[id];
        return character && !character.owned && playerCoins >= character.price;
    }
    
    getOwnedCharacters() {
        return Object.values(this.characters).filter(char => char.owned);
    }
    
    getAvailableCharacters() {
        return Object.values(this.characters).filter(char => !char.owned);
    }
    
    getAllCharacters() {
        return Object.values(this.characters);
    }
    
    getCharacterStats(id) {
        const character = this.characters[id];
        return character ? character.stats : null;
    }
    
    // Get character multipliers for gameplay
    getCharacterMultipliers(id) {
        const character = this.characters[id];
        if (!character) return { speed: 1, power: 1, agility: 1 };
        
        return {
            speed: character.stats.speed / 5, // More balanced speed differences
            power: character.stats.power / 6, // More balanced power differences
            agility: character.stats.agility / 5 // More balanced agility differences
        };
    }
}
