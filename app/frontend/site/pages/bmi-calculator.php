<section class="hero"><div class="wrap">
    <h1><?= $s->t('bmi.h1') ?></h1>
    <p class="lead"><?= $s->t('bmi.lead') ?></p>
</div></section>
<div class="wrap grid grid-2 bmi-grid">
    <form class="calc card" id="bmi-form" novalidate data-decimal="<?= $s->lang === 'en' ? '.' : ',' ?>" data-error="<?= $s->a('bmi.error') ?>">
        <fieldset>
            <legend><?= $s->t('bmi.units') ?></legend>
            <div class="units">
                <label><input type="radio" name="units" value="metric" checked> <?= $s->t('bmi.metric') ?></label>
                <label><input type="radio" name="units" value="imperial"> <?= $s->t('bmi.imperial') ?></label>
            </div>
        </fieldset>
        <fieldset>
            <legend><?= $s->t('bmi.height') ?></legend>
            <div class="row" data-units="metric">
                <div class="field"><label for="h-cm"><?= $s->t('bmi.cm') ?></label><input id="h-cm" type="text" inputmode="decimal" autocomplete="off"></div>
            </div>
            <div class="row" data-units="imperial" hidden>
                <div class="field"><label for="h-ft"><?= $s->t('bmi.ft') ?></label><input id="h-ft" type="text" inputmode="numeric" autocomplete="off"></div>
                <div class="field"><label for="h-in"><?= $s->t('bmi.in') ?></label><input id="h-in" type="text" inputmode="decimal" autocomplete="off"></div>
            </div>
        </fieldset>
        <fieldset>
            <legend><?= $s->t('bmi.weight') ?></legend>
            <div class="row" data-units="metric">
                <div class="field"><label for="w-kg"><?= $s->t('bmi.kg') ?></label><input id="w-kg" type="text" inputmode="decimal" autocomplete="off"></div>
            </div>
            <div class="row" data-units="imperial" hidden>
                <div class="field"><label for="w-st"><?= $s->t('bmi.st') ?></label><input id="w-st" type="text" inputmode="numeric" autocomplete="off"></div>
                <div class="field"><label for="w-lb"><?= $s->t('bmi.lb') ?></label><input id="w-lb" type="text" inputmode="decimal" autocomplete="off"></div>
            </div>
        </fieldset>
        <button type="submit" class="btn-cta"><?= $s->t('bmi.go') ?></button>
        <div class="result" id="bmi-result" role="status" aria-live="polite" data-your="<?= $s->a('bmi.your') ?>"></div>
    </form>
    <div>
        <div class="card">
            <h2><?= $s->t('bmi.band.h') ?></h2>
            <table class="bmi-bands" id="bmi-bands">
                <thead><tr><th scope="col"><?= $s->t('bmi.band.range') ?></th><th scope="col"><?= $s->t('bmi.band.cat') ?></th></tr></thead>
                <tbody>
                    <tr data-cat="under"><td><?= $s->lang === 'en' ? 'Below 18.5' : '&lt; 18,5' ?></td><th scope="row"><?= $s->t('bmi.cat.under') ?></th></tr>
                    <tr data-cat="normal"><td><?= $s->lang === 'en' ? '18.5 to 24.9' : '18,5 – 24,9' ?></td><th scope="row"><?= $s->t('bmi.cat.normal') ?></th></tr>
                    <tr data-cat="over"><td><?= $s->lang === 'en' ? '25 to 29.9' : '25 – 29,9' ?></td><th scope="row"><?= $s->t('bmi.cat.over') ?></th></tr>
                    <tr data-cat="obese"><td><?= $s->lang === 'en' ? '30 or more' : '≥ 30' ?></td><th scope="row"><?= $s->t('bmi.cat.obese') ?></th></tr>
                </tbody>
            </table>
            <p class="muted small-print"><a href="<?= SITE_SOURCES['bmi'] ?>" rel="noopener"><?= $s->t('src.bmi') ?></a></p>
        </div>
        <div class="card mt">
            <h2><?= $s->t('bmi.about.h') ?></h2>
            <p><?= $s->t('bmi.about.p1') ?></p>
            <p><?= $s->t('bmi.about.p2') ?></p>
        </div>
    </div>
</div>
<section class="band"><div class="wrap feature-row">
    <div>
        <h2><?= $s->t('bmi.track.h') ?></h2>
        <p><?= $s->t('bmi.track.p') ?></p>
        <div class="actions"><a class="btn-cta" href="<?= $s->link('login') ?>"><?= $s->t('cta.start') ?></a></div>
    </div>
    <figure><?= $s->shot('estimates', 'shot.estimates') ?></figure>
</div></section>
