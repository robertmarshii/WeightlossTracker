<?php
$assetVersion = function ($path) { $t = @filemtime(__DIR__ . '/' . $path); return $t ? $t : '1'; };
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy and Cookies | Weightloss Tracker</title>
    <meta name="description" content="What Weightloss Tracker stores, why, which cookies and outside services it uses, how long data is kept, and how to get your data deleted.">
    <link rel="canonical" href="https://weightloss-tracker.com/privacy">
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
        <h1>Privacy and cookies</h1>
        <p class="updated">Last updated: 4 November 2026</p>

        <section class="info-section" aria-labelledby="who">
            <h2 id="who">Who runs Weightloss Tracker</h2>
            <p>Weightloss Tracker (weightloss-tracker.com) is run by Robert Marsh II, an individual based in Manchester, UK. He decides how your data is used and is the &ldquo;data controller&rdquo; under UK data protection law.</p>
            <p>Contact for privacy questions and requests: <strong>[CONTACT EMAIL]</strong></p>
        </section>

        <section class="info-section" aria-labelledby="what">
            <h2 id="what">What we collect and why</h2>
            <ul>
                <li><strong>Your account:</strong> your email address, and your first and last name if you sign in with Google or Microsoft (we take them from that account). We use these to sign you in and to send the emails described below.</li>
                <li><strong>Your tracking data:</strong> the weights you log and their dates; your height, age, body frame and activity level; your target weight; body fat percentages (worked out automatically from your BMI and age each time you log a weight, or entered by you); and any smart-scale readings (muscle mass, fat, water, bone), tape measurements (neck, breast, waist, hips, thighs, calves, arms) and skinfold caliper readings you choose to add. We use these only to show you your own figures, charts, goals and achievements.</li>
                <li><strong>Your settings:</strong> units, theme, language, time zone, date and time format, first day of the week and your email choices.</li>
                <li><strong>Sign-in codes:</strong> a 6-digit code linked to your email address while you sign in.</li>
                <li><strong>Security counters:</strong> to stop abuse, we count sign-in attempts per email address and IP address. These are stored as one-way scrambled values (hashes), not as the address itself.</li>
                <li><strong>Server logs:</strong> our web server records each request (IP address, time, page asked for and browser details), and keeps a log line each time a reminder or report email is sent, including the address it went to. We use logs to keep the service running and fix faults.</li>
            </ul>
            <p>The settings page has a &ldquo;Share anonymous data for research&rdquo; switch. It is off unless you turn it on, and at present the app does not share any of your data with anyone, whichever way it is set.</p>
            <p>We do not sell your data, we do not show you adverts inside the app, and nobody else can see your tracking data.</p>
        </section>

        <section class="info-section" aria-labelledby="basis">
            <h2 id="basis">Our lawful basis</h2>
            <ul>
                <li><strong>Providing your account and the tracker</strong> (account, tracking data, settings, sign-in codes, emails you turn on): to provide the service you signed up for (UK GDPR Article 6(1)(b)).</li>
                <li><strong>Weight and body measurements are health data.</strong> We only hold what you choose to enter and use it only to show it back to you. Our basis is your explicit consent (Article 9(2)(a)). You can withdraw it at any time by deleting entries or asking us to delete your account.</li>
                <li><strong>Security counters and server logs:</strong> our legitimate interest in keeping the service secure and working (Article 6(1)(f)).</li>
            </ul>
        </section>

        <section class="info-section" aria-labelledby="where">
            <h2 id="where">Where it is stored and how long we keep it</h2>
            <ul>
                <li>Your account, tracking data and settings are stored in our PostgreSQL database on our server. We keep them while you have an account. If you ask us to delete your account, we delete the account and everything linked to it.</li>
                <li>You can delete any weight entry, and any smart-scale, measurement or caliper entry, yourself at any time from your dashboard.</li>
                <li>Sign-in codes last 15 minutes. A code is deleted when you use it, when you ask for a new one, or after too many wrong guesses.</li>
                <li>Security counters are cleared after about a day.</li>
                <li>The code does not set a fixed period for server logs or the email log. We use them only to run the service and do not share them.</li>
            </ul>
        </section>

        <section class="info-section" aria-labelledby="cookies">
            <h2 id="cookies">Cookies and browser storage</h2>
            <p>These keep you signed in and remember your display choices. They are strictly necessary for the service you asked for, so they do not need consent under the Privacy and Electronic Communications Regulations (PECR).</p>
            <div class="table-wrap" tabindex="0" role="region" aria-label="Cookies and storage set by Weightloss Tracker">
                <table>
                    <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">How long</th></tr></thead>
                    <tbody>
                        <tr><td><code>PHPSESSID</code></td><td>Cookie</td><td>Your signed-in session (also holds a security token for forms)</td><td>Until you close the browser; a sign-in session is ended after 24 hours</td></tr>
                        <tr><td><code>remember_token</code>, <code>user_id</code></td><td>Cookies (secure, not readable by scripts)</td><td>Keep you signed in on this device</td><td>30 days from your last visit, or until you sign out</td></tr>
                        <tr><td><code>weightUnit</code>, <code>heightUnit</code>, <code>language</code></td><td>Local storage</td><td>Remember your units and language on this device</td><td>Until you clear your browser data</td></tr>
                    </tbody>
                </table>
            </div>
            <p><strong>Google Ads tag.</strong> The home page and the dashboard load Google&rsquo;s advertising tag (gtag.js, ID AW-17636245354) from googletagmanager.com. We use it to measure whether people arrive from our Google adverts. Google receives your IP address and browser details and may set its own cookies. You can block it with your browser&rsquo;s tracking protection or an ad blocker; the tracker works the same without it. See <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer">how Google uses data from advertising</a>.</p>
        </section>

        <section class="info-section" aria-labelledby="services">
            <h2 id="services">Who we share data with</h2>
            <p>We use these companies to run the service. Some are outside the UK.</p>
            <ul>
                <li><strong>SparkPost</strong> sends our emails (sign-in codes, and the weekly reminder and monthly report if you turn them on). It receives your email address and the email content. Open and click tracking are switched off.</li>
                <li><strong>Google and Microsoft</strong>, only if you choose &ldquo;Continue with Google&rdquo; or &ldquo;Continue with Microsoft&rdquo;. We ask for your basic profile only (Google: openid, email and profile; Microsoft: User.Read) and receive your email address and name.</li>
                <li><strong>Google Ads</strong>: the advertising tag described above.</li>
                <li><strong>Code and style libraries</strong>: pages load jQuery from cdnjs (Cloudflare), Bootstrap from StackPath&rsquo;s BootstrapCDN and, on the dashboard, Chart.js from jsDelivr. These services receive your IP address and browser details when the files load.</li>
            </ul>
            <p>We may also share data if the law requires it.</p>
        </section>

        <section class="info-section" aria-labelledby="rights">
            <h2 id="rights">Your rights and deleting your data</h2>
            <p>You have the right to ask for a copy of your data, to have it corrected, to have it deleted, to restrict or object to how we use it, and to receive the data you gave us in a reusable format. Where we rely on consent, you can withdraw it at any time.</p>
            <p>There is no &ldquo;delete my account&rdquo; button yet. To delete your account and all its data, or to use any other right, email <strong>[CONTACT EMAIL]</strong> from the address you sign in with. We will reply within one month.</p>
            <p>To stop reminder or report emails, turn them off in Settings.</p>
        </section>

        <section class="info-section" aria-labelledby="complaints">
            <h2 id="complaints">Complaints</h2>
            <p>If you are unhappy with how we handle your data, please contact us first so we can put it right. You also have the right to complain to the Information Commissioner&rsquo;s Office (ICO), the UK regulator: <a href="https://ico.org.uk/make-a-complaint/" rel="noopener noreferrer">ico.org.uk/make-a-complaint</a> or 0303 123 1113.</p>
        </section>

        <section class="info-section" aria-labelledby="changes">
            <h2 id="changes">Changes to this page</h2>
            <p>If we change what we collect or who we share it with, we will update this page and the date at the top.</p>
        </section>

        <a class="back-link" href="/">&larr; Back to Weightloss Tracker</a>
    </main>

    <footer class="site-footer">
        <nav aria-label="Footer">
            <a href="/">Home</a>
            <a href="/privacy">Privacy &amp; cookies</a>
            <a href="/#signin">Sign in</a>
        </nav>
        <p>&copy; <?php echo date('Y'); ?> Weightloss Tracker</p>
    </footer>
</body>
</html>
