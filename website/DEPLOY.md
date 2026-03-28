# StackPage Website

Landing page for the StackPage desktop app.

## How it works

`index.php` calls the GitHub Releases API once per hour:

```
GET https://api.github.com/repos/marion909/StackPage/releases/latest
```

The response is cached in `cache/release.json` for 60 minutes.
On every page load the version badge, download buttons and file sizes are
rendered server-side from the cached data — **no manual update needed after a
GitHub release**.

## Platform detection

| File extension            | Platform button  |
|---------------------------|-----------------|
| `_x64-setup.exe` / `.msi` / `.exe` | Windows  |
| `.dmg`                    | macOS           |
| `.AppImage` / `.deb`      | Linux           |

## Deployment

Upload the entire `website/` folder to your web server (Apache + PHP 8.0+).

```
/your-webroot/
  index.php
  .htaccess
  assets/
    style.css
  cache/           ← created automatically, must be writable (chmod 755)
```

Make sure the `cache/` directory is writable by the web server:

```bash
chmod 755 cache/
```

**Nginx**: Use `fastcgi_pass` for `.php` files and add `deny all` for the
`cache/` location block.

## Cache invalidation

Delete `cache/release.json` to force an immediate refresh, or wait for the
TTL (3600 s) to expire automatically.
