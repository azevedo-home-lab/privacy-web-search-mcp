# Privacy Web Search MCP

Lightweight, privacy-focused web search for Claude Desktop. No Docker, no API keys, just Node.js.

## Features

- 🔒 **Privacy-First**: Uses DuckDuckGo, Qwant, and Startpage
- 📝 **Full Logging**: All searches logged for audit purposes  
- 🪶 **Lightweight**: Pure Node.js, no containers or services
- 🚀 **Zero Config**: One command to install and it just works
- 🔄 **Auto-Fallback**: Tries multiple engines if one fails
- 🎯 **No Tracking**: No external API keys or accounts needed

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/azevedo-home-lab/privacy-web-search-mcp/main/install.sh | bash
```

After installation, restart Claude Desktop (Cmd+Q and reopen).

## How It Works

```
Claude Desktop
    ↓
MCP Server (Node.js)
    ↓
Privacy Search Engines
    • DuckDuckGo (primary)
    • Qwant (fallback)
    • Startpage (fallback)
```

The MCP server only runs when Claude needs to search. No persistent services or containers.

## Privacy-Focused Search Engines

### DuckDuckGo (Primary)
- No tracking or profiling
- No search history stored
- Anonymous search results

### Qwant (Fallback)
- European privacy-focused search
- GDPR compliant
- No user tracking

### Startpage (Fallback)  
- Anonymous Google results
- No IP address logging
- Privacy by design

## Search Logging

All searches are logged to:
```
/usr/local/lib/searxng-mcp/logs/search.log
```

**Log format:**
```json
{
  "timestamp": "2026-05-13T17:00:00.000Z",
  "type": "SEARCH_REQUEST",
  "query": "anthropic claude",
  "source": "DuckDuckGo",
  "resultsCount": 10
}
```

**View logs:**
```bash
tail -f /usr/local/lib/searxng-mcp/logs/search.log
```

## Usage in Claude

Just ask naturally:
- "Search the web for anthropic claude"
- "Find recent news about AI"
- "Look up the weather in San Francisco"

## Requirements

- **macOS** (Linux support coming soon)
- **Node.js** v18+ and npm
- **Claude Desktop** (Code or Cowork mode)

## Installation Locations

- **Program**: `/usr/local/lib/searxng-mcp/`
- **Command**: `/usr/local/bin/searxng-mcp`
- **Logs**: `/usr/local/lib/searxng-mcp/logs/search.log`
- **Config**: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - or `~/Library/Application Support/Claude-3p/claude_desktop_config.json` (Cowork)

## Uninstall

```bash
sudo rm -rf /usr/local/lib/searxng-mcp
sudo rm /usr/local/bin/searxng-mcp
```

Then manually remove the `privacy-web-search` entry from your Claude config file.

## Architecture

### What's Different from the Old Version?

**Old (Docker-based):**
- Required Docker Desktop (heavy)
- SearXNG container running 24/7
- ~200MB+ memory usage
- Separate service to manage

**New (Node.js only):**
- Only Node.js required (lightweight)  
- No persistent services
- ~20MB memory (only when searching)
- Zero maintenance

## Development

### Test the MCP server manually:

```bash
cd /usr/local/lib/searxng-mcp
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node src/index.js
```

### Test search functionality:

```bash
cd ~/mcp-packages/searxng-mcp
npm install
node -e "import('./src/search-engines.js').then(m => m.search('test').then(console.log))"
```

## Troubleshooting

### "Command not found: searxng-mcp"

Check if installed:
```bash
ls -la /usr/local/bin/searxng-mcp
```

Re-run installer if missing.

### "MCP server not appearing in Claude"

1. Check config:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Restart Claude Desktop completely (Cmd+Q)

3. Check logs:
   ```bash
   tail -f /usr/local/lib/searxng-mcp/logs/search.log
   ```

### "All search engines failed"

Network connectivity issue or engines are blocking requests. Check:

```bash
curl -I https://html.duckduckgo.com
```

If blocked, you may need to adjust network settings or use a VPN.

## Contributing

PRs welcome! Especially for:
- Linux installer support
- Windows installer support
- Additional privacy-focused search engines
- Better HTML parsing

## License

MIT

## Comparison

| Feature | Old (SearXNG) | New (Node.js) |
|---------|---------------|---------------|
| Dependencies | Docker + Node.js | Node.js only |
| Memory | 200MB+ | 20MB |
| Startup | Seconds | Instant |
| Services | Container 24/7 | On-demand |
| Maintenance | Docker updates | None |
| Distribution | Complex | Single script |
| Privacy | Self-hosted | Direct to privacy engines |
