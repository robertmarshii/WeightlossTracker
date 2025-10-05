#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

debugLog('📊 UNCOVERED FUNCTIONS ANALYSIS');
debugLog('================================================================================');

// Get backend coverage data
let backendCoverage = {};
try {
    const coverageResponse = execSync('curl -s -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "action=get_report" http://127.0.0.1:8111/router.php?controller=coverage', { encoding: 'utf8' });
    const coverageData = JSON.parse(coverageResponse);
    if (coverageData.success) {
        backendCoverage = coverageData.coverage.functions || {};
    }
} catch (e) {
    debugLog('⚠️  Could not fetch backend coverage data');
}

// Analyze backend functions
debugLog('\n🔧 BACKEND UNCOVERED FUNCTIONS:');
debugLog('--------------------------------------------------');

const backendFunctions = [
    // SchemaManager.php
    { file: 'SchemaManager.php', class: 'SchemaManager', function: 'switchSchema', type: 'public static' },
    { file: 'SchemaManager.php', class: 'SchemaManager', function: 'getCurrentSchema', type: 'public static' },
    { file: 'SchemaManager.php', class: 'SchemaManager', function: 'validateSchemaSwitch', type: 'private static' },
    { file: 'SchemaManager.php', class: 'SchemaManager', function: 'isLocalhost', type: 'private static' },
    
    // AuthManager.php
    { file: 'AuthManager.php', class: 'AuthManager', function: 'generateCode', type: 'private static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'sendEmail', type: 'private static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'checkRateLimit', type: 'private static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'sendLoginCode', type: 'public static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'createAccount', type: 'public static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'verifyLoginCode', type: 'public static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'verifySignupCode', type: 'public static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'logout', type: 'public static' },
    { file: 'AuthManager.php', class: 'AuthManager', function: 'isLoggedIn', type: 'public static' },
    
    // Config.php (Database class)
    { file: 'Config.php', class: 'Database', function: 'getInstance', type: 'public static' },
    { file: 'Config.php', class: 'Database', function: 'getSchema', type: 'public static' },
    { file: 'Config.php', class: 'Database', function: '__construct', type: 'private' },
    { file: 'Config.php', class: 'Database', function: 'getdbConnection', type: 'public' },
    { file: 'Config.php', class: 'Database', function: '__destruct', type: 'public' },
    
    // DatabaseSeeder.php
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'resetSchemas', type: 'public static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'seedSchema', type: 'public static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'migrateLive', type: 'public static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'runSchemaSeeder', type: 'private static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'runSchemaMigration', type: 'private static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'getSeederFile', type: 'private static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'verifySchema', type: 'private static' },
    { file: 'DatabaseSeeder.php', class: 'DatabaseSeeder', function: 'isLocalhost', type: 'private static' },
    
    // Router.php Controllers
    { file: 'Router.php', function: 'Get1', type: 'function' },
    { file: 'Router.php', function: 'SchemaController', type: 'function' },
    { file: 'Router.php', function: 'SeederController', type: 'function' },
    { file: 'Router.php', function: 'ProfileController', type: 'function' },
    { file: 'Router.php', function: 'EmailController', type: 'function' },
    { file: 'Router.php', function: 'CoverageController', type: 'function' },
    
    // LoginRouter.php
    { file: 'LoginRouter.php', function: 'AuthController', type: 'function' },
    
    // Get1.php
    { file: 'Get1.php', class: 'Get1Class', function: '__construct', type: 'public' },
    { file: 'Get1.php', class: 'Get1Class', function: 'Get', type: 'public' },
    
    // CoverageLogger.php (excluding coverage tracking functions)
    { file: 'CoverageLogger.php', class: 'CoverageLogger', function: 'getInstance', type: 'public static' },
    { file: 'CoverageLogger.php', class: 'CoverageLogger', function: 'getReport', type: 'public' },
    { file: 'CoverageLogger.php', class: 'CoverageLogger', function: 'exportReport', type: 'public' },
    { file: 'CoverageLogger.php', class: 'CoverageLogger', function: 'clearCoverage', type: 'public' },
];

const uncoveredBackend = [];
const coveredBackend = [];

backendFunctions.forEach(func => {
    const key = func.class ? 
        `/var/app/backend/${func.file}:${func.class}::${func.function}` : 
        `/var/app/backend/${func.file}:${func.function}`;
    
    if (backendCoverage[key]) {
        coveredBackend.push(func);
    } else {
        uncoveredBackend.push(func);
    }
});

// Group uncovered functions by file
const uncoveredByFile = {};
uncoveredBackend.forEach(func => {
    if (!uncoveredByFile[func.file]) {
        uncoveredByFile[func.file] = [];
    }
    uncoveredByFile[func.file].push(func);
});

Object.entries(uncoveredByFile).forEach(([file, functions]) => {
    debugLog(`\n📄 ${file} (${functions.length} uncovered functions)`);
    functions.forEach(func => {
        const name = func.class ? `${func.class}::${func.function}` : func.function;
        const priority = func.type.includes('public') ? '🔴 HIGH' : '🟡 MEDIUM';
        debugLog(`   ${priority} ${name} (${func.type})`);
    });
});

debugLog('\n🔧 FRONTEND UNCOVERED FUNCTIONS:');
debugLog('--------------------------------------------------');

