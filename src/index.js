#!/usr/bin/env node

const chalk = require('chalk');
const figlet = require('figlet');

// Import commands
const statusCmd = require('./commands/status');
const monitor = require('./services/monitor');

// Simple argument parser
function parseArgs(args) {
  const result = {
    command: null,
    subcommand: null,
    options: {}
  };

  if (args.length < 3) {
    return result;
  }

  const parts = args.slice(2);

  if (parts.length === 0) {
    result.command = 'help';
    return result;
  }

  const flagIndex = parts.findIndex(p => p && p.startsWith('--'));
  let cmdParts = flagIndex === -1 ? parts : parts.slice(0, flagIndex);

  result.command = cmdParts[0];
  result.subcommand = cmdParts[1] || null;

  if (flagIndex !== -1) {
    for (let i = flagIndex; i < parts.length; i++) {
      const flag = parts[i];
      if (flag && flag.startsWith('--')) {
        const flagParts = flag.split('=');
        const key = flagParts[0].replace('--', '');
        result.options[key] = flagParts[1] || true;
      }
    }
  }

  return result;
}

function showBanner() {
  console.log(chalk.cyan(figlet.textSync('Net Monitor', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })));
  console.log(chalk.bold.cyan('  v1.0.0'));
  console.log(chalk.gray('  Monitor network traffic & connections\n'));
}

function showHelp() {
  console.log(chalk.bold('\n📖 Usage:'));
  console.log('  net-monitor <command> [options]\n');

  console.log(chalk.bold('\n🔧 Commands:'));
  console.log('  status         Show current network status');
  console.log('  start          Start monitoring (30s)');
  console.log('  stop           Stop monitoring');
  console.log('  connections    View active connections');
  console.log('  history        Show usage history');
  console.log('  alerts         Show alerts');
  console.log('  help           Show this help message');

  console.log(chalk.bold('\n📌 Examples:'));
  console.log('  net-monitor status');
  console.log('  net-monitor start');
  console.log('  net-monitor connections');
  console.log('  net-monitor history\n');
}

async function main() {
  const args = parseArgs(process.argv);
  const { command, subcommand, options } = args;

  if (!command || command === 'help') {
    showBanner();
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'status':
        statusCmd.showStatus();
        break;

      case 'start':
        await monitor.startMonitoring();
        break;

      case 'stop':
        monitor.stopMonitoring();
        break;

      case 'connections':
        statusCmd.showConnections();
        break;

      case 'history':
        statusCmd.showHistory();
        break;

      case 'alerts':
        statusCmd.showAlerts();
        break;

      default:
        console.log(chalk.yellow(`Unknown command: ${command}`));
        console.log(chalk.gray('Use: net-monitor help'));
    }
  } catch (error) {
    console.error(chalk.red('\n✗ Error:'), error.message);
    process.exit(1);
  }
}

main();
