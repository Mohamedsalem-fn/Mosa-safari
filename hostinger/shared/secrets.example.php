<?php
/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 *
 * Hostinger Private Secrets Template
 * Copy to /home/uXXXX/mosa_private_vault/secrets.php (outside public_html, chmod 600)
 * -------------------------------------------------------------------------------
 */

return [
    // Generate via: php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_BCRYPT, ['cost' => 12]);"
    'ADMIN_PASSWORD_HASH' => 'REPLACE_WITH_BCRYPT_HASH',
    // Generate via: openssl rand -hex 32
    'ADMIN_JWT_SECRET' => 'REPLACE_WITH_64_HEX_RANDOM_SECRET',
    'GREEN_API_URL' => 'https://7107.api.greenapi.com',
    'GREEN_ID_INSTANCE' => '710722810425',
    'GREEN_API_TOKEN' => 'REPLACE_WITH_GREEN_API_TOKEN',
    'OWNER_WHATSAPP_PHONES' => '201023355550',
    'RESEND_API_KEY' => 'REPLACE_WITH_RESEND_API_KEY',
    'EMAIL_FROM' => 'Mosa Safari <bookings@mosasafari.com>'
];
