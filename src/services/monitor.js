const chalk = require('chalk');
const config = require('./config');

class NetworkMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitorInterval = null;
    this.currentStats = {
      bytesIn: 0,
      bytesOut: 0,
      speedIn: 0,
      speedOut: 0,
      connections: []
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatSpeed(bytesPerSec) {
    return this.formatBytes(bytesPerSec) + '/s';
  }

  getStatus() {
    return {
      monitoring: this.isMonitoring,
      stats: this.currentStats,
      formatted: {
        totalIn: this.formatBytes(this.currentStats.bytesIn),
        totalOut: this.formatBytes(this.currentStats.bytesOut),
        speedIn: this.formatSpeed(this.currentStats.speedIn),
        speedOut: this.formatSpeed(this.currentStats.speedOut)
      }
    };
  }

  async startMonitoring(duration = 30000) {
    if (this.isMonitoring) {
      console.log(chalk.yellow('\n⚠ Already monitoring'));
      return;
    }

    this.isMonitoring = true;
    let lastBytesIn = 0;
    let lastBytesOut = 0;
    let lastTime = Date.now();

    console.log(chalk.blue('\n⟳ Starting network monitoring...\n'));

    this.monitorInterval = setInterval(() => {
      // Simulate network traffic
      const newBytesIn = this.currentStats.bytesIn + Math.floor(Math.random() * 50000) + 10000;
      const newBytesOut = this.currentStats.bytesOut + Math.floor(Math.random() * 30000) + 5000;
      
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      
      this.currentStats.speedIn = Math.floor((newBytesIn - lastBytesIn) / elapsed);
      this.currentStats.speedOut = Math.floor((newBytesOut - lastBytesOut) / elapsed);
      this.currentStats.bytesIn = newBytesIn;
      this.currentStats.bytesOut = newBytesOut;
      
      lastBytesIn = newBytesIn;
      lastBytesOut = newBytesOut;
      lastTime = now;

      // Generate simulated connections
      this.currentStats.connections = this.generateConnections();
    }, 2000);

    // Auto-stop after duration
    setTimeout(() => {
      this.stopMonitoring();
    }, duration);

    return { status: 'monitoring', duration };
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    // Save to history
    config.addHistoryEntry({
      bytesIn: this.currentStats.bytesIn,
      bytesOut: this.currentStats.bytesOut,
      duration: 30 // simulated
    });

    console.log(chalk.green('\n✓ Network monitoring stopped'));
  }

  generateConnections() {
    const protocols = ['TCP', 'UDP', 'HTTPS'];
    const states = ['ESTABLISHED', 'LISTENING', 'TIME_WAIT'];
    const apps = ['Chrome', 'Safari', 'VS Code', 'Terminal', 'Slack', 'Spotify'];
    const hosts = [
      'api.github.com',
      'localhost',
      'google.com',
      'cloudflare.com',
      'amazonaws.com',
      'microsoft.com'
    ];

    const numConnections = Math.floor(Math.random() * 8) + 3;
    const connections = [];

    for (let i = 0; i < numConnections; i++) {
      connections.push({
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        localPort: Math.floor(Math.random() * 60000) + 1024,
        remote: hosts[Math.floor(Math.random() * hosts.length)],
        remotePort: [80, 443, 3000, 8080, 5432][Math.floor(Math.random() * 5)],
        state: states[Math.floor(Math.random() * states.length)],
        app: apps[Math.floor(Math.random() * apps.length)]
      });
    }

    return connections;
  }

  getConnections() {
    return this.currentStats.connections;
  }

  getHistory() {
    return config.getHistory(50);
  }

  getDailyUsage() {
    const history = config.getHistory();
    const today = new Date().toDateString();
    
    const todayEntries = history.filter(h => 
      new Date(h.timestamp).toDateString() === today
    );

    const totalIn = todayEntries.reduce((sum, h) => sum + (h.bytesIn || 0), 0);
    const totalOut = todayEntries.reduce((sum, h) => sum + (h.bytesOut || 0), 0);

    return {
      bytesIn: totalIn,
      bytesOut: totalOut,
      formatted: {
        downloaded: this.formatBytes(totalIn),
        uploaded: this.formatBytes(totalOut)
      }
    };
  }

  getAlerts() {
    return config.getAlerts();
  }

  addAlert(type, message) {
    return config.addAlert({ type, message });
  }

  clearAlerts() {
    config.clearAlerts();
  }
}

module.exports = new NetworkMonitor();
