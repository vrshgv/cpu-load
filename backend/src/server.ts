import express, { Response } from 'express';
import cors from 'cors';
import os from 'os';

const app = express();
const port = 3000;

app.use(cors());

// Fetch CPU load data route
app.get('/api/cpu', (_, res: Response) => {
  const cpus = os.cpus().length;
  const loadAverage = os.loadavg()[0] / cpus;

  res.json({ timestamp: Date.now(), load: loadAverage });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
