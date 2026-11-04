<section class="hero"><div class="wrap hero-grid">
    <div>
        <h1><?= $s->t('login.h1') ?></h1>
        <p class="lead"><?= $s->t('login.lead') ?></p>
        <ul class="badges">
            <li><?= Site::icon('tick') ?><?= $s->t('home.badge.free') ?></li>
            <li><?= Site::icon('tick') ?><?= $s->t('home.badge.nopw') ?></li>
        </ul>
        <p><a href="<?= $s->link('home') ?>"><?= $s->t('nav.home') ?></a> · <a href="<?= $s->link('features') ?>"><?= $s->t('nav.features') ?></a></p>
    </div>
    <div class="signin-wrap"><?php include __DIR__ . '/../card.php'; ?></div>
</div></section>
