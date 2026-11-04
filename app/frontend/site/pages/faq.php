<section class="hero"><div class="wrap">
    <h1><?= $s->t('faqpage.h1') ?></h1>
    <p class="lead"><?= $s->t('faqpage.lead') ?></p>
</div></section>
<div class="wrap">
    <div class="faq faq-open">
<?php foreach (SITE_FAQ as $k): ?>
        <section class="card" id="<?= $k ?>" aria-labelledby="q-<?= $k ?>">
            <h2 id="q-<?= $k ?>"><?= $s->t("faq.$k.q") ?></h2>
            <p><?= $s->t("faq.$k.a") ?></p>
        </section>
<?php endforeach; ?>
    </div>
    <p><a href="<?= $s->link('features') ?>"><?= $s->t('cta.features') ?></a> · <a href="<?= $s->link('about') ?>"><?= $s->t('nav.about') ?></a></p>
</div>
<?php include __DIR__ . '/../cta.php'; ?>
