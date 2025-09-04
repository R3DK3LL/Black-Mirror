const SoundManager = require('./sound-manager');
const TextureGenerator = require('./texture-generator');

class AssetLoader {
    constructor() {
        this.soundManager = new SoundManager();
        this.textureGenerator = new TextureGenerator();
        this.iconsGenerated = false;
    }

    init() {
        this.generateIcons();
        this.soundManager.playStartup();
    }

    generateIcons() {
        if (this.iconsGenerated) return;
        
        const iconTypes = ['flip-h', 'flip-v', 'rotate', 'invert', 'reset'];
        const iconStyle = document.createElement('style');
        let css = '';
        
        iconTypes.forEach(type => {
            const iconData = this.textureGenerator.generateIcon(type, 16);
            css += `
                .icon-${type}::before {
                    content: '';
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background-image: url('${iconData}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    margin-right: 6px;
                    vertical-align: middle;
                }
            `;
        });
        
        iconStyle.textContent = css;
        document.head.appendChild(iconStyle);
        this.iconsGenerated = true;
        
        // Apply icons to control labels
        setTimeout(() => {
            this.applyIconsToControls();
        }, 100);
    }

    applyIconsToControls() {
        const controls = {
            'flip-h': document.querySelector('label[for="flip-h"] .control-text'),
            'flip-v': document.querySelector('label[for="flip-v"] .control-text'),
            'invert': document.querySelector('label[for="invert"] .control-text'),
            'reset': document.getElementById('reset')
        };
        
        Object.entries(controls).forEach(([type, element]) => {
            if (element) {
                element.classList.add(`icon-${type}`);
            }
        });
    }

    playFlipSound() {
        this.soundManager.playFlip();
    }

    playClickSound() {
        this.soundManager.playClick();
    }

    setSoundEnabled(enabled) {
        this.soundManager.setEnabled(enabled);
    }

    setSoundVolume(volume) {
        this.soundManager.setVolume(volume);
    }

    // Generate additional visual assets
    createLoadingSpinner() {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Create spinning mechanical gear
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const center = size / 2;
        const radius = size * 0.4;
        const teeth = 8;
        
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const x1 = center + Math.cos(angle) * radius;
            const y1 = center + Math.sin(angle) * radius;
            const x2 = center + Math.cos(angle) * (radius + 3);
            const y2 = center + Math.sin(angle) * (radius + 3);
            
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        return canvas.toDataURL();
    }

    // Create noise texture for authentic mechanical look
    createNoiseTexture(intensity = 0.1) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 255;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = 255 * intensity; // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    }
}

module.exports = AssetLoader;