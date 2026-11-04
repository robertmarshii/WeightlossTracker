<?php /** Sign-in / create-account card. Element ids are used by js/index.js and the Cypress tests: do not rename. */ ?>
<section class="glass-card" id="signin" aria-labelledby="signin-title">
    <div class="logo-section">
        <div class="logo-icon">
            <svg viewBox="0 0 44 44" class="progress-ring" aria-hidden="true" focusable="false">
                <circle cx="22" cy="22" r="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"/>
                <circle cx="22" cy="22" r="15" fill="none" stroke="#64a6d8" stroke-width="12" stroke-linecap="round" class="progress-ring-circle"/>
            </svg>
        </div>
        <div class="logo-text"><?= $s->t('card.brand') ?></div>
        <h2 id="signin-title" class="signin-title"><?= $s->t('card.title') ?></h2>
    </div>

    <ul class="nav nav-tabs" id="authTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <a class="nav-link active" id="login-tab" data-toggle="tab" href="#login" role="tab" aria-controls="login" aria-selected="true"><?= $s->t('card.tab.login') ?></a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link" id="signup-tab" data-toggle="tab" href="#signup" role="tab" aria-controls="signup" aria-selected="false"><?= $s->t('card.tab.signup') ?></a>
        </li>
    </ul>

    <div class="tab-content" id="authTabsContent">
        <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
            <div id="loginWelcomeSection">
                <div class="welcome-title"><?= $s->t('card.welcome') ?></div>
                <div class="welcome-subtitle"><?= $s->t('card.welcome.sub') ?></div>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail" class="sr-only"><?= $s->t('card.email.label') ?></label>
                    <input type="email" class="form-control glass-input" id="loginEmail" placeholder="<?= $s->a('card.email.ph') ?>" autocomplete="email" required>
                </div>
                <button type="submit" class="btn primary-btn" id="sendLoginCodeBtn"><?= $s->t('card.send') ?></button>
            </form>
            <div id="loginSocialSection">
                <div class="divider"><span><?= $s->t('card.or') ?></span></div>
                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;"><?= SITE_GOOGLE ?><span><?= $s->t('card.google') ?></span></a>
                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;"><?= SITE_MICROSOFT ?><span><?= $s->t('card.microsoft') ?></span></a>
            </div>
            <form id="verifyLoginForm" class="verify-form">
                <div class="welcome-title"><?= $s->t('card.check') ?></div>
                <div class="welcome-subtitle"><?= $s->t('card.check.sub') ?></div>
                <div class="form-group">
                    <label for="loginCode" class="sr-only"><?= $s->t('card.code.label') ?></label>
                    <input type="text" class="form-control glass-input" id="loginCode" placeholder="<?= $s->a('card.code.ph') ?>" maxlength="6" pattern="[0-9]{6}" inputmode="numeric" autocomplete="one-time-code" required>
                </div>
                <button type="submit" class="btn primary-btn"><?= $s->t('card.verify') ?></button>
                <div class="bottom-link"><a href="#" id="backToEmailLink" onclick="backToEmailLogin(); return false;"><?= $s->t('card.back') ?></a></div>
            </form>
        </div>

        <div class="tab-pane fade" id="signup" role="tabpanel" aria-labelledby="signup-tab">
            <div id="signupWelcomeSection">
                <div class="welcome-title"><?= $s->t('card.create') ?></div>
                <div class="welcome-subtitle"><?= $s->t('card.create.sub') ?></div>
            </div>
            <form id="signupForm">
                <div class="form-group">
                    <label for="signupEmail" class="sr-only"><?= $s->t('card.email.label') ?></label>
                    <input type="email" class="form-control glass-input" id="signupEmail" placeholder="<?= $s->a('card.email.ph') ?>" autocomplete="email" required>
                </div>
                <div class="form-check mb-3" id="termsCheck">
                    <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                    <label class="form-check-label small" id="agreeTermsLabel" for="agreeTerms"><?= $s->t('card.agree') ?></label>
                </div>
                <button type="submit" class="btn primary-btn"><?= $s->t('card.create.btn') ?></button>
            </form>
            <div id="signupSocialSection">
                <div class="divider"><span><?= $s->t('card.or') ?></span></div>
                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;"><?= SITE_GOOGLE ?><span><?= $s->t('card.google') ?></span></a>
                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;"><?= SITE_MICROSOFT ?><span><?= $s->t('card.microsoft') ?></span></a>
            </div>
            <form id="verifySignupForm" class="verify-form">
                <div class="welcome-title"><?= $s->t('card.verify.title') ?></div>
                <div class="welcome-subtitle"><?= $s->t('card.verify.sub') ?></div>
                <div class="form-group">
                    <label for="signupCode" class="sr-only"><?= $s->t('card.code.label') ?></label>
                    <input type="text" class="form-control glass-input" id="signupCode" placeholder="<?= $s->a('card.code.ph') ?>" maxlength="6" pattern="[0-9]{6}" inputmode="numeric" autocomplete="one-time-code" required>
                </div>
                <button type="submit" class="btn primary-btn"><?= $s->t('card.verify.btn') ?></button>
                <div class="bottom-link"><a href="#" onclick="backToEmailSignup(); return false;"><?= $s->t('card.back') ?></a></div>
            </form>
        </div>
    </div>
</section>
