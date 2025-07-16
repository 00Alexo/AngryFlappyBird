import { PIPE_WIDTH, PIPE_GAP, PIPE_SPEED, COLORS } from './constants.js';

export class Pipe {
    constructor(x, topHeight, bottomY) {
        this.x = x;
        this.topHeight = topHeight;
        this.bottomY = bottomY;
        this.scored = false;
        this.highlight = false;
        this.highlightIntensity = 0;
        this.highlightDirection = 1;
        this.celebrationTimer = 0;
        this.shakeOffset = 0;
        this.glowRadius = 0;
    }

    update() {
        this.x -= PIPE_SPEED;
        
        // Update highlight animation
        if (this.highlight) {
            this.highlightIntensity += this.highlightDirection * 0.1;
            if (this.highlightIntensity >= 1) {
                this.highlightIntensity = 1;
                this.highlightDirection = -1;
            } else if (this.highlightIntensity <= 0.3) {
                this.highlightIntensity = 0.3;
                this.highlightDirection = 1;
            }
            
            // Celebration effects
            if (this.celebrationTimer > 0) {
                this.celebrationTimer--;
                this.shakeOffset = Math.sin(this.celebrationTimer * 0.5) * 3;
                this.glowRadius = Math.max(0, this.celebrationTimer * 0.5);
            }
        }
    }

    isOffScreen() {
        return this.x + PIPE_WIDTH < 0;
    }

