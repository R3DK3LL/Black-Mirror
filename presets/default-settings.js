const DEFAULT_SETTINGS = {
    // Display settings
    flipHorizontal: false,
    flipVertical: false,
    rotate: 0,
    invert: false,
    
    // Performance settings
    speed: 150,
    sensitivity: 128,
    
    // Audio settings
    soundEnabled: true,
    soundVolume: 0.3,
    
    // Visual settings
    flapSize: 12,
    animationEasing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    
    // Capture settings
    captureRate: 30, // FPS
    pixelationMode: 'adaptive',
    
    // UI settings
    showControls: true,
    showStatusBar: true,
    keyboardShortcuts: true,
    
    // Advanced settings
    batchSize: 10,
    maxAnimationQueue: 50,
    debounceDelay: 16,
    
    // Window settings
    minWidth: 400,
    minHeight: 300,
    aspectRatio: null,
    
    // Theme settings
    darkMode: true,
    accentColor: '#4CAF50',
    metalTexture: true,
    
    // Debug settings
    showDebugInfo: false,
    logPerformance: false
};

const SETTING_CONSTRAINTS = {
    speed: { min: 50, max: 500, step: 25 },
    sensitivity: { min: 0, max: 255, step: 5 },
    soundVolume: { min: 0, max: 1, step: 0.1 },
    flapSize: { min: 8, max: 20, step: 2 },
    captureRate: { min: 10, max: 60, step: 5 },
    batchSize: { min: 1, max: 50, step: 1 },
    rotate: { values: [0, 90, 180, 270] }
};

const KEYBOARD_SHORTCUTS = {
    'h': 'flipHorizontal',
    'v': 'flipVertical',
    'i': 'invert',
    'r': 'rotate',
    ' ': 'pause',
    'Escape': 'showControls',
    'F11': 'fullscreen',
    '1': 'preset_default',
    '2': 'preset_mirror',
    '3': 'preset_inverted',
    '4': 'preset_rotated_90'
};

const PRESET_CATEGORIES = {
    basic: ['default', 'mirror', 'inverted'],
    rotation: ['rotated_90', 'rotated_180'],
    effects: ['flipped_both', 'high_contrast', 'low_contrast'],
    performance: ['fast_flip', 'slow_mechanical'],
    utility: ['silent']
};

const VALIDATION_RULES = {
    flipHorizontal: (value) => typeof value === 'boolean',
    flipVertical: (value) => typeof value === 'boolean',
    rotate: (value) => SETTING_CONSTRAINTS.rotate.values.includes(value),
    invert: (value) => typeof value === 'boolean',
    speed: (value) => {
        const c = SETTING_CONSTRAINTS.speed;
        return typeof value === 'number' && value >= c.min && value <= c.max;
    },
    sensitivity: (value) => {
        const c = SETTING_CONSTRAINTS.sensitivity;
        return typeof value === 'number' && value >= c.min && value <= c.max;
    },
    soundEnabled: (value) => typeof value === 'boolean',
    soundVolume: (value) => {
        const c = SETTING_CONSTRAINTS.soundVolume;
        return typeof value === 'number' && value >= c.min && value <= c.max;
    }
};

function validateSettings(settings) {
    const validated = { ...DEFAULT_SETTINGS };
    
    Object.keys(settings).forEach(key => {
        if (VALIDATION_RULES[key] && VALIDATION_RULES[key](settings[key])) {
            validated[key] = settings[key];
        }
    });
    
    return validated;
}

function getPresetByName(name) {
    const configs = require('./mirror-configs.json');
    return configs.presets[name] || configs.presets.default;
}

function applyConstraints(key, value) {
    const constraint = SETTING_CONSTRAINTS[key];
    if (!constraint) return value;
    
    if (constraint.values) {
        return constraint.values.includes(value) ? value : constraint.values[0];
    }
    
    if (constraint.min !== undefined && constraint.max !== undefined) {
        return Math.max(constraint.min, Math.min(constraint.max, value));
    }
    
    return value;
}

function getSettingDescription(key) {
    const descriptions = {
        flipHorizontal: 'Mirror display horizontally',
        flipVertical: 'Mirror display vertically',
        rotate: 'Rotate display (0°, 90°, 180°, 270°)',
        invert: 'Invert black and white pixels',
        speed: 'Animation speed in milliseconds',
        sensitivity: 'Threshold for black/white conversion (0-255)',
        soundEnabled: 'Enable mechanical sound effects',
        soundVolume: 'Volume level for sound effects (0.0-1.0)',
        flapSize: 'Size of individual flaps in pixels',
        captureRate: 'Screen capture framerate (FPS)',
        showControls: 'Show control panel interface',
        keyboardShortcuts: 'Enable keyboard shortcuts'
    };
    
    return descriptions[key] || `Setting: ${key}`;
}

module.exports = {
    DEFAULT_SETTINGS,
    SETTING_CONSTRAINTS,
    KEYBOARD_SHORTCUTS,
    PRESET_CATEGORIES,
    VALIDATION_RULES,
    validateSettings,
    getPresetByName,
    applyConstraints,
    getSettingDescription
};
