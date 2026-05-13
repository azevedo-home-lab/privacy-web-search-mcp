import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'search.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getTimestamp() {
  return new Date().toISOString();
}

export function logSearch(query, source, resultsCount) {
  const logEntry = {
    timestamp: getTimestamp(),
    type: 'SEARCH_REQUEST',
    query,
    source,
    resultsCount
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(LOG_FILE, logLine);
}

export function logResults(query, results) {
  const logEntry = {
    timestamp: getTimestamp(),
    type: 'SEARCH_RESULTS',
    query,
    resultCount: results.length,
    results: results.map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.substring(0, 100) || ''
    }))
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(LOG_FILE, logLine);
}

export function logError(query, error) {
  const logEntry = {
    timestamp: getTimestamp(),
    type: 'ERROR',
    query,
    error: error.message,
    stack: error.stack
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(LOG_FILE, logLine);
}

export function getLogPath() {
  return LOG_FILE;
}
