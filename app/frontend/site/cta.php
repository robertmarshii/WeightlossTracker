<section class="band"><div class="wrap"><div class="cta-band">
    <h2><?= $s->t('cta.h') ?></h2>
    <p><?= $s->t('cta.p') ?></p>
    <div class="actions">
        <a class="btn-cta" href="<?= $s->page === 'home' ? '#signin' : $s->link('login') ?>"><?= $s->t('cta.start') ?></a>
        <a class="btn-ghost" href="<?= $s->link('login') ?>"><?= $s->t('cta.signin') ?></a>
    </div>
</div></div></section>
