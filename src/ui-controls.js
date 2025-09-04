class UIControls {
    constructor() {
        this.settings = {
            flipHorizontal: false,
            flipVertical: false,
            rotate: 0,
            invert: false,
            speed: 150,
            sensitivity: 128
        };
        this.callbacks = {};
        this.init();
    }

    init() {
        this.loadControlPanel();
        this.bindEvents();
        this.loadSettings();
    }

    loadControlPanel() {
        fetch('components/control-panel.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('control-panel').innerHTML = html;
                this.bindControlEvents();
            });
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.trigger('resize');
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    bindControlEvents() {
        // Flip controls
        document.getElementById('flip-h').addEventListener('change', (e) => {
            this.settings.flipHorizontal = e.target.checked;
            this.trigger('settingsChange', this.settings);
        });

        document.getElementById('flip-v').addEventListener('change', (e) => {
            this.settings.flipVertical = e.target.checked;
            this.trigger('settingsChange', this.settings);
        });

        // Rotation control
        document.getElementById('rotate').addEventListener('input', (e) => {
            this.settings.rotate = parseInt(e.target.value);
            this.trigger('settingsChange', this.settings);
        });

        // Invert control
        document.getElementById('invert').addEventListener('change', (e) => {
            this.settings.invert = e.target.checked;
            this.trigger('settingsChange', this.settings);
        });

        // Speed control
        document.getElementById('speed').addEventListener('input', (e) => {
            this.settings.speed = parseInt(e.target.value);
            this.trigger('settingsChange', this.settings);
        });

        // Sensitivity control
        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.settings.sensitivity = parseInt(e.target.value);
            this.trigger('settingsChange', this.settings);
        });

        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.resetSettings();
        });
    }

    handleKeyboard(e) {
        switch(e.key) {
            case 'h':
                this.toggleSetting('flipHorizontal');
                break;
            case 'v':
                this.toggleSetting('flipVertical');
                break;
            case 'i':
                this.toggleSetting('invert');
                break;
            case 'r':
                this.cycleSetting('rotate', [0, 90, 180, 270]);
                break;
            case ' ':
                e.preventDefault();
                this.trigger('pause');
                break;
        }
    }

    toggleSetting(key) {
        this.settings[key] = !this.settings[key];
        this.updateUI();
        this.trigger('settingsChange', this.settings);
    }

    cycleSetting(key, values) {
        const currentIndex = values.indexOf(this.settings[key]);
        const nextIndex = (currentIndex + 1) % values.length;
        this.settings[key] = values[nextIndex];
        this.updateUI();
        this.trigger('settingsChange', this.settings);
    }

    updateUI() {
        const elements = {
            'flip-h': this.settings.flipHorizontal,
            'flip-v': this.settings.flipVertical,
            'invert': this.settings.invert,
            'rotate': this.settings.rotate,
            'speed': this.settings.speed,
            'sensitivity': this.settings.sensitivity
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    resetSettings() {
        this.settings = {
            flipHorizontal: false,
            flipVertical: false,
            rotate: 0,
            invert: false,
            speed: 150,
            sensitivity: 128
        };
        this.updateUI();
        this.saveSettings();
        this.trigger('settingsChange', this.settings);
    }

    saveSettings() {
        localStorage.setItem('blackMirrorSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('blackMirrorSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.updateUI();
        }
    }

    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }

    getSettings() {
        return { ...this.settings };
    }
}

module.exports = UIControls;
