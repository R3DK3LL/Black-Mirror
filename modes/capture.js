const CaptureMode = {
   mediaRecorder: null,
   recordedChunks: [],
   isRecording: false,
   
   screenshot(app) {
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       
       canvas.width = app.display.offsetWidth;
       canvas.height = app.display.offsetHeight;
       
       // Render current flap display to canvas
       const flaps = app.display.querySelectorAll('.flap');
       const flapWidth = canvas.width / app.cols;
       const flapHeight = canvas.height / app.rows;
       
       flaps.forEach((flap, index) => {
           const row = Math.floor(index / app.cols);
           const col = index % app.cols;
           
           const isWhite = flap.classList.contains('white');
           ctx.fillStyle = isWhite ? '#ddd' : '#333';
           ctx.fillRect(col * flapWidth, row * flapHeight, flapWidth, flapHeight);
       });
       
       // Download screenshot
       canvas.toBlob(blob => {
           const url = URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `black-mirror-${Date.now()}.png`;
           a.click();
           URL.revokeObjectURL(url);
       });
   },
   
   async toggleRecording(app) {
       if (this.isRecording) {
           this.stopRecording();
       } else {
           await this.startRecording(app);
       }
   },
   
   async startRecording(app) {
       try {
           const stream = app.display.captureStream ? app.display.captureStream(30) : 
                         await navigator.mediaDevices.getDisplayMedia({ video: true });
           
           this.mediaRecorder = new MediaRecorder(stream, {
               mimeType: 'video/webm;codecs=vp9'
           });
           
           this.recordedChunks = [];
           this.mediaRecorder.ondataavailable = (event) => {
               if (event.data.size > 0) {
                   this.recordedChunks.push(event.data);
               }
           };
           
           this.mediaRecorder.onstop = () => {
               const blob = new Blob(this.recordedChunks, {
                   type: 'video/webm'
               });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `black-mirror-${Date.now()}.webm`;
               a.click();
               URL.revokeObjectURL(url);
           };
           
           this.mediaRecorder.start();
           this.isRecording = true;
           document.getElementById('record-btn').textContent = 'Stop Recording';
           
       } catch (error) {
           alert('Screen recording not supported: ' + error.message);
       }
   },
   
   stopRecording() {
       if (this.mediaRecorder && this.isRecording) {
           this.mediaRecorder.stop();
           this.isRecording = false;
           document.getElementById('record-btn').textContent = 'Record';
       }
   }
};
