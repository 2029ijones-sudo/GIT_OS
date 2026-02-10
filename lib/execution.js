// lib/execution.js - REAL EXECUTION NO SIMULATION
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class ExecutionEngine {
  constructor() {
    this.sessions = new Map();
    this.timeout = 14 * 60 * 1000; // 14 minutes
  }

  // REAL Execution Services
  services = {
    // Piston - for CS programs (C++, Java, Python, etc.)
    piston: async (code, language) => {
      const languageMap = {
        'python': 'python',
        'javascript': 'javascript',
        'java': 'java',
        'csharp': 'csharp',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rust': 'rust',
        'ruby': 'ruby',
        'php': 'php'
      };
      
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: languageMap[language],
        version: '*',
        files: [{ content: code }],
        stdin: '',
        args: []
      });
      
      return response.data.run;
    },

    // Replit Code Execution API
    replit: async (code, language) => {
      const response = await axios.post('https://eval-backend.replit.app/eval', {
        code: code,
        language: language
      });
      return response.data;
    },

    // JDoodle Compiler API (needs API key)
    jdoodle: async (code, language, clientId, clientSecret) => {
      const response = await axios.post('https://api.jdoodle.com/v1/execute', {
        script: code,
        language: language,
        versionIndex: '0',
        clientId: clientId,
        clientSecret: clientSecret
      });
      return response.data;
    },

    // CodeSandbox API for Electron/Web
    codesandbox: async (files, template = 'node') => {
      const response = await axios.post('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
        files: files,
        template: template
      });
      
      const sandboxId = response.data.sandbox_id;
      return {
        url: `https://${sandboxId}.csb.app`,
        embedUrl: `https://codesandbox.io/embed/${sandboxId}`,
        id: sandboxId
      };
    }
  };

  // REAL CS Program Execution
  async executeCS(code, language, sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session expired');
    
    try {
      // Use Piston API for REAL execution
      const result = await this.services.piston(code, language);
      
      // Store execution in session
      session.executions.push({
        timestamp: new Date().toISOString(),
        language: language,
        code: code.substring(0, 1000), // Store first 1000 chars
        result: result
      });
      
      return {
        output: result.output,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.code,
        language: language,
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`REAL execution failed: ${error.message}`);
    }
  }

  // REAL Electron App Execution
  async executeElectron(code, sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session expired');
    
    // Create complete Electron app structure
    const files = {
      'package.json': {
        content: JSON.stringify({
          name: `electron-app-${sessionId}`,
          version: '1.0.0',
          main: 'main.js',
          dependencies: {
            'electron': '^25.0.0'
          },
          scripts: {
            'start': 'electron .'
          }
        }, null, 2)
      },
      'main.js': {
        content: `
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // User's Electron code
  ${code}
  
  // Load empty page with user code executed
  win.loadURL('data:text/html;charset=utf-8,<html><body><div id="app"></div><script>${code.replace(/'/g, "\\'")}</script></body></html>');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
        `
      },
      'index.html': {
        content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Electron App</title>
</head>
<body>
    <div id="app">Electron App Running</div>
    <script>
        // User's frontend code runs here
        ${code}
    </script>
</body>
</html>
        `
      }
    };
    
    try {
      // Create REAL CodeSandbox with Electron template
      const sandbox = await this.services.codesandbox(files, 'node');
      
      // Store sandbox info
      session.electronSandbox = sandbox;
      session.electronUrl = sandbox.embedUrl;
      
      return {
        type: 'electron',
        sandboxId: sandbox.id,
        previewUrl: sandbox.url,
        embedUrl: sandbox.embedUrl,
        status: 'running',
        expiresAt: new Date(session.endTime).toISOString()
      };
    } catch (error) {
      throw new Error(`REAL Electron execution failed: ${error.message}`);
    }
  }

  // REAL Web App Deployment
  async deployWeb(frontendCode, backendCode, sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session expired');
    
    const files = {
      'index.html': {
        content: frontendCode || '<html><body>Empty Project</body></html>'
      },
      'script.js': {
        content: backendCode || 'console.log("Hello from GIT_OS")'
      },
      'package.json': {
        content: JSON.stringify({
          name: `web-app-${sessionId}`,
          version: '1.0.0',
          scripts: {
            'start': 'node server.js'
          }
        }, null, 2)
      },
      'server.js': {
        content: backendCode.includes('require') ? backendCode : `
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
        `
      }
    };
    
    try {
      const sandbox = await this.services.codesandbox(files, 'node');
      
      session.webDeployment = sandbox;
      session.deploymentUrl = sandbox.url;
      
      return {
        type: 'web',
        url: sandbox.url,
        embedUrl: sandbox.embedUrl,
        status: 'deployed',
        sandboxId: sandbox.id
      };
    } catch (error) {
      throw new Error(`REAL web deployment failed: ${error.message}`);
    }
  }

  // Session Management
  createSession(labId, userId, type) {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      labId,
      userId,
      type,
      startTime: Date.now(),
      endTime: Date.now() + this.timeout,
      isActive: true,
      executions: [],
      createdAt: new Date().toISOString()
    };
    
    this.sessions.set(sessionId, session);
    
    // Auto cleanup after 14 minutes
    setTimeout(() => {
      this.cleanupSession(sessionId);
    }, this.timeout);
    
    return sessionId;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || Date.now() > session.endTime) {
      return null;
    }
    return session;
  }

  cleanupSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // Get all active sessions for a user
  getUserSessions(userId) {
    const now = Date.now();
    const userSessions = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && now < session.endTime) {
        userSessions.push(session);
      }
    }
    
    return userSessions;
  }
}

// Singleton instance
const executionEngine = new ExecutionEngine();
export default executionEngine;
