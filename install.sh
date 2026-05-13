#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Installation directory
INSTALL_DIR="/usr/local/lib/searxng-mcp"
BIN_LINK="/usr/local/bin/searxng-mcp"

# Config files
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
COWORK_CONFIG="$HOME/Library/Application Support/Claude-3p/claude_desktop_config.json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Privacy Web Search MCP - Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: This installer currently only supports macOS${NC}"
    exit 1
fi

# Check for Node.js
echo -n "Checking Node.js... "
if ! command -v node &> /dev/null; then
    echo -e "${RED}NOT FOUND${NC}"
    echo ""
    echo "Node.js is required but not installed."
    echo "Install it with: brew install node"
    echo "Or download from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}$NODE_VERSION${NC}"

# Check for npm
echo -n "Checking npm... "
if ! command -v npm &> /dev/null; then
    echo -e "${RED}NOT FOUND${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}$NPM_VERSION${NC}"

echo ""

# Clean up old installation
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing old installation..."
    sudo rm -rf "$INSTALL_DIR"
fi

if [ -L "$BIN_LINK" ]; then
    sudo rm "$BIN_LINK"
fi

# Create installation directory
echo "Creating installation directory..."
sudo mkdir -p "$INSTALL_DIR"

# Copy files
echo "Installing files..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

sudo cp -r "$SCRIPT_DIR/src" "$INSTALL_DIR/"
sudo cp "$SCRIPT_DIR/package.json" "$INSTALL_DIR/"
sudo cp "$SCRIPT_DIR/README.md" "$INSTALL_DIR/" 2>/dev/null || true

# Create logs directory
sudo mkdir -p "$INSTALL_DIR/logs"
sudo chmod 777 "$INSTALL_DIR/logs"

# Install npm dependencies
echo "Installing dependencies..."
cd "$INSTALL_DIR"
sudo npm install --production --silent

# Create symlink
echo "Creating command-line tool..."
sudo ln -sf "$INSTALL_DIR/src/index.js" "$BIN_LINK"
sudo chmod +x "$BIN_LINK"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuring Claude Desktop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to update config
update_config() {
    local config_file=$1
    local config_name=$2

    if [ ! -f "$config_file" ]; then
        echo "Creating $config_name config..."
        mkdir -p "$(dirname "$config_file")"
        echo '{}' > "$config_file"
    else
        echo "Backing up $config_name config..."
        cp "$config_file" "$config_file.backup.$(date +%s)"
    fi

    echo "Updating $config_name config..."

    # Use Node.js to update JSON config
    node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('$config_file', 'utf8'));
        if (!config.mcpServers) config.mcpServers = {};
        config.mcpServers['privacy-web-search'] = {
            command: '$BIN_LINK'
        };
        fs.writeFileSync('$config_file', JSON.stringify(config, null, 2));
    "

    echo -e "${GREEN}✓ $config_name configured${NC}"
}

# Update Claude Code config
if [ -d "$HOME/Library/Application Support/Claude" ]; then
    update_config "$CLAUDE_CONFIG" "Claude Code"
fi

# Update Cowork config
if [ -d "$HOME/Library/Application Support/Claude-3p" ]; then
    update_config "$COWORK_CONFIG" "Cowork"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}Installation Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Installation details:"
echo "  • Location: $INSTALL_DIR"
echo "  • Command: searxng-mcp"
echo "  • Logs: $INSTALL_DIR/logs/search.log"
echo ""
echo "Privacy-focused search engines:"
echo "  • DuckDuckGo (primary)"
echo "  • Qwant (fallback)"
echo "  • Startpage (fallback)"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Desktop (Cmd+Q and reopen)"
echo "  2. Test with: 'Search the web for anthropic claude'"
echo ""
echo "View logs:"
echo "  tail -f $INSTALL_DIR/logs/search.log"
echo ""
echo "Uninstall:"
echo "  sudo rm -rf $INSTALL_DIR $BIN_LINK"
echo "  # Then manually remove from Claude config"
echo ""
