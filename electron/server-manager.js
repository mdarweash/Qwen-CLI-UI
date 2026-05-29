import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverStarted = false;

export async function startEmbeddedServer() {
  if (serverStarted) return;

  // Set env defaults for desktop mode
  process.env.DESKTOP_MODE = 'true';
  process.env.PORT = process.env.PORT || '5008';

  // Load and start the Express server
  // server/index.js uses ESM — we import it dynamically
  const projectRoot = path.resolve(__dirname, '..');

  // We need to import server/index.js which sets up Express
  // Since it uses ESM, we use dynamic import
  const serverPath = path.join(projectRoot, 'server', 'index.js');

  try {
    const serverModule = await import(`file://${serverPath}`);
    const port = await serverModule.startServer();
    serverStarted = true;
    return port;
  } catch (err) {
    console.error('Failed to start embedded server:', err);
    throw err;
  }
}
