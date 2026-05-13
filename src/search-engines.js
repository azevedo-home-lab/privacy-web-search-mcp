import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { logSearch, logError } from './logger.js';

/**
 * Privacy-focused search engines:
 * - DuckDuckGo: Privacy-first, no tracking
 * - Startpage: Anonymous Google results
 * - Qwant: European privacy-focused search
 */

// DuckDuckGo HTML Search (Privacy-focused, no JavaScript required)
export async function searchDuckDuckGo(query, limit = 10) {
  try {
    logSearch(query, 'DuckDuckGo', 0);

    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo returned ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result').each((i, elem) => {
      if (results.length >= limit) return false;

      const $elem = $(elem);
      const $link = $elem.find('.result__a');
      const $snippet = $elem.find('.result__snippet');

      const title = $link.text().trim();
      const url = $link.attr('href');
      const content = $snippet.text().trim();

      if (title && url) {
        results.push({
          title,
          url,
          content,
          source: 'DuckDuckGo'
        });
      }
    });

    logSearch(query, 'DuckDuckGo', results.length);
    return results;
  } catch (error) {
    logError(query, error);
    throw error;
  }
}

// Startpage Search (Anonymous Google results)
export async function searchStartpage(query, limit = 10) {
  try {
    logSearch(query, 'Startpage', 0);

    const url = `https://www.startpage.com/sp/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Startpage returned ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.w-gl__result').each((i, elem) => {
      if (results.length >= limit) return false;

      const $elem = $(elem);
      const $link = $elem.find('.w-gl__result-title');
      const $snippet = $elem.find('.w-gl__description');

      const title = $link.text().trim();
      const url = $link.attr('href');
      const content = $snippet.text().trim();

      if (title && url) {
        results.push({
          title,
          url,
          content,
          source: 'Startpage'
        });
      }
    });

    logSearch(query, 'Startpage', results.length);
    return results;
  } catch (error) {
    logError(query, error);
    throw error;
  }
}

// Qwant Search (European privacy-focused)
export async function searchQwant(query, limit = 10) {
  try {
    logSearch(query, 'Qwant', 0);

    const url = `https://api.qwant.com/v3/search/web?q=${encodeURIComponent(query)}&count=${limit}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Qwant returned ${response.status}`);
    }

    const data = await response.json();
    const results = [];

    if (data.data && data.data.result && data.data.result.items) {
      for (const item of data.data.result.items.web || []) {
        if (results.length >= limit) break;

        results.push({
          title: item.title,
          url: item.url,
          content: item.desc || '',
          source: 'Qwant'
        });
      }
    }

    logSearch(query, 'Qwant', results.length);
    return results;
  } catch (error) {
    logError(query, error);
    throw error;
  }
}

// Aggregator: Try multiple engines with fallback
export async function search(query, limit = 10) {
  const engines = [
    { name: 'DuckDuckGo', fn: searchDuckDuckGo },
    { name: 'Qwant', fn: searchQwant },
    { name: 'Startpage', fn: searchStartpage }
  ];

  for (const engine of engines) {
    try {
      const results = await engine.fn(query, limit);
      if (results && results.length > 0) {
        return results;
      }
    } catch (error) {
      console.error(`${engine.name} failed:`, error.message);
      // Continue to next engine
    }
  }

  // All engines failed
  throw new Error('All search engines failed');
}
