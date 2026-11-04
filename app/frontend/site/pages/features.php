<?php
/** [key prefix, screenshot(s), icon, number of list items] in page order */
$sections = [
    ['features.log', ['log'], 'scale', 3],
    ['features.charts', ['recent', 'alltime'], 'chart', 3],
    ['features.goals', ['goals'], 'target', 3],
    ['features.ach', ['streak'], 'trophy', 3],
    ['features.health', ['estimates'], 'heart', 4],
    ['features.est', ['fatloss'], 'calc', 3],
    ['features.body', ['measure', 'smart'], 'ruler', 3],
    ['features.email', ['reminders'], 'mail', 3],
    ['features.settings', ['settings'], 'gear', 4],
];
?>
<section class="hero"><div class="wrap">
    <h1><?= $s->t('features.h1') ?></h1>
    <p class="lead"><?= $s->t('features.lead') ?></p>
    <nav class="toc" aria-label="<?= $s->a('features.h1') ?>">
<?php foreach ($sections as [$k]): ?>
        <a href="#<?= substr($k, 9) ?>"><?= $s->t("$k.h") ?></a>
<?php endforeach; ?>
        <a href="#ben"><?= $s->t('features.ben.h') ?></a>
    </nav>
</div></section>

<div class="wrap">
<?php foreach ($sections as $i => [$k, $shots, $ico, $n]): ?>
    <section class="feature-row<?= $i % 2 ? ' flip' : '' ?>" id="<?= substr($k, 9) ?>" aria-labelledby="<?= substr($k, 9) ?>-h">
        <div>
            <?= Site::icon($ico) ?>
            <h2 id="<?= substr($k, 9) ?>-h"><?= $s->t("$k.h") ?></h2>
<?php if ($s->t("$k.p") !== "$k.p"): ?>
            <p><?= $s->t("$k.p") ?></p>
<?php endif; ?>
            <ul>
<?php for ($j = 1; $j <= $n; $j++): ?>
                <li><?= $s->t("$k.l$j") ?></li>
<?php endfor; ?>
            </ul>
        </div>
        <div class="shots">
<?php foreach ($shots as $sh): ?>
            <figure><?= $s->shot($sh, "shot.$sh", $i > 0) ?></figure>
<?php endforeach; ?>
        </div>
    </section>
<?php endforeach; ?>

    <section class="band grid grid-2" aria-label="<?= $s->a('features.signin.h') ?>">
        <div class="card">
            <?= Site::icon('lock') ?>
            <h2><?= $s->t('features.signin.h') ?></h2>
            <ul>
                <li><?= $s->t('features.signin.l1') ?></li>
                <li><?= $s->t('features.signin.l2') ?></li>
                <li><?= $s->t('features.signin.l3') ?></li>
                <li><?= $s->t('features.signin.l4') ?></li>
            </ul>
        </div>
        <div class="card">
            <?= Site::icon('tick') ?>
            <h2><?= $s->t('features.free.h') ?></h2>
            <p><?= $s->t('features.free.p') ?></p>
        </div>
    </section>

    <section class="band" id="ben" aria-labelledby="ben-h">
        <?= Site::icon('heart') ?>
        <h2 id="ben-h"><?= $s->t('features.ben.h') ?></h2>
        <p class="lead"><?= $s->t('features.ben.p') ?></p>
        <h3><?= $s->t('src.h') ?></h3>
        <p><?= $s->t('features.ben.src.p') ?></p>
        <ul class="sources">
<?php foreach (SITE_SOURCES as $key => $url): ?>
            <li><a href="<?= $url ?>" rel="noopener"><?= $s->t("src.$key") ?></a></li>
<?php endforeach; ?>
        </ul>
    </section>
</div>

<?php include __DIR__ . '/../cta.php'; ?>
