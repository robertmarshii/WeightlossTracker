<?php

require_once '/var/app/project/vendor/autoload.php';
require_once('/var/app/backend/CoverageLogger.php');
require_once('/var/app/backend/OAuthConfig.php');
require_once('/var/app/backend/AuthManager.php');
require_once('/var/app/backend/Config.php');

use League\OAuth2\Client\Provider\Google;
use Stevenmaguire\OAuth2\Client\Provider\Microsoft;

class OAuthManager {

    /**
     * Microsoft sign-in is only safe here with the "consumers" tenant (personal Microsoft accounts):
     * with "common"/"organizations"/a tenant id, a work-account admin can set any address as "mail"
     * and sign in as that person (nOAuth). Accounts are matched by email, so any other tenant is refused.
     */
    private static function microsoftTenantAllowed() {
        $tenant = strtolower(trim((string)(OAuthConfig::getMicrosoftConfig()['tenant'] ?? '')));
        if ($tenant !== 'consumers') {
            error_log("OAuthManager: Microsoft sign-in refused - MICROSOFT_TENANT must be 'consumers' (accounts are matched by email; other tenants allow unverified emails)");
            return false;
        }
        return true;
    }

    public static function getAuthorizationUrl($provider) {
        COVERAGE_LOG('getAuthorizationUrl', __CLASS__, __FILE__, __LINE__);

        if (!OAuthConfig::isConfigured($provider)) {
            return ['success' => false, 'message' => ucfirst($provider) . ' OAuth is not configured'];
        }
        if ($provider === 'microsoft' && !self::microsoftTenantAllowed()) {
            return ['success' => false, 'message' => 'Microsoft sign-in is not available at the moment'];
        }

        try {
            $providerInstance = self::createProvider($provider);

            // Generate state for security
            $state = bin2hex(random_bytes(32));

            // Ensure session is started properly
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $_SESSION['oauth_state'] = $state;
            $_SESSION['oauth_provider'] = $provider;
            $_SESSION['oauth_timestamp'] = time(); // Track when state was created

            $authorizationUrl = $providerInstance->getAuthorizationUrl([
                'state' => $state,
                'scope' => self::getScopes($provider)
            ]);

            return [
                'success' => true,
                'authorization_url' => $authorizationUrl
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to generate authorization URL'];
        }
    }

    public static function handleCallback($provider, $code, $state) {
        COVERAGE_LOG('handleCallback', __CLASS__, __FILE__, __LINE__);

        // Ensure session is started properly
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }


        // Verify state parameter
        if (!isset($_SESSION['oauth_state']) || $state !== $_SESSION['oauth_state']) {
            // Clear any stale OAuth data
            unset($_SESSION['oauth_state']);
            unset($_SESSION['oauth_provider']);
            unset($_SESSION['oauth_timestamp']);
            return ['success' => false, 'message' => 'Please try logging in again'];
        }

        // Check if state is too old (more than 10 minutes)
        if (isset($_SESSION['oauth_timestamp']) && (time() - $_SESSION['oauth_timestamp']) > 600) {
            unset($_SESSION['oauth_state']);
            unset($_SESSION['oauth_provider']);
            unset($_SESSION['oauth_timestamp']);
            return ['success' => false, 'message' => 'Session expired, please try logging in again'];
        }

        // Verify provider matches
        if (!isset($_SESSION['oauth_provider']) || $provider !== $_SESSION['oauth_provider']) {
            return ['success' => false, 'message' => 'Provider mismatch'];
        }
        if ($provider === 'microsoft' && !self::microsoftTenantAllowed()) {
            return ['success' => false, 'message' => 'Microsoft sign-in is not available at the moment'];
        }

        try {
            $providerInstance = self::createProvider($provider);

            // Get access token
            $accessToken = $providerInstance->getAccessToken('authorization_code', [
                'code' => $code
            ]);

            // Get user details
            try {
                if ($provider === 'microsoft') {
                    // Direct call to Microsoft Graph API (library method doesn't work)
                    $graphUrl = 'https://graph.microsoft.com/v1.0/me';
                    $context = stream_context_create([
                        'http' => [
                            'method' => 'GET',
                            'header' => 'Authorization: Bearer ' . $accessToken->getToken()
                        ]
                    ]);

                    $response = file_get_contents($graphUrl, false, $context);
                    if ($response === false) {
                        throw new Exception("Failed to call Graph API");
                    }

                    $userDetails = json_decode($response, true);
                    if (!$userDetails) {
                        throw new Exception("Invalid JSON response from Graph API");
                    }

                } else {
                    // Use standard OAuth library method for other providers (Google)
                    $resourceOwner = $providerInstance->getResourceOwner($accessToken);
                    $userDetails = $resourceOwner->toArray();
                }

            } catch (Exception $e) {
                throw $e;
            }

            // Extract email from user details
            $email = self::extractEmail($provider, $userDetails);

            if (!$email) {
                return ['success' => false, 'message' => 'Unable to get email from ' . ucfirst($provider)];
            }

            // Create or login user
            $result = self::createOrLoginUser($email, $provider, $userDetails);

            // Clear OAuth session data
            unset($_SESSION['oauth_state']);
            unset($_SESSION['oauth_provider']);
            unset($_SESSION['oauth_timestamp']);

            return $result;

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Authentication failed'];
        }
    }

