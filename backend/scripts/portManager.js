#!/usr/bin/env node

/**
 * Port Management Utility for YENE BET Backend
 * Helps resolve port conflicts and manage server processes
 */

const { execSync, exec } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
}

/**
 * Find the first available port in a range
 */
async function findAvailablePort(startPort = 5000, maxPort = 5010) {
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

/**
 * Get process ID using a specific port
 */
function getProcessIdForPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
        return parseInt(parts[parts.length - 1]);
      }
    }
  } catch (error) {
    // Port not found or no process using it
  }
  return null;
}

/**
 * Kill process by ID
 */
function killProcessById(pid) {
  try {
    execSync(`taskkill /f /pid ${pid}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Kill all Node.js processes
 */
function killAllNodeProcesses() {
  try {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update frontend environment file with new port
 */
function updateFrontendEnv(port) {
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
  
  try {
    let envContent = '';
    if (fs.existsSync(frontendEnvPath)) {
      envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    }
    
    // Update or add VITE_API_URL
    const apiUrlLine = `VITE_API_URL=http://localhost:${port}/api`;
    const apiUrlRegex = /^VITE_API_URL=.*/m;
    
    if (apiUrlRegex.test(envContent)) {
      envContent = envContent.replace(apiUrlRegex, apiUrlLine);
    } else {
      envContent += `\n${apiUrlLine}\n`;
    }
    
    fs.writeFileSync(frontendEnvPath, envContent.trim());
    colorLog(`✅ Updated frontend/.env with port ${port}`, 'green');
    return true;
  } catch (error) {
    colorLog(`❌ Failed to update frontend/.env: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main command handler
 */
async function main() {
  const command = process.argv[2];
  const targetPort = parseInt(process.argv[3]) || 5000;
  
  colorLog('\n🔧 YENE BET Port Management Utility', 'cyan');
  colorLog('=====================================', 'cyan');
  
  switch (command) {
    case 'check':
      colorLog(`\n📊 Checking port ${targetPort}...`, 'yellow');
      const available = await isPortAvailable(targetPort);
      if (available) {
        colorLog(`✅ Port ${targetPort} is available`, 'green');
      } else {
        const pid = getProcessIdForPort(targetPort);
        if (pid) {
          colorLog(`❌ Port ${targetPort} is in use by process ${pid}`, 'red');
        } else {
          colorLog(`❌ Port ${target0Port} is in use`, 'red');
        }
      }
      break;
      
    case 'find':
      colorLog(`\n🔍 Finding available port starting from ${targetPort}...`, 'yellow');
      const availablePort = await findAvailablePort(targetPort, targetPort + 10);
      if (availablePort) {
        colorLog(`✅ Found available port: ${availablePort}`, 'green');
        colorLog(`💡 Use: PORT=${availablePort} npm run dev`, 'blue');
      } else {
        colorLog(`❌ No available ports found in range ${targetPort}-${targetPort + 10}`, 'red');
      }
      break;
      
    case 'kill':
      colorLog(`\n🔫 Attempting to kill process on port ${targetPort}...`, 'yellow');
      const processId = getProcessIdForPort(targetPort);
      if (processId) {
        if (killProcessById(processId)) {
          colorLog(`✅ Killed process ${processId} on port ${targetPort}`, 'green');
        } else {
          colorLog(`❌ Failed to kill process ${processId}`, 'red');
        }
      } else {
        colorLog(`ℹ️  No process found on port ${targetPort}`, 'yellow');
      }
      break;
      
    case 'kill-all':
      colorLog('\n🔫 Killing all Node.js processes...', 'yellow');
      if (killAllNodeProcesses()) {
        colorLog('✅ All Node.js processes killed', 'green');
      } else {
        colorLog('ℹ️  No Node.js processes found', 'yellow');
      }
      break;
      
    case 'update-frontend':
      const port = parseInt(process.argv[3]) || 5000;
      colorLog(`\n📝 Updating frontend to use port ${port}...`, 'yellow');
      updateFrontendEnv(port);
      break;
      
    case 'status':
      colorLog('\n📊 Port Status Report:', 'yellow');
      for (let p = 5000; p <= 5010; p++) {
        const isAvailable = await isPortAvailable(p);
        const pid = !isAvailable ? getProcessIdForPort(p) : null;
        const status = isAvailable ? 'Available' : `In use (${pid || 'Unknown'})`;
        const statusColor = isAvailable ? 'green' : 'red';
        colorLog(`  Port ${p}: ${status}`, statusColor);
      }
      break;
      
    case 'auto-fix':
      colorLog('\n🔧 Auto-fixing port conflicts...', 'yellow');
      
      // First try to kill processes on common ports
      let fixed = false;
      for (let p = 5000; p <= 5002; p++) {
        const pid = getProcessIdForPort(p);
        if (pid) {
          colorLog(`🔫 Killing process ${pid} on port ${p}...`, 'yellow');
          if (killProcessById(pid)) {
            colorLog(`✅ Killed process on port ${p}`, 'green');
            fixed = true;
          }
        }
      }
      
      if (fixed) {
        colorLog('✅ Port conflicts resolved', 'green');
        colorLog('💡 You can now run: npm run dev', 'blue');
      } else {
        // Find an alternative port
        const altPort = await findAvailablePort(5000, 5010);
        if (altPort && altPort !== 5000) {
          colorLog(`⚠️  Port 5000 is busy, using port ${altPort}`, 'yellow');
          updateFrontendEnv(altPort);
          colorLog(`✅ Updated frontend to use port ${altPort}`, 'green');
          colorLog(`💡 Run: PORT=${altPort} npm run dev`, 'blue');
        } else {
          colorLog('❌ Could not resolve port conflicts automatically', 'red');
          colorLog('💡 Try manually killing Node.js processes or use a different port range', 'blue');
        }
      }
      break;
      
    default:
      colorLog('\n📖 Available Commands:', 'cyan');
      colorLog('  check [port]           - Check if a port is available', 'white');
      colorLog('  find [start-port]      - Find first available port', 'white');
      colorLog('  kill [port]            - Kill process using specific port', 'white');
      colorLog('  kill-all               - Kill all Node.js processes', 'white');
      colorLog('  update-frontend [port] - Update frontend .env with port', 'white');
      colorLog('  status                 - Show status of ports 5000-5010', 'white');
      colorLog('  auto-fix               - Auto-resolve port conflicts', 'white');
      colorLog('\n📝 Examples:', 'cyan');
      colorLog('  node portManager.js check 5000', 'white');
      colorLog('  node portManager.js auto-fix', 'white');
      colorLog('  node portManager.js find 5001', 'white');
      break;
  }
  
  colorLog('\n', 'white');
}

// Run the utility
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
  getProcessIdForPort,
  killProcessById,
  killAllNodeProcesses,
  updateFrontendEnv
};
