const http = require('http');
const net = require('net');
const { WebSocketServer } = require('ws');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const tcp = net.createConnection({ host: 'fr1.wssht.to', port: 80 });
  ws.on('message', (data) => tcp.write(data));
  ws.on('close', () => tcp.destroy());
  tcp.on('data', (data) => ws.send(data));
  tcp.on('close', () => ws.close());
  tcp.on('error', () => ws.close());
});

server.listen(process.env.PORT || 3000);
