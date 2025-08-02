/* Ability System - Handles character special abilities */
import { GAME_STATES } from './constants.js';

// Egg Bomb class for Matilda's ability
class EggBomb {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.velocity = { x: 0, y: 0 };
        this.gravity = 0.4;
        this.size = 15;
        this.rotation = 0;
        this.trail = []; // Trail effect
    }

    update() {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) {
            this.trail.shift();
        }

        // Apply gravity
        this.velocity.y += this.gravity;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Update rotation for visual effect
        this.rotation += 0.1;
        
        // Check if egg has landed (reached ground or sufficient depth)
        if (this.y >= this.game.renderer.canvas.height - 100) {
            // Create egg bomb explosion particles
            this.game.particleSystem.addEggBombParticles(this.x, this.y);
            return true; // Egg has landed
        }
        
        return false;
    }

    draw(ctx) {
        ctx.save();
        
        // Draw trail
        this.trail.forEach((point, index) => {
            const alpha = (index + 1) / this.trail.length * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFE4B5'; // Moccasin color
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw egg shape
        ctx.fillStyle = '#FFFAF0'; // Floral white
        ctx.strokeStyle = '#DEB887'; // Burlywood
        ctx.lineWidth = 2;
        
        // Egg body (oval)
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Add some spots for detail
        ctx.fillStyle = '#F5DEB3'; // Wheat
        ctx.beginPath();
        ctx.ellipse(-5, -8, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(4, 2, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class AbilityManager {
    constructor(game) {
        console.log('AbilityManager constructor called'); // Debug log
        this.game = game;
        this.activeAbility = null;
        this.cooldownTimer = 0;
        this.cooldownDuration = 30000; // 30 seconds in milliseconds
        this.lastActivation = 0;
        
        // Matilda's Egg Bomb ability state
        this.matildaResurrectionUsed = false;
        this.matildaLastDeath = 0;
        this.matildaResurrectionCooldown = 90000; // 90 seconds (1.5 minutes)
        this.eggBomb = null; // Current falling egg
        
        // Game freeze state for dramatic effect
        this.gameFrozen = false;
        this.freezeEndTime = 0;
        this.freezeOverlay = null;
        this.frozenBirdVelocity = null;
        
        // Blues' Triple Bird ability state
        this.bluesBirdCount = 3; // Start with 3 birds (Jim, Jake, Jay)
        this.bluesMaxBirds = 3; // Maximum 3 birds (Jim, Jake, Jay)
        this.bluesSpawnInterval = 150000; // 150 seconds = 2.5 minutes
        this.bluesLastSpawn = 0; // When the last bird was spawned
        this.bluesGameStartTime = 0; // When the game started (for spawn timing)
        
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

        // Get current character
        const character = this.game.characterUI.getCurrentCharacter();
        console.log('Current character:', character ? character.name : 'None'); // Debug log
        if (!character) return;

        // Set cooldown duration for Red
        if (character.id === 'red') {
            this.cooldownDuration = 40000; // 40 seconds
        } else {
            this.cooldownDuration = 30000; // Default 30 seconds
        }

        // Prevent activation if ability is currently active
        if (this.activeAbility) {
            console.log('Ability is currently active, cannot activate again.');
            return;
        }

        // Check if ability is on cooldown
        if (timeSinceLastActivation < this.cooldownDuration) {
            console.log('Ability on cooldown, remaining:', this.cooldownDuration - timeSinceLastActivation); // Debug log
            return;
        }

        // Activate character-specific ability
        switch (character.id) {
            case 'red':
                this.activateRageMode();
                break;
            case 'blues':
                // Blues' ability is passive - no manual activation needed
                console.log('The Blues\' triple bird ability is passive - manages bird count automatically');
                return;
            case 'matilda':
                // Matilda's ability is passive - only activated on death
                console.log('Matilda\'s Egg Bomb is a passive ability - activates on death');
                return;
            default:
                console.log(`No ability implemented for character: ${character.name}`);
                return;
        }
        // Do NOT start cooldown here; will start after ability ends
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
        
        // Show duration countdown
        this.showDurationDisplay('RAGE MODE');
    }

    update() {
        // Update active ability
        if (this.activeAbility) {
            const currentTime = Date.now();
            const elapsed = currentTime - this.activeAbility.startTime;
            const remaining = this.activeAbility.duration - elapsed;
            
            // Update duration countdown display
            this.updateDurationDisplay(remaining);
            
            if (elapsed >= this.activeAbility.duration || this.activeAbility.hasSmashed) {
                this.deactivateAbility();
            }
        }

        // Update egg bomb if active (for visual effect only now)
        if (this.eggBomb) {
            const landed = this.eggBomb.update();
            if (landed) {
                // Just create explosion effect, respawn already happened
                this.game.particleSystem.addEggBombParticles(this.eggBomb.x, this.eggBomb.y);
                this.eggBomb = null;
            }
        }

        // Update freeze state and countdown
        if (this.gameFrozen) {
            const now = Date.now();
            const remaining = this.freezeEndTime - now;
            
            console.log(`Freeze remaining: ${remaining}ms, frozen: ${this.gameFrozen}`);
            
            // Update countdown display
            this.updateFreezeCountdown(remaining);
            
            // Check if freeze time has expired
            if (remaining <= 0) {
                console.log('🔓 Freeze time expired, calling unfreezeGame()');
                this.unfreezeGame();
            }
        }

        // Update Blues' triple bird system
        this.updateBluesAbility();

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

        // Hide duration display
        this.hideDurationDisplay();

        // Start cooldown now
        this.lastActivation = Date.now();
        this.startCooldown();
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
        // If Blues is active, let the Blues display handle the timer
        if (this.isBluesActive()) {
            return;
        }
        
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
            
            // Get current character to handle different ability types
            const character = this.game.characterUI.getCurrentCharacter();
            
            // Check if ability is currently active
            if (this.activeAbility) {
                abilityCountdown.textContent = 'In Use';
                console.log('Ability in use, showing "In Use"'); // Debug log
            } else if (character && character.id === 'matilda') {
                // Handle Matilda's resurrection cooldown
                const timeSinceLastDeath = currentTime - this.matildaLastDeath;
                const matildaCooldownRemaining = Math.max(0, this.matildaResurrectionCooldown - timeSinceLastDeath);
                
                if (this.matildaResurrectionUsed && matildaCooldownRemaining > 0) {
                    const minutes = Math.floor(matildaCooldownRemaining / 60000);
                    const seconds = Math.ceil((matildaCooldownRemaining % 60000) / 1000);
                    abilityCountdown.textContent = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
                    console.log('Matilda resurrection on cooldown:', matildaCooldownRemaining); // Debug log
                } else {
                    abilityCountdown.textContent = 'Ready';
                    console.log('Matilda resurrection ready'); // Debug log
                }
            } else if (remainingCooldown > 0) {
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

    // Matilda's Egg Bomb ability - called when Matilda dies
    checkMatildaResurrection() {
        console.log('checkMatildaResurrection() called');
        
        const character = this.game.characterUI.getCurrentCharacter();
        console.log('Current character:', character ? character.name : 'None');
        
        if (!character || character.id !== 'matilda') {
            console.log('Not Matilda, resurrection not available');
            return false;
        }
        
        const currentTime = Date.now();
        const timeSinceLastDeath = currentTime - this.matildaLastDeath;
        
        console.log('Matilda resurrection check:', {
            used: this.matildaResurrectionUsed,
            timeSinceLastDeath,
            cooldown: this.matildaResurrectionCooldown
        });
        
        // Check if resurrection ability is available
        if (this.matildaResurrectionUsed && timeSinceLastDeath < this.matildaResurrectionCooldown) {
            console.log('Matilda resurrection on cooldown');
            return false;
        }
        
        console.log('🥚 Activating Matilda resurrection!');
        
        // Activate egg bomb resurrection
        this.activateEggBomb();
        this.matildaResurrectionUsed = true;
        this.matildaLastDeath = currentTime;
        
        // Freeze the game for 3 seconds - bird will disappear and reappear after countdown
        this.freezeGame(3000);
        
        return true;
    }

    respawnMatildaAfterFreeze() {
        console.log('🔄 Respawning Matilda after freeze countdown!');
        
        // FORCE bird to be visible IMMEDIATELY with nuclear option
        this.game.bird.visible = true;
        this.game.bird.forceVisible = true; // Override any visibility checks
        
        // Reset bird position to a safe location
        this.game.bird.x = this.game.canvas.width * 0.3; // Move forward a bit
        this.game.bird.y = this.game.canvas.height * 0.5; // Center vertically
        this.game.bird.velocity.y = 0;
        this.game.bird.velocity.x = 0; // Stop any horizontal movement
        
        console.log('🐦 NUCLEAR FORCED Bird visibility - visible:', this.game.bird.visible, 'forceVisible:', this.game.bird.forceVisible);
        console.log('🐦 Bird position:', this.game.bird.x, this.game.bird.y);
        
        // Force the game to continue playing
        this.game.gameState.setState(GAME_STATES.PLAYING);
        console.log('🎮 Game state set to PLAYING');
        
        // Create explosion particles at respawn location
        this.game.particleSystem.addEggBombParticles(this.game.bird.x, this.game.bird.y);
        
        // CRITICAL: Restart the game loop if it was stopped
        if (!this.game.gameLoop) {
            console.log('🔄 Restarting game loop for Matilda resurrection');
            this.game.startGameLoop();
        } else {
            console.log('✅ Game loop is already running');
        }
        
        // Clear force visible after a short delay (let normal visibility take over)
        setTimeout(() => {
            this.game.bird.forceVisible = false;
            console.log('🔄 Cleared forceVisible - normal visibility should work now');
        }, 1000);
        
        console.log('✅ Matilda respawn complete!');
    }

    // Freeze the game for dramatic effect
    freezeGame(duration = 3000) {
        console.log(`🧊 Freezing game for ${duration}ms`);
        this.gameFrozen = true;
        this.freezeEndTime = Date.now() + duration;
        
        // Hide the bird during freeze
        this.game.bird.visible = false;
        
        // Freeze all pipes (stop horizontal movement but allow falling)
        this.game.pipeManager.freezeAllPipes();
        
        // Store bird's current velocity to restore later
        this.frozenBirdVelocity = { ...this.game.bird.velocity };
        
        // Create freeze overlay with countdown
        this.createFreezeOverlay(duration);
        
        // Note: unfreezeGame will be called from the update loop when time expires
    }

    unfreezeGame() {
        console.log('❄️ Unfreezing game - removing overlay');
        console.log('🐦 Bird visible before respawn:', this.game.bird.visible);
        
        this.gameFrozen = false;
        this.freezeEndTime = 0;
        
        // Unfreeze all pipes (resume horizontal movement)
        this.game.pipeManager.unfreezeAllPipes();
        
        // AGGRESSIVELY remove ALL freeze overlays
        const existingOverlays = document.querySelectorAll('[style*="z-index: 999"], [style*="position: fixed"]');
        existingOverlays.forEach(overlay => {
            if (overlay.style.background && overlay.style.background.includes('radial-gradient')) {
                console.log('🗑️ Removing freeze overlay');
                overlay.remove();
            }
        });
        
        // Remove our specific overlay
        if (this.freezeOverlay) {
            console.log('🗑️ Removing freeze overlay from DOM');
            try {
                this.freezeOverlay.remove();
                console.log('✅ Freeze overlay removed successfully');
            } catch (error) {
                console.error('❌ Error removing freeze overlay:', error);
            }
        }
        
        // Clear all references
        this.freezeOverlay = null;
        this.freezeCountdownElement = null;
        
        // Respawn Matilda after the freeze countdown
        this.respawnMatildaAfterFreeze();
        
        console.log('🐦 Bird visible after respawn:', this.game.bird.visible);
        console.log('🎮 Game state after respawn:', this.game.gameState.getState());
        console.log('🔄 Game loop running:', !!this.game.gameLoop);
    }

    createFreezeOverlay(duration) {
        // FIRST: Remove ANY existing overlays aggressively
        this.forceRemoveAllFreezeOverlays();
        
        console.log('🎬 Creating new freeze overlay');
        
        // Create dramatic overlay
        this.freezeOverlay = document.createElement('div');
        this.freezeOverlay.id = 'matilda-freeze-overlay'; // Give it a unique ID
        this.freezeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,215,0,0.2) 50%, rgba(255,69,0,0.3) 100%);
            backdrop-filter: blur(2px);
            z-index: 999999;
            pointer-events: none;
        `;
        
        // Add dramatic text
        const text = document.createElement('div');
        text.style.cssText = `
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            color: #FFD700;
            font-size: 3rem;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,69,0,0.6);
            text-align: center;
            text-align: center;
        `;
        text.innerHTML = '🥚 EGG BOMB!<br><span style="font-size: 1.5rem;">PIPES DESTROYED!</span>';
        
        // Add countdown timer
        const countdown = document.createElement('div');
        countdown.style.cssText = `
            position: absolute;
            top: 55%;
            left: 50%;
            transform: translateX(-50%);
            color: #FFD700;
            font-size: 4rem;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(255,215,0,1), 0 0 40px rgba(255,69,0,0.8);
            text-align: center;
            border: 3px solid #FFD700;
            border-radius: 50%;
            width: 100px;
            height: 100px;
            line-height: 94px;
            background: rgba(0,0,0,0.3);
        `;
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: absolute;
            top: 75%;
            left: 50%;
            transform: translateX(-50%);
            color: #FFD700;
            font-size: 1.2rem;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255,215,0,0.8);
            text-align: center;
        `;
        instructions.innerHTML = 'MATILDA WILL RESPAWN WHEN COUNTDOWN ENDS';
        
        this.freezeOverlay.appendChild(text);
        this.freezeOverlay.appendChild(countdown);
        this.freezeOverlay.appendChild(instructions);
        document.body.appendChild(this.freezeOverlay);
        
        // Store reference for updates (instead of using startCountdown)
        this.freezeCountdownElement = countdown;
        
        // Add CSS animations if not already added
        if (!document.getElementById('eggBombAnimations')) {
            const style = document.createElement('style');
            style.id = 'eggBombAnimations';
            style.textContent = `
                @keyframes countdownPulse {
                    0% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.1); }
                    100% { transform: translateX(-50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateFreezeCountdown(remainingMs) {
        if (!this.freezeCountdownElement) {
            console.log('⚠️ No freeze countdown element found');
            return;
        }
        
        const seconds = Math.ceil(remainingMs / 1000);
        console.log(`⏰ Updating countdown: ${remainingMs}ms remaining, ${seconds} seconds`);
        
        this.freezeCountdownElement.textContent = seconds > 0 ? seconds : 'GO!';
        
        // Pulse animation
        this.freezeCountdownElement.style.animation = 'countdownPulse 0.5s ease-in-out';
        
        // Change color and size as time runs out
        if (seconds <= 0) {
            console.log('🚀 Countdown reached 0 - showing GO!');
            this.freezeCountdownElement.style.color = '#00FF00';
            this.freezeCountdownElement.style.borderColor = '#00FF00';
            this.freezeCountdownElement.style.textShadow = '0 0 30px rgba(0,255,0,1), 0 0 60px rgba(0,255,0,0.8)';
        } else if (seconds <= 1) {
            this.freezeCountdownElement.style.color = '#FF4500';
            this.freezeCountdownElement.style.borderColor = '#FF4500';
            this.freezeCountdownElement.style.textShadow = '0 0 30px rgba(255,69,0,1), 0 0 60px rgba(255,0,0,0.8)';
            this.freezeCountdownElement.style.fontSize = '5rem';
        } else if (seconds <= 2) {
            this.freezeCountdownElement.style.color = '#FF8C00';
            this.freezeCountdownElement.style.borderColor = '#FF8C00';
            this.freezeCountdownElement.style.textShadow = '0 0 20px rgba(255,140,0,1), 0 0 40px rgba(255,140,0,0.8)';
            this.freezeCountdownElement.style.fontSize = '4.5rem';
        } else {
            this.freezeCountdownElement.style.color = '#FFD700';
            this.freezeCountdownElement.style.borderColor = '#FFD700';
            this.freezeCountdownElement.style.textShadow = '0 0 20px rgba(255,215,0,1), 0 0 40px rgba(255,69,0,0.8)';
            this.freezeCountdownElement.style.fontSize = '4rem';
        }
    }

    forceRemoveAllFreezeOverlays() {
        console.log('🧹 Force removing all freeze overlays');
        
        // Remove by ID
        const overlayById = document.getElementById('matilda-freeze-overlay');
        if (overlayById) {
            overlayById.remove();
            console.log('✅ Removed overlay by ID');
        }
        
        // Remove any elements with our specific styling
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const style = element.style;
            if (style.position === 'fixed' && 
                style.zIndex && 
                parseInt(style.zIndex) > 999 &&
                style.background && 
                style.background.includes('radial-gradient')) {
                console.log('🗑️ Removing potential freeze overlay element');
                element.remove();
            }
        });
        
        // Clear our references
        this.freezeOverlay = null;
        this.freezeCountdownElement = null;
    }

    isGameFrozen() {
        return this.gameFrozen;
    }

    respawnMatildaImmediately() {
        console.log('🔄 Respawning Matilda immediately!');
        
        // Reset bird position to a safe location
        this.game.bird.x = this.game.canvas.width * 0.3; // Move forward a bit
        this.game.bird.y = this.game.canvas.height * 0.5; // Center vertically
        this.game.bird.velocity.y = 0;
        
        // Create explosion particles at respawn location
        this.game.particleSystem.addEggBombParticles(this.game.bird.x, this.game.bird.y);
        
        // Force the game to continue playing
        this.game.gameState.setState(GAME_STATES.PLAYING);
    }

    activateEggBomb() {
        console.log('🥚 Activating Matilda\'s Egg Bomb!');
        
        // Find two pipes ahead of the bird
        const birdsX = this.game.bird.x;
        const pipesAhead = this.game.pipeManager.pipes
            .filter(pipe => pipe.x > birdsX)
            .sort((a, b) => a.x - b.x)
            .slice(0, 2);
        
        // Make the pipes fall down
        pipesAhead.forEach(pipe => {
            this.makePipeFallDown(pipe);
        });
        
        // Create the falling egg at a random position above the screen
        const eggX = birdsX + Math.random() * 200 + 100; // Drop egg slightly ahead
        this.eggBomb = new EggBomb(eggX, -50, this.game);
        
        // Show visual feedback
        this.showAbilityActivation('🥚 EGG BOMB ACTIVATED!');
        
        return true;
    }

    makePipeFallDown(pipe) {
        // Add falling animation properties to the pipe
        pipe.falling = true;
        pipe.fallSpeed = 0;
        pipe.rotationSpeed = Math.random() * 0.2 - 0.1; // Random rotation
        pipe.rotation = 0;
        
        console.log('🏗️ Pipe falling down!');
    }

    respawnMatilda(x, y) {
        console.log('🔄 Respawning Matilda at egg location!');
        
        // Reset bird position and state
        this.game.bird.x = x;
        this.game.bird.y = y;
        this.game.bird.velocity.y = 0;
        
        // Create explosion particles at respawn location
        this.game.particleSystem.addEggBombParticles(x, y);
        
        // Force the game to continue playing
        this.game.gameState.setState(GAME_STATES.PLAYING);
        
        // Restart the game loop if it was stopped
        if (!this.game.gameLoop) {
            this.game.startGameLoop();
        }
        
        // Show respawn notification
        this.showAbilityActivation('🔄 MATILDA RESPAWNED!');
    }

    // Render egg bomb if active
    renderEggBomb(ctx) {
        if (this.eggBomb) {
            this.eggBomb.draw(ctx);
        }
    }

    showDurationDisplay(abilityName) {
        const durationTimer = document.getElementById('abilityDuration');
        const durationText = document.getElementById('abilityDurationText');
        
        if (durationTimer && durationText) {
            durationText.textContent = abilityName;
            durationTimer.style.display = 'block';
        }
    }

    updateDurationDisplay(remainingMs) {
        const durationCountdown = document.getElementById('abilityDurationCountdown');
        
        if (durationCountdown && remainingMs > 0) {
            const remainingSeconds = Math.ceil(remainingMs / 1000);
            durationCountdown.textContent = `${remainingSeconds}s`;
        }
    }

    hideDurationDisplay() {
        const durationTimer = document.getElementById('abilityDuration');
        if (durationTimer) {
            durationTimer.style.display = 'none';
        }
    }

    resetAbility() {
        console.log('Resetting ability system'); // Debug log
        
        // Deactivate any active ability
        if (this.activeAbility) {
            this.deactivateAbility();
        }
        
        // Reset cooldown timer
        this.cooldownTimer = 0;
        this.lastActivation = 0;
        
        // Reset Matilda's resurrection ability
        this.matildaResurrectionUsed = false;
        this.matildaLastDeath = 0;
        this.eggBomb = null;
        
        // Reset Blues' ability
        this.bluesBirdCount = 3;
        this.bluesLastSpawn = 0;
        this.bluesGameStartTime = 0;
        
        // Unfreeze game if frozen
        if (this.gameFrozen) {
            this.unfreezeGame();
        }
        this.frozenBirdVelocity = null;
        
        // Hide ability timer and duration display
        this.hideAbilityTimer();
        this.hideDurationDisplay();
        
        console.log('Ability system reset'); // Debug log
    }
    
    // Blues' Triple Bird System Methods
    initializeBluesAbility() {
        const character = this.game.characterUI.getCurrentCharacter();
        if (character && character.id === 'blues') {
            this.bluesBirdCount = 3; // Start with all 3 birds (Jim, Jake, Jay)
            this.bluesGameStartTime = Date.now();
            this.bluesLastSpawn = 0; // Don't start respawn timer until a bird is lost
            console.log('🔵 Blues ability initialized - Starting with Jim, Jake, and Jay!');
            
            // Show the initial bird count display
            this.updateBluesBirdCountDisplay();
        }
    }
    
    updateBluesAbility() {
        const character = this.game.characterUI.getCurrentCharacter();
        if (!character || character.id !== 'blues') return;
        
        const currentTime = Date.now();
        
        // Only check for respawn if we have lost birds AND the respawn timer has started
        if (this.bluesBirdCount < this.bluesMaxBirds && this.bluesLastSpawn > 0) {
            const timeSinceLastSpawn = currentTime - this.bluesLastSpawn;
            
            // Check if we should spawn a new bird
            if (timeSinceLastSpawn >= this.bluesSpawnInterval) {
                this.spawnNewBluesBird();
            }
        }
        
        // Update the display
        this.updateBluesBirdCountDisplay();
    }
    
    spawnNewBluesBird() {
        if (this.bluesBirdCount >= this.bluesMaxBirds) return; // Safety check
        
        this.bluesBirdCount++;
        this.bluesLastSpawn = Date.now();
        
        const birdNames = ['Jim', 'Jake', 'Jay'];
        const newBirdName = birdNames[this.bluesBirdCount - 1];
        
        console.log(`🔵 New bird respawned: ${newBirdName}! Total birds: ${this.bluesBirdCount}`);
        
        // Show visual feedback
        this.showAbilityActivation(`🔵 ${newBirdName} respawned! (${this.bluesBirdCount}/3 birds)`);
        
        // Add spawn particles
        this.game.particleSystem.addExplosionParticles(
            this.game.bird.x - 50, 
            this.game.bird.y, 
            '#4A90E2' // Blue color
        );
        
        // Update display immediately
        this.updateBluesBirdCountDisplay();
    }
    
    onBluesBirdDeath() {
        if (this.bluesBirdCount > 1) {
            const birdNames = ['Jim', 'Jake', 'Jay'];
            const lostBirdName = birdNames[this.bluesBirdCount - 1]; // The bird we're about to lose
            
            this.bluesBirdCount--;
            
            // Start the respawn timer only when we lose the first bird
            if (this.bluesBirdCount === 2) {
                this.bluesLastSpawn = Date.now(); // Reset spawn timer when first bird is lost
            }
            
            console.log(`💔 Lost ${lostBirdName}! Remaining birds: ${this.bluesBirdCount}`);
            
            // Show feedback
            this.showAbilityActivation(`💔 Lost ${lostBirdName}! ${this.bluesBirdCount} birds remaining`);
            
            // Update display immediately
            this.updateBluesBirdCountDisplay();
            
            return false; // Don't end game yet
        } else {
            console.log('💔 Lost the last bird (Jim) - Game Over!');
            return true; // End game
        }
    }
    
    getBluesBirdCount() {
        return this.bluesBirdCount;
    }
    
    isBluesActive() {
        const character = this.game.characterUI.getCurrentCharacter();
        return character && character.id === 'blues';
    }
    
    getBluesScoreMultiplier() {
        return this.isBluesActive() ? this.bluesBirdCount : 1;
    }
    
    updateBluesBirdCountDisplay() {
        if (!this.isBluesActive()) return;
        
        const abilityTimer = document.getElementById('abilityTimer');
        const abilityCountdown = document.getElementById('abilityCountdown');
        
        if (abilityTimer && abilityCountdown) {
            abilityTimer.style.display = 'block';
            
            const birdIcons = '🔵'.repeat(this.bluesBirdCount) + '💀'.repeat(3 - this.bluesBirdCount);
            const birdNames = ['Jim', 'Jake', 'Jay'];
            const aliveBirds = birdNames.slice(0, this.bluesBirdCount);
            
            // Show respawn timer only if we have lost birds AND the respawn timer has started
            if (this.bluesBirdCount < this.bluesMaxBirds && this.bluesLastSpawn > 0) {
                const timeUntilRespawn = this.bluesSpawnInterval - (Date.now() - this.bluesLastSpawn);
                const secondsUntilRespawn = Math.max(0, Math.ceil(timeUntilRespawn / 1000));
                
                abilityCountdown.innerHTML = `${birdIcons}<br>${aliveBirds.join(', ')} (${this.bluesBirdCount}x score)<br>Respawn: ${secondsUntilRespawn}s`;
            } else {
                abilityCountdown.innerHTML = `${birdIcons}<br>${aliveBirds.join(', ')} (${this.bluesBirdCount}x score)`;
            }
        }
    }
}
