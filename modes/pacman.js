const PacmanMode = {
   pacman: { x: 0, y: 0, direction: { x: 1, y: 0 } },
   dots: [],
   score: 0,
   lastMove: 0,
   dotSpawnTimer: 0,
   gameStarted: false,
   
   init(app) {
       this.pacman = { 
           x: Math.floor(app.cols * 0.1), 
           y: Math.floor(app.rows / 2),
           direction: { x: 1, y: 0 }
       };
       this.dots = [];
       this.score = 0;
       this.lastMove = 0;
       this.dotSpawnTimer = 0;
       this.gameStarted = true;
       
       // Spawn initial dots
       this.spawnDots(app, 5);
   },
   
   spawnDots(app, count) {
       for (let i = 0; i < count; i++) {
           // Spawn dots in random positions
           const dot = {
               x: Math.floor(Math.random() * app.cols),
               y: Math.floor(Math.random() * app.rows),
               collected: false
           };
           this.dots.push(dot);
       }
   },
   
   update(app, imageData) {
       const data = imageData.data;
       const now = Date.now();
       
       if (!this.gameStarted) {
           this.init(app);
       }
       
       // Create avoidance map - dark areas are obstacles (people)
       const obstacles = [];
       for (let row = 0; row < app.rows; row++) {
           obstacles[row] = [];
           for (let col = 0; col < app.cols; col++) {
               const i = (row * app.cols + col) * 4;
               const r = data[i];
               const g = data[i + 1];
               const b = data[i + 2];
               const gray = (r + g + b) / 3;
               obstacles[row][col] = gray < 100; // Dark areas are obstacles
           }
       }
       
       // Move Pacman every 200ms
       if (now - this.lastMove > 200) {
           const directions = [
               { x: 0, y: -1 }, // up
               { x: 1, y: 0 },  // right  
               { x: 0, y: 1 },  // down
               { x: -1, y: 0 }  // left
           ];
           
           // Find best direction (avoid obstacles, move toward dots)
           let bestDirection = this.pacman.direction;
           let bestScore = -1000;
           
           directions.forEach(dir => {
               const newX = (this.pacman.x + dir.x + app.cols) % app.cols;
               const newY = (this.pacman.y + dir.y + app.rows) % app.rows;
               
               let score = 0;
               
               // Avoid obstacles
               if (obstacles[newY] && obstacles[newY][newX]) {
                   score -= 500;
               }
               
               // Move toward closest uncollected dot
               let minDotDistance = Infinity;
               this.dots.forEach(dot => {
                   if (!dot.collected) {
                       const distance = Math.abs(newX - dot.x) + Math.abs(newY - dot.y);
                       minDotDistance = Math.min(minDotDistance, distance);
                   }
               });
               
               if (minDotDistance < Infinity) {
                   score += (50 - minDotDistance); // Closer = better
               }
               
               // Slight preference to continue current direction
               if (dir.x === this.pacman.direction.x && dir.y === this.pacman.direction.y) {
                   score += 5;
               }
               
               // Prefer moving right/down generally
               score += dir.x * 2 + dir.y;
               
               if (score > bestScore) {
                   bestScore = score;
                   bestDirection = dir;
               }
           });
           
           this.pacman.direction = bestDirection;
           
           // Move Pacman
           this.pacman.x = (this.pacman.x + this.pacman.direction.x + app.cols) % app.cols;
           this.pacman.y = (this.pacman.y + this.pacman.direction.y + app.rows) % app.rows;
           
           this.lastMove = now;
       }
       
       // Check dot collection
       this.dots.forEach(dot => {
           if (!dot.collected) {
               const distance = Math.abs(this.pacman.x - dot.x) + Math.abs(this.pacman.y - dot.y);
               if (distance <= 1) {
                   dot.collected = true;
                   this.score += 10;
                   if (app.playSound) app.playSound('flip');
               }
           }
       });
       
       // Spawn new dots periodically in white areas
       if (now - this.dotSpawnTimer > 2000) {
           let attempts = 0;
           while (attempts < 10) {
               const x = Math.floor(Math.random() * app.cols);
               const y = Math.floor(Math.random() * app.rows);
               
               // Only spawn in white areas (safe zones)
               if (!obstacles[y] || !obstacles[y][x]) {
                   this.dots.push({ x, y, collected: false });
                   break;
               }
               attempts++;
           }
           this.dotSpawnTimer = now;
       }
       
       // Clean up collected dots
       this.dots = this.dots.filter(dot => !dot.collected);
       
       // Render mirror with game overlay
       for (let row = 0; row < app.rows; row++) {
           for (let col = 0; col < app.cols; col++) {
               const i = (row * app.cols + col) * 4;
               const r = data[i];
               const g = data[i + 1];
               const b = data[i + 2];
               
               const gray = (r + g + b) / 3;
               let isWhite = gray > 100;
               
               // Pacman appears as black dot
               if (this.pacman.x === col && this.pacman.y === row) {
                   isWhite = false;
               }
               
               // Dots appear as white pixels
               this.dots.forEach(dot => {
                   if (!dot.collected && dot.x === col && dot.y === row) {
                       isWhite = true;
                   }
               });
               
               const mirrorCol = app.cols - 1 - col;
               app.setFlap(row, mirrorCol, isWhite);
           }
       }
       
       // Update score display (if exists)
       const scoreElement = document.getElementById('game-score');
       if (scoreElement) {
           scoreElement.textContent = `Score: ${this.score}`;
       }
   }
};
