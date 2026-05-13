# Privacy Web Search MCP

Privacy-focused web search for Claude Desktop using DuckDuckGo, Qwant, and Startpage.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/azevedo-home-lab/privacy-web-search-mcp/main/install.sh | bash
```

Restart Claude Desktop after installation.

## Requirements

- macOS
- Node.js v18+
- Claude Desktop (Code or Cowork mode)

## Usage

Ask Claude naturally:
- "Search the web for X"
- "Find recent news about Y"
- "Look up Z"

## Logs

All searches are logged:
```bash
tail -f /usr/local/lib/searxng-mcp/logs/search.log
```

## Uninstall

```bash
sudo rm -rf /usr/local/lib/searxng-mcp
sudo rm /usr/local/bin/searxng-mcp
```

Then remove `privacy-web-search` from your Claude config.

## How It Works

The MCP server runs only when Claude searches. It queries privacy-focused search engines (DuckDuckGo primary, Qwant and Startpage as fallbacks) and returns results. All requests are logged for audit purposes.

## License

MIT
