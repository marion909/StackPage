<?php
/**
 * StackPage Landing Page
 * Downloads the latest GitHub release info once per hour and auto-generates
 * platform-specific download buttons.
 */

define('GITHUB_OWNER', 'marion909');
define('GITHUB_REPO',  'StackPage');
define('CACHE_FILE',   __DIR__ . '/cache/release.json');
define('CACHE_TTL',    3600); // seconds

// ─── Fetch latest release ──────────────────────────────────────────────────────

function fetch_latest_release(): array {
    // Serve from cache if fresh
    if (file_exists(CACHE_FILE)) {
        $data = json_decode(file_get_contents(CACHE_FILE), true);
        if (isset($data['_cached_at']) && (time() - $data['_cached_at']) < CACHE_TTL) {
            return $data;
        }
    }

    $url = sprintf(
        'https://api.github.com/repos/%s/%s/releases/latest',
        GITHUB_OWNER,
        GITHUB_REPO
    );

    $ctx = stream_context_create([
        'http' => [
            'method'  => 'GET',
            'header'  => implode("\r\n", [
                'User-Agent: StackPage-Website/1.0',
                'Accept: application/vnd.github+json',
            ]),
            'timeout' => 5,
        ],
    ]);

    $body = @file_get_contents($url, false, $ctx);

    if ($body === false || empty($body)) {
        // Return cached data even if stale, or empty fallback
        if (file_exists(CACHE_FILE)) {
            return json_decode(file_get_contents(CACHE_FILE), true);
        }
        return [];
    }

    $data = json_decode($body, true);
    if (!isset($data['tag_name'])) {
        return [];
    }

    $data['_cached_at'] = time();

    // Store to cache
    if (!is_dir(dirname(CACHE_FILE))) {
        mkdir(dirname(CACHE_FILE), 0755, true);
    }
    file_put_contents(CACHE_FILE, json_encode($data));

    return $data;
}

// ─── Parse assets into per-platform downloads ─────────────────────────────────

function parse_downloads(array $release): array {
    $assets = $release['assets'] ?? [];
    $map = [
        'windows' => ['label' => 'Windows',       'icon' => '⊞', 'exts' => ['_x64-setup.exe', '.msi', '.exe']],
        'mac'     => ['label' => 'macOS',          'icon' => '', 'exts' => ['.dmg', '_aarch64.dmg', '_x64.dmg']],
        'linux'   => ['label' => 'Linux (AppImage)', 'icon' => '🐧', 'exts' => ['.AppImage', '.deb']],
    ];

    $downloads = [];
    foreach ($map as $platform => $info) {
        foreach ($assets as $asset) {
            $name = strtolower($asset['name']);
            foreach ($info['exts'] as $ext) {
                if (str_ends_with($name, strtolower($ext))) {
                    $downloads[$platform] = [
                        'label'    => $info['label'],
                        'icon'     => $info['icon'],
                        'url'      => $asset['browser_download_url'],
                        'filename' => $asset['name'],
                        'size'     => round($asset['size'] / (1024 * 1024), 1),
                    ];
                    break 2;
                }
            }
        }
    }

    return $downloads;
}

$release   = fetch_latest_release();
$version   = $release['tag_name']  ?? null;
$changelog = $release['body']      ?? '';
$published = isset($release['published_at'])
    ? date('F j, Y', strtotime($release['published_at']))
    : null;
$release_url = $release['html_url'] ?? ('https://github.com/' . GITHUB_OWNER . '/' . GITHUB_REPO . '/releases');

$downloads = parse_downloads($release);
// Fallback: link to releases page if no assets yet
$fallback_url = $release_url;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="StackPage – Visual website builder for Windows, macOS and Linux. Drag, drop, export. No coding required.">
  <meta property="og:title"       content="StackPage – Visual Website Builder">
  <meta property="og:description" content="Build beautiful websites without writing code. Export clean HTML or deploy directly via FTP/SFTP.">
  <meta property="og:type"        content="website">
  <title>StackPage – Visual Website Builder</title>
  <link rel="stylesheet" href="assets/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<!-- ─── NAV ──────────────────────────────────────────────────────────────────── -->
<nav class="nav">
  <div class="container nav__inner">
    <a href="#" class="nav__logo">
      <img src="assets/logo.png" alt="StackPage" class="nav__logo-img">
    </a>
    <ul class="nav__links">
      <li><a href="#features">Features</a></li>
      <li><a href="#download">Download</a></li>
      <li><a href="https://github.com/<?= GITHUB_OWNER ?>/<?= GITHUB_REPO ?>" target="_blank" rel="noopener">GitHub ↗</a></li>
    </ul>
  </div>
