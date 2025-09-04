const { validateSettings, getPresetByName, DEFAULT_SETTINGS } = require('../presets/default-settings');

class PresetManager {
    constructor() {
        this.configs = null;
        this.currentPreset = 'default';
        this.customSettings = {};
        this.loadConfigs();
    }

    async loadConfigs() {
        try {
            const response = await fetch('presets/mirror-configs.json');
            this.configs = await response.json();
        } catch (error) {
            console.warn('Failed to load configs, using defaults:', error);
            this.configs = {
                presets: { default: DEFAULT_SETTINGS },
                userPresets: {}
            };
        }
    }

    getPreset(name) {
        if (!this.configs) return DEFAULT_SETTINGS;
        
        return this.configs.presets[name] || 
               this.configs.userPresets[name] || 
               this.configs.presets.default;
    }

    getAllPresets() {
        if (!this.configs) return { default: DEFAULT_SETTINGS };
        
        return {
            ...this.configs.presets,
            ...this.configs.userPresets
        };
    }

    getPresetNames() {
        return Object.keys(this.getAllPresets());
    }

    getPresetsByCategory() {
        const { PRESET_CATEGORIES } = require('../presets/default-settings');
        const categorized = {};
        
        Object.entries(PRESET_CATEGORIES).forEach(([category, presets]) => {
            categorized[category] = presets.map(name => ({
                name,
                config: this.getPreset(name)
            }));
        });
        
        // Add user presets category
        const userPresets = Object.keys(this.configs?.userPresets || {});
        if (userPresets.length > 0) {
            categorized.user = userPresets.map(name => ({
                name,
                config: this.getPreset(name)
            }));
        }
        
        return categorized;
    }

    applyPreset(name) {
        const preset = this.getPreset(name);
        const validated = validateSettings(preset);
        
        this.currentPreset = name;
        this.customSettings = {};
        
        return validated;
    }

    saveCustomSetting(key, value) {
        this.customSettings[key] = value;
        this.currentPreset = 'custom';
    }

    getCurrentSettings() {
        const base = this.getPreset(this.currentPreset);
        return validateSettings({ ...base, ...this.customSettings });
    }

    saveUserPreset(name, settings) {
        if (!this.configs) return false;
        
        const validated = validateSettings(settings);
        this.configs.userPresets[name] = {
            ...validated,
            name: name,
            custom: true,
            created: new Date().toISOString()
        };
        
        this.saveConfigs();
        return true;
    }

    deleteUserPreset(name) {
        if (!this.configs || !this.configs.userPresets[name]) return false;
        
        delete this.configs.userPresets[name];
        this.saveConfigs();
        return true;
    }

    saveConfigs() {
        try {
            const configData = JSON.stringify(this.configs, null, 2);
            localStorage.setItem('blackMirrorConfigs', configData);
        } catch (error) {
            console.warn('Failed to save configs:', error);
        }
    }

    loadUserConfigs() {
        try {
            const saved = localStorage.getItem('blackMirrorConfigs');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.configs.userPresets = parsed.userPresets || {};
            }
        } catch (error) {
            console.warn('Failed to load user configs:', error);
        }
    }

    exportPresets() {
        return {
            version: '1.0',
            exported: new Date().toISOString(),
            userPresets: this.configs?.userPresets || {}
        };
    }

    importPresets(data) {
        try {
            if (data.version !== '1.0') {
                throw new Error('Unsupported preset version');
            }
            
            Object.entries(data.userPresets).forEach(([name, preset]) => {
                const validated = validateSettings(preset);
                this.configs.userPresets[name] = {
                    ...validated,
                    name: name,
                    custom: true,
                    imported: new Date().toISOString()
                };
            });
            
            this.saveConfigs();
            return true;
        } catch (error) {
            console.error('Failed to import presets:', error);
            return false;
        }
    }

    getPresetPreview(name) {
        const preset = this.getPreset(name);
        return {
            name: preset.name || name,
            transforms: [
                preset.flipHorizontal && 'Flip H',
                preset.flipVertical && 'Flip V',
                preset.rotate > 0 && `Rotate ${preset.rotate}°`,
                preset.invert && 'Invert'
            ].filter(Boolean).join(', ') || 'None',
            speed: `${preset.speed}ms`,
            sensitivity: preset.sensitivity,
            sound: preset.soundEnabled ? 'On' : 'Off'
        };
    }

    resetToDefaults() {
        this.currentPreset = 'default';
        this.customSettings = {};
        return this.getCurrentSettings();
    }
}

module.exports = PresetManager;