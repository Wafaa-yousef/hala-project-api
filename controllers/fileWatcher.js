const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar'); 

const excelPath = path.join(__dirname, 'data', 'yourfile.xlsx');

chokidar.watch(excelPath).on('change', () => {
  console.log('📁 Excel file changed!');
  io.emit('excel-updated'); 
});
