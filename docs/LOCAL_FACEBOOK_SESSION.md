# Local Facebook session for gallery worker

This is an opt-in local convenience for the admin gallery importer. It is not a production authentication mechanism.

## Preferred setup: current Chrome tab through CDP

The admin button opens a new tab in the already-running Chrome profile, uses the existing Facebook session, walks the gallery with the `Ảnh tiếp theo` control, and closes only the worker-created tab. It does not export or persist cookies/tokens.

On Chrome 144+, open `chrome://inspect/#remote-debugging` and enable Remote Debugging. Keep Chrome open while the local Next.js server runs. The app reads Chrome's local `DevToolsActivePort` file; `SOCIAL_FACEBOOK_CDP_ACTIVE_PORT_PATH` is only needed when Chrome uses a non-default data directory.

```dotenv
SOCIAL_FACEBOOK_WORKER_ENABLED=true
SOCIAL_FACEBOOK_CDP_ENABLED=true
```

The CDP bridge is local-only, must stay bound to `127.0.0.1`, and is never available to production/serverless requests. If Chrome is restarted, enable Remote Debugging again before using the button.

## Fallback: isolated local storage state

The worker does not read the Chrome profile currently open on the machine. Create an explicit Playwright storage state in an isolated window:

The worker does not read the Chrome profile currently open on the machine. Create an explicit Playwright storage state in an isolated window:

```bash
npm run social:facebook-gallery -- \
  --url "https://www.facebook.com/story.php?story_fbid=...&id=..." \
  --headed \
  --wait-for-login \
  --save-storage-state .local/facebook/storage-state.json
```

Log in only in the Playwright window that opens. The worker filters the saved state to Facebook cookies and Facebook localStorage, writes it atomically with `0600` permissions, and keeps it under `.local/facebook/`.

`.env.local` already points the local app to:

```dotenv
SOCIAL_FACEBOOK_STORAGE_STATE_PATH=.local/facebook/storage-state.json
```

Restart the local Next.js server after creating the file. The CLI can seed a fresh temporary profile from this local state. If the state expires, the worker waits for manual login in that temporary window and refreshes the local state after a successful scan.

## Security boundary

- Never send the state file through the admin UI/API.
- Never commit, upload, print, or paste its contents into chat.
- The path must remain under `.local/facebook/`; other paths are rejected.
- The CDP mode never serializes the original Chrome profile or session into an API/request/file; it only controls a new tab and closes that tab after scanning.
- The fallback storage-state mode never reads or copies the original Chrome profile.
- Production/serverless keeps the Facebook worker disabled.

To revoke this local session, remove `.local/facebook/storage-state.json` and create a new state when needed.
