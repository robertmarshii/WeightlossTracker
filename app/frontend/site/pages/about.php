<?php $stages = [1 => ['log', 'estimates'], 2 => ['recent', 'alltime'], 3 => [], 4 => 'settings', 5 => 'reminders', 6 => 'goals', 7 => 'measure', 8 => 'smart', 9 => 'fatloss']; ?>
<section class="hero"><div class="wrap">
    <h1><?= $s->t('about.h1') ?></h1>
    <p class="lead"><?= $s->t('about.lead') ?></p>
</div></section>
<div class="wrap">
    <section class="note" aria-labelledby="start-h">
        <h2 id="start-h"><?= $s->t('about.start.h') ?></h2>
        <p><?= $s->t('about.start.p1') ?></p>
        <p><?= $s->t('about.start.p2') ?></p>
    </section>

    <section class="band" aria-labelledby="stages-h">
        <h2 id="stages-h"><?= $s->t('about.stages.h') ?></h2>
        <ol class="steps steps-long">
<?php foreach ($stages as $n => $shots): ?>
            <li<?= $shots ? '' : ' class="no-shot"' ?>>
                <div><h3><?= $s->t("about.s$n.h") ?></h3><p><?= $s->t("about.s$n.p") ?></p>
<?php if ($n === 3): ?>
                    <p><a href="<?= $s->link('features') ?>#ben"><?= $s->t('src.h') ?></a></p>
<?php endif; ?>
                </div>
<?php if ($shots): ?>
                <div class="shots">
<?php foreach ((array) $shots as $sh): ?>
                    <figure><?= $s->shot($sh, "shot.$sh") ?></figure>
<?php endforeach; ?>
                </div>
<?php endif; ?>
            </li>
<?php endforeach; ?>
        </ol>
    </section>

    <section class="band grid grid-2" aria-label="<?= $s->a('about.now.h') ?>">
        <div class="card">
            <h2><?= $s->t('about.now.h') ?></h2>
            <p><?= $s->t('about.now.p') ?></p>
            <ul>
<?php for ($j = 1; $j <= 8; $j++): ?>
                <li><?= $s->t("about.now.l$j") ?></li>
<?php endfor; ?>
            </ul>
            <p><a href="<?= $s->link('features') ?>"><?= $s->t('cta.features') ?></a></p>
        </div>
        <div class="card result">
            <h2><?= $s->t('about.result.h') ?></h2>
            <p class="big-number"><?= $s->t('about.result.big') ?></p>
            <p><?= $s->t('about.result.p') ?></p>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../cta.php'; ?>
