const chalk = require('chalk');
const monitor = require('../services/monitor');

function showStatus() {
  const status = monitor.getStatus();
  
  console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('  📊 Network Monitor - Status'));
  console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  // Monitoring Status
  const monitorStatus = status.monitoring ? chalk.green('ACTIVE') : chalk.gray('INACTIVE');
  console.log(chalk.bold('  Monitoring: ') + monitorStatus);

  if (status.monitoring) {
    console.log(chalk.bold('\n  📈 Current Speed:'));
    console.log(chalk.green('    ↓ Download: ') + chalk.cyan(status.formatted.speedIn));
    console.log(chalk.yellow('    ↑ Upload:   ') + chalk.cyan(status.formatted.speedOut));
  }

  console.log(chalk.bold('\n  📊 Total Transferred:'));
  console.log(chalk.green('    ↓ Downloaded: ') + chalk.cyan(status.formatted.totalIn));
  console.log(chalk.yellow('    ↑ Uploaded:   ') + chalk.cyan(status.formatted.totalOut));

  // Daily usage
  const daily = monitor.getDailyUsage();
  console.log(chalk.bold('\n  📅 Today\'s Usage:'));
  console.log(chalk.green('    ↓ Downloaded: ') + chalk.cyan(daily.formatted.downloaded));
  console.log(chalk.yellow('    ↑ Uploaded:   ') + chalk.cyan(daily.formatted.uploaded));

  console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

function showConnections() {
  const connections = monitor.getConnections();

  if (connections.length === 0) {
    console.log(chalk.yellow('\n📡 No active connections. Start monitoring first.'));
    return;
  }

  console.log(chalk.bold('\n📡 Active Connections\n'));

  connections.forEach(conn => {
    const stateColor = conn.state === 'ESTABLISHED' ? chalk.green : 
                      conn.state === 'LISTENING' ? chalk.blue : chalk.gray;
    
    console.log(chalk.cyan(`  ${conn.app}`));
    console.log(chalk.gray(`    ${conn.protocol} | ${conn.localPort} → ${conn.remote}:${conn.remotePort}`));
    console.log(chalk.gray(`    State: `) + stateColor(conn.state));
    console.log('');
  });
}

function showHistory() {
  const history = monitor.getHistory();

  if (history.length === 0) {
    console.log(chalk.yellow('\n📜 No history available.'));
    return;
  }

  console.log(chalk.bold('\n📜 Recent History\n'));

  history.reverse().slice(0, 10).forEach(entry => {
    const timestamp = new Date(entry.timestamp).toLocaleString();
    console.log(chalk.gray(`  ${timestamp}`));
    console.log(chalk.green(`    ↓ ${monitor.formatBytes(entry.bytesIn || 0)}`));
    console.log(chalk.yellow(`    ↑ ${monitor.formatBytes(entry.bytesOut || 0)}\n`));
  });
}

function showAlerts() {
  const alerts = monitor.getAlerts();

  if (alerts.length === 0) {
    console.log(chalk.green('\n🔔 No alerts.'));
    return;
  }

  console.log(chalk.bold('\n🔔 Alerts\n'));

  alerts.forEach(alert => {
    const typeColor = alert.type === 'warning' ? chalk.yellow : chalk.red;
    console.log(typeColor(`  [${alert.type.toUpperCase()}]`) + chalk.gray(` ${alert.message}`));
    console.log(chalk.gray(`    ${new Date(alert.createdAt).toLocaleString()}\n`));
  });
}

module.exports = {
  showStatus,
  showConnections,
  showHistory,
  showAlerts
};
