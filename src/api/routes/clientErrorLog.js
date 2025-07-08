import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/log-client-error', async (req, res) => {
  try {
    const { timestamp, message, stack, url, userAgent, componentStack } = req.body;

    const logEntry = `[${timestamp}] CLIENT-ERROR: ${message}\n` +
                    `URL: ${url}\n` +
                    `Stack: ${stack}\n` +
                    `Component: ${componentStack}\n` +
                    `UserAgent: ${userAgent}\n` +
                    `---\n`;

    const logPath = path.join(__dirname, '../../../logs/servers/front-end-server-logs.log');
    await fs.appendFile(logPath, logEntry);

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging client error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
