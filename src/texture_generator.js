class TextureGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textures = {};
        this.generateTextures();
    }

    generateTextures() {
        this.generateMetalTexture();
        this.generateBrushedMetal();
        this.generateWornMetal();
        this.applyTexturesToCSS();
    }

    generateMetalTexture() {
        const size = 64;
        this.canvas.width = size;
        this.canvas.height = size;
        
        const imageData = this.ctx.createImageData(size, size);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 0.3 + 0.7;
            const base = 80;
            
            data[i] = base * noise;     // R
            data[i + 1] = base * noise; // G  
            data[i + 2] = base * noise; // B
            data[i + 3] = 255;          // A
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.textures.metal = this.canvas.toDataURL();
    }

    generateBrushedMetal() {
        const size = 32;
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Create brushed metal pattern
        const gradient = this.ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(0.5, '#888');
        gradient.addColorStop(1, '#666');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, size, size);
        
        // Add brush lines
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < size; i += 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, size);
            this.ctx.stroke();
        }
        
        this.textures.brushed = this.canvas.toDataURL();
    }

    generateWornMetal() {
        const size = 48;
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Base metal color
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(0, 0, size, size);
        
        // Add wear patterns
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 3 + 1;
            const alpha = Math.random() * 0.3 + 0.1;
            
            this.ctx.fillStyle = `rgba(100,100,100,${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.textures.worn = this.canvas.toDataURL();
    }

    applyTexturesToCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .flap-container[data-state="0"] .flap-top,
            .flap-container[data-state="0"] .flap-bottom {
                background-image: url('${this.textures.metal}');
                background-size: 8px 8px;
                background-blend-mode: multiply;
            }
            
            .flap-container[data-state="1"] .flap-top,
            .flap-container[data-state="1"] .flap-bottom {
                background-image: url('${this.textures.brushed}');
                background-size: 6px 6px;
                background-blend-mode: screen;
            }
            
            #flap-display::before {
                background-image: url('${this.textures.worn}');
                background-size: 32px 32px;
                background-repeat: repeat;
                background-blend-mode: multiply;
            }
        `;
        document.head.appendChild(style);
    }

    generateIcon(type, size = 16) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, size, size);
        
        this.ctx.fillStyle = '#ccc';
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        
        switch (type) {
            case 'flip-h':
                this.drawFlipHIcon(size);
                break;
            case 'flip-v':
                this.drawFlipVIcon(size);
                break;
            case 'rotate':
                this.drawRotateIcon(size);
                break;
            case 'invert':
                this.drawInvertIcon(size);
                break;
            case 'reset':
                this.drawResetIcon(size);
                break;
        }
        
        return this.canvas.toDataURL();
    }

    drawFlipHIcon(size) {
        const center = size / 2;
        // Draw arrow pointing left-right
        this.ctx.beginPath();
        this.ctx.moveTo(2, center);
        this.ctx.lineTo(size - 2, center);
        this.ctx.moveTo(4, center - 3);
        this.ctx.lineTo(2, center);
        this.ctx.lineTo(4, center + 3);
        this.ctx.moveTo(size - 4, center - 3);
        this.ctx.lineTo(size - 2, center);
        this.ctx.lineTo(size - 4, center + 3);
        this.ctx.stroke();
    }

    drawFlipVIcon(size) {
        const center = size / 2;
        // Draw arrow pointing up-down
        this.ctx.beginPath();
        this.ctx.moveTo(center, 2);
        this.ctx.lineTo(center, size - 2);
        this.ctx.moveTo(center - 3, 4);
        this.ctx.lineTo(center, 2);
        this.ctx.lineTo(center + 3, 4);
        this.ctx.moveTo(center - 3, size - 4);
        this.ctx.lineTo(center, size - 2);
        this.ctx.lineTo(center + 3, size - 4);
        this.ctx.stroke();
    }

    drawRotateIcon(size) {
        const center = size / 2;
        const radius = size * 0.3;
        // Draw circular arrow
        this.ctx.beginPath();
        this.ctx.arc(center, center, radius, -Math.PI/2, Math.PI);
        this.ctx.stroke();
        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(center - radius - 2, center + 2);
        this.ctx.lineTo(center - radius, center);
        this.ctx.lineTo(center - radius + 2, center + 2);
        this.ctx.stroke();
    }

    drawInvertIcon(size) {
        const quarter = size / 4;
        // Draw half black, half white circle
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, quarter, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, quarter, 0, Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
    }

    drawResetIcon(size) {
        const center = size / 2;
        // Draw refresh symbol
        this.ctx.beginPath();
        this.ctx.arc(center, center, size * 0.3, Math.PI/4, Math.PI * 1.75);
        this.ctx.stroke();
        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(center + 3, 4);
        this.ctx.lineTo(center + 5, 2);
        this.ctx.lineTo(center + 5, 6);
        this.ctx.fill();
    }
}

module.exports = TextureGenerator;