</nav>

<!-- ─── HERO ─────────────────────────────────────────────────────────────────── -->
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__badge">
      <?php if ($version): ?>
        <span>🎉 Version <?= htmlspecialchars($version) ?> released<?= $published ? ' · ' . htmlspecialchars($published) : '' ?></span>
      <?php else: ?>
        <span>Open Source · Free forever</span>
      <?php endif; ?>
    </div>

    <h1 class="hero__title">
      Build websites<br>
      <span class="hero__title-accent">without writing code.</span>
    </h1>

    <p class="hero__sub">
      StackPage is a free, native desktop app for Windows, macOS and Linux.
      Drag components onto the canvas, configure them visually, then export
      clean HTML/CSS or deploy directly to any FTP/SFTP server.
    </p>

    <div class="hero__actions">
      <?php if (!empty($downloads)): ?>
        <?php $first = array_values($downloads)[0]; ?>
        <a href="<?= htmlspecialchars($first['url']) ?>" class="btn btn--primary btn--lg">
          ↓ Download for <?= htmlspecialchars($first['label']) ?>
          <?php if ($version): ?><span class="btn__version"><?= htmlspecialchars($version) ?></span><?php endif; ?>
        </a>
      <?php else: ?>
        <a href="<?= htmlspecialchars($fallback_url) ?>" class="btn btn--primary btn--lg" target="_blank" rel="noopener">
          ↓ Download Latest Release
        </a>
      <?php endif; ?>
      <a href="https://github.com/<?= GITHUB_OWNER ?>/<?= GITHUB_REPO ?>" class="btn btn--ghost btn--lg" target="_blank" rel="noopener">
        View on GitHub
      </a>
    </div>

    <p class="hero__note">Free &amp; open source · No account required · Works offline</p>
  </div>

  <!-- Decorative canvas mockup -->
  <div class="hero__mockup" aria-hidden="true">
    <div class="mockup__window">
      <div class="mockup__titlebar">
        <span class="mockup__dot mockup__dot--red"></span>
        <span class="mockup__dot mockup__dot--yellow"></span>
        <span class="mockup__dot mockup__dot--green"></span>
        <span class="mockup__title">StackPage – My Website</span>
      </div>
      <div class="mockup__body">
        <div class="mockup__sidebar">
          <div class="mockup__sideitem mockup__sideitem--active"></div>
          <div class="mockup__sideitem"></div>
          <div class="mockup__sideitem"></div>
          <div class="mockup__sideitem"></div>
          <div class="mockup__sideitem"></div>
          <div class="mockup__sideitem"></div>
        </div>
        <div class="mockup__canvas">
          <div class="mockup__block mockup__block--hero"></div>
          <div class="mockup__block mockup__block--text"></div>
          <div class="mockup__block mockup__block--cols">
            <span></span><span></span><span></span>
          </div>
          <div class="mockup__block mockup__block--text mockup__block--short"></div>
        </div>
        <div class="mockup__props">
          <div class="mockup__prop-row"></div>
          <div class="mockup__prop-row mockup__prop-row--sm"></div>
          <div class="mockup__prop-swatch-row">
            <span class="mockup__swatch mockup__swatch--blue"></span>
            <span class="mockup__swatch mockup__swatch--teal"></span>
            <span class="mockup__swatch mockup__swatch--gray"></span>
          </div>
          <div class="mockup__prop-row"></div>
          <div class="mockup__prop-row mockup__prop-row--sm"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ─── FEATURES ─────────────────────────────────────────────────────────────── -->
