<?php
$assetVersion = function ($path) { $t = @filemtime(__DIR__ . '/' . $path); return $t ? $t : '1'; };
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Use | Weightloss Tracker</title>
    <meta name="description" content="The terms for using Weightloss Tracker: a free weight tracking service, not medical advice, acceptable use, our liability and the law that applies.">
    <link rel="canonical" href="https://weightloss-tracker.com/terms">
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#4A90E2">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/global.css?v=<?php echo $assetVersion('css/global.css'); ?>">
    <link rel="stylesheet" href="css/index.css?v=<?php echo $assetVersion('css/index.css'); ?>">
    <style>
        .policy h1 { color: white; font-size: 2rem; font-weight: 700; margin: 2rem 0 0.5rem; }
        .policy .updated { color: rgba(255, 255, 255, 0.8); }
        .policy h3 { color: white; font-size: 1.1rem; margin-top: 1.25rem; }
        .policy .info-section { margin-top: 1.5rem; }
        .policy .info-section ul { padding-left: 1.3rem; }
        .policy .info-section li { margin-bottom: 0.4rem; line-height: 1.6; }
        .policy a { color: #9cc8ea; text-decoration: underline; }
        .policy a:hover { color: white; }
        .policy .table-wrap { overflow-x: auto; margin: 0.75rem 0 1rem; }
        .policy table { width: 100%; border-collapse: collapse; color: rgba(255, 255, 255, 0.9); }
        .policy th, .policy td { border: 1px solid rgba(100, 150, 200, 0.35); padding: 0.5rem 0.65rem; vertical-align: top; text-align: left; }
        .policy th { color: white; background: rgba(20, 40, 60, 0.6); }
        .policy code { color: #ffd7a8; }
        .back-link { display: inline-block; margin-top: 1.5rem; }
    </style>
</head>
<body>
    <main class="container policy">
        <h1>Terms of use</h1>
        <p class="updated">Last updated: 4 November 2026</p>

        <section class="info-section" aria-labelledby="about">
            <h2 id="about">About these terms</h2>
            <p>These terms apply when you use Weightloss Tracker at weightloss-tracker.com (&ldquo;the service&rdquo;). &ldquo;We&rdquo; and &ldquo;us&rdquo; means the people who run it. By creating an account or using the service you agree to these terms. If you do not agree, please do not use it.</p>
            <p>Questions about these terms: <a href="mailto:support@weightloss-tracker.com">support@weightloss-tracker.com</a></p>
            <p>How we handle your data, and which cookies we use, is explained in our <a href="/privacy">privacy and cookie notice</a>.</p>
        </section>

        <section class="info-section" aria-labelledby="service">
            <h2 id="service">The service</h2>
            <ul>
                <li>Weightloss Tracker lets you log your weight and body measurements, see charts, set a target weight, earn achievements and choose reminder and report emails. It is free; there is no paid plan.</li>
                <li>It is meant for adults aged 18 and over.</li>
                <li>You sign in with a code sent to your email address, or with your Google or Microsoft account. Keep access to that email or account secure, as anyone who can read it can sign in as you. Sign out on shared devices.</li>
                <li>We may change, pause or stop the service, or any part of it, at any time, for example to fix faults, improve it or keep it secure.</li>
            </ul>
        </section>

        <section class="info-section" aria-labelledby="medical">
            <h2 id="medical">Not medical advice</h2>
            <p>Weightloss Tracker is a record-keeping tool, not a medical service. Figures such as BMI, the body fat estimate and the ideal weight range are worked out from the numbers you enter using general formulas. They are estimates for general information only, and they may not suit you, for example if you are pregnant, very muscular, an older adult or have a health condition.</p>
            <ul>
                <li>Do not use the service to diagnose or treat any condition, or instead of advice from a GP or other health professional.</li>
                <li>Talk to a health professional before making big changes to your diet, exercise or weight, and if you are worried about your eating or your weight.</li>
                <li>If you need urgent medical help, call NHS 111, or 999 in an emergency.</li>
            </ul>
        </section>

        <section class="info-section" aria-labelledby="use">
            <h2 id="use">Acceptable use</h2>
            <p>When you use the service you must not:</p>
            <ul>
                <li>break the law, or use the service for anyone else&rsquo;s data without their permission;</li>
                <li>try to get into other people&rsquo;s accounts, or into parts of the service or its servers that are not meant for you;</li>
                <li>test, probe or attack the service&rsquo;s security, or overload it, for example with automated requests or by repeatedly asking for sign-in codes;</li>
                <li>copy, scrape or resell the service, or use it to send spam;</li>
                <li>upload anything harmful, such as viruses or malicious code.</li>
            </ul>
            <p>We may suspend or close an account that breaks these terms.</p>
        </section>

        <section class="info-section" aria-labelledby="data">
            <h2 id="data">Your data and your account</h2>
            <ul>
                <li>The information you enter stays yours. We use it only as our <a href="/privacy">privacy notice</a> describes.</li>
                <li>You can delete individual entries from your dashboard. To close your account and delete all its data, email <a href="mailto:support@weightloss-tracker.com">support@weightloss-tracker.com</a> from the address you sign in with.</li>
                <li>You can stop using the service at any time. Reminder and report emails can be turned off in Settings.</li>
                <li>Keep your own copy of anything important: we do not promise that data will never be lost.</li>
            </ul>
        </section>

        <section class="info-section" aria-labelledby="warranty">
            <h2 id="warranty">No warranty</h2>
            <p>We provide the service free of charge and &ldquo;as is&rdquo;. We try to keep it working and accurate, but we do not promise that it will always be available, free of errors or faults, or that its figures will be right for you.</p>
        </section>

        <section class="info-section" aria-labelledby="liability">
            <h2 id="liability">Our liability</h2>
            <ul>
                <li>Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud, or for anything else that the law does not allow us to limit or exclude. These terms do not affect your legal rights as a consumer.</li>
                <li>Otherwise, as far as the law allows, we are not liable for any loss or damage arising from your use of, or inability to use, the service, including loss of data, or from decisions you make based on its figures.</li>
                <li>We are not responsible for services run by others that you choose to use with ours, such as your Google or Microsoft account or your email provider.</li>
            </ul>
        </section>

        <section class="info-section" aria-labelledby="changes">
            <h2 id="changes">Changes to these terms</h2>
            <p>We may update these terms, for example when the service changes or the law requires it. We will put the new version on this page and change the date at the top. If you keep using the service after that, the new terms apply. If you do not agree with them, stop using the service and ask us to delete your account.</p>
        </section>

        <section class="info-section" aria-labelledby="law">
            <h2 id="law">Law and disputes</h2>
            <p>These terms are governed by the law of England and Wales, and the courts of England and Wales can deal with any dispute. If you live in Scotland or Northern Ireland, you can also bring a claim in your local courts. If you have a problem, please email us first so we can try to put it right.</p>
        </section>

        <a class="back-link" href="/">&larr; Back to Weightloss Tracker</a>
    </main>

    <footer class="site-footer">
        <nav aria-label="Footer">
            <a href="/">Home</a>
            <a href="/privacy">Privacy</a>
            <a href="/privacy#cookies">Cookies</a>
            <a href="/terms">Terms</a>
            <a href="/#signin">Sign in</a>
        </nav>
        <p>&copy; <?php echo date('Y'); ?> Weightloss Tracker</p>
    </footer>
</body>
</html>
