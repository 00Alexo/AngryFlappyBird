import { BIRD_SIZE, FLAP_STRENGTH, GRAVITY, COLORS } from './constants.js';

export class Bird {
    constructor(x, y, characterManager) {
        this.characterManager = characterManager;
        this.rageMode = false;
        this.reset(x, y);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
        this.flapAnimation = 0;
        this.trail = [];
        this.rageMode = false;
        this.visible = true; // Bird is visible by default
    }

    update() {
        // Get character multipliers
        const character = this.characterManager.getCurrentCharacter();
        const multipliers = this.characterManager.getCharacterMultipliers(character.id);
        
        // Apply rage mode speed boost
        let speedMultiplier = multipliers.speed;
        if (this.rageMode) {
            speedMultiplier *= 2.0; // 100% speed boost during rage mode - much more dramatic!
        }
        
        // Update physics with character modifiers
        let gravityMultiplier = speedMultiplier;
        if (this.rageMode) {
            gravityMultiplier *= 0.7; // Reduced gravity during rage mode for more dramatic effect
        }
        
        this.velocity += GRAVITY * gravityMultiplier;
        this.y += this.velocity;

        // Update rotation and animation
        this.rotation = Math.min(this.velocity * 0.08, 1.2);
        this.flapAnimation = Math.max(this.flapAnimation - 0.05, 0);

        // Update trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        const maxTrailLength = this.rageMode ? 15 : 8; // Longer trail during rage mode
        if (this.trail.length > maxTrailLength) this.trail.shift();

        // Update trail alpha
        this.trail.forEach((point, index) => {
            const baseAlpha = this.rageMode ? 0.6 : 0.3; // More visible trail during rage mode
            point.alpha = index / this.trail.length * baseAlpha;
        });
    }

    flap() {
        const character = this.characterManager.getCurrentCharacter();
        const multipliers = this.characterManager.getCharacterMultipliers(character.id);
        
        let flapStrength = FLAP_STRENGTH * multipliers.agility;
        
        // Rage mode makes flapping stronger but not too much
        if (this.rageMode) {
            flapStrength *= 1.3; // 30% stronger flap in rage mode - more balanced
        }
        
        this.velocity = flapStrength;
        this.rotation = -0.3;
        this.flapAnimation = 1;
    }

    setRageMode(active) {
        this.rageMode = active;
        console.log(`Rage mode ${active ? 'activated' : 'deactivated'}`);
    }

    isRageModeActive() {
        return this.rageMode;
    }

    checkBounds(canvasHeight) {
        return this.y + BIRD_SIZE/2 >= canvasHeight || this.y - BIRD_SIZE/2 <= 0;
    }

    getBounds() {
        const character = this.characterManager.getCurrentCharacter();
        if (character.id === 'chuck') {
            // Triangle bounds for Chuck - slightly smaller for better gameplay
            return {
                left: this.x - BIRD_SIZE/2.2,
                right: this.x + BIRD_SIZE/2.2,
                top: this.y - BIRD_SIZE/2.2,
                bottom: this.y + BIRD_SIZE/2.2
            };
        } else {
            // Circular bounds for other birds
            return {
                left: this.x - BIRD_SIZE/2,
                right: this.x + BIRD_SIZE/2,
                top: this.y - BIRD_SIZE/2,
                bottom: this.y + BIRD_SIZE/2
            };
        }
    }

