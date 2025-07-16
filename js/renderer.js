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

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clouds = [];
        this.generateClouds();
    }

    generateClouds() {
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
    }

    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.generateClouds();
    }

    updateClouds() {
        this.clouds.forEach(cloud => cloud.update(this.canvas.width));
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

        // Draw clouds
        this.clouds.forEach(cloud => cloud.draw(this.ctx));

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
    }

    render(bird, pipeManager, particleSystem) {
        this.renderBackground();
        
        // Draw pipes
        pipeManager.draw(this.ctx);
        
        // Draw bird trail
        bird.drawTrail(this.ctx);
        
        // Draw bird
        bird.draw(this.ctx);
        
        // Draw particles
        particleSystem.draw(this.ctx);
    }
}
