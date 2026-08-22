require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const claude = require('./claude');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Serve the built React app (client/dist) if it exists, so the whole thing
// can be deployed as one service. During local development the client
// usually runs on its own Vite dev server instead (see client/README).
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(200).send('Primer API is running. Build the client to see the app here.');
  });
});

app.listen(PORT, () => {
  console.log(`Primer server listening on http://localhost:${PORT}`);
  console.log(`Claude API: ${claude.hasLiveApi() ? 'live (key found)' : 'offline fallback (no ANTHROPIC_API_KEY set)'}`);
});
