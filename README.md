# Qwen CLI UI

A modern, responsive web-based user interface for [Qwen Code CLI](https://github.com/QwenLM/Qwen), providing an intuitive chat interface with file management, session history, and code editing capabilities.

> **Fork of [cruzyjapan/Qwen-CLI-UI](https://github.com/cruzyjapan/Qwen-CLI-UI)** with Qwen CLI compatibility fixes and native `settings.json` integration.

## Features

- 🤖 **Interactive Chat Interface** — Seamless communication with Qwen AI assistant
- ⚙️ **Native Settings Integration** — Reads models, providers, and MCP servers directly from `~/.qwen/settings.json`
- 📁 **File Explorer** — Browse, view, and edit project files with syntax highlighting
- 🔄 **Session Management** — Save, resume, and manage multiple chat sessions
- 🎨 **Dark/Light Theme** — Customizable appearance with automatic theme detection
- 🛠️ **Integrated Terminal** — Built-in shell access for direct command execution
- 📝 **Code Editor** — Monaco-based editor with syntax highlighting and IntelliSense
- 🔒 **Secure Authentication** — JWT-based authentication system
- 📱 **Fully Responsive** — Optimized for desktop, tablet, and mobile devices

## What's Changed (Fork Changes)

### Qwen CLI Compatibility
- **Fixed project name decoding** — Projects display correctly instead of garbled base64 names, matching Qwen CLI's dash-to-slash directory encoding
- **Fixed session discovery** — Searches `chats/` subdirectory for JSONL session files, matching how Qwen CLI stores conversations
- **Fixed session history** — Reads and parses JSONL-based message history; normalizes `parts[]` and `role:"model"` to `content[]` and `role:"assistant"`
- **Default sort by recent activity** — Projects sorted by most recent activity instead of alphabetical

### `~/.qwen/settings.json` Integration
- **Real model list** — Model dropdown in Settings shows actual models from `settings.json` (e.g., GLM-4.7, GLM-5-turbo, GLM-5.1) instead of hardcoded names
- **Active model badge** — Chat interface displays the active model from `settings.json` (e.g., `glm-5.1`) instead of a hardcoded default
- **Model fallback** — Server uses the active model from `settings.json` as fallback when no model is explicitly selected in the UI
- **MCP server display** — Shows MCP servers configured in `settings.json` in the Settings panel
- **Provider info** — Displays model provider and base URL alongside each model
- **New `GET /api/settings` endpoint** — Exposes public config (models, active model, fast model, provider, MCP servers) to the frontend

## Screenshots

<div align="center">
<table>
<tr>
<td align="center">
<h3>Chat Interface</h3>
<img src="public/screenshots/TOP.png" alt="Chat Interface" width="400">
<br>
<em>Main chat interface with project overview</em>
</td>
<td align="center">
<h3>Settings Panel</h3>
<img src="public/screenshots/Setting.png" alt="Settings" width="400">
<br>
<em>Configuration and model settings</em>
</td>
</tr>
</table>
</div>

## Prerequisites

- Node.js 18+ and npm
- [Qwen Code CLI](https://github.com/QwenLM/Qwen) installed and configured
- Unix-like environment (Linux, macOS, WSL)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mdarweash/Qwen-CLI-UI.git
cd Qwen-CLI-UI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The UI reads model and provider configuration directly from `~/.qwen/settings.json` — the same file Qwen CLI uses. No duplicate configuration needed.

Create a `.env` file in the root directory for server-only settings:

```env
# Server Configuration
PORT=5008
VITE_PORT=5009

# Qwen CLI Configuration
AGENT_BIN=qwen
AGENT_SKIP_PERMISSIONS_FLAG=--yolo

# Authentication (change in production)
JWT_SECRET=your-secret-key-here

# Environment
NODE_ENV=development
```

### 4. Start the Application

```bash
npm run dev
```

Access the application at:
- Frontend: http://localhost:5009
- API Server: http://localhost:5008

## Usage Guide

### Initial Setup
1. Open the application in your browser
2. Create an admin account on first launch
3. Select or create a project directory
4. Start chatting with Qwen!

### Model Selection
- Models are read from `~/.qwen/settings.json` → `modelProviders`
- Open **Settings** → **Tools** tab to select a model
- The active model badge in the chat shows your current selection
- If no model is selected, the active model from `settings.json` is used automatically

### Chat Features
- Type messages and press Enter to send
- Use `@` to reference project files
- Drag and drop images for visual context
- View tool usage in expandable sections
- Auto-scroll and manual scroll modes

### File Management
- Browse files in the Files tab
- Click to open in the integrated editor
- Save changes with Ctrl/Cmd + S
- Syntax highlighting for all major languages

### Session Management
- Sessions auto-save during conversations
- Resume previous sessions from the sidebar
- Search through session history
- Delete old sessions to free up space

## Project Structure

```
Qwen-CLI-UI/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilities (api.js, websocket.js)
├── server/                 # Express backend
│   ├── index.js            # Main server
│   ├── settings.js         # Reads ~/.qwen/settings.json
│   ├── agent-cli.js        # Qwen CLI integration
│   ├── projects.js         # Project & session management
│   ├── sessionManager.js   # Session persistence
│   ├── routes/             # API route modules
│   └── middleware/          # Auth middleware
├── public/                 # Static assets
└── dist/                   # Production build
```

## API Documentation

### REST Endpoints
- `GET /api/settings` — Models, active model, providers, MCP servers from `~/.qwen/settings.json`
- `GET /api/config` — Server port and WebSocket URL
- `GET /api/projects` — List all projects
- `GET /api/projects/:name/sessions` — Get project sessions
- `GET /api/projects/:name/sessions/:id/messages` — Get session messages
- `POST /api/projects/create` — Add a project manually
- `PUT /api/projects/:name/rename` — Rename a project
- `DELETE /api/projects/:name` — Delete a project
- `POST /api/transcribe` — Audio transcription (Whisper)

### WebSocket Events
- `qwen-command` — Send command to Qwen
- `qwen-output` — Receive Qwen output (streamed)
- `session-created` — New session notification
- `qwen-complete` — Command completion
- `session-aborted` — Session abort confirmation
- `projects_updated` — Project file change notification

## Production Deployment

### Build for Production

```bash
# Build the frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t qwen-cli-ui .

# Run container
docker run -p 5008:5008 -p 5009:5009 \
  -e JWT_SECRET=your-secret-key \
  -v ~/.qwen:/root/.qwen \
  qwen-cli-ui
```

### Security Recommendations

1. **Change default JWT secret** — Use a strong, random secret in production
2. **Enable HTTPS** — Use reverse proxy (nginx/caddy) with SSL certificates
3. **Configure CORS** — Restrict origins in production
4. **Regular updates** — Keep dependencies updated for security patches
5. **Access control** — Implement proper user authentication and authorization

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Check if the server is running on the correct port
- Verify firewall settings allow WebSocket connections
- Ensure authentication token is valid

**Qwen CLI Not Responding**
- Verify Qwen CLI installation: `which qwen`
- Test Qwen directly: `qwen --help`
- Check server logs for detailed errors
- Ensure proper permissions for Qwen executable

**Models Not Showing**
- Verify `~/.qwen/settings.json` exists and has `modelProviders` configured
- Check that `GET /api/settings` returns model data
- Restart the server after changing `settings.json`

**Sessions Not Saving**
- Check write permissions: `~/.qwen/sessions/`
- Verify sufficient disk space
- Review server logs for file system errors

**Authentication Issues**
- Clear browser localStorage
- Regenerate JWT token
- Check server authentication logs

## Development

### Running Tests

```bash
npm test
```

### Code Style

```bash
npm run lint
npm run format
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) file for details

## Acknowledgments

- Original project by [cruzyjapan](https://github.com/cruzyjapan/Qwen-CLI-UI)
- Built for [Qwen Code CLI](https://github.com/QwenLM/Qwen)
- Powered by React, Vite, and Tailwind CSS
- Monaco Editor for code editing
- Terminal emulation with node-pty
- Icons from Heroicons

## Support

For issues and feature requests:
- Open an issue on [GitHub Issues](https://github.com/mdarweash/Qwen-CLI-UI/issues)
- Check [existing issues](https://github.com/mdarweash/Qwen-CLI-UI/issues) for solutions
- Include detailed logs when reporting bugs

---

<div align="center">
Made with ❤️ for the Qwen community
</div>
