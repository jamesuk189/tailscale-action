const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');

async function run() {
    try {
        const isWindows = process.platform === 'win32';
        const isMacOS = process.platform === 'darwin';

        if (isWindows) {
            await runWindows();
        } else if (isMacOS) {
            await runMacOS();
        } else {
            await runLinux();
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function runLinux() {

    if (!fs.existsSync('/usr/bin/tailscale')) {
        return;
    }

    await exec.exec(`sudo tailscale logout`);

    core.startGroup('Output Tailscale log');

    await exec.exec('journalctl -u tailscaled');

    core.endGroup();
}

async function runWindows() {

    if (!fs.existsSync('C:\\Program Files\\Tailscale\\tailscale.exe')) {
        return;
    }

    await exec.exec('tailscale', ['logout']);

    core.startGroup('Output Tailscale log');

    await exec.exec('pwsh -Command ". {Get-ChildItem C:\\ProgramData\\Tailscale\\Logs *.txt | Get-Content}"');

    core.endGroup();
}

async function runMacOS() {

    if (!fs.existsSync('/Applications/Tailscale.app')) {
        return;
    }

    await exec.exec('/Applications/Tailscale.app/Contents/MacOS/Tailscale', ['logout']);
}

run();