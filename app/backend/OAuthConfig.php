<?php

require_once('/var/app/backend/CoverageLogger.php');

class OAuthConfig {

    public static function getGoogleConfig() {
        COVERAGE_LOG('getGoogleConfig', __CLASS__, __FILE__, __LINE__);
        return [
            'clientId'     => $_ENV['GOOGLE_CLIENT_ID'] ?? '',
            'clientSecret' => $_ENV['GOOGLE_CLIENT_SECRET'] ?? '',
            'redirectUri'  => self::getBaseUrl() . '/login_router.php?controller=auth&action=oauth_callback&provider=google',
            'hostedDomain' => $_ENV['GOOGLE_HOSTED_DOMAIN'] ?? null,
        ];
    }

    public static function getMicrosoftConfig() {
        COVERAGE_LOG('getMicrosoftConfig', __CLASS__, __FILE__, __LINE__);
        return [
            'clientId'     => $_ENV['MICROSOFT_CLIENT_ID'] ?? '',
            'clientSecret' => $_ENV['MICROSOFT_CLIENT_SECRET'] ?? '',
            'redirectUri'  => self::getBaseUrl() . '/oauth-callback-microsoft.php',
            'tenant'       => $_ENV['MICROSOFT_TENANT'] ?? 'consumers', // 'common', 'organizations', 'consumers', or specific tenant ID
        ];
    }

    private static function getBaseUrl() {
        COVERAGE_LOG('getBaseUrl', __CLASS__, __FILE__, __LINE__);

        // Always use the production domain for OAuth callbacks
        return 'https://www.weightloss-tracker.com';
    }

    public static function isConfigured($provider) {
        COVERAGE_LOG('isConfigured', __CLASS__, __FILE__, __LINE__);
        if ($provider === 'google') {
            $config = self::getGoogleConfig();
            return !empty($config['clientId']) && !empty($config['clientSecret']);
        } elseif ($provider === 'microsoft') {
            $config = self::getMicrosoftConfig();
            return !empty($config['clientId']) && !empty($config['clientSecret']);
        }
        return false;
    }
}