    checkCollision(bird) {
        const birdBounds = bird.getBounds();
        const pipeLeft = this.x;
        const pipeRight = this.x + PIPE_WIDTH;

        // Check if bird is within pipe's x range
        if (birdBounds.right > pipeLeft && birdBounds.left < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdBounds.top < this.topHeight || birdBounds.bottom > this.bottomY) {
                return true;
            }
        }
        return false;
    }

    checkScored(bird) {
        if (!this.scored && bird.x > this.x + PIPE_WIDTH) {
            this.scored = true;
            this.highlight = true;
            this.highlightIntensity = 0.3;
            this.celebrationTimer = 60; // 60 frames of celebration
            this.glowRadius = 30;
            return true;
        }
        return false;
    }

    removeHighlight(bird) {
        if (this.highlight && this.x < bird.x - 200) {
            this.highlight = false;
            this.highlightIntensity = 0;
            this.celebrationTimer = 0;
            this.shakeOffset = 0;
            this.glowRadius = 0;
        }
    }

    draw(ctx, canvasHeight) {
        // Save context for transformations
        ctx.save();
        
        // Apply shake effect when celebrating
        if (this.highlight && this.celebrationTimer > 0) {
            ctx.translate(this.shakeOffset, 0);
        }
        
        // Draw glow effect behind the tower when highlighted
        if (this.highlight && this.glowRadius > 0) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = this.glowRadius;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        const highlight = this.highlight ? this.interpolateColor(COLORS.PIPE.NORMAL, COLORS.PIPE.HIGHLIGHT, this.highlightIntensity) : COLORS.PIPE.NORMAL;
        const shadow = this.highlight ? this.interpolateColor(COLORS.PIPE.SHADOW, COLORS.PIPE.HIGHLIGHT_SHADOW, this.highlightIntensity) : COLORS.PIPE.SHADOW;

        // Top pig tower
        this.drawPigTower(ctx, this.x, 0, PIPE_WIDTH, this.topHeight, highlight, shadow, 'top');

        // Bottom pig tower
        this.drawPigTower(ctx, this.x, this.bottomY, PIPE_WIDTH, canvasHeight - this.bottomY, highlight, shadow, 'bottom');

        // Pig tower caps with pig faces
        this.drawPigCap(ctx, this.x, this.topHeight - 30, PIPE_WIDTH + 10, 30, highlight, shadow, 'top');
        this.drawPigCap(ctx, this.x, this.bottomY, PIPE_WIDTH + 10, 30, highlight, shadow, 'bottom');
        
        // Draw celebration particles if celebrating
        if (this.highlight && this.celebrationTimer > 0) {
            this.drawCelebrationParticles(ctx);
        }
        
        // Restore context
        ctx.restore();
    }

    drawPigTower(ctx, x, y, width, height, lightColor, darkColor, position) {
        // Main tower body (pig structure)
        ctx.fillStyle = COLORS.PIPE.PIG_GREEN;
        ctx.fillRect(x, y, width, height);

        // Left highlight
        ctx.fillStyle = COLORS.PIPE.SHINE;
        ctx.fillRect(x, y, 4, height);

        // Right shadow
        ctx.fillStyle = darkColor;
        ctx.fillRect(x + width - 4, y, 4, height);

        // Wooden support beams
        ctx.fillStyle = COLORS.PIPE.WOOD;
        const beamWidth = 6;
        const beamSpacing = height / 4;
        
        for (let i = 1; i < 4; i++) {
            const beamY = y + (beamSpacing * i);
            ctx.fillRect(x + 5, beamY, width - 10, beamWidth);
            
            // Beam shadows
            ctx.fillStyle = COLORS.PIPE.WOOD_DARK;
            ctx.fillRect(x + 5, beamY + beamWidth - 2, width - 10, 2);
            ctx.fillStyle = COLORS.PIPE.WOOD;
        }

        // Windows/openings in the tower
        ctx.fillStyle = '#333333';
        const windowWidth = 12;
        const windowHeight = 8;
        const windowSpacing = height / 3;
        
        for (let i = 0; i < 3; i++) {
            const windowY = y + (windowSpacing * i) + 20;
            ctx.fillRect(x + width/2 - windowWidth/2, windowY, windowWidth, windowHeight);
            
            // Window frame
            ctx.strokeStyle = COLORS.PIPE.WOOD_DARK;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + width/2 - windowWidth/2, windowY, windowWidth, windowHeight);
        }

        // Pig decorative elements on the sides
        if (height > 60) {
            this.drawPigDecoration(ctx, x - 2, y + height/2, position);
            this.drawPigDecoration(ctx, x + width - 8, y + height/2, position);
        }
    }

    drawPigDecoration(ctx, x, y, position) {
        // Small pig face decoration
        ctx.fillStyle = COLORS.PIPE.PIG_PINK;
        ctx.beginPath();
        ctx.arc(x + 5, y, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Pig snout
        ctx.fillStyle = COLORS.PIPE.PIG_SNOUT;
        ctx.beginPath();
        ctx.arc(x + 5, y + 2, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Nostrils
        ctx.fillStyle = COLORS.PIPE.PIG_EYE;
        ctx.beginPath();
        ctx.arc(x + 4, y + 2, 0.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 6, y + 2, 0.5, 0, 2 * Math.PI);
        ctx.fill();

        // Eyes
        ctx.fillStyle = COLORS.PIPE.PIG_EYE_WHITE;
        ctx.beginPath();
        ctx.arc(x + 3, y - 2, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 7, y - 2, 1.5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = COLORS.PIPE.PIG_EYE;
        ctx.beginPath();
        ctx.arc(x + 3, y - 2, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 7, y - 2, 0.8, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawPigCap(ctx, x, y, width, height, lightColor, darkColor, position) {
        // Main cap structure
        ctx.fillStyle = COLORS.PIPE.PIG_GREEN;
        ctx.fillRect(x - 5, y, width, height);

        // Top highlight
        ctx.fillStyle = COLORS.PIPE.SHINE;
        ctx.fillRect(x - 5, y, width, 3);

        // Bottom shadow
        ctx.fillStyle = darkColor;
        ctx.fillRect(x - 5, y + height - 3, width, 3);

        // Side shadows
        ctx.fillStyle = darkColor;
        ctx.fillRect(x + width - 8, y, 3, height);

        // Large pig face on the cap
        this.drawLargePigFace(ctx, x + width/2 - 15, y + height/2 - 10, position);

        // Pig ears
        ctx.fillStyle = COLORS.PIPE.PIG_PINK;
        if (position === 'top') {
            // Ears pointing up
            ctx.beginPath();
            ctx.moveTo(x + width/2 - 20, y + 5);
            ctx.lineTo(x + width/2 - 15, y - 2);
            ctx.lineTo(x + width/2 - 10, y + 5);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x + width/2 + 10, y + 5);
            ctx.lineTo(x + width/2 + 15, y - 2);
            ctx.lineTo(x + width/2 + 20, y + 5);
            ctx.fill();
        } else {
            // Ears pointing down
            ctx.beginPath();
            ctx.moveTo(x + width/2 - 20, y + height - 5);
            ctx.lineTo(x + width/2 - 15, y + height + 2);
            ctx.lineTo(x + width/2 - 10, y + height - 5);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x + width/2 + 10, y + height - 5);
            ctx.lineTo(x + width/2 + 15, y + height + 2);
            ctx.lineTo(x + width/2 + 20, y + height - 5);
            ctx.fill();
        }
    }

    drawLargePigFace(ctx, x, y, position) {
        // Main pig face
        ctx.fillStyle = COLORS.PIPE.PIG_PINK;
        ctx.beginPath();
        ctx.arc(x + 15, y + 10, 12, 0, 2 * Math.PI);
        ctx.fill();

        // Pig snout
        ctx.fillStyle = COLORS.PIPE.PIG_SNOUT;
        ctx.beginPath();
        ctx.arc(x + 15, y + 14, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Nostrils
        ctx.fillStyle = COLORS.PIPE.PIG_EYE;
        ctx.beginPath();
        ctx.arc(x + 13, y + 14, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 17, y + 14, 1, 0, 2 * Math.PI);
        ctx.fill();

        // Eyes - make them more expressive when highlighted
        ctx.fillStyle = COLORS.PIPE.PIG_EYE_WHITE;
        const eyeSize = this.highlight ? 3.5 : 3;
        ctx.beginPath();
        ctx.arc(x + 11, y + 7, eyeSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 19, y + 7, eyeSize, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = COLORS.PIPE.PIG_EYE;
        const pupilSize = this.highlight ? 2.5 : 2;
        ctx.beginPath();
        ctx.arc(x + 11, y + 7, pupilSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 19, y + 7, pupilSize, 0, 2 * Math.PI);
        ctx.fill();

        // Angry eyebrows - more intense when highlighted
        ctx.strokeStyle = COLORS.PIPE.PIG_EYE;
        ctx.lineWidth = this.highlight ? 3 : 2;
        const eyebrowOffset = this.highlight ? 2 : 0;
        
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 4 - eyebrowOffset);
        ctx.lineTo(x + 13, y + 6 - eyebrowOffset);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 17, y + 6 - eyebrowOffset);
        ctx.lineTo(x + 22, y + 4 - eyebrowOffset);
        ctx.stroke();
        
        // Add angry mouth when highlighted
        if (this.highlight) {
            ctx.strokeStyle = COLORS.PIPE.PIG_EYE;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 15, y + 18, 3, 0, Math.PI);
            ctx.stroke();
        }
    }

    interpolateColor(color1, color2, factor) {
        // Simple color interpolation - for basic effect
        // In a full implementation, you'd parse hex colors and interpolate RGB values
        return factor > 0.5 ? color2 : color1;
    }

    drawCelebrationParticles(ctx) {
        const centerX = this.x + PIPE_WIDTH / 2;
        const centerY = this.topHeight + (this.bottomY - this.topHeight) / 2;
        
        // Draw golden particles around the gap
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 40 + Math.sin(this.celebrationTimer * 0.2 + i) * 10;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.sin(this.celebrationTimer * 0.3 + i) * 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add sparkle effect
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Draw score text effect
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+1', centerX, centerY - 30);
        
        // Add text shadow
        ctx.fillStyle = '#FF6B35';
        ctx.fillText('+1', centerX + 1, centerY - 29);
    }
}

export class PipeManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.pipes = [];
    }

    reset() {
        this.pipes = [];
        this.generatePipe();
    }

    generatePipe() {
        const gapY = Math.random() * (this.canvasHeight - PIPE_GAP - 200) + 100;
        this.pipes.push(new Pipe(this.canvasWidth, gapY, gapY + PIPE_GAP));
    }

    update(bird) {
        // Update all pipes
        this.pipes.forEach(pipe => {
            pipe.update();
            pipe.removeHighlight(bird);
        });

        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => !pipe.isOffScreen());

        // Generate new pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvasWidth - 350) {
            this.generatePipe();
        }
    }

    checkCollisions(bird) {
        return this.pipes.some(pipe => pipe.checkCollision(bird));
    }

    // New method to handle pipe smashing during rage mode
    checkAndSmashCollisions(bird) {
        const collidingPipeIndex = this.pipes.findIndex(pipe => pipe.checkCollision(bird));
        
        if (collidingPipeIndex !== -1) {
            // Remove the colliding pipe (smash it)
            this.pipes.splice(collidingPipeIndex, 1);
            return true; // Collision occurred, but pipe was smashed
        }
        
        return false; // No collision
    }

    checkScoring(bird) {
        return this.pipes.some(pipe => pipe.checkScored(bird));
    }

    draw(ctx) {
        this.pipes.forEach(pipe => pipe.draw(ctx, this.canvasHeight));
    }

    getScoreParticlePosition() {
        const scoredPipe = this.pipes.find(pipe => pipe.scored && pipe.highlight);
        if (scoredPipe) {
            return {
                x: scoredPipe.x + PIPE_WIDTH/2,
                y: scoredPipe.topHeight + PIPE_GAP/2
            };
        }
        return null;
    }
}
