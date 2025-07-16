/* Ability System - Handles character special abilities */
import { GAME_STATES } from './constants.js';

export class AbilityManager {
    constructor(game) {
        console.log('AbilityManager constructor called'); // Debug log
        this.game = game;
        this.activeAbility = null;
        this.cooldownTimer = 0;
        this.cooldownDuration = 30000; // 30 seconds in milliseconds
        this.lastActivation = 0;
        this.setupEventListeners();
        console.log('AbilityManager initialized'); // Debug log
    }

    setupEventListeners() {
        console.log('Setting up ability event listeners'); // Debug log
        
        // Listen for E key press
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key); // Debug log
            if (e.key === 'e' || e.key === 'E') {
                console.log('E key pressed - attempting to activate ability'); // Debug log
                this.activateAbility();
            }
        });
        
        console.log('Ability event listeners set up'); // Debug log
    }

    activateAbility() {
        console.log('activateAbility called, game state:', this.game.gameState.getState()); // Debug log
        
        if (this.game.gameState.getState() !== GAME_STATES.PLAYING) {
            console.log('Game not in PLAYING state, ability activation blocked'); // Debug log
            return;
        }
        
        const currentTime = Date.now();
        const timeSinceLastActivation = currentTime - this.lastActivation;
        
        console.log('Time since last activation:', timeSinceLastActivation, 'Cooldown:', this.cooldownDuration); // Debug log
        
        // Check if ability is on cooldown
        if (timeSinceLastActivation < this.cooldownDuration) {
            console.log('Ability on cooldown, remaining:', this.cooldownDuration - timeSinceLastActivation); // Debug log
            return;
        }

        const character = this.game.characterUI.getCurrentCharacter();
        console.log('Current character:', character ? character.name : 'None'); // Debug log
        
        if (!character) return;

        // Activate character-specific ability
        switch (character.id) {
            case 'red':
                this.activateRageMode();
                break;
            default:
                console.log(`No ability implemented for character: ${character.name}`);
                return;
        }

        this.lastActivation = currentTime;
        this.startCooldown();
    }

    activateRageMode() {
        console.log('Activating Rage Mode!');
        
        // Create rage mode ability
        this.activeAbility = {
            type: 'rage',
            startTime: Date.now(),
            duration: 8000, // 8 seconds
            originalSpeed: this.game.bird.velocity.y,
            speedMultiplier: 1.5,
            canSmashPipes: true,
            hasSmashed: false
        };

        // Apply rage mode effects
        this.game.bird.setRageMode(true);
        
        // Show visual feedback
        this.showAbilityActivation('🔥 RAGE MODE ACTIVATED!');
    }

    update() {
        // Update active ability
        if (this.activeAbility) {
            const currentTime = Date.now();
            const elapsed = currentTime - this.activeAbility.startTime;
            
            if (elapsed >= this.activeAbility.duration || this.activeAbility.hasSmashed) {
                this.deactivateAbility();
            }
        }

        // Update cooldown timer display
        this.updateCooldownDisplay();
    }

    deactivateAbility() {
        if (!this.activeAbility) return;

        console.log('Deactivating ability');
        
        // Remove rage mode effects
        if (this.activeAbility.type === 'rage') {
            this.game.bird.setRageMode(false);
        }

        this.activeAbility = null;
    }

    onPipeHit() {
        if (this.activeAbility && this.activeAbility.type === 'rage' && this.activeAbility.canSmashPipes) {
            console.log('Pipe smashed during rage mode!');
            this.activeAbility.hasSmashed = true;
            return true; // Pipe was smashed
        }
        return false; // Normal collision
    }

    startCooldown() {
        this.cooldownTimer = this.cooldownDuration;
        
        // Update UI to show cooldown
        const abilityTimer = document.getElementById('abilityTimer');
        if (abilityTimer) {
            abilityTimer.style.display = 'block';
        }
    }

    updateCooldownDisplay() {
        const currentTime = Date.now();
        const timeSinceLastActivation = currentTime - this.lastActivation;
        const remainingCooldown = Math.max(0, this.cooldownDuration - timeSinceLastActivation);
        
        const abilityCountdown = document.getElementById('abilityCountdown');
        const abilityTimer = document.getElementById('abilityTimer');
        
        console.log('updateCooldownDisplay called, elements found:', { abilityCountdown: !!abilityCountdown, abilityTimer: !!abilityTimer }); // Debug log
        
        if (!abilityCountdown || !abilityTimer) return;

        // Always show timer when game is playing
        if (this.game.gameState.getState() === GAME_STATES.PLAYING) {
            abilityTimer.style.display = 'block';
            
            if (remainingCooldown > 0) {
                const seconds = Math.ceil(remainingCooldown / 1000);
                abilityCountdown.textContent = `${seconds}s`;
                console.log('Ability on cooldown, showing timer:', seconds); // Debug log
            } else {
                abilityCountdown.textContent = 'Ready';
                console.log('Ability ready, showing timer'); // Debug log
            }
        } else {
            abilityTimer.style.display = 'none';
        }
    }

    showAbilityActivation(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 1000;
            animation: abilityNotification 2s ease-out forwards;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Add animation keyframes if not already added
        if (!document.getElementById('abilityAnimations')) {
            const style = document.createElement('style');
            style.id = 'abilityAnimations';
            style.textContent = `
                @keyframes abilityNotification {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); }
                    20% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
                    80% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    hideAbilityTimer() {
        const abilityTimer = document.getElementById('abilityTimer');
        if (abilityTimer) {
            abilityTimer.style.display = 'none';
        }
    }

    isRageModeActive() {
        return this.activeAbility && this.activeAbility.type === 'rage';
    }
}
