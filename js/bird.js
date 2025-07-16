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
    }

    update() {
        // Get character multipliers
        const character = this.characterManager.getCurrentCharacter();
        const multipliers = this.characterManager.getCharacterMultipliers(character.id);
        
        // Apply rage mode speed boost
        let speedMultiplier = multipliers.speed;
        if (this.rageMode) {
            speedMultiplier *= 1.5; // 50% speed boost during rage mode
        }
        
        // Update physics with character modifiers
        this.velocity += GRAVITY * speedMultiplier;
        this.y += this.velocity;

        // Update rotation and animation
        this.rotation = Math.min(this.velocity * 0.08, 1.2);
        this.flapAnimation = Math.max(this.flapAnimation - 0.05, 0);

        // Update trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 8) this.trail.shift();

        // Update trail alpha
        this.trail.forEach((point, index) => {
            point.alpha = index / this.trail.length * 0.3;
        });
    }

    flap() {
        const character = this.characterManager.getCurrentCharacter();
        const multipliers = this.characterManager.getCharacterMultipliers(character.id);
        
        let flapStrength = FLAP_STRENGTH * multipliers.agility;
        
        // Rage mode makes flapping stronger but not too much
        if (this.rageMode) {
            flapStrength *= 1.3; // 30% stronger flap in rage mode
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
        return {
            left: this.x - BIRD_SIZE/2,
            right: this.x + BIRD_SIZE/2,
            top: this.y - BIRD_SIZE/2,
            bottom: this.y + BIRD_SIZE/2
        };
    }

    draw(ctx) {
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
        ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Bird body with gradient using character colors
        const bodyGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, BIRD_SIZE/2);
        bodyGradient.addColorStop(0, colors.body);
        bodyGradient.addColorStop(0.7, colors.secondary);
        bodyGradient.addColorStop(1, this.darkenColor(colors.secondary, 0.3));
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
        ctx.fill();

        // Bird outline
        ctx.strokeStyle = this.darkenColor(colors.secondary, 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Wing animation
        const wingOffset = Math.sin(Date.now() * 0.02) * 3 + this.flapAnimation * 8;
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.ellipse(-5, wingOffset, BIRD_SIZE/3, BIRD_SIZE/4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.body;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bird beak
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(BIRD_SIZE/2, 0);
        ctx.lineTo(BIRD_SIZE/2 + 12, -3);
        ctx.lineTo(BIRD_SIZE/2 + 12, 3);
        ctx.closePath();
        ctx.fill();

        // Beak outline
        ctx.strokeStyle = this.darkenColor(colors.accent, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bird eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-2, -8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, -8, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-1, -10, 2, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyebrow
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.lineTo(2, -15);
        ctx.stroke();

        // Draw character-specific special effects
        this.drawSpecialEffects(ctx, character);

        ctx.restore();
    }

    drawSpecialEffects(ctx, character) {
        switch(character.id) {
            case 'blue':
                // Lightning effect for speed
                if (Math.random() < 0.1) {
                    ctx.strokeStyle = character.colors.accent;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-15, -15);
                    ctx.lineTo(-10, -5);
                    ctx.lineTo(-15, 5);
                    ctx.stroke();
                }
                break;
            case 'yellow':
                // Triangle shape effect
                ctx.strokeStyle = character.colors.accent;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(-15, 10);
                ctx.lineTo(15, 10);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'black':
                // Fuse effect
                ctx.strokeStyle = '#FF4444';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(0, -25);
                ctx.stroke();
                // Spark effect
                if (Math.random() < 0.2) {
                    ctx.fillStyle = '#FFAA00';
                    ctx.beginPath();
                    ctx.arc(0, -25, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'green':
                // Boomerang trail
                ctx.strokeStyle = character.colors.accent;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(0, 0, 25, 0, Math.PI);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
        }
    }

    drawTrail(ctx) {
        const character = this.characterManager.getCurrentCharacter();
        this.trail.forEach(point => {
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = character.colors.body;
            ctx.beginPath();
            ctx.arc(point.x, point.y, BIRD_SIZE/3, 0, Math.PI * 2);
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
