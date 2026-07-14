const fs = require('fs');
const path = require('path');

/**
 * Vercel Serverless Function: /api/catalog
 *
 * GET  -> returns the catalog JSON (reads from data.json)
 * POST -> receives updated catalog array, stores it temporarily in /tmp (ephemeral) and returns success.
 *        This allows the front‑end to POST after admin edits, but data will not persist across deployments.
 */
module.exports = (req, res) => {
  const dataFile = path.join(__dirname, '..', 'data.json');

  if (req.method === 'GET') {
    // Read static data file
    fs.readFile(dataFile, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ error: 'Failed to read catalog data' });
      } else {
        try {
          const json = JSON.parse(data);
          res.status(200).json(json);
        } catch (e) {
          res.status(500).json({ error: 'Invalid JSON in catalog data' });
        }
      }
    });
  } else if (req.method === 'POST') {
    // Receive updated catalog from client
    let body = [];
    req
      .on('data', chunk => body.push(chunk))
      .on('end', () => {
        try {
          const catalog = JSON.parse(Buffer.concat(body).toString());
          // Store in temporary file (will be lost after function finishes)
          const tmpPath = path.join('/tmp', 'catalog_' + Date.now() + '.json');
          fs.writeFile(tmpPath, JSON.stringify(catalog, null, 2), err => {
            if (err) {
              console.error('Failed to write temp file', err);
            }
          });
          res.status(200).json({ message: 'Catalog received' });
        } catch (e) {
          res.status(400).json({ error: 'Invalid JSON payload' });
        }
      });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
