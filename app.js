class BlackMirror {
   constructor() {
       this.video = document.getElementById('camera');
       this.canvas = document.getElementById('capture-canvas');
       this.ctx = this.canvas.getContext('2d');
       this.display = document.getElementById('flap-display');
       
       this.isRunning = false;
       this.currentMode = 'mirror';
       this.currentStyle = 'airport';
       this.flaps = [];
       this.rows = 0;
       this.cols = 0;
       this.flapSize = 8;
       
       this.audioContext = null;
       this.sounds = {};
       
       this.init();
   }
   
   init() {
       this.setupUI();
       this.createAudio();
       this.calculateGrid();
       this.createFlapGrid();
   }
   
   setupUI() {
       document.getElementById('start-btn').onclick = () => this.toggleMirror();
       document.getElementById('mode-select').onchange = (e) => this.setMode(e.target.value);
       document.getElementById('style-select').onchange = (e) => this.setStyle(e.target.value);
       document.getElementById('size-slider').oninput = (e) => this.setSize(e.target.value);
       document.getElementById('screenshot-btn').onclick = () => this.takeScreenshot();
       document.getElementById('record-btn').onclick = () => this.toggleRecording();
       
       window.addEventListener('resize', () => this.handleResize());
   }
   
   createAudio() {
       try {
           this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
           this.generateFlipSound();
       } catch (e) {
           console.log('Audio not available');
       }
   }
   
   generateFlipSound() {
       const duration = 0.1;
       const sampleRate = this.audioContext.sampleRate;
       const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
       const data = buffer.getChannelData(0);
       
       for (let i = 0; i < buffer.length; i++) {
           const t = i / sampleRate;
           const envelope = Math.exp(-t * 20);
           const click = Math.sin(t * 800 * Math.PI) * envelope * 0.1;
           data[i] = click;
       }
       
       this.sounds.flip = buffer;
   }
   
   playSound(soundName) {
       if (!this.audioContext || !this.sounds[soundName]) return;
       
       try {
           const source = this.audioContext.createBufferSource();
           const gainNode = this.audioContext.createGain();
           
           source.buffer = this.sounds[soundName];
           gainNode.gain.value = 0.3;
           
           source.connect(gainNode);
           gainNode.connect(this.audioContext.destination);
           source.start();
       } catch (e) {}
   }
   
   calculateGrid() {
       const rect = this.display.getBoundingClientRect();
       this.cols = Math.floor(rect.width / this.flapSize);
       this.rows = Math.floor((rect.height) / this.flapSize);
       
       document.documentElement.style.setProperty('--rows', this.rows);
       document.documentElement.style.setProperty('--cols', this.cols);
       document.documentElement.style.setProperty('--flap-size', this.flapSize + 'px');
   }
   
   createFlapGrid() {
       this.display.innerHTML = '';
       this.flaps = [];
       
       const totalFlaps = this.rows * this.cols;
       
       for (let i = 0; i < totalFlaps; i++) {
           const flap = document.createElement('div');
           flap.className = 'flap black';
           
           const row = Math.floor(i / this.cols);
           const col = i % this.cols;
           
           if (!this.flaps[row]) this.flaps[row] = [];
           this.flaps[row][col] = flap;
           
           this.display.appendChild(flap);
       }
   }
   
   async toggleMirror() {
       if (this.isRunning) {
           this.stop();
       } else {
           await this.start();
       }
   }
   
   async start() {
       try {
           const stream = await navigator.mediaDevices.getUserMedia({ 
               video: { 
                   width: { ideal: 640 }, 
                   height: { ideal: 480 },
                   frameRate: { ideal: 30 }
               } 
           });
           
           this.video.srcObject = stream;
           
           await new Promise(resolve => {
               this.video.onloadedmetadata = resolve;
           });
           
           this.canvas.width = this.cols;
           this.canvas.height = this.rows;
           this.isRunning = true;
           
           document.getElementById('start-btn').textContent = 'Stop';
           this.update();
           
       } catch (error) {
           alert('Camera access required: ' + error.message);
       }
   }
   
   stop() {
       this.isRunning = false;
       document.getElementById('start-btn').textContent = 'Start Mirror';
       
       if (this.video.srcObject) {
           this.video.srcObject.getTracks().forEach(track => track.stop());
       }
   }
   
   update() {
       if (!this.isRunning) return;
       
       if (this.video.readyState >= 2 && this.video.videoWidth > 0) {
           this.ctx.drawImage(this.video, 0, 0, this.cols, this.rows);
           const imageData = this.ctx.getImageData(0, 0, this.cols, this.rows);
           
           // Run current mode
           if (this.currentMode === 'mirror') {
               MirrorMode.update(this, imageData);
           } else if (this.currentMode === 'snake') {
                SnakeMode.update(this, imageData);
            } else if (this.currentMode === 'pacman') {
                PacmanMode.update(this, imageData);
            }
        }
        
        // Handle mode initialization
        if (this.currentMode === 'pacman') {
            if (!PacmanMode.gameStarted) {
               SnakeMode.update(this, imageData);
           }
       }
       
       setTimeout(() => requestAnimationFrame(() => this.update()), 33);
   }
   
   setFlap(row, col, state, playSound = false) {
       if (this.flaps[row] && this.flaps[row][col]) {
           const prevState = this.flaps[row][col].classList.contains('white');
           if (prevState !== state && playSound) {
               this.playSound('flip');
           }
           this.flaps[row][col].className = `flap ${state ? 'white' : 'black'}`;
       }
   }
   
   setMode(mode) {
       this.currentMode = mode;
       if (mode === 'snake') {
           SnakeMode.init(this);
       }
   }
   
   setStyle(style) {
       this.currentStyle = style;
       const themeCSS = document.getElementById('theme-css');
       themeCSS.href = `styles/${style}.css`;
   }
   
   setSize(size) {
       this.flapSize = parseInt(size);
       this.calculateGrid();
       this.createFlapGrid();
       if (this.isRunning) {
           this.canvas.width = this.cols;
           this.canvas.height = this.rows;
       }
   }
   
   handleResize() {
       this.calculateGrid();
       this.createFlapGrid();
       if (this.isRunning) {
           this.canvas.width = this.cols;
           this.canvas.height = this.rows;
       }
   }
   
   takeScreenshot() {
       CaptureMode.screenshot(this);
   }
   
   toggleRecording() {
       CaptureMode.toggleRecording(this);
   }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
   window.blackMirror = new BlackMirror();
});
