#!/usr/bin/env bash
# -------------------------------------------------------------------------------
# Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
# Focus: AI Engineering | Automation | Agentic Systems
# Copyright (c) 2026. All Rights Reserved.
# -------------------------------------------------------------------------------

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> 1. Building Tailwind CSS & checking JS syntax..."
npm run build:css
npm run check

echo "==> 2. Syncing Hostinger storefront (https://mosasafari.com)..."
SITE_DIR="$ROOT_DIR/hostinger/mosasafari.com"
mkdir -p "$SITE_DIR/api/_lib"
cp index.html robots.txt sitemap.xml manifest.webmanifest "$SITE_DIR/"
rm -rf "$SITE_DIR/assets"
cp -r assets "$SITE_DIR/assets"
rm -f "$SITE_DIR/assets/js/env.local.js" "$SITE_DIR/assets/js/admin.js" "$SITE_DIR/assets/css/admin.css" "$SITE_DIR/assets/css/input.css"
cp "$ROOT_DIR/hostinger/shared/mosa_core.php" "$SITE_DIR/api/_lib/mosa_core.php"

echo "==> 3. Syncing Hostinger isolated admin subdomain (https://eria.mosasafari.com)..."
ADM_DIR="$ROOT_DIR/hostinger/eria.mosasafari.com"
mkdir -p "$ADM_DIR/api/_lib" "$ADM_DIR/assets/css" "$ADM_DIR/assets/js/data" "$ADM_DIR/assets/images"
cp admin.html "$ADM_DIR/admin.html"
cp assets/css/tailwind.css assets/css/admin.css "$ADM_DIR/assets/css/"
cp assets/js/admin.js "$ADM_DIR/assets/js/"
cp assets/js/data/trips.js "$ADM_DIR/assets/js/data/"
cp -r assets/images/* "$ADM_DIR/assets/images/"
cp "$ROOT_DIR/hostinger/shared/mosa_core.php" "$ADM_DIR/api/_lib/mosa_core.php"

echo "==> 4. Verifying PHP syntax across all Hostinger PHP files..."
find "$ROOT_DIR/hostinger" -type f -name "*.php" -print0 | xargs -0 -n1 php -l

echo "==> 5. Packaging ready-to-upload Hostinger ZIP archives (with isolated runtime secrets)..."
DIST_DIR="$ROOT_DIR/dist/hostinger"
STAGE_DIR="$DIST_DIR/_stage"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/mosasafari.com" "$STAGE_DIR/eria.mosasafari.com"

cp -a "$SITE_DIR/." "$STAGE_DIR/mosasafari.com/"
cp -a "$ADM_DIR/." "$STAGE_DIR/eria.mosasafari.com/"

if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$ROOT_DIR/.env"
    set +a
fi

ADMIN_INIT_PASS="${ADMIN_PASSWORD:-Mosa@2026}"
export ADMIN_INIT_PASS
SECRETS_TMP="$STAGE_DIR/mosa_secrets.php"

php -r '
$pw = getenv("ADMIN_INIT_PASS") ?: "Mosa@2026";
$hash = password_hash($pw, PASSWORD_BCRYPT, ["cost" => 12]);
$jwt = bin2hex(random_bytes(32));
$data = [
    "ADMIN_PASSWORD_HASH" => $hash,
    "ADMIN_JWT_SECRET" => $jwt,
    "GREEN_API_URL" => getenv("GREEN_API_URL") ?: "https://7107.api.greenapi.com",
    "GREEN_ID_INSTANCE" => getenv("GREEN_ID_INSTANCE") ?: "710722810425",
    "GREEN_API_TOKEN" => getenv("GREEN_API_TOKEN") ?: "",
    "OWNER_WHATSAPP_PHONES" => getenv("OWNER_WHATSAPP_PHONES") ?: "201023355550",
    "RESEND_API_KEY" => getenv("RESEND_API_KEY") ?: "",
    "EMAIL_FROM" => "Mosa Safari <bookings@mosasafari.com>"
];
file_put_contents($argv[1], "<?php\nreturn " . var_export($data, true) . ";\n");
' "$SECRETS_TMP"

cp "$SECRETS_TMP" "$STAGE_DIR/mosasafari.com/api/.mosa_secrets.php"
cp "$SECRETS_TMP" "$STAGE_DIR/eria.mosasafari.com/api/.mosa_secrets.php"
chmod 600 "$STAGE_DIR/mosasafari.com/api/.mosa_secrets.php" "$STAGE_DIR/eria.mosasafari.com/api/.mosa_secrets.php"
rm -f "$SECRETS_TMP"

rm -f "$DIST_DIR/mosasafari.com-public_html.zip" "$DIST_DIR/eria.mosasafari.com-subdomain.zip"
(cd "$STAGE_DIR/mosasafari.com" && zip -qr "$DIST_DIR/mosasafari.com-public_html.zip" .)
(cd "$STAGE_DIR/eria.mosasafari.com" && zip -qr "$DIST_DIR/eria.mosasafari.com-subdomain.zip" .)
rm -rf "$STAGE_DIR"

ls -lh "$DIST_DIR/mosasafari.com-public_html.zip" "$DIST_DIR/eria.mosasafari.com-subdomain.zip"
echo "==> Done! Ready for upload to Hostinger hPanel."
