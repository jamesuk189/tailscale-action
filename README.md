# Connect to Tailscale Action

This is an unofficial GitHub Action with Linux and Windows support for connecting to a [Tailscale](https://tailscale.com/) Tailnet. All GitHub Actions after this one will have access to the Tailnet machines.

The `--accept-routes` flag is always used to ensure the Linux runner will accept advertised subnet routes.

At the end of the job `tailscale logout` is called to remove the runner machine from the Tailnet. Logs from Tailscale are also output in the action cleanup.

## Usage

This action uses a reusable and ephemeral auth key to connect the runner to the Tailnet. You should generate an [auth key](https://login.tailscale.com/admin/settings/keys) with the reusable and ephemeral settings enabled. If you have 'Manually authorize new devices' enabled you will need to also have the pre-authorized setting enabled for the key.

```yaml
- uses: jamesuk189/tailscale-action@main
  with:
    authKey: # required - reusable and ephemeral
    version: # optional - default: 1.30.2
    args: # optional - additional arguments to pass to `tailscale up`
    hostname: # optional - A custom hostname to use - default: github-{runner-hostname}
```

### Examples

#### Connect to Tailnet

This is the same as using `tailscale up --authkey tskey-abcdef1432341818 --accept-routes`.

```yaml
- uses: jamesuk189/tailscale-action@main
  with:
    authKey: ${{ secrets.TAILSCALE_AUTHKEY }}
```

#### Connect to Tailnet with Exit Node

This is the same as using `tailscale up --authkey tskey-abcdef1432341818 --accept-routes --exit-node=100.x.y.z`.

```yaml
- uses: jamesuk189/tailscale-action@main
  with:
    authKey: ${{ secrets.TAILSCALE_AUTHKEY }}
    args: --exit-node=${{ secrets.TAILSCALE_EXITNODEIP }}
```

#### Connect to Tailnet with specific Tailscale version

This is the same as using `tailscale up --authkey tskey-abcdef1432341818 --accept-routes` with the specified Tailscale client version installed.

```yaml
- uses: jamesuk189/tailscale-action@main
  with:
    authKey: ${{ secrets.TAILSCALE_AUTHKEY }}
    version: 1.30.2
```