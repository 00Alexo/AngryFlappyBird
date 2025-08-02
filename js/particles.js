import { COLORS } from './constants.js';

export class Particle {
    constructor(x, y, vx, vy, color, life = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class ExplosionParticle extends Particle {
    constructor(x, y, vx, vy, color, life = 1) {
        super(x, y, vx, vy, color, life);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life -= 0.02;
        return this.life > 0;
    }
}

export class EggBombParticle extends Particle {
    constructor(x, y, vx, vy, color, life = 1) {
        super(x, y, vx, vy, color, life);
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // lighter gravity
        this.life -= 0.015; // slower fade
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addFlapParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            const particle = new Particle(
                x,
                y,
                Math.random() * 4 - 2,
                Math.random() * 4 - 2,
                `hsl(${Math.random() * (COLORS.PARTICLES.FLAP_MAX - COLORS.PARTICLES.FLAP_MIN) + COLORS.PARTICLES.FLAP_MIN}, 70%, 60%)`
            );
            this.particles.push(particle);
        }
    }

    addScoreParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(
                x,
                y,
                Math.random() * 6 - 3,
                Math.random() * 6 - 3,
                COLORS.PARTICLES.SCORE
            );
            this.particles.push(particle);
        }
    }

    addExplosionParticles(x, y) {
        for (let i = 0; i < 30; i++) {
            const particle = new ExplosionParticle(
                x,
                y,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                `hsl(${Math.random() * 60}, 70%, 50%)`
            );
            this.particles.push(particle);
        }
    }

    addEggBombParticles(x, y) {
        // Egg explosion particles
        for (let i = 0; i < 20; i++) {
            const particle = new EggBombParticle(
                x,
                y,
                Math.random() * 8 - 4,
                Math.random() * 8 - 4,
                `hsl(${Math.random() * 40 + 40}, 60%, 70%)`, // Yellow to brown colors
                1.5
            );
            this.particles.push(particle);
        }
        
        // Add some white eggshell pieces
        for (let i = 0; i < 15; i++) {
            const particle = new EggBombParticle(
                x,
                y,
                Math.random() * 6 - 3,
                Math.random() * 6 - 3,
                '#FFFAF0', // Floral white
                1.2
            );
            this.particles.push(particle);
        }
    }

    update() {
        this.particles = this.particles.filter(particle => particle.update());
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.particles = [];
    }

    hasParticles() {
        return this.particles.length > 0;
    }
}
