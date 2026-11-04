<?php
/** Page frame for the public website. Expects $s (Site), $content (HTML) and $withCard (bool). */
$titleKeys = [
    'home' => 'home', 'features' => 'features', 'how-it-works' => 'how', 'faq' => 'faqpage',
    'bmi-calculator' => 'bmi', 'about' => 'about', 'login' => 'login',
];
$tk = $titleKeys[$s->page];
$title = $s->a($tk . '.title');
$desc = $s->a($tk . '.desc');
$canonical = Site::url($s->lang, $s->page);
$image = Site::BASE . '/images/og-image.png';

// Structured data: what the page is, in the page's language. Text matches what the page shows.
$graph = [];
if ($s->page === 'home') {
    $graph[] = ['@type' => 'WebSite', '@id' => Site::BASE . '/#website', 'name' => 'Weightloss Tracker', 'url' => Site::BASE . '/',
        'inLanguage' => ['en-GB', 'de', 'es', 'fr']];
}
if ($s->page === 'home' || $s->page === 'features') {
    $graph[] = ['@type' => 'WebApplication', 'name' => 'Weightloss Tracker', 'url' => Site::url($s->lang, 'home'),
        'description' => $s->plain('home.desc'), 'applicationCategory' => 'HealthApplication',
        'operatingSystem' => 'Any (web browser)', 'inLanguage' => ['en-GB', 'de', 'es', 'fr'], 'isAccessibleForFree' => true,
        'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'GBP']];
}
if ($s->page !== 'home') {
    $graph[] = ['@type' => 'BreadcrumbList', 'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => $s->plain('nav.home'), 'item' => Site::url($s->lang, 'home')],
        ['@type' => 'ListItem', 'position' => 2, 'name' => $s->plain($tk . '.h1'), 'item' => $canonical],
    ]];
}
if ($s->page === 'faq') {
    $qa = [];
    foreach (SITE_FAQ as $k) {
        $qa[] = ['@type' => 'Question', 'name' => $s->plain('faq.' . $k . '.q'),
            'acceptedAnswer' => ['@type' => 'Answer', 'text' => $s->plain('faq.' . $k . '.a')]];
    }
    $graph[] = ['@type' => 'FAQPage', 'inLanguage' => $s->htmlLang(), 'mainEntity' => $qa];
}
$ld = str_replace('</', '<\/', json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
?>
<!DOCTYPE html>
<html lang="<?= $s->htmlLang() ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?></title>
    <meta name="description" content="<?= $desc ?>">
    <meta name="robots" content="<?= in_array($s->page, Site::NOINDEX, true) ? 'noindex, follow' : 'index, follow' ?>">
    <link rel="canonical" href="<?= $canonical ?>">
    <?= $s->alternates() ?>

    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#1e3a5f">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Weightloss Tracker">
    <meta property="og:url" content="<?= $canonical ?>">
    <meta property="og:title" content="<?= $title ?>">
    <meta property="og:description" content="<?= $desc ?>">
    <meta property="og:image" content="<?= $image ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="<?= Site::LANGS[$s->lang][2] ?>">
<?php foreach (Site::LANGS as $code => $info): if ($code !== $s->lang): ?>
    <meta property="og:locale:alternate" content="<?= $info[2] ?>">
<?php endif; endforeach; ?>
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= $title ?>">
    <meta name="twitter:description" content="<?= $desc ?>">
    <meta name="twitter:image" content="<?= $image ?>">
    <script type="application/ld+json"><?= $ld ?></script>
<?php if ($withCard): ?>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?= Site::v('css/global.css') ?>">
    <link rel="stylesheet" href="<?= Site::v('css/index.css') ?>">
<?php endif; ?>
    <link rel="stylesheet" href="<?= Site::v('css/site.css') ?>">
</head>
<body class="site">
<a class="skip" href="#main"><?= $s->t('skip') ?></a>
<nav class="lang-nav" aria-label="<?= $s->a('lang.label') ?>"><div class="wrap">
<?php foreach (Site::LANGS as $code => $info): ?>
    <a href="<?= Site::path($code, $s->page) ?>" lang="<?= $info[1] ?>" hreflang="<?= $info[3] ?>"<?= $code === $s->lang ? ' aria-current="true"' : '' ?>><?= $info[0] ?></a>
<?php endforeach; ?>
</div></nav>
<header class="site-head"><div class="wrap">
    <a class="logo" href="<?= $s->link('home') ?>"><?= SITE_LOGO ?>Weightloss Tracker</a>
    <nav class="site-nav" aria-label="<?= $s->a('nav.main') ?>">
        <a href="<?= $s->link('features') ?>"<?= $s->cur('features') ?>><?= $s->t('nav.features') ?></a>
        <a href="<?= $s->link('how-it-works') ?>"<?= $s->cur('how-it-works') ?>><?= $s->t('nav.how') ?></a>
        <a href="<?= $s->link('about') ?>"<?= $s->cur('about') ?>><?= $s->t('nav.about') ?></a>
        <a href="<?= $s->link('faq') ?>"<?= $s->cur('faq') ?>><?= $s->t('nav.faq') ?></a>
        <a href="<?= $s->link('bmi-calculator') ?>"<?= $s->cur('bmi-calculator') ?>><?= $s->t('nav.bmi') ?></a>
        <a class="btn-cta" href="<?= $s->link('login') ?>"<?= $s->cur('login') ?>><?= $s->t('nav.signin') ?></a>
    </nav>
</div></header>

<?php if ($withCard): ?>
<div id="alert-container" role="status" aria-live="polite"></div>
<?php endif; ?>
<main id="main">
<?= $content ?>
</main>

<footer class="site-foot"><div class="wrap">
    <div class="foot-top">
        <div>
            <a class="logo" href="<?= $s->link('home') ?>"><?= SITE_LOGO ?>Weightloss Tracker</a>
            <p><?= $s->t('foot.about') ?></p>
        </div>
        <nav class="foot-links" aria-label="<?= $s->a('nav.footer') ?>">
            <a href="<?= $s->link('home') ?>"><?= $s->t('nav.home') ?></a>
            <a href="<?= $s->link('features') ?>"><?= $s->t('nav.features') ?></a>
            <a href="<?= $s->link('how-it-works') ?>"><?= $s->t('nav.how') ?></a>
            <a href="<?= $s->link('about') ?>"><?= $s->t('nav.about') ?></a>
            <a href="<?= $s->link('faq') ?>"><?= $s->t('nav.faq') ?></a>
            <a href="<?= $s->link('bmi-calculator') ?>"><?= $s->t('nav.bmi') ?></a>
            <a href="<?= $s->link('login') ?>"><?= $s->t('nav.signin') ?></a>
            <a href="/privacy"><?= $s->t('nav.privacy') ?></a>
            <a href="/terms"><?= $s->t('nav.terms') ?></a>
            <a href="/privacy#cookies"><?= $s->t('nav.cookies') ?></a>
        </nav>
    </div>
    <p><?= $s->t('foot.contact') ?></p>
    <p>&copy; <?= date('Y') ?> Weightloss Tracker</p>
</div></footer>
<?php if ($withCard): ?>
<script>window.WT_MSG = <?= json_encode(array_filter(Site::load($s->lang), function ($k) { return strpos($k, 'msg.') === 0; }, ARRAY_FILTER_USE_KEY), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
<script src="<?= Site::v('js/coverage.js') ?>"></script>
<script src="<?= Site::v('js/global.js') ?>"></script>
<script src="<?= Site::v('js/index.js') ?>"></script>
<?php endif; ?>
<?php if ($s->page === 'bmi-calculator'): ?>
<script src="<?= Site::v('js/bmi.js') ?>"></script>
<?php endif; ?>
</body>
</html>
