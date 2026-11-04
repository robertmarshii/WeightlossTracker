<section class="hero"><div class="wrap hero-grid">
    <div>
        <h1><?= $s->t('home.h1') ?></h1>
        <p class="lead"><?= $s->t('home.lead') ?></p>
        <div class="actions">
            <a class="btn-cta" href="#signin"><?= $s->t('cta.start') ?></a>
            <a class="btn-ghost" href="<?= $s->link('features') ?>"><?= $s->t('cta.features') ?></a>
        </div>
        <ul class="badges">
            <li><?= Site::icon('tick') ?><?= $s->t('home.badge.free') ?></li>
            <li><?= Site::icon('tick') ?><?= $s->t('home.badge.nopw') ?></li>
            <li><?= Site::icon('tick') ?><?= $s->t('home.badge.browser') ?></li>
            <li><?= Site::icon('tick') ?><?= $s->t('home.badge.lang') ?></li>
        </ul>
    </div>
    <div class="signin-wrap"><?php include __DIR__ . '/../card.php'; ?></div>
</div></section>

<section class="band band-alt" aria-labelledby="glance-h"><div class="wrap">
    <h2 id="glance-h" class="center"><?= $s->t('home.glance.h') ?></h2>
    <p class="lead center muted"><?= $s->t('home.glance.p') ?></p>
    <div class="glance">
        <figure class="glance-main"><?= $s->shot('alltime', 'shot.alltime', true) ?><figcaption><?= $s->t('home.glance.1') ?></figcaption></figure>
        <figure class="glance-phone"><?= $s->shot('m-goals', 'shot.m-goals', true) ?><figcaption><?= $s->t('home.glance.2') ?></figcaption></figure>
    </div>
</div></section>

<section class="band" aria-labelledby="glp-h"><div class="wrap feature-row">
    <div>
        <p class="eyebrow"><?= Site::icon('pill') ?> GLP-1</p>
        <h2 id="glp-h"><?= $s->t('home.glp.h') ?></h2>
        <p><?= $s->t('home.glp.p1') ?></p>
        <ul class="ticks">
            <li><?= $s->t('home.glp.l1') ?></li>
            <li><?= $s->t('home.glp.l2') ?></li>
            <li><?= $s->t('home.glp.l3') ?></li>
        </ul>
        <p><?= $s->t('home.glp.p2') ?></p>
    </div>
    <figure><?= $s->shot('weekly', 'shot.weekly') ?></figure>
</div></section>

<section class="band band-alt" aria-labelledby="who-h"><div class="wrap">
    <h2 id="who-h"><?= $s->t('home.who.h') ?></h2>
    <div class="grid grid-3">
        <div class="card"><?= Site::icon('pill') ?><h3><?= $s->t('home.who.1.h') ?></h3><p><?= $s->t('home.who.1.p') ?></p></div>
        <div class="card"><?= Site::icon('chart') ?><h3><?= $s->t('home.who.2.h') ?></h3><p><?= $s->t('home.who.2.p') ?></p></div>
        <div class="card"><?= Site::icon('scale') ?><h3><?= $s->t('home.who.3.h') ?></h3><p><?= $s->t('home.who.3.p') ?></p></div>
    </div>
</div></section>

<section class="band" aria-labelledby="feat-h"><div class="wrap">
    <h2 id="feat-h"><?= $s->t('home.feat.h') ?></h2>
<?php
$rows = [[1, 'log', 'scale'], [2, 'recent', 'chart'], [3, 'goals', 'target'], [4, 'fatloss', 'heart'], [5, 'measure', 'ruler'], [6, 'streak', 'trophy']];
foreach ($rows as $i => [$n, $shot, $ico]): ?>
    <div class="feature-row<?= $i % 2 ? ' flip' : '' ?>">
        <div><?= Site::icon($ico) ?><h3><?= $s->t("home.feat.$n.h") ?></h3><p><?= $s->t("home.feat.$n.p") ?></p></div>
        <figure><?= $s->shot($shot, "shot.$shot") ?></figure>
    </div>
<?php endforeach; ?>
    <div class="actions"><a class="btn-cta" href="<?= $s->link('features') ?>"><?= $s->t('cta.features') ?></a></div>
</div></section>

<section class="band band-alt" aria-labelledby="how-h"><div class="wrap">
    <h2 id="how-h"><?= $s->t('home.how.h') ?></h2>
    <ol class="steps">
        <li><h3><?= $s->t('home.how.1.h') ?></h3><p><?= $s->t('home.how.1.p') ?></p></li>
        <li><h3><?= $s->t('home.how.2.h') ?></h3><p><?= $s->t('home.how.2.p') ?></p></li>
        <li><h3><?= $s->t('home.how.3.h') ?></h3><p><?= $s->t('home.how.3.p') ?></p></li>
    </ol>
    <div class="actions"><a class="btn-ghost" href="<?= $s->link('how-it-works') ?>"><?= $s->t('cta.how') ?></a></div>
</div></section>

<section class="band" aria-labelledby="why-h"><div class="wrap">
    <div class="note">
        <h2 id="why-h"><?= $s->t('home.why.h') ?></h2>
        <p><?= $s->t('home.why.p1') ?></p>
        <ul>
            <li><?= $s->t('home.why.l1') ?></li>
            <li><?= $s->t('home.why.l2') ?></li>
            <li><?= $s->t('home.why.l3') ?></li>
            <li><?= $s->t('home.why.l4') ?></li>
        </ul>
        <p><?= $s->t('home.why.p2') ?></p>
        <p><a href="<?= $s->link('about') ?>"><?= $s->t('home.why.more') ?></a></p>
    </div>
</div></section>

<section class="band band-alt" aria-labelledby="faq-h"><div class="wrap">
    <h2 id="faq-h"><?= $s->t('home.faq.h') ?></h2>
    <div class="faq">
<?php foreach (SITE_FAQ_HOME as $k): ?>
        <details><summary><h3><?= $s->t("faq.$k.q") ?></h3></summary><div><p><?= $s->t("faq.$k.a") ?></p></div></details>
<?php endforeach; ?>
    </div>
    <p><a href="<?= $s->link('faq') ?>"><?= $s->t('home.faq.more') ?></a></p>
</div></section>

<?php include __DIR__ . '/../cta.php'; ?>
