const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const port = 3000;
// This section allows specific file types to be uploaded and processed
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
// Here I create a server instance
const server = http.createServer(async (req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) throw new Error('Not a file');

        const ext = path.extname(filePath).toLowerCase();
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404: File not found');
    }
});
// The server is started and listens at localhost on port 3000
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});