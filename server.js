/**
 * Simple HTTP Server for Local Development
 * Serves static files on port 3000
 * 
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'application/font-woff',
	'.woff2': 'application/font-woff2',
	'.ttf': 'application/font-ttf',
	'.eot': 'application/vnd.ms-fontobject',
	'.otf': 'application/font-otf',
	'.webmanifest': 'application/manifest+json',
	'.xml': 'application/xml',
	'.txt': 'text/plain'
};

function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/html' });
			res.end('<h1>404 - File Not Found</h1>');
			return;
		}

		const mimeType = getMimeType(filePath);
		res.writeHead(200, { 'Content-Type': mimeType });
		res.end(data);
	});
}

function getFilePath(url) {
	let filePath = path.join(PUBLIC_DIR, url === '/' ? 'index.html' : url);
	
	// Security: prevent directory traversal
	if (!filePath.startsWith(PUBLIC_DIR)) {
		return null;
	}

	// If it's a directory, try index.html
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		filePath = path.join(filePath, 'index.html');
	}

	return filePath;
}

const server = http.createServer((req, res) => {
	// CORS headers for development
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	const filePath = getFilePath(req.url);
	
	if (!filePath) {
		res.writeHead(403, { 'Content-Type': 'text/html' });
		res.end('<h1>403 - Forbidden</h1>');
		return;
	}

	serveFile(filePath, res);
});

server.listen(PORT, () => {
	console.log(`\n🚀 Server running at http://localhost:${PORT}\n`);
	console.log('Press Ctrl+C to stop the server\n');
});

server.on('error', (err) => {
	if (err.code === 'EADDRINUSE') {
		console.error(`\n❌ Port ${PORT} is already in use.`);
		console.error('Try:');
		console.error(`  - Kill the process using port ${PORT}`);
		console.error(`  - Or use a different port: PORT=3001 node server.js\n`);
	} else {
		console.error('Server error:', err);
	}
	process.exit(1);
});
