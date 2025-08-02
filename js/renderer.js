import { COLORS } from './constants.js';

export class Cloud {
    constructor(x, y, size, speed, opacity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.opacity = opacity;
    }

    update(canvasWidth) {
        this.x -= this.speed;
        if (this.x + this.size < 0) {
            this.x = canvasWidth + this.size;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.5, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 1.2, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.8, this.y - this.size * 0.3, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class Slingshot {
    constructor(x, y, size, speed, swayAmount) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.swayAmount = swayAmount;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.time = 0;
        this.baseY = y;
    }

    update(canvasWidth, canvasHeight) {
        this.x -= this.speed;
        this.time += 0.02;
        
        // Add swaying motion
        this.y = this.baseY + Math.sin(this.time + this.swayPhase) * this.swayAmount;
        
        if (this.x + this.size < 0) {
            this.x = canvasWidth + Math.random() * 200;
            this.baseY = canvasHeight - 150; // Keep on ground level
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw slingshot base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-this.size * 0.3, this.size * 0.5, this.size * 0.6, this.size * 0.8);
        
        // Draw slingshot arms
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = this.size * 0.15;
        ctx.lineCap = 'round';
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.1, this.size * 0.5);
        ctx.lineTo(-this.size * 0.4, -this.size * 0.2);
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.moveTo(this.size * 0.1, this.size * 0.5);
        ctx.lineTo(this.size * 0.4, -this.size * 0.2);
        ctx.stroke();
        
        // Draw rubber band
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = this.size * 0.05;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.4, -this.size * 0.2);
        ctx.lineTo(this.size * 0.4, -this.size * 0.2);
        ctx.stroke();
        
        ctx.restore();
    }
}