    draw(ctx) {
        // Don't draw if not visible (unless forced visible)
        if (!this.visible && !this.forceVisible) return;
        
        const character = this.characterManager.getCurrentCharacter();
        const colors = character.colors;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Rage mode aura effect
        if (this.rageMode) {
            ctx.save();
            const time = Date.now() * 0.02; // Faster animation
            const auraRadius = BIRD_SIZE/2 + 25 + Math.sin(time) * 10; // Bigger aura
            
            // Dark red rage aura with more intense colors
            const auraGradient = ctx.createRadialGradient(0, 0, BIRD_SIZE/2, 0, 0, auraRadius);
            auraGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
            auraGradient.addColorStop(0.3, 'rgba(255, 69, 0, 0.6)');
            auraGradient.addColorStop(0.6, 'rgba(220, 20, 60, 0.8)');
            auraGradient.addColorStop(0.8, 'rgba(139, 0, 0, 0.9)');
            auraGradient.addColorStop(1, 'rgba(75, 0, 0, 1)');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // More intense rage particles
            for (let i = 0; i < 12; i++) {
                const angle = (time + i * 0.5) % (Math.PI * 2);
                const distance = auraRadius * (0.7 + Math.sin(time + i) * 0.3);
                const px = Math.cos(angle) * distance;
                const py = Math.sin(angle) * distance;
                
                ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 100)}, 0, ${0.8 + Math.random() * 0.2})`;
                ctx.beginPath();
                ctx.arc(px, py, 3 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Lightning-like sparks
            for (let i = 0; i < 6; i++) {
                const sparkAngle = (time * 2 + i * Math.PI / 3) % (Math.PI * 2);
                const sparkDist = auraRadius * 1.2;
                const sparkX = Math.cos(sparkAngle) * sparkDist;
                const sparkY = Math.sin(sparkAngle) * sparkDist;
                
                ctx.strokeStyle = `rgba(255, 255, 0, ${0.6 + Math.random() * 0.4})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sparkX * 0.8, sparkY * 0.8);
                ctx.lineTo(sparkX, sparkY);
                ctx.stroke();
            }
            
            ctx.restore();
        }

        // Bird shadow
        ctx.save();
        ctx.translate(3, 3);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Triangle shadow for Chuck
            ctx.moveTo(0, -BIRD_SIZE/2);
            ctx.lineTo(-BIRD_SIZE/2, BIRD_SIZE/2);
            ctx.lineTo(BIRD_SIZE/2, BIRD_SIZE/2);
            ctx.closePath();
        } else {
            // Circular shadow for other birds
            ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();

        // Bird body with gradient using character colors
        const bodyGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, BIRD_SIZE/2);
        bodyGradient.addColorStop(0, colors.body);
        bodyGradient.addColorStop(0.7, colors.secondary);
        bodyGradient.addColorStop(1, this.darkenColor(colors.secondary, 0.3));
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Triangle body for Chuck
            ctx.moveTo(0, -BIRD_SIZE/2);
            ctx.lineTo(-BIRD_SIZE/2, BIRD_SIZE/2);
            ctx.lineTo(BIRD_SIZE/2, BIRD_SIZE/2);
            ctx.closePath();
        } else {
            // Circular body for other birds
            ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
        }
        ctx.fill();

        // Add character-specific belly marking
        if (colors.belly) {
            ctx.fillStyle = colors.belly;
            ctx.strokeStyle = this.darkenColor(colors.belly, 0.2);
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            if (character.id === 'chuck') {
                // Triangular belly for Chuck
                ctx.moveTo(0, 0);
                ctx.lineTo(-BIRD_SIZE/4, BIRD_SIZE/3);
                ctx.lineTo(BIRD_SIZE/4, BIRD_SIZE/3);
                ctx.closePath();
            } else {
                // Create an oval belly shape for other birds
                ctx.ellipse(0, 8, BIRD_SIZE/3, BIRD_SIZE/2.5, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.stroke();
        }

        // Bird outline
        ctx.strokeStyle = this.darkenColor(colors.secondary, 0.5);
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Triangle outline for Chuck
            ctx.moveTo(0, -BIRD_SIZE/2);
            ctx.lineTo(-BIRD_SIZE/2, BIRD_SIZE/2);
            ctx.lineTo(BIRD_SIZE/2, BIRD_SIZE/2);
            ctx.closePath();
        } else {
            // Circular outline for other birds
            ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Wing animation
        const wingOffset = Math.sin(Date.now() * 0.02) * 3 + this.flapAnimation * 8;
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Triangular wing for Chuck
            ctx.moveTo(-8, wingOffset - 2);
            ctx.lineTo(-BIRD_SIZE/3, wingOffset + BIRD_SIZE/6);
            ctx.lineTo(-4, wingOffset + BIRD_SIZE/6);
            ctx.closePath();
        } else {
            // Elliptical wing for other birds
            ctx.ellipse(-5, wingOffset, BIRD_SIZE/3, BIRD_SIZE/4, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.strokeStyle = colors.body;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bird beak
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Positioned beak for triangle shape - at the tip
            ctx.moveTo(BIRD_SIZE/2 - 2, -5);
            ctx.lineTo(BIRD_SIZE/2 + 10, -3);
            ctx.lineTo(BIRD_SIZE/2 + 10, 1);
            ctx.closePath();
        } else {
            // Standard beak for circular birds
            ctx.moveTo(BIRD_SIZE/2, 0);
            ctx.lineTo(BIRD_SIZE/2 + 12, -3);
            ctx.lineTo(BIRD_SIZE/2 + 12, 3);
            ctx.closePath();
        }
        ctx.fill();

        // Beak outline
        ctx.strokeStyle = this.darkenColor(colors.accent, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bird eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Position eyes better for triangle shape
            ctx.arc(-6, -12, 7, 0, Math.PI * 2);
        } else {
            // Standard eye position for circular birds
            ctx.arc(-2, -8, 8, 0, Math.PI * 2);
        }
        ctx.fill();

        // Eye pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Pupil for triangle-positioned eye
            ctx.arc(-4, -12, 4, 0, Math.PI * 2);
        } else {
            // Standard pupil for circular birds
            ctx.arc(0, -8, 5, 0, Math.PI * 2);
        }
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = 'white';
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Highlight for triangle-positioned eye
            ctx.arc(-5, -14, 1.5, 0, Math.PI * 2);
        } else {
            // Standard highlight for circular birds
            ctx.arc(-1, -10, 2, 0, Math.PI * 2);
        }
        ctx.fill();

        // Angry eyebrow
        ctx.strokeStyle = colors.eyebrow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (character.id === 'chuck') {
            // Eyebrow positioned for triangle shape
            ctx.moveTo(-12, -16);
            ctx.lineTo(-2, -18);
        } else {
            // Standard eyebrow for circular birds
            ctx.moveTo(-8, -12);
            ctx.lineTo(2, -15);
        }
        ctx.stroke();

        // Draw character-specific special effects
        this.drawSpecialEffects(ctx, character);

        ctx.restore();
    }

    drawSpecialEffects(ctx, character) {
        switch(character.id) {
            case 'chuck':
                // Speed lines for Chuck - more dynamic and triangle-themed
                if (Math.random() < 0.4) {
                    ctx.strokeStyle = character.colors.accent;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    // Multiple speed lines with varying lengths
                    ctx.moveTo(-25, -8);
                    ctx.lineTo(-35, -8);
                    ctx.moveTo(-20, -3);
                    ctx.lineTo(-40, -3);
                    ctx.moveTo(-25, 2);
                    ctx.lineTo(-35, 2);
                    ctx.moveTo(-22, 7);
                    ctx.lineTo(-32, 7);
                    ctx.stroke();
                    
                    // Add some triangular speed particles
                    if (Math.random() < 0.3) {
                        ctx.fillStyle = character.colors.accent;
                        ctx.globalAlpha = 0.6;
                        for (let i = 0; i < 3; i++) {
                            const x = -30 - Math.random() * 15;
                            const y = -8 + Math.random() * 16;
                            const size = 2 + Math.random() * 3;
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(x - size, y + size/2);
                            ctx.lineTo(x - size, y - size/2);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    ctx.globalAlpha = 1;
                }
                break;
            case 'bomb':
                // Fuse and sparks for Bomb
                ctx.strokeStyle = character.colors.fuse || '#8B4513';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -BIRD_SIZE/2);
                ctx.lineTo(0, -BIRD_SIZE/2 - 8);
                ctx.stroke();
                // Spark effect
                if (Math.random() < 0.4) {
                    ctx.fillStyle = '#FFAA00';
                    ctx.beginPath();
                    ctx.arc(0 + (Math.random() - 0.5) * 4, -BIRD_SIZE/2 - 8, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'blues':
                // Multiple bird effect (showing the trio)
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = character.colors.body;
                // Left bird shadow
                ctx.beginPath();
                ctx.arc(-15, -5, BIRD_SIZE/4, 0, Math.PI * 2);
                ctx.fill();
                // Right bird shadow
                ctx.beginPath();
                ctx.arc(15, -5, BIRD_SIZE/4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                break;
            case 'matilda':
                // Egg bomb trail
                if (Math.random() < 0.2) {
                    ctx.fillStyle = character.colors.accent;
                    ctx.beginPath();
                    ctx.ellipse(0, 15, 3, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'stella':
                // Bubble effects
                if (Math.random() < 0.3) {
                    ctx.save();
                    ctx.globalAlpha = 0.6;
                    ctx.strokeStyle = character.colors.bubble || character.colors.accent;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(-10, -10, 8, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(12, -8, 6, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                break;
        }
    }

    drawTrail(ctx) {
        // Don't draw trail if bird is not visible (unless forced visible)
        if (!this.visible && !this.forceVisible) return;
        
        const character = this.characterManager.getCurrentCharacter();
        this.trail.forEach(point => {
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = character.colors.body;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            if (character.id === 'chuck') {
                // Triangle trail for Chuck
                const size = BIRD_SIZE/3;
                ctx.moveTo(0, -size/2);
                ctx.lineTo(-size/2, size/2);
                ctx.lineTo(size/2, size/2);
                ctx.closePath();
            } else {
                // Circular trail for other birds
                ctx.arc(0, 0, BIRD_SIZE/3, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
        });
    }

    // Helper function to darken colors
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgb(${Math.floor(r * (1 - amount))}, ${Math.floor(g * (1 - amount))}, ${Math.floor(b * (1 - amount))})`;
    }
}
