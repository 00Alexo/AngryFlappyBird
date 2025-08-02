/* Character Management */
export class CharacterManager {
    constructor() {
        this.characters = {
            stella: {
                id: 'stella',
                name: 'Stella',
                description: 'The pink bird with bubble shield powers',
                price: 180,
                owned: false,
                stats: {
                    speed: 7,
                    power: 5,
                    agility: 9,
                    special: 'Bubble Shield'
                },
                colors: {
                    body: '#FF1493',        // Deep pink
                    secondary: '#DC143C',   // Crimson for shadows
                    accent: '#FFB6C1',      // Light pink for highlights
                    beak: '#FFA500',       // Orange beak
                    eyebrow: '#8B008B',    // Dark magenta for eyebrows
                    belly: '#FFCCCB',      // Light coral belly
                    bubble: '#FFE4E1'      // Misty rose for bubbles
                }
            },
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
                    body: '#DC143C',        // Deeper, darker red (Crimson)
                    secondary: '#8B0000',   // Very dark red for shadows
                    accent: '#FF6347',      // Tomato red for highlights
                    beak: '#FFA500',       // Orange beak
                    eyebrow: '#2F1B14',    // Very dark brown/black for angry eyebrows
                    belly: '#F5F5F5'       // Off-white for belly
                }
            },
            chuck: {
                id: 'chuck',
                name: 'Chuck',
                description: 'The lightning-fast triangular speedster',
                price: 100,
                owned: false,
                stats: {
                    speed: 10,
                    power: 6,
                    agility: 7,
                    special: 'Triangle Dash'
                },
                colors: {
                    body: '#FFA500',        // Darker orange-yellow
                    secondary: '#FF8C00',   // Dark orange for shadows
                    accent: '#FFD700',      // Gold for highlights
                    beak: '#FF4500',       // Orange-red beak
                    eyebrow: '#B8860B',    // Dark goldenrod for eyebrows
                    belly: '#FFFF99'       // Light yellow belly
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
                    body: '#2F2F2F',        // Dark gray instead of pure black
                    secondary: '#1C1C1C',   // Very dark gray for shadows
                    accent: '#FF6B35',      // Orange-red for fuse and accents
                    beak: '#FFA500',       // Orange beak
                    eyebrow: '#0D0D0D',    // Almost black for eyebrows
                    fuse: '#8B4513',       // Brown fuse
                    belly: '#404040'       // Slightly lighter gray belly
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
                    body: '#4169E1',        // Royal blue
                    secondary: '#1E3A8A',   // Dark blue for shadows
                    accent: '#87CEEB',      // Sky blue for highlights
                    beak: '#FFA500',       // Orange beak
                    eyebrow: '#191970',    // Midnight blue for eyebrows
                    belly: '#E6F3FF'       // Very light blue belly
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
                    body: '#F8F8FF',        // Ghost white
                    secondary: '#DCDCDC',   // Gainsboro for shadows
                    accent: '#FFD700',      // Gold for accents
                    beak: '#FFA500',       // Orange beak
                    eyebrow: '#8B4513',    // Saddle brown for eyebrows
                    belly: '#FFFAFA',      // Snow white belly
                    crest: '#D2691E'       // Chocolate brown for head crest
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
            speed: character.stats.speed / 6, // More balanced speed differences
            power: character.stats.power / 8, // More balanced power differences
            agility: character.stats.agility / 6 // More balanced agility differences (Red: 6/6 = 1.0)
        };
    }
}
