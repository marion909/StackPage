<?php
/**
 * StackPage Auto-Updater Endpoint
 *
 * Tauri ruft diese URL auf:
 *   GET https://stackpage.at/updates/{target}/{arch}/{current_version}
 *
 * Antwort:
 *   200 + JSON  → Update verfügbar
 *   204         → Kein Update (User hat bereits die aktuelle Version)
 */

header('Content-Type: application/json');

// ─── URL-Pfad parsen ───────────────────────────────────────────────────────────
// PATH_INFO liefert z.B.: /windows/x86_64/1.0.0
$path   = trim($_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '', '/');
$parts  = explode('/', ltrim(str_replace('updates', '', $path), '/'));
$parts  = array_values(array_filter($parts));

$target          = $parts[0] ?? '';   // z.B. "windows"
$arch            = $parts[1] ?? '';   // z.B. "x86_64"
$current_version = $parts[2] ?? '0';  // z.B. "1.0.0"

// ─── Releases laden ────────────────────────────────────────────────────────────
$releases_file = __DIR__ . '/releases.json';

if (!file_exists($releases_file)) {
    http_response_code(500);
    echo json_encode(['error' => 'releases.json not found']);
    exit;
}

$releases = json_decode(file_get_contents($releases_file), true);

if (!$releases || !isset($releases['version'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid releases.json']);
    exit;
}

$latest_version = $releases['version'];

// ─── Version vergleichen ───────────────────────────────────────────────────────
if (version_compare($latest_version, $current_version, '<=')) {
    // Kein Update verfügbar
    http_response_code(204);
    exit;
}

// ─── Plattform bestimmen ───────────────────────────────────────────────────────
// Tauri sendet "windows", "linux", "darwin" als {target}
$platform_key = match (true) {
    str_contains($target, 'windows') => "{$target}-{$arch}",
    str_contains($target, 'darwin')  => "{$target}-{$arch}",
    str_contains($target, 'linux')   => "{$target}-{$arch}",
    default                          => "{$target}-{$arch}",
};

$platforms = $releases['platforms'] ?? [];

// Fallback: erste verfügbare Plattform
if (!isset($platforms[$platform_key])) {
    http_response_code(204);
    exit;
}

$platform = $platforms[$platform_key];

// ─── Update-Response ausgeben ──────────────────────────────────────────────────
http_response_code(200);
echo json_encode([
    'version'  => $latest_version,
    'notes'    => $releases['notes'] ?? '',
    'pub_date' => $releases['pub_date'] ?? date('c'),
    'platforms' => [
        $platform_key => [
            'signature' => $platform['signature'],
            'url'       => $platform['url'],
        ],
    ],
]);
