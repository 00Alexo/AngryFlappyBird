/* Ability System - Handles character special abilities */
import { GAME_STATES, PIPE_WIDTH } from './constants.js';

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
        
        // Bomb's explosion ability state
        this.bombFuseTimer = 0;
        this.bombFuseDuration = 3000; // 3 seconds fuse
        this.bombExplosionRadius = 0; // Will be calculated dynamically based on canvas size
        this.bombCooldownDuration = 60000; // 60 seconds cooldown
        
        // Blues' Triple Bird ability state
        this.bluesBirdCount = 3; // Start with 3 birds (Jim, Jake, Jay)
        this.bluesMaxBirds = 3; // Maximum 3 birds (Jim, Jake, Jay)
        this.bluesSpawnInterval = 150000; // 150 seconds = 2.5 minutes
        this.bluesLastSpawn = 0; // When the last bird was spawned
        this.bluesGameStartTime = 0; // When the game started (for spawn timing)
        
        // Stella's Gravity Bubble ability state
        this.stellaGravityBubbleDuration = 6000; // 6 seconds
        this.stellaGravityBubbleCooldown = 35000; // 35 seconds
        this.stellaGravityReduction = 0.4; // 60% reduced gravity (was 70%)
        this.stellaHitboxShrink = 0.85; // 15% smaller hitbox (was 20%)
        this.stellaWallStickDuration = 1000; // 1 second max wall stick (reduced from 1.5s)
        this.stellaWallStickStartTime = 0; // When wall sticking started
        this.stellaIsStuckToWall = false; // Whether currently stuck to wall
        this.stellaStuckWallX = 0; // X position of wall being stuck to
        this.stellaBubbleTrail = []; // Trail of sparkle positions for visual effect
        
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

        // Set cooldown duration for different characters
        if (character.id === 'red') {
            this.cooldownDuration = 40000; // 40 seconds
        } else if (character.id === 'bomb') {
            this.cooldownDuration = this.bombCooldownDuration; // 60 seconds
        } else if (character.id === 'stella') {
            this.cooldownDuration = this.stellaGravityBubbleCooldown; // 35 seconds
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
            case 'bomb':
                this.activateBombExplosion();
                break;
            case 'stella':
                this.activateGravityBubble();
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

    activateBombExplosion() {
        console.log('💣 Activating Bomb Explosion!');
        
        // Create bomb explosion ability with fuse timer
        this.activeAbility = {
            type: 'bomb',
            startTime: Date.now(),
            duration: this.bombFuseDuration, // 3 seconds fuse
            fuseStarted: true,
            exploded: false
        };

        // Apply bomb fuse effects to bird
        this.game.bird.setBombFuse(true);
        
        // Show visual feedback
        this.showAbilityActivation('💣 BOMB FUSE LIT! 3 SECONDS!');
        
        // Show duration countdown
        this.showDurationDisplay('BOMB FUSE');
    }

    activateGravityBubble() {
        console.log('🫧 Activating Stella\'s Gravity Bubble!');
        
        // Create gravity bubble ability
        this.activeAbility = {
            type: 'gravityBubble',
            startTime: Date.now(),
            duration: this.stellaGravityBubbleDuration, // 6 seconds
            originalGravity: this.game.bird.gravity,
            originalHitboxSize: this.game.bird.hitboxRadius || this.game.bird.size,
            canStickToWalls: true,
            bubbleAlpha: 0.8, // For visual effect
            hasExtraLife: true, // Stella gets one extra life during bubble
            lifeUsed: false // Track if the extra life has been used
        };
        
        console.log('🔍 Gravity bubble initialized with extra life:', this.activeAbility);

        // Apply gravity bubble effects
        this.game.bird.setGravityBubble(true, this.stellaGravityReduction, this.stellaHitboxShrink);
        
        // Reset wall sticking state
        this.stellaIsStuckToWall = false;
        this.stellaWallStickStartTime = 0;
        this.stellaBubbleTrail = [];
        
        // Show visual feedback
        this.showAbilityActivation('🫧 GRAVITY BUBBLE ACTIVATED! (+1 LIFE)');
        
        // Show duration countdown
        this.showDurationDisplay('GRAVITY BUBBLE');
    }

    update() {
        // Update active ability
        if (this.activeAbility) {
            const currentTime = Date.now();
            const elapsed = currentTime - this.activeAbility.startTime;
            const remaining = this.activeAbility.duration - elapsed;
            
            // Update duration countdown display
            this.updateDurationDisplay(remaining);
            
            // Handle bomb explosion at end of fuse
            if (this.activeAbility.type === 'bomb' && !this.activeAbility.exploded && elapsed >= this.activeAbility.duration) {
                this.triggerBombExplosion();
                this.activeAbility.exploded = true;
                // Don't deactivate yet - let explosion effects play out
            }
            
            // Handle Stella's gravity bubble special mechanics
            if (this.activeAbility.type === 'gravityBubble') {
                this.updateGravityBubble(currentTime);
            }
            
            // Deactivate ability after duration or after smashing (rage mode only)
            if (elapsed >= this.activeAbility.duration || 
                (this.activeAbility.type === 'rage' && this.activeAbility.hasSmashed)) {
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
        
        // Remove bomb fuse effects
        if (this.activeAbility.type === 'bomb') {
            this.game.bird.setBombFuse(false);
        }
        
        // Remove gravity bubble effects
        if (this.activeAbility.type === 'gravityBubble') {
            this.game.bird.setGravityBubble(false);
            this.stellaIsStuckToWall = false;
            this.stellaWallStickStartTime = 0;
            this.stellaBubbleTrail = [];
        }

        this.activeAbility = null;

        // Hide duration display
        this.hideDurationDisplay();

        // Start cooldown now
        this.lastActivation = Date.now();
        this.startCooldown();
    }

    updateGravityBubble(currentTime) {
        // Update bubble trail for visual effect
        this.stellaBubbleTrail.push({
            x: this.game.bird.x,
            y: this.game.bird.y,
            timestamp: currentTime,
            size: Math.random() * 3 + 2 // Random sparkle size
        });
        
        // Remove old trail points (keep only last 8 points - fewer for subtlety)
        if (this.stellaBubbleTrail.length > 8) {
            this.stellaBubbleTrail.shift();
        }
        
        // Handle wall sticking mechanics
        if (this.stellaIsStuckToWall) {
            const stickDuration = currentTime - this.stellaWallStickStartTime;
            
            // Much easier to escape - any movement or time limit
            if (stickDuration >= this.stellaWallStickDuration || 
                Math.abs(this.game.bird.velocity.y) > 1 || // Any upward movement
                Math.abs(this.game.bird.x - this.stellaStuckWallX) > 30) { // Moved away
                this.unstickFromWall();
            } else {
                // Keep bird near wall but allow some movement
                const targetX = this.stellaStuckWallX + (this.stellaStuckWallX < this.game.bird.x ? 25 : -25);
                this.game.bird.x = targetX;
                this.game.bird.velocity.x = 0;
                // Allow some gravity while stuck (don't completely freeze)
                if (this.game.bird.velocity.y > 1) {
                    this.game.bird.velocity.y *= 0.3; // Slow fall while stuck
                }
            }
        } else {
            // Only check for wall sticking occasionally to avoid too much sticking
            if (Math.random() < 0.1) { // Only 10% chance per frame to check
                this.checkWallSticking();
            }
        }
    }

    checkWallSticking() {
        // Check collision with pipes for wall sticking
        if (!this.game.pipeManager || !this.game.pipeManager.pipes) return;
        
        const birdX = this.game.bird.x;
        const birdY = this.game.bird.y;
        const birdSize = this.game.bird.hitboxRadius || this.game.bird.size || 20;
        
        // Only check for wall sticking if bird is moving towards a wall (not flying away)
        const birdVelocityX = this.game.bird.velocity.x || 0;
        
        for (const pipe of this.game.pipeManager.pipes) {
            // Check if bird is near a pipe wall
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + PIPE_WIDTH;
            
            // Check if bird is horizontally aligned with pipe
            if (birdX + birdSize > pipeLeft && birdX - birdSize < pipeRight) {
                // Check if bird is in the gap (can stick to pipe walls)
                if (birdY > pipe.topHeight + 20 && birdY < pipe.bottomY - 20) { // Added buffer zones
                    // Determine which wall is closer
                    const distanceToLeft = Math.abs(birdX - pipeLeft);
                    const distanceToRight = Math.abs(birdX - pipeRight);
                    
                    // Much stricter conditions - only stick if very close and moving slowly
                    const minStickDistance = 15; // Reduced from 30 to 15
                    const maxStickVelocity = 2; // Only stick if moving slowly
                    
                    if ((distanceToLeft < minStickDistance || distanceToRight < minStickDistance) && 
                        Math.abs(this.game.bird.velocity.y) < maxStickVelocity) {
                        this.stickToWall(distanceToLeft < distanceToRight ? pipeLeft : pipeRight);
                        break;
                    }
                }
            }
        }
    }

    stickToWall(wallX) {
        console.log('🧲 Stella lightly stuck to wall!');
        this.stellaIsStuckToWall = true;
        this.stellaWallStickStartTime = Date.now();
        this.stellaStuckWallX = wallX;
        
        // Don't force position, just reduce movement
        this.game.bird.velocity.x *= 0.1; // Slow horizontal movement
        this.game.bird.velocity.y *= 0.5; // Slow vertical movement
        
        // Show more subtle feedback
        this.showAbilityActivation('🧲 Wall Assist!');
    }

    unstickFromWall() {
        console.log('🚀 Stella released from wall!');
        this.stellaIsStuckToWall = false;
        this.stellaWallStickStartTime = 0;
        this.stellaStuckWallX = 0;
        
        // Give a small gentle push away from wall
        this.game.bird.velocity.y = Math.min(this.game.bird.velocity.y, -1); // Small upward push
    }

    triggerBombExplosion() {
        console.log('💥 BOMB EXPLOSION TRIGGERED!');
        
        const birdX = this.game.bird.x;
        const birdY = this.game.bird.y;
        
        // Calculate dynamic explosion radius based on canvas size
        // Ensure it can destroy at least 2 pipes by making it proportional to screen width
        const canvasWidth = this.game.canvas.width;
        const baseRadius = canvasWidth * 0.4; // 40% of screen width
        const minRadius = Math.max(400, canvasWidth * 0.3); // Minimum 400px or 30% of screen width
        this.bombExplosionRadius = Math.max(baseRadius, minRadius);
        
        console.log(`💥 Dynamic explosion radius: ${this.bombExplosionRadius}px (canvas width: ${canvasWidth}px)`);
        
        // Find all pipes within explosion radius
        const pipesToDestroy = [];
        let totalScore = 0;
        
        this.game.pipeManager.pipes.forEach((pipe, index) => {
            const pipeX = pipe.x + (PIPE_WIDTH / 2); // Pipe center X
            const topPipeY = pipe.topHeight / 2; // Top pipe center Y
            const bottomPipeY = pipe.bottomY + (this.game.canvas.height - pipe.bottomY) / 2; // Bottom pipe center Y
            
            // Check distance to both top and bottom parts of the pipe
            const distanceToTop = Math.sqrt(Math.pow(pipeX - birdX, 2) + Math.pow(topPipeY - birdY, 2));
            const distanceToBottom = Math.sqrt(Math.pow(pipeX - birdX, 2) + Math.pow(bottomPipeY - birdY, 2));
            
            // If either part is within explosion radius, make the pipe fall down
            if (distanceToTop <= this.bombExplosionRadius || distanceToBottom <= this.bombExplosionRadius) {
                this.makePipeFallDown(pipe);
                pipesToDestroy.push(pipe);
                // Award points for each destroyed pipe
                totalScore += 1;
            }
        });
        
        // Don't remove pipes immediately - let them fall down with animation
        // The pipes will be removed automatically when they hit the ground
        
        // Award score for destroyed pipes
        for (let i = 0; i < totalScore; i++) {
            this.game.gameState.incrementScore();
        }
        
        // Create massive explosion effect
        this.game.particleSystem.addBombExplosionParticles(birdX, birdY, this.bombExplosionRadius);
        
        // Screen shake effect
        this.createScreenShake();
        
        // Respawn Bomb after explosion with brief invincibility
        setTimeout(() => {
            this.respawnBombAfterExplosion();
        }, 2000); // 2 second delay
        
        // Show explosion feedback
        this.showAbilityActivation(`💥 EXPLOSION! ${pipesToDestroy.length} PIPES DESTROYED! +${totalScore} POINTS!`);
        
        console.log(`💥 Destroyed ${pipesToDestroy.length} pipes, awarded ${totalScore} points`);
    }

    respawnBombAfterExplosion() {
        console.log('🔄 Respawning Bomb after explosion!');
        
        // Don't move the bird - just reset velocity and add invincibility
        this.game.bird.velocity.y = 0;
        this.game.bird.velocity.x = 0; // Stop any horizontal movement
        
        // Brief invincibility (2 seconds)
        this.game.bird.setInvincible(true);
        setTimeout(() => {
            this.game.bird.setInvincible(false);
        }, 2000);
        
        // Show respawn notification
        this.showAbilityActivation('💣 BOMB RESPAWNED WITH INVINCIBILITY!');
        
        console.log('✅ Bomb respawn complete!');
    }

    createScreenShake() {
        // Create screen shake effect
        const originalTransform = this.game.canvas.style.transform || '';
        let shakeIntensity = 15;
        let shakeCount = 0;
        const maxShakes = 20;
        
        const shakeInterval = setInterval(() => {
            if (shakeCount >= maxShakes) {
                this.game.canvas.style.transform = originalTransform;
                clearInterval(shakeInterval);
                return;
            }
            
            const offsetX = (Math.random() - 0.5) * shakeIntensity;
            const offsetY = (Math.random() - 0.5) * shakeIntensity;
            this.game.canvas.style.transform = `${originalTransform} translate(${offsetX}px, ${offsetY}px)`;
            
            shakeIntensity *= 0.9; // Decay shake intensity
            shakeCount++;
        }, 50);
    }

    onPipeHit() {
        console.log('🔍 onPipeHit called, activeAbility:', this.activeAbility);
        
        if (this.activeAbility && this.activeAbility.type === 'rage' && this.activeAbility.canSmashPipes) {
            console.log('Pipe smashed during rage mode!');
            this.activeAbility.hasSmashed = true;
            return true; // Pipe was smashed
        }
        
        if (this.activeAbility && this.activeAbility.type === 'bomb' && !this.activeAbility.exploded) {
            console.log('💣 Bomb hit pipe during fuse - ability wasted!');
            this.showAbilityActivation('💣 FUSE EXTINGUISHED! ABILITY WASTED!');
            this.deactivateAbility(); // Waste the ability
            return false; // Normal collision (bomb dies)
        }
        
        if (this.activeAbility && this.activeAbility.type === 'gravityBubble') {
            console.log('🫧 Gravity bubble collision detected!');
            console.log('  - stuckToWall:', this.stellaIsStuckToWall);
            console.log('  - hasExtraLife:', this.activeAbility.hasExtraLife);
            console.log('  - lifeUsed:', this.activeAbility.lifeUsed);
            
            if (this.stellaIsStuckToWall) {
                console.log('🫧 Stella hit pipe while stuck to wall - bubble popped!');
                this.showAbilityActivation('💥 BUBBLE POPPED! WALL STICK FAILED!');
                this.deactivateAbility(); // End the ability
                return false; // Normal collision (Stella dies)
            } else if (this.activeAbility.hasExtraLife && !this.activeAbility.lifeUsed) {
                console.log('🫧 Stella used her bubble extra life - pipe destroyed!');
                this.showAbilityActivation('� BUBBLE LIFE SAVED YOU! PIPE DESTROYED!');
                this.activeAbility.lifeUsed = true; // Mark extra life as used
                
                // Don't reset position - let Stella continue flying through the destroyed pipe
                console.log('🫧 Pipe destroyed, Stella continues with bubble active');
                return true; // Collision handled, pipe destroyed
            } else {
                console.log('🫧 Extra life not available or already used - proceeding with normal collision');
            }
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

    isBombFuseActive() {
        return this.activeAbility && this.activeAbility.type === 'bomb' && !this.activeAbility.exploded;
    }

    isGravityBubbleActive() {
        return this.activeAbility && this.activeAbility.type === 'gravityBubble';
    }

    isStuckToWall() {
        return this.stellaIsStuckToWall;
    }

    getGravityReduction() {
        return this.isGravityBubbleActive() ? this.stellaGravityReduction : 1;
    }

    getHitboxShrink() {
        return this.isGravityBubbleActive() ? this.stellaHitboxShrink : 1;
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

    // Render Stella's gravity bubble effect if active
    renderGravityBubble(ctx) {
        if (!this.isGravityBubbleActive()) return;

        const birdX = this.game.bird.x;
        const birdY = this.game.bird.y;
        const birdSize = this.game.bird.hitboxRadius || this.game.bird.size || 20;
        const time = Date.now() * 0.003; // Animation timing

        ctx.save();

        // Draw sparkle trail
        this.stellaBubbleTrail.forEach((sparkle, index) => {
            const age = Date.now() - sparkle.timestamp;
            const maxAge = 800;
            const alpha = Math.max(0, 1 - (age / maxAge));
            
            if (alpha > 0) {
                ctx.globalAlpha = alpha * 0.4;
                ctx.fillStyle = '#FFB6C1';
                ctx.beginPath();
                ctx.arc(sparkle.x, sparkle.y, sparkle.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                
                // Twinkling effect
                if (Math.random() > 0.85) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.beginPath();
                    ctx.arc(sparkle.x, sparkle.y, sparkle.size * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Main bubble - more prominent and animated
        const bubbleRadius = birdSize * 2.2; // Larger bubble
        const pulseEffect = 1 + Math.sin(time * 4) * 0.1; // Gentle pulsing
        const currentRadius = bubbleRadius * pulseEffect;
        
        // Create animated gradient for bubble effect
        const gradient = ctx.createRadialGradient(
            birdX, birdY, 0,
            birdX, birdY, currentRadius
        );
        gradient.addColorStop(0, 'rgba(255, 182, 193, 0.6)'); // More visible center
        gradient.addColorStop(0.5, 'rgba(255, 105, 180, 0.4)'); 
        gradient.addColorStop(0.8, 'rgba(255, 20, 147, 0.2)'); 
        gradient.addColorStop(1, 'rgba(255, 20, 147, 0.05)'); 
        
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(birdX, birdY, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Animated bubble outline with shimmer effect
        ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.2; // Shimmering opacity
        ctx.strokeStyle = '#FF69B4'; // Hot pink
        ctx.lineWidth = 2;
        
        // Rotating dashed line effect
        const dashOffset = time * 20;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.arc(birdX, birdY, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Secondary bubble ring for extra visual impact
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#FFB6C1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(birdX, birdY, currentRadius * 1.15, 0, Math.PI * 2);
        ctx.stroke();

        // Floating sparkles around the bubble (more prominent)
        for (let i = 0; i < 6; i++) { // More sparkles
            const angle = (i / 6) * Math.PI * 2 + time;
            const distance = currentRadius + 8 + Math.sin(time * 2 + i) * 5;
            const sparkleX = birdX + Math.cos(angle) * distance;
            const sparkleY = birdY + Math.sin(angle) * distance;
            
            ctx.globalAlpha = 0.7 + Math.sin(time * 3 + i) * 0.3;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 2 + Math.sin(time * 4 + i) * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Star sparkle effect
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sparkleX - 3, sparkleY);
            ctx.lineTo(sparkleX + 3, sparkleY);
            ctx.moveTo(sparkleX, sparkleY - 3);
            ctx.lineTo(sparkleX, sparkleY + 3);
            ctx.stroke();
        }

        // Extra life indicator - heart icon if life is available
        if (this.activeAbility.hasExtraLife && !this.activeAbility.lifeUsed) {
            const heartX = birdX + currentRadius * 0.7;
            const heartY = birdY - currentRadius * 0.7;
            const heartSize = 8;
            
            ctx.globalAlpha = 0.8 + Math.sin(time * 5) * 0.2; // Pulsing heart
            ctx.fillStyle = '#FF1493'; // Deep pink
            
            // Draw heart shape
            ctx.beginPath();
            ctx.moveTo(heartX, heartY + heartSize/4);
            ctx.quadraticCurveTo(heartX - heartSize/2, heartY - heartSize/4, heartX - heartSize/4, heartY);
            ctx.quadraticCurveTo(heartX, heartY - heartSize/2, heartX + heartSize/4, heartY);
            ctx.quadraticCurveTo(heartX + heartSize/2, heartY - heartSize/4, heartX, heartY + heartSize/4);
            ctx.fill();
            
            // Heart outline
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Show wall stick indicator if stuck to wall
        if (this.stellaIsStuckToWall) {
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#32CD32'; // Lime green
            ctx.font = 'bold 12px Arial'; // Smaller font
            ctx.textAlign = 'center';
            ctx.fillText('🧲', birdX + 30, birdY - 10); // Just a small magnetic icon
            
            // Draw more subtle connection indicator
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 1; // Thinner line
            ctx.setLineDash([2, 4]); // More subtle dashed line
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(birdX, birdY);
            ctx.lineTo(this.stellaStuckWallX, birdY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
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
        
        // Reset Bomb's explosion ability
        this.bombFuseTimer = 0;
        
        // Reset Blues' ability
        this.bluesBirdCount = 3;
        this.bluesLastSpawn = 0;
        this.bluesGameStartTime = 0;
        
        // Reset Stella's gravity bubble ability
        this.stellaIsStuckToWall = false;
        this.stellaWallStickStartTime = 0;
        this.stellaStuckWallX = 0;
        this.stellaBubbleTrail = [];
        
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
