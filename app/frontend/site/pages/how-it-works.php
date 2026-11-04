<?php $steps = [1 => null, 2 => 'log', 3 => 'alltime', 4 => 'goals', 5 => 'measure', 6 => 'reminders']; ?>
<section class="hero"><div class="wrap">
    <h1><?= $s->t('how.h1') ?></h1>
    <p class="lead"><?= $s->t('how.lead') ?></p>
</div></section>
<div class="wrap">
    <ol class="steps steps-long">
<?php foreach ($steps as $n => $shot): ?>
        <li>
            <div><h2><?= $s->t("how.$n.h") ?></h2><p><?= $s->t("how.$n.p") ?></p>
<?php if ($n === 1): ?>
                <p><a class="btn-cta" href="<?= $s->link('login') ?>"><?= $s->t('cta.start') ?></a></p>
<?php endif; ?>
            </div>
<?php if ($shot): ?>
            <figure><?= $s->shot($shot, "shot.$shot", $n > 2) ?></figure>
<?php else: ?>
            <div class="card"><?= Site::icon('lock') ?><ul>
                <li><?= $s->t('features.signin.l1') ?></li>
                <li><?= $s->t('features.signin.l2') ?></li>
                <li><?= $s->t('features.signin.l3') ?></li>
            </ul></div>
<?php endif; ?>
        </li>
<?php endforeach; ?>
    </ol>
    <section class="band" aria-labelledby="tips-h">
        <h2 id="tips-h"><?= $s->t('how.tips.h') ?></h2>
        <ul class="ticks">
            <li><?= $s->t('how.tips.l1') ?></li>
            <li><?= $s->t('how.tips.l2') ?></li>
            <li><?= $s->t('how.tips.l3') ?></li>
        </ul>
    </section>
</div>
<?php include __DIR__ . '/../cta.php'; ?>
