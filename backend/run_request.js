const http = require('http');

const data = JSON.stringify({ repoUrl: 'C:/Users/SONU MANDAL/Desktop/Professional CI_CD Platform UI/backend/sample-repo' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/github/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
});

req.write(data);
req.end();
