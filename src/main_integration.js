const ScreenCapture = require('./screen-capture');
const FlapDisplay = require('./flap-display');
const UIControls = require('./ui-controls');
const MirrorEffects = require('./mirror-effects');
const AssetLoader = require('./asset-loader');
const PresetManager = require('./preset-manager');

class BlackMirror {
    constructor() {
        this.screenCapture = new ScreenCapture();
        this.flapDisplay = new FlapDisplay('flap-display');
        this.uiControls = new UIControls();
        this.mirrorEffects = new MirrorEffects();
        this.assetLoader = new AssetLoader();
        this.presetManager = new PresetManager();
        
        this.isRunning = false;
        this.animationFrame = null;
        this.lastUpdate = 0;
        this.frameRate = 30;
        this.frameInterval = 1000 / this.frameRate;
        
        this.init();
    }

    async init() {
        try {
            // Initialize components
            await this.screenCapture.init();
            this.assetLoader.init();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load default preset
            const defaultSettings = this.presetManager.getCurrentSettings();
            this.applySettings(defaultSettings);
            
            // Start the main loop
            this.start();
            
            console.log('Black Mirror initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Black Mirror:', error);
            this.showError('Failed to initialize screen capture. Please check permissions.');
        }
    }

    setupEventListeners() {
        // UI control events
        this.uiControls.on('settingsChange', (settings) => {
            this.applySettings(settings);
            this.presetManager.saveCustomSetting(Object.keys(settings)[0], Object.values(settings)[0]);
        });

        this.uiControls.on('resize', () => {
            this.flapDisplay.resize();
        });

        this.uiControls.on('pause', () => {
            this.toggle();
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.flapDisplay.resize();
        });

        // Preset shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                const presetNames = this.presetManager.getPresetNames();
                const index = parseInt(e.key) - 1;
                if (presetNames[index]) {
                    this.loadPreset(presetNames[index]);
                }
            }
        });
    }

    applySettings(settings) {
        // Update mirror effects
        this.mirrorEffects.updateSettings(settings);
        
        // Update frame rate
        if (settings.speed) {
            this.frameRate = Math.max(10, Math.min(60, 1000 / settings.speed));
            this.frameInterval = 1000 / this.frameRate;
        }
        
        // Update audio settings
        if (settings.soundEnabled !== undefined) {
            this.assetLoader.setSoundEnabled(settings.soundEnabled);
        }
        
        if (settings.soundVolume !== undefined) {
            this.assetLoader.setSoundVolume(settings.soundVolume);
        }
    }

    loadPreset(presetName) {
        const settings = this.presetManager.applyPreset(presetName);
        this.applySettings(settings);
        this.uiControls.updateUI();
        this.assetLoader.playClickSound();
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdate = performance.now();
        this.update();
        
        console.log('Black Mirror started');
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        console.log('Black Mirror stopped');
    }

    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    update() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastUpdate;
        
        if (deltaTime >= this.frameInterval) {
            try {
                // Capture screen data
                const rawPixelData = this.screenCapture.captureFrame();
                
                if (rawPixelData) {
                    // Apply mirror effects
                    const processedData = this.mirrorEffects.processPixelData(rawPixelData);
                    
                    // Update display
                    this.flapDisplay.update(processedData);
                }
                
                this.lastUpdate = now;
            } catch (error) {
                console.error('Update loop error:', error);
            }
        }
        
        this.animationFrame = requestAnimationFrame(() => this.update());
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Cleanup on window close
    destroy() {
        this.stop();
        this.screenCapture.stop();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.blackMirror = new BlackMirror();
});

// Cleanup on window unload
window.addEventListener('beforeunload', () => {
    if (window.blackMirror) {
        window.blackMirror.destroy();
    }
});

module.exports = BlackMirror;