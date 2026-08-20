/**
 * Tech Manthan 6.0 - Matrix Binary Code Engine & FX
 */

class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Matrix Rain State
        this.fontSize = 16;
        this.columns = 0;
        this.drops = [];
        this.chars = "01";
        
        // Additional FX State
        this.shockwaves = [];
        this.particles = []; // For burst explosions
        this.width = 0;
        this.height = 0;
        this.lastDrawTime = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate(0);
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        
        this.columns = Math.floor(this.width / this.fontSize) + 1;
        this.drops = [];
        for (let x = 0; x < this.columns; x++) {
            this.drops[x] = Math.floor(Math.random() * this.height / this.fontSize);
        }
    }

    createShockwave(x, y, color = '#00f3ff', maxRadius = 900) {
        this.shockwaves.push({
            x: x || this.width / 2,
            y: y || this.height / 2,
            radius: 5,
            maxRadius: maxRadius,
            color: color,
            alpha: 1,
            speed: 20,
            lineWidth: 7
        });
    }

    createRevealExplosion(x, y) {
        const cx = x || this.width / 2;
        const cy = y || this.height / 2;

        this.createShockwave(cx, cy, '#00f3ff', 1100);
        setTimeout(() => this.createShockwave(cx, cy, '#bc13fe', 1300), 140);
        setTimeout(() => this.createShockwave(cx, cy, '#ffffff', 1000), 280);
        setTimeout(() => this.createShockwave(cx, cy, '#39ff14', 1200), 420);

        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#ffffff', '#ffd700'];
        for (let i = 0; i < 220; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 14 + 4;
            this.particles.push({
                x: cx,
                y: cy,
                radius: Math.random() * 3.8 + 1.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.014 + 0.008
            });
        }
    }

    setVortex(active, intensity = 1) {
        // Maintained for compatibility with scanner.js
    }

    animate(timestamp) {
        requestAnimationFrame((ts) => this.animate(ts));

        // Throttle to 30 FPS for Matrix rain
        if (!this.lastDrawTime) this.lastDrawTime = timestamp;
        if (timestamp - this.lastDrawTime < 33) return; 
        this.lastDrawTime = timestamp;

        // Matrix Rain Background
        this.ctx.fillStyle = 'rgba(2, 5, 10, 0.15)'; // Trail effect
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.font = this.fontSize + 'px "JetBrains Mono", monospace';
        
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.chars.charAt(Math.floor(Math.random() * this.chars.length));
            
            // Randomly highlight some characters in white
            this.ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : '#39ff14';
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

            if (this.drops[i] * this.fontSize > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++; // Integer step to prevent blurring
        }

        // Render Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed;
            sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));
            sw.lineWidth = Math.max(0.5, sw.lineWidth * 0.98);

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = sw.color;
            this.ctx.lineWidth = sw.lineWidth;
            this.ctx.globalAlpha = sw.alpha;
            this.ctx.shadowColor = sw.color;
            this.ctx.shadowBlur = 22;
            this.ctx.stroke();
            this.ctx.restore();

            if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Render Burst Explosions
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 14;
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

window.ParticleEngine = ParticleEngine;
