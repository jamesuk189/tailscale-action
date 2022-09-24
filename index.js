const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const os = require('os');

async function run() {
    try {
        const isWindows = process.platform === 'win32';

        if (isWindows) {
            await runWindows();
        } else {
            await runLinux();
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function downloadInstaller(installerFilename, destFilename, version) {
    const url = getDownloadUrl(installerFilename, version);

    return await tc.downloadTool(url, destFilename);
}

function getDownloadUrl(installerFilename, version) {
    const minor = version.split('.')[1];
    const release = minor % 2 === 0 ? 'stable' : 'unstable';

    return `https://pkgs.tailscale.com/${release}/${installerFilename}`;
}

async function runLinux() {
    core.startGroup('Downloading Linux Tailscale binaries');

    const version = core.getInput('version', { required: true });
    const filename = `tailscale_${version}_amd64.tgz`;
    const installerPath = '/tmp/tailscale.tgz';

    const path = await downloadInstaller(filename, installerPath, version);

    core.endGroup();
    core.startGroup('Installing Tailscale');

    await tc.extractTar(path, '/tmp');

    await exec.exec(`sudo mv "/tmp/tailscale_${version}_amd64/tailscaled" /usr/sbin/`);
    await exec.exec(`sudo mv "/tmp/tailscale_${version}_amd64/systemd/tailscaled.service" /etc/systemd/system/`);
    await exec.exec(`sudo mv "/tmp/tailscale_${version}_amd64/systemd/tailscaled.defaults" /etc/default/tailscaled`);
    await exec.exec(`sudo mv "/tmp/tailscale_${version}_amd64/tailscale" /usr/bin/`);

    await exec.exec('sudo service tailscaled start');

    core.endGroup();
    core.startGroup('Starting Tailscale');

    const authkey = core.getInput('authkey', { required: true });
    const args = core.getInput('args');
    let hostname = core.getInput('hostname');

    if (hostname === '') {
        hostname = `github-${os.hostname()}`;
    }

    await exec.exec(`sudo tailscale up --authkey ${authkey} --hostname=${hostname} --accept-routes ${args}`);

    core.endGroup();
}

async function runWindows() {
    core.startGroup('Downloading Windows Tailscale Installer');

    const version = core.getInput('version', { required: true });
    const filename = `tailscale-setup-${version}-amd64.msi`;
    const tempDirectory = process.env['RUNNER_TEMP'];
    const installerPath = `${tempDirectory}\\tailscale.msi`;

    const path = await downloadInstaller(filename, installerPath, version);

    core.endGroup();
    core.startGroup('Installing Tailscale');

    await exec.exec('msiexec /i "' + path + '" /qn');

    await core.addPath('C:\\Program Files\\Tailscale');

    core.endGroup();
    core.startGroup('Starting Tailscale');

    const authkey = core.getInput('authkey', { required: true });
    const args = core.getInput('args');
    let hostname = core.getInput('hostname');

    if (hostname === '') {
        hostname = `github-${os.hostname()}`;
    }

    const tsArgs = ['up', '--authkey', `${authkey}`, '--hostname', `${hostname}`, '--accept-routes'];
    if (args) {
        tsArgs.push(args);
    }
    await exec.exec('tailscale', tsArgs);

    core.endGroup();
}

run();