<section class="features" id="features">
  <div class="container">
    <h2 class="section-title">Everything you need to build a website</h2>
    <p class="section-sub">No cloud, no subscription, no data sent anywhere.</p>

    <div class="features__grid">
      <?php
      $features = [
        ['icon' => '🖱', 'title' => 'Drag &amp; Drop Editor',
         'desc' => 'Drag components from the palette, reorder sections, and build pages visually in seconds.'],
        ['icon' => '🎨', 'title' => 'Theme Editor',
         'desc' => 'Global colors, typography, spacing, and border radius — with a live WCAG contrast checker.'],
        ['icon' => '📄', 'title' => 'Multi-Page Projects',
         'desc' => 'Manage unlimited pages per project. Duplicate, import, and reuse layouts across pages.'],
        ['icon' => '🚀', 'title' => 'One-Click Deploy',
         'desc' => 'Publish via FTP, SFTP, or Netlify Drop directly from the app — no terminal required.'],
        ['icon' => '📦', 'title' => 'Clean HTML Export',
         'desc' => 'Exports minified, self-contained HTML + CSS with sitemap.xml and correct semantic tags.'],
        ['icon' => '🔌', 'title' => '17+ Block Types',
         'desc' => 'Hero, Heading, Text, Button, Image, Gallery, Video, Pricing Table, Contact Form, and more.'],
        ['icon' => '↩', 'title' => 'Undo / Redo',
         'desc' => 'Full undo/redo history for every action: block edits, theme changes, section moves.'],
        ['icon' => '📐', 'title' => 'Responsive Preview',
         'desc' => 'Switch between Desktop, Tablet, and Mobile preview modes while editing.'],
        ['icon' => '🌐', 'title' => 'EN / DE Interface',
         'desc' => 'English and German UI out of the box — more languages can be added easily.'],
      ];
      foreach ($features as $f): ?>
        <div class="feature-card">
          <div class="feature-card__icon"><?= $f['icon'] ?></div>
          <h3 class="feature-card__title"><?= $f['title'] ?></h3>
          <p class="feature-card__desc"><?= $f['desc'] ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ─── DOWNLOAD ─────────────────────────────────────────────────────────────── -->
<section class="download" id="download">
  <div class="container">
    <h2 class="section-title section-title--light">Download StackPage</h2>
    <?php if ($version): ?>
      <p class="section-sub section-sub--light">
        Latest release: <strong><?= htmlspecialchars($version) ?></strong>
        <?= $published ? '· Released ' . htmlspecialchars($published) : '' ?>
        · <a href="<?= htmlspecialchars($release_url) ?>" target="_blank" rel="noopener">View changelog ↗</a>
      </p>
    <?php else: ?>
      <p class="section-sub section-sub--light">Free and open source for all platforms.</p>
    <?php endif; ?>

    <?php if (!empty($downloads)): ?>
      <div class="download__grid">
        <?php foreach ($downloads as $dl): ?>
          <a href="<?= htmlspecialchars($dl['url']) ?>" class="download-card">
            <span class="download-card__icon"><?= $dl['icon'] ?></span>
            <div class="download-card__info">
              <span class="download-card__label"><?= htmlspecialchars($dl['label']) ?></span>
              <span class="download-card__filename"><?= htmlspecialchars($dl['filename']) ?></span>
              <?php if ($dl['size'] > 0): ?>
                <span class="download-card__size"><?= $dl['size'] ?> MB</span>
              <?php endif; ?>
            </div>
            <span class="download-card__arrow">↓</span>
          </a>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <div class="download__fallback">
        <a href="<?= htmlspecialchars($fallback_url) ?>" class="btn btn--white btn--lg" target="_blank" rel="noopener">
          View All Releases on GitHub ↗
        </a>
      </div>
    <?php endif; ?>

    <p class="download__note">
      All releases are available on
      <a href="<?= htmlspecialchars($release_url) ?>" target="_blank" rel="noopener">
        GitHub Releases ↗
      </a>
    </p>
  </div>
</section>

<!-- ─── HOW IT WORKS ─────────────────────────────────────────────────────────── -->
<section class="steps">
  <div class="container">
    <h2 class="section-title">From idea to website in minutes</h2>
    <div class="steps__grid">
      <?php
      $steps = [
        ['n' => '1', 'title' => 'Create a project',    'desc' => 'Give your site a name and pick a starter template.'],
        ['n' => '2', 'title' => 'Build your pages',    'desc' => 'Drag blocks onto the canvas, edit text and images, apply your theme.'],
        ['n' => '3', 'title' => 'Export or publish',   'desc' => 'Export to a folder or deploy directly to your FTP/SFTP server or Netlify.'],
      ];
      foreach ($steps as $s): ?>
        <div class="step">
          <div class="step__number"><?= $s['n'] ?></div>
          <h3 class="step__title"><?= $s['title'] ?></h3>
          <p class="step__desc"><?= $s['desc'] ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ─── FOOTER ────────────────────────────────────────────────────────────────── -->
<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <span class="nav__logo-badge nav__logo-badge--sm">SP</span>
      <span>StackPage</span>
    </div>
    <p class="footer__copy">
      Open source under the MIT License ·
      <a href="https://github.com/<?= GITHUB_OWNER ?>/<?= GITHUB_REPO ?>" target="_blank" rel="noopener">GitHub</a>
    </p>
  </div>
</footer>

</body>
</html>
