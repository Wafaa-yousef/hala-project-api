require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const {Server}=require('socket.io')
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const chokidar = require('chokidar');
const path = require('path');
const excelPath = path.join(__dirname, 'uploads', 'Hala_Warehouse_Test.xlsx');

// const body_parser=require('body-parser')

const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
})
app.use(cors());
app.use(express.json());
io.on('connection', socket => {
  console.log(' A client connected');

  socket.on('disconnect', () => {
    console.log(' Client disconnected');
  });
});

app.use('/api',require('./router/api/index.js'))
chokidar.watch(excelPath).on('change', () => {
  console.log(' Excel file changed!');
  io.emit('excel-updated');
});

server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
  