    private static function createProvider($provider) {
        COVERAGE_LOG('createProvider', __CLASS__, __FILE__, __LINE__);

        if ($provider === 'google') {
            $config = OAuthConfig::getGoogleConfig();
            return new Google([
                'clientId'     => $config['clientId'],
                'clientSecret' => $config['clientSecret'],
                'redirectUri'  => $config['redirectUri'],
                'hostedDomain' => $config['hostedDomain'],
            ]);
        } elseif ($provider === 'microsoft') {
            $config = OAuthConfig::getMicrosoftConfig();
            return new Microsoft([
                'clientId'     => $config['clientId'],
                'clientSecret' => $config['clientSecret'],
                'redirectUri'  => $config['redirectUri'],
                'tenant'       => $config['tenant'],
            ]);
        } else {
            throw new Exception("Unsupported provider: $provider");
        }
    }

    private static function getScopes($provider) {
        COVERAGE_LOG('getScopes', __CLASS__, __FILE__, __LINE__);

        if ($provider === 'google') {
            return ['openid', 'email', 'profile'];
        } elseif ($provider === 'microsoft') {
            return ['https://graph.microsoft.com/User.Read'];
        }
        return [];
    }

    private static function extractEmail($provider, $userDetails) {
        COVERAGE_LOG('extractEmail', __CLASS__, __FILE__, __LINE__);

        if ($provider === 'google') {
            // Only an address Google has verified may sign in to the account with that email
            $verified = $userDetails['email_verified'] ?? false;
            if ($verified !== true && $verified !== 'true') {
                error_log("OAuthManager: Google sign-in refused - email not verified by Google");
                return null;
            }
            return $userDetails['email'] ?? null;
        } elseif ($provider === 'microsoft') {
            // nOAuth: Graph's "mail" is set by a work tenant's admin and is not verified by Microsoft.
            // Safe only because microsoftTenantAllowed() limits sign-in to the "consumers" tenant
            // (personal Microsoft accounts, where the address belongs to the account).
            if (!self::microsoftTenantAllowed()) {
                return null;
            }
            return $userDetails['mail'] ?? $userDetails['userPrincipalName'] ?? null;
        }
        return null;
    }

    private static function createOrLoginUser($email, $provider, $userDetails) {
        COVERAGE_LOG('createOrLoginUser', __CLASS__, __FILE__, __LINE__);

        try {
            $db = Database::getInstance()->getDbConnection();
            $schema = Database::getSchema();

            // Check if user exists
            $stmt = $db->prepare("SELECT id, first_name, last_name FROM {$schema}.users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                // Create new user
                $firstName = self::extractFirstName($provider, $userDetails);
                $lastName = self::extractLastName($provider, $userDetails);

                $stmt = $db->prepare("INSERT INTO {$schema}.users (email, first_name, last_name, created_at) VALUES (?, ?, ?, NOW())");
                $stmt->execute([$email, $firstName, $lastName]);

                $userId = $db->lastInsertId();
                $user = [
                    'id' => $userId,
                    'first_name' => $firstName,
                    'last_name' => $lastName
                ];
            }

            // Create session (similar to AuthManager::verifyLoginCode)
            require_once('/var/app/backend/AuthManager.php');
            AuthManager::startUserSession($user['id'], $email, $user['first_name'], $user['last_name']);

            // Set remember me token (stored hashed; see AuthManager)
            AuthManager::setRememberToken($user['id']);

            return ['success' => true, 'message' => 'Login successful'];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to create or login user'];
        }
    }

    private static function extractFirstName($provider, $userDetails) {
        COVERAGE_LOG('extractFirstName', __CLASS__, __FILE__, __LINE__);

        if ($provider === 'google') {
            return $userDetails['given_name'] ?? $userDetails['name'] ?? '';
        } elseif ($provider === 'microsoft') {
            return $userDetails['givenName'] ?? $userDetails['displayName'] ?? '';
        }
        return '';
    }

    private static function extractLastName($provider, $userDetails) {
        COVERAGE_LOG('extractLastName', __CLASS__, __FILE__, __LINE__);

        if ($provider === 'google') {
            return $userDetails['family_name'] ?? '';
        } elseif ($provider === 'microsoft') {
            return $userDetails['surname'] ?? '';
        }
        return '';
    }
}
