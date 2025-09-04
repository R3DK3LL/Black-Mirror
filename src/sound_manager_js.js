class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
        this.init();
    }

    init() {
        // Create audio files programmatically using Web Audio API
        this.createFlipSound();
        this.createClickSound();
        this.createStartupSound();
    }

    createFlipSound() {
        // Generate mechanical flip sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.15;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Create mechanical click with decay
            const envelope = Math.exp(-t * 15);
            const noise = (Math.random() - 0.5) * 0.3;
            const click = Math.sin(t * 1000 * Math.PI) * envelope * 0.1;
            data[i] = (click + noise) * envelope;
        }

        this.sounds.flip = buffer;
    }

    createClickSound() {
        // Generate UI click sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.05;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            const tone = Math.sin(t * 800 * Math.PI) * envelope * 0.05;
            data[i] = tone;
        }

        this.sounds.click = buffer;
    }

    createStartupSound() {
        // Generate startup/mechanical whir sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.8;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(t * Math.PI) * 0.1;
            const freq = 100 + (t * 200);
            const mechanical = Math.sin(t * freq * Math.PI) * envelope;
            const noise = (Math.random() - 0.5) * 0.02 * envelope;
            data[i] = mechanical + noise;
        }

        this.sounds.startup = buffer;
    }

    playSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    playFlip() {
        this.playSound('flip');
    }

    playClick() {
        this.playSound('click');
    }

    playStartup() {
        this.playSound('startup');
    }
}

module.exports = SoundManager;
