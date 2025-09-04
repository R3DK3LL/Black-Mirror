class MirrorEffects {
    constructor() {
        this.settings = {
            flipHorizontal: false,
            flipVertical: false,
            rotate: 0,
            invert: false,
            sensitivity: 128
        };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    processPixelData(pixelData) {
        if (!pixelData || pixelData.length === 0) return pixelData;

        let processed = this.deepCopy(pixelData);

        // Apply transformations in order
        processed = this.applySensitivity(processed);
        processed = this.applyInvert(processed);
        processed = this.applyRotation(processed);
        processed = this.applyFlips(processed);

        return processed;
    }

    applySensitivity(data) {
        const threshold = this.settings.sensitivity;
        return data.map(row => 
            row.map(pixel => {
                // Convert back to 0-255 range for threshold comparison
                const grayValue = pixel * 255;
                return grayValue > threshold ? 1 : 0;
            })
        );
    }

    applyInvert(data) {
        if (!this.settings.invert) return data;
        
        return data.map(row => 
            row.map(pixel => pixel === 1 ? 0 : 1)
        );
    }

    applyRotation(data) {
        const angle = this.settings.rotate;
        
        switch (angle) {
            case 90:
                return this.rotate90(data);
            case 180:
                return this.rotate180(data);
            case 270:
                return this.rotate270(data);
            default:
                return data;
        }
    }

    applyFlips(data) {
        let result = data;
        
        if (this.settings.flipHorizontal) {
            result = this.flipHorizontal(result);
        }
        
        if (this.settings.flipVertical) {
            result = this.flipVertical(result);
        }
        
        return result;
    }

    rotate90(data) {
        const rows = data.length;
        const cols = data[0].length;
        const result = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                result[c][rows - 1 - r] = data[r][c];
            }
        }
        
        return result;
    }

    rotate180(data) {
        return data.slice().reverse().map(row => row.slice().reverse());
    }

    rotate270(data) {
        const rows = data.length;
        const cols = data[0].length;
        const result = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                result[cols - 1 - c][r] = data[r][c];
            }
        }
        
        return result;
    }

    flipHorizontal(data) {
        return data.map(row => row.slice().reverse());
    }

    flipVertical(data) {
        return data.slice().reverse();
    }

    deepCopy(data) {
        return data.map(row => row.slice());
    }

    // Utility method to get transformation matrix for CSS transforms
    getTransformMatrix() {
        let transforms = [];
        
        if (this.settings.rotate !== 0) {
            transforms.push(`rotate(${this.settings.rotate}deg)`);
        }
        
        let scaleX = this.settings.flipHorizontal ? -1 : 1;
        let scaleY = this.settings.flipVertical ? -1 : 1;
        
        if (scaleX !== 1 || scaleY !== 1) {
            transforms.push(`scale(${scaleX}, ${scaleY})`);
        }
        
        return transforms.join(' ');
    }

    // Apply CSS transforms to display element
    applyDisplayTransforms(element) {
        const transform = this.getTransformMatrix();
        element.style.transform = transform;
        
        // Apply invert filter
        if (this.settings.invert) {
            element.style.filter = 'invert(1)';
        } else {
            element.style.filter = 'none';
        }
    }
}

module.exports = MirrorEffects;
