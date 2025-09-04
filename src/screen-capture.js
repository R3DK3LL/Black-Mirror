const { desktopCapturer } = require('electron');

class ScreenCapture {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
    }

    async init() {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        // Filter out our own window to prevent feedback loop
        const currentWindow = require('electron').remote.getCurrentWindow();
        const filteredSources = sources.filter(source => 
            !source.name.includes('Black Mirror') && 
            source.id !== currentWindow.getMediaSourceId()
        );

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: filteredSources[0].id
                }
            }
        });

        this.stream = stream;
        this.setupVideo();
        this.setupCanvas();
    }

    setupVideo() {
        this.video = document.createElement('video');
        this.video.srcObject = this.stream;
        this.video.autoplay = true;
        this.video.style.display = 'none';
        document.body.appendChild(this.video);
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    captureFrame() {
        if (!this.video || !this.ctx) return null;

        const displayDiv = document.getElementById('flap-display');
        const rect = displayDiv.getBoundingClientRect();
        
        // Adaptive grid based on window size
        const flapSize = 12; // minimum flap size in pixels
        const width = Math.max(8, Math.floor(rect.width / flapSize));
        const height = Math.max(6, Math.floor(rect.height / flapSize));

        this.canvas.width = width;
        this.canvas.height = height;
        
        this.ctx.drawImage(this.video, 0, 0, width, height);
        
        const imageData = this.ctx.getImageData(0, 0, width, height);
        return this.pixelateData(imageData, width, height);
    }

    pixelateData(imageData, width, height) {
        const pixels = [];
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const gray = (r + g + b) / 3;
                row.push(gray > 128 ? 1 : 0);
            }
            pixels.push(row);
        }
        return pixels;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}

module.exports = ScreenCapture;
