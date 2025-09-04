class FlapDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.grid = [];
        this.currentData = [];
        this.animationQueue = [];
        this.isAnimating = false;
    }

    init(rows, cols) {
        this.container.innerHTML = '';
        this.grid = [];
        this.currentData = Array(rows).fill().map(() => Array(cols).fill(0));

        for (let row = 0; row < rows; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'flap-row';
            
            const gridRow = [];
            for (let col = 0; col < cols; col++) {
                const flap = this.createFlap(row, col);
                rowDiv.appendChild(flap);
                gridRow.push(flap);
            }
            
            this.grid.push(gridRow);
            this.container.appendChild(rowDiv);
        }
    }

    createFlap(row, col) {
        const flapContainer = document.createElement('div');
        flapContainer.className = 'flap-container';
        flapContainer.dataset.row = row;
        flapContainer.dataset.col = col;

        const topHalf = document.createElement('div');
        topHalf.className = 'flap-top';
        
        const bottomHalf = document.createElement('div');
        bottomHalf.className = 'flap-bottom';
        
        const flipPanel = document.createElement('div');
        flipPanel.className = 'flap-flip';

        flapContainer.appendChild(topHalf);
        flapContainer.appendChild(bottomHalf);
        flapContainer.appendChild(flipPanel);

        return flapContainer;
    }

    update(pixelData) {
        if (!pixelData || pixelData.length === 0) return;

        const rows = pixelData.length;
        const cols = pixelData[0].length;

        // Resize grid if needed
        if (this.grid.length !== rows || this.grid[0]?.length !== cols) {
            this.init(rows, cols);
        }

        // Queue animations for changed pixels
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (this.currentData[row][col] !== pixelData[row][col]) {
                    this.queueFlip(row, col, pixelData[row][col]);
                    this.currentData[row][col] = pixelData[row][col];
                }
            }
        }

        this.processAnimationQueue();
    }

    queueFlip(row, col, newState) {
        this.animationQueue.push({ row, col, newState });
    }

    processAnimationQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;
        
        this.isAnimating = true;
        const batch = this.animationQueue.splice(0, Math.min(10, this.animationQueue.length));
        
        batch.forEach(({ row, col, newState }) => {
            this.flipFlap(row, col, newState);
        });

        setTimeout(() => {
            this.isAnimating = false;
            this.processAnimationQueue();
        }, 150);
    }

    flipFlap(row, col, newState) {
        const flap = this.grid[row][col];
        const flipPanel = flap.querySelector('.flap-flip');
        
        flap.classList.add('flipping');
        flap.dataset.state = newState;
        
        setTimeout(() => {
            flap.classList.remove('flipping');
        }, 300);
    }

    resize() {
        // Trigger resize recalculation
        const rect = this.container.getBoundingClientRect();
        this.container.style.setProperty('--container-width', `${rect.width}px`);
        this.container.style.setProperty('--container-height', `${rect.height}px`);
    }
}

module.exports = FlapDisplay;
