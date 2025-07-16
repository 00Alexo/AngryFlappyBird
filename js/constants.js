// Game constants
export const CANVAS_WIDTH = window.innerWidth;
export const CANVAS_HEIGHT = window.innerHeight;
export const GRAVITY = 0.4;
export const FLAP_STRENGTH = -7;
export const PIPE_WIDTH = 80;
export const PIPE_GAP = 180;
export const PIPE_SPEED = 2;
export const BIRD_SIZE = 40;

// Game states
export const GAME_STATES = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Storage keys
export const STORAGE_KEYS = {
    HIGH_SCORE: 'angryFlappyHighScore',
    COINS: 'angryFlappyCoins'
};

// Game mechanics
export const GAME_MECHANICS = {
    COINS_PER_POINT: 3
};

// Colors
export const COLORS = {
    BACKGROUND: {
        SKY_TOP: '#87CEEB',
        SKY_MID: '#4A90E2',
        GROUND_TOP: '#228B22',
        GROUND_BOTTOM: '#006400',
        DIRT_TOP: '#8B4513',
        DIRT_MID: '#A0522D',
        DIRT_BOTTOM: '#654321',
        GRASS: '#228B22'
    },
    BIRD: {
        BODY_LIGHT: '#FF6B35',
        BODY_MID: '#FF4500',
        BODY_DARK: '#CC3300',
        WING: '#FF8C00',
        BEAK: '#FFD700',
        BEAK_OUTLINE: '#FFA500',
        EYE_WHITE: 'white',
        EYE_BLACK: 'black',
        EYEBROW: '#8B0000',
        OUTLINE: '#B22222',
        TRAIL: '#FF6B35'
    },
    PIPE: {
        NORMAL: '#90EE90',        // Light green for pig structures
        HIGHLIGHT: '#98FB98',     // Lighter green when highlighted
        SHADOW: '#228B22',        // Dark green shadow
        HIGHLIGHT_SHADOW: '#32CD32', // Highlighted shadow
        SHINE: '#F0FFF0',         // Very light green shine
        PIG_PINK: '#FFB6C1',      // Light pink for pig elements
        PIG_PINK_DARK: '#FF69B4', // Darker pink for pig details
        PIG_GREEN: '#9ACD32',     // Yellow-green for pig buildings
        PIG_SNOUT: '#FFC0CB',     // Pink for pig snouts
        PIG_EYE: '#000000',       // Black for pig eyes
        PIG_EYE_WHITE: '#FFFFFF', // White for pig eye highlights
        WOOD: '#8B4513',          // Brown for wooden elements
        WOOD_DARK: '#654321'      // Dark brown for wood shadows
    },
    PARTICLES: {
        SCORE: '#FFD700',
        FLAP_MIN: 15,
        FLAP_MAX: 75
    }
};
