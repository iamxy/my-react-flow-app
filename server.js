import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function createServer() {
  const app = express();
  const vite = await createViteServer({ server: { middlewareMode: true } });

  // Set "/path/to/workspace" as a static folder
  const workspacePath = process.env.WORKSPACE_PATH;
  if (!workspacePath) {
    console.error("Please set the WORKSPACE_PATH environment variable.");
    process.exit(1);
  }
  app.use('/static', express.static(path.resolve(workspacePath)));

  // Serving React apps with Vite's middleware
  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

createServer();
