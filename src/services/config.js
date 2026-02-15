const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.dataDir = path.join(__dirname, '..', '..', 'data');
    this.historyFile = path.join(this.dataDir, 'history.json');
    this.settingsFile = path.join(this.dataDir, 'settings.json');
    this.alertsFile = path.join(this.dataDir, 'alerts.json');

    this.ensureDataDir();
    this.initializeFiles();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeFiles() {
    const defaults = {
      history: [],
      settings: {
        refreshInterval: 2000,
        maxHistoryDays: 30,
        alerts: {
          dataWarning: 80, // percentage
          dataCritical: 95
        }
      },
      alerts: []
    };

    Object.keys(defaults).forEach(key => {
      const filePath = this.getFilePath(key);
      if (!fs.existsSync(filePath)) {
        this.writeJson(key, defaults[key]);
      }
    });
  }

  getFilePath(type) {
    switch (type) {
      case 'history': return this.historyFile;
      case 'settings': return this.settingsFile;
      case 'alerts': return this.alertsFile;
      default: return null;
    }
  }

  readJson(type) {
    const filePath = this.getFilePath(type);
    if (!filePath) return null;
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  writeJson(type, data) {
    const filePath = this.getFilePath(type);
    if (!filePath) return false;
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      return false;
    }
  }

  getHistory(limit = 100) {
    const history = this.readJson('history') || [];
    return history.slice(-limit);
  }

  addHistoryEntry(entry) {
    const history = this.getHistory();
    entry.id = 'h-' + Date.now().toString(36);
    entry.timestamp = new Date().toISOString();
    history.push(entry);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = history.filter(h => new Date(h.timestamp) > thirtyDaysAgo);
    
    this.writeJson('history', filtered);
    return entry;
  }

  getSettings() {
    return this.readJson('settings');
  }

  updateSettings(updates) {
    const settings = this.readJson('settings');
    const newSettings = { ...settings, ...updates };
    this.writeJson('settings', newSettings);
    return newSettings;
  }

  getAlerts() {
    return this.readJson('alerts') || [];
  }

  addAlert(alert) {
    const alerts = this.getAlerts();
    alert.id = 'a-' + Date.now().toString(36);
    alert.createdAt = new Date().toISOString();
    alert.read = false;
    alerts.push(alert);
    this.writeJson('alerts', alerts);
    return alert;
  }

  markAlertRead(id) {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
      this.writeJson('alerts', alerts);
    }
  }

  clearAlerts() {
    this.writeJson('alerts', []);
  }
}

module.exports = new ConfigManager();
