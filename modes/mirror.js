const MirrorMode = {
   update(app, imageData) {
       const data = imageData.data;
       
       for (let row = 0; row < app.rows; row++) {
           for (let col = 0; col < app.cols; col++) {
               const i = (row * app.cols + col) * 4;
               const r = data[i];
               const g = data[i + 1];
               const b = data[i + 2];
               
               const gray = (r + g + b) / 3;
               const isWhite = gray > 128;
               
               // Mirror horizontally
               const mirrorCol = app.cols - 1 - col;
               app.setFlap(row, mirrorCol, isWhite);
           }
       }
   }
};
