const SnakeMode = {
    snake: [],
    direction: { x: 1, y: 0 },
    lastMove: 0,
    avoidanceMap: [],
    
    init(app) {
        this.snake = [
            { x: Math.floor(app.cols / 2), y: Math.floor(app.rows / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.lastMove = 0;
        this.avoidanceMap = [];
    },
    
    update(app, imageData) {
        const data = imageData.data;
        const now = Date.now();
        
        // Build avoidance map - dark areas are where people are
        this.avoidanceMap = [];
        for (let row = 0; row < app.rows; row++) {
            this.avoidanceMap[row] = [];
            for (let col = 0; col < app.cols; col++) {
                const i = (row * app.cols + col) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const gray = (r + g + b) / 3;
                this.avoidanceMap[row][col] = gray < 128; // true = avoid dark areas (people)
            }
        }
        
        // Update snake position every 150ms
        if (now - this.lastMove > 150) {
            const head = this.snake[0];
            
            // Check directions
            const directions = [
                { x: 0, y: -1, name: 'up' },
                { x: 1, y: 0, name: 'right' },
                { x: 0, y: 1, name: 'down' },
                { x: -1, y: 0, name: 'left' }
            ];
            
            // Score each direction (lower = better)
            let bestDirection = this.direction;
            let bestScore = Infinity;
            
            directions.forEach(dir => {
                let score = 0;
                
                // Look ahead 3 steps
                for (let step = 1; step <= 3; step++) {
                    const checkX = (head.x + dir.x * step + app.cols) % app.cols;
                    const checkY = (head.y + dir.y * step + app.rows) % app.rows;
                    
                    // High penalty for dark areas (where people are)
                    if (this.avoidanceMap[checkY] && this.avoidanceMap[checkY][checkX]) {
                        score += 15 * (4 - step); // Closer = higher penalty
                    }
                    
                    // Penalty for hitting snake body
                    const hitsBody = this.snake.some(segment => 
                        segment.x === checkX && segment.y === checkY
                    );
                    if (hitsBody) {
                        score += 25;
                    }
                }
                
                // Slight preference to continue current direction
                if (dir.x !== this.direction.x || dir.y !== this.direction.y) {
                    score += 1;
                }
                
                if (score < bestScore) {
                    bestScore = score;
                    bestDirection = dir;
                }
            });
            
            this.direction = bestDirection;
            
            const newHead = {
                x: (head.x + this.direction.x + app.cols) % app.cols,
                y: (head.y + this.direction.y + app.rows) % app.rows
            };
            
            this.snake.unshift(newHead);
            if (this.snake.length > 12) {
                this.snake.pop();
            }
            
            this.lastMove = now;
        }
        
        // Render mirror with snake overlay
        for (let row = 0; row < app.rows; row++) {
            for (let col = 0; col < app.cols; col++) {
                const i = (row * app.cols + col) * 4;
                const r = data[i + 1];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const gray = (r + g + b) / 3;
                let isWhite = gray > 128;
                
                // Snake body appears as WHITE (visible against dark background)
                const isSnake = this.snake.some(segment => 
                    segment.x === col && segment.y === row
                );
                
                if (isSnake) {
                    isWhite = true; // Snake shows as white flaps
                }
                
                const mirrorCol = app.cols - 1 - col;
                app.setFlap(row, mirrorCol, isWhite);
            }
        }
    }
};