// Frontend functions (from grep results)
const frontendFunctions = [
    // index.js (authentication)
    { file: 'index.js', function: 'updateSignupButton', priority: 'MEDIUM' },
    { file: 'index.js', function: 'isValidEmail', priority: 'HIGH' },
    { file: 'index.js', function: 'continueWithGoogle', priority: 'LOW' },
    { file: 'index.js', function: 'continueWithMicrosoft', priority: 'LOW' },
    { file: 'index.js', function: 'sendLoginCode', priority: 'HIGH' },
    { file: 'index.js', function: 'createAccount', priority: 'HIGH' },
    { file: 'index.js', function: 'verifyLoginCode', priority: 'HIGH' },
    { file: 'index.js', function: 'verifySignupCode', priority: 'HIGH' },
    { file: 'index.js', function: 'backToEmailLogin', priority: 'MEDIUM' },
    { file: 'index.js', function: 'backToEmailSignup', priority: 'MEDIUM' },
    
    // dashboard.js (main app functionality)
    { file: 'dashboard.js', function: 'refreshLatestWeight', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'refreshGoal', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'loadProfile', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'refreshBMI', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'refreshHealth', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'refreshIdealWeight', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'refreshWeightProgress', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'refreshGallbladderHealth', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'loadWeightHistory', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'formatDate', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'editWeight', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'deleteWeight', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'loadSettings', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'saveSettings', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'resetSettings', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateDateExample', priority: 'LOW' },
    { file: 'dashboard.js', function: 'initTabNavigation', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'resetToLineChart', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'resetToBarChart', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'initWeightChart', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'updateWeightChart', priority: 'HIGH' },
    { file: 'dashboard.js', function: 'updateMonthlyChart', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateMonthlyAchievementCards', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateWeeklyChart', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateWeeklyAchievementCards', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateYearlyChart', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateYearlyAchievementCards', priority: 'MEDIUM' },
    { file: 'dashboard.js', function: 'updateAchievementCards', priority: 'HIGH' },
    
    // global.js (utilities)
    { file: 'global.js', function: 'showAlert', priority: 'HIGH' },
    { file: 'global.js', function: 'showToast', priority: 'MEDIUM' },
    { file: 'global.js', function: 'parseJson', priority: 'HIGH' },
    { file: 'global.js', function: 'openModal', priority: 'MEDIUM' },
    
    // coverage.js (already covered in testing)
    { file: 'coverage.js', function: 'loggedFunction', priority: 'LOW' },
    { file: 'coverage.js', function: 'instrumentObject', priority: 'LOW' },
];

// Group frontend functions by priority and file
const frontendByPriority = { HIGH: [], MEDIUM: [], LOW: [] };
frontendFunctions.forEach(func => {
    frontendByPriority[func.priority].push(func);
});

['HIGH', 'MEDIUM', 'LOW'].forEach(priority => {
    if (frontendByPriority[priority].length > 0) {
        const icon = priority === 'HIGH' ? '🔴' : priority === 'MEDIUM' ? '🟡' : '🟢';
        debugLog(`\n${icon} ${priority} PRIORITY (${frontendByPriority[priority].length} functions):`);
        
        const byFile = {};
        frontendByPriority[priority].forEach(func => {
            if (!byFile[func.file]) byFile[func.file] = [];
            byFile[func.file].push(func);
        });
        
        Object.entries(byFile).forEach(([file, functions]) => {
            debugLog(`   📄 ${file}: ${functions.map(f => f.function).join(', ')}`);
        });
    }
});

debugLog('\n📊 SUMMARY:');
debugLog('--------------------------------------------------');
debugLog(`🔧 Backend Functions: ${coveredBackend.length} covered, ${uncoveredBackend.length} uncovered (${backendFunctions.length} total)`);
debugLog(`🎨 Frontend Functions: 0 covered, ${frontendFunctions.length} uncovered (${frontendFunctions.length} total)`);

const backendCoverage = ((coveredBackend.length / backendFunctions.length) * 100).toFixed(1);
debugLog(`📈 Backend Coverage: ${backendCoverage}%`);
debugLog(`📈 Frontend Coverage: 0.0%`);

debugLog('\n💡 RECOMMENDED TEST PRIORITIES:');
debugLog('--------------------------------------------------');
debugLog('🔴 HIGH PRIORITY BACKEND:');
debugLog('   - AuthManager::createAccount (user registration)');
debugLog('   - AuthManager::verifyLoginCode (login verification)');  
debugLog('   - AuthManager::logout (session management)');
debugLog('   - AuthManager::isLoggedIn (session validation)');
debugLog('   - SchemaController (database schema operations)');
debugLog('   - ProfileController (user profile management)');

debugLog('\n🔴 HIGH PRIORITY FRONTEND:');
debugLog('   - Authentication functions (sendLoginCode, createAccount, verifyLoginCode)');
debugLog('   - Weight tracking (refreshLatestWeight, loadWeightHistory, editWeight, deleteWeight)');
debugLog('   - Profile management (loadProfile, loadSettings, saveSettings)');
debugLog('   - Chart initialization (initWeightChart, updateWeightChart)');
debugLog('   - Health calculations (refreshBMI, refreshHealth, refreshIdealWeight)');

debugLog('\n================================================================================');
debugLog(`🎯 Generated: ${new Date().toISOString()}`);