export class Pig {
    constructor(x, y, size, speed, bounceHeight) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.bounceHeight = bounceHeight;
        this.bouncePhase = Math.random() * Math.PI * 2;
        this.time = 0;
        this.baseY = y;
    }

    update(canvasWidth) {
        this.x -= this.speed;
        this.time += 0.03;
        
        // Add bouncing motion
        this.y = this.baseY + Math.sin(this.time + this.bouncePhase) * this.bounceHeight;
        
        if (this.x + this.size < 0) {
            this.x = canvasWidth + Math.random() * 300;
            this.baseY = Math.random() * 50 + 350; // Stay on ground level
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw pig body
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pig ears
        ctx.fillStyle = '#7CFC00';
        ctx.beginPath();
        ctx.arc(-this.size * 0.6, -this.size * 0.4, this.size * 0.3, 0, Math.PI * 2);
        ctx.arc(this.size * 0.6, -this.size * 0.4, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pig eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.arc(this.size * 0.3, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pig snout
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(0, this.size * 0.2, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw nostrils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-this.size * 0.1, this.size * 0.2, this.size * 0.05, 0, Math.PI * 2);
        ctx.arc(this.size * 0.1, this.size * 0.2, this.size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class StructuralElement {
    constructor(x, y, type, size, speed) {
        this.x = x;
        this.y = y;
        this.type = type; // 'wood', 'stone', 'ice'
        this.size = size;
        this.speed = speed;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update(canvasWidth) {
        this.x -= this.speed;
        this.rotation += this.rotationSpeed;
        
        if (this.x + this.size < 0) {
            this.x = canvasWidth + Math.random() * 400;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        switch (this.type) {
            case 'wood':
                ctx.fillStyle = '#8B4513';
                ctx.strokeStyle = '#654321';
                break;
            case 'stone':
                ctx.fillStyle = '#696969';
                ctx.strokeStyle = '#2F4F4F';
                break;
            case 'ice':
                ctx.fillStyle = '#87CEEB';
                ctx.strokeStyle = '#4682B4';
                break;
        }
        
        ctx.lineWidth = 2;
        ctx.fillRect(-this.size * 0.5, -this.size * 0.1, this.size, this.size * 0.2);
        ctx.strokeRect(-this.size * 0.5, -this.size * 0.1, this.size, this.size * 0.2);
        
        ctx.restore();
    }
}

export class Bird {
    constructor(x, y, type, size, speed, flightPattern) {
        this.x = x;
        this.y = y;
        this.type = type; // 'small', 'medium', 'large'
        this.size = size;
        this.speed = speed;
        this.flightPattern = flightPattern;
        this.time = 0;
        this.baseY = y;
        this.wingPhase = Math.random() * Math.PI * 2;
    }

    update(canvasWidth) {
        this.x -= this.speed;
        this.time += 0.05;
        
        // Different flight patterns
        switch (this.flightPattern) {
            case 'wave':
                this.y = this.baseY + Math.sin(this.time) * 30;
                break;
            case 'dive':
                this.y = this.baseY + Math.sin(this.time * 2) * 50;
                break;
            case 'soar':
                this.y = this.baseY + Math.sin(this.time * 0.5) * 20;
                break;
        }
        
        if (this.x + this.size < 0) {
            this.x = canvasWidth + Math.random() * 500;
            this.baseY = Math.random() * 150 + 50; // Stay in sky area
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw bird body
        ctx.fillStyle = this.type === 'small' ? '#FF6B6B' : this.type === 'medium' ? '#4A90E2' : '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wings (animated)
        const wingOffset = Math.sin(this.time * 8 + this.wingPhase) * 0.3;
        ctx.fillStyle = this.type === 'small' ? '#FF4444' : this.type === 'medium' ? '#0066CC' : '#FFA500';
        
        // Left wing
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.8, wingOffset, this.size * 0.6, this.size * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.ellipse(this.size * 0.8, wingOffset, this.size * 0.6, this.size * 0.3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.size * 0.3, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clouds = [];
        this.slingshots = [];
        this.structuralElements = [];
        this.backgroundBirds = [];
        this.generateBackgroundElements();
    }

    generateBackgroundElements() {
        // Generate clouds
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push(new Cloud(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height * 0.6,
                Math.random() * 60 + 40,
                Math.random() * 0.5 + 0.2,
                Math.random() * 0.3 + 0.1
            ));
        }

        // Generate slingshots
        this.slingshots = [];
        for (let i = 0; i < 3; i++) {
            this.slingshots.push(new Slingshot(
                Math.random() * this.canvas.width + i * 300,
                this.canvas.height - 150, // Fixed position on ground
                Math.random() * 30 + 40,
                Math.random() * 0.3 + 0.1,
                Math.random() * 5 + 3 // Reduced sway for ground placement
            ));
        }

        // Generate structural elements
        this.structuralElements = [];
        const types = ['wood', 'stone', 'ice'];
        for (let i = 0; i < 5; i++) {
            this.structuralElements.push(new StructuralElement(
                Math.random() * this.canvas.width + i * 200,
                Math.random() * 150 + 250,
                types[Math.floor(Math.random() * types.length)],
                Math.random() * 30 + 20,
                Math.random() * 0.3 + 0.1
            ));
        }

        // Generate background birds
        this.backgroundBirds = [];
        const flightPatterns = ['wave', 'dive', 'soar'];
        const birdTypes = ['small', 'medium', 'large'];
        for (let i = 0; i < 6; i++) {
            this.backgroundBirds.push(new Bird(
                Math.random() * this.canvas.width + i * 200,
                Math.random() * 150 + 50,
                birdTypes[Math.floor(Math.random() * birdTypes.length)],
                Math.random() * 8 + 8,
                Math.random() * 0.8 + 0.4,
                flightPatterns[Math.floor(Math.random() * flightPatterns.length)]
            ));
        }
    }

    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.generateBackgroundElements();
    }

    updateBackgroundElements() {
        this.clouds.forEach(cloud => cloud.update(this.canvas.width));
        this.slingshots.forEach(slingshot => slingshot.update(this.canvas.width, this.canvas.height));
        this.structuralElements.forEach(element => element.update(this.canvas.width));
        this.backgroundBirds.forEach(bird => bird.update(this.canvas.width));
    }

    renderBackground() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, COLORS.BACKGROUND.SKY_TOP);
        gradient.addColorStop(0.3, COLORS.BACKGROUND.SKY_MID);
        gradient.addColorStop(0.7, COLORS.BACKGROUND.GROUND_TOP);
        gradient.addColorStop(1, COLORS.BACKGROUND.GROUND_BOTTOM);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background birds (behind clouds)
        this.backgroundBirds.forEach(bird => bird.draw(this.ctx));

        // Draw clouds
        this.clouds.forEach(cloud => cloud.draw(this.ctx));

        // Draw structural elements
        this.structuralElements.forEach(element => element.draw(this.ctx));

        // Draw ground
        const groundHeight = 80;
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - groundHeight, 0, this.canvas.height);
        groundGradient.addColorStop(0, COLORS.BACKGROUND.DIRT_TOP);
        groundGradient.addColorStop(0.5, COLORS.BACKGROUND.DIRT_MID);
        groundGradient.addColorStop(1, COLORS.BACKGROUND.DIRT_BOTTOM);
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - groundHeight, this.canvas.width, groundHeight);

        // Draw grass on ground
        this.ctx.fillStyle = COLORS.BACKGROUND.GRASS;
        this.ctx.fillRect(0, this.canvas.height - groundHeight, this.canvas.width, 20);

        // Draw slingshots (on ground)
        this.slingshots.forEach(slingshot => slingshot.draw(this.ctx));
    }

    render(bird, pipeManager, particleSystem, abilityManager = null) {
        // Update all background elements
        this.updateBackgroundElements();
        
        // Render background with all elements
        this.renderBackground();
        
        // Draw pipes
        pipeManager.draw(this.ctx);
        
        // Draw bird trail
        bird.drawTrail(this.ctx);
        
        // Check if we need to render multiple Blues birds
        if (abilityManager && abilityManager.isBluesActive()) {
            this.renderBluesBirds(bird, abilityManager);
        } else {
            // Draw single bird (will be hidden if not visible)
            bird.draw(this.ctx);
        }
        
        // Draw particles
        particleSystem.draw(this.ctx);
        
        // Draw egg bomb if active (Matilda's ability)
        if (abilityManager) {
            abilityManager.renderEggBomb(this.ctx);
            // Draw gravity bubble if active (Stella's ability)
            abilityManager.renderGravityBubble(this.ctx);
        }
    }
    
    renderBluesBirds(bird, abilityManager) {
        const birdCount = abilityManager.getBluesBirdCount();
        const spacing = 35; // Increased distance between birds
        
        // Draw birds in formation (back to front for proper layering)
        for (let i = birdCount - 1; i >= 0; i--) {
            this.ctx.save();
            
            // Position birds in a diagonal formation behind each other
            let offsetX = 0;
            let offsetY = 0;
            
            if (birdCount > 1) {
                if (i === 0) {
                    // Lead bird (main position)
                    offsetX = 0;
                    offsetY = 0;
                } else if (i === 1) {
                    // Second bird behind and slightly below
                    offsetX = -spacing;
                    offsetY = spacing * 0.7;
                } else if (i === 2) {
                    // Third bird further behind and above the second
                    offsetX = -spacing * 1.8;
                    offsetY = -spacing * 0.3;
                }
            }
            
            // Translate to bird position with offset
            this.ctx.translate(bird.x + offsetX, bird.y + offsetY);
            this.ctx.rotate(bird.rotation);
            
            // Draw blue bird with slight transparency for birds in back
            const alpha = i === 0 ? 1.0 : 0.85; // Front bird fully opaque, others slightly transparent
            this.ctx.globalAlpha = alpha;
            
            // Draw blue bird
            this.drawBluesBird(this.ctx, i);
            
            this.ctx.restore();
        }
    }
    
    drawBluesBird(ctx, birdIndex) {
        const BIRD_SIZE = 40; // Match the bird size from constants
        const colors = {
            body: '#4A90E2',        // Bright blue
            secondary: '#1E3A8A',   // Dark blue for shadows
            accent: '#60A5FA'       // Light blue for highlights
        };
        
        // Scale birds in back to be smaller for depth effect
        const scale = 1 - (birdIndex * 0.08); // Each bird behind gets progressively smaller
        ctx.scale(scale, scale);
        
        // Draw body
        ctx.fillStyle = colors.body;
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw shadow/shading
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.arc(2, 2, BIRD_SIZE/2 - 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(-3, -3, BIRD_SIZE/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-5, -5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-3, -3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(22, -3);
        ctx.lineTo(22, 3);
        ctx.closePath();
        ctx.fill();
    }
}
