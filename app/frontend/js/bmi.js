// Free BMI calculator on the public website. Runs only in the browser: nothing is sent anywhere.
// Same calculation and categories as the app (backend Router.php): kg / m², under 18.5, under 25, under 30, else 30+.
(function () {
    var form = document.getElementById('bmi-form');
    if (!form) return;
    var dec = form.getAttribute('data-decimal') || '.';
    var out = document.getElementById('bmi-result');
    var rows = document.querySelectorAll('#bmi-bands tbody tr');

    function num(id) {
        var v = (document.getElementById(id).value || '').trim().replace(',', '.');
        if (v === '') return 0;
        var n = parseFloat(v);
        return isFinite(n) && n >= 0 ? n : NaN;
    }
    function units() {
        return form.querySelector('input[name="units"]:checked').value;
    }
    function showUnits() {
        var u = units();
        var groups = form.querySelectorAll('[data-units]');
        for (var i = 0; i < groups.length; i++) groups[i].hidden = groups[i].getAttribute('data-units') !== u;
    }
    function category(bmi) {
        if (bmi < 18.5) return 'under';
        if (bmi < 25) return 'normal';
        if (bmi < 30) return 'over';
        return 'obese';
    }

    var radios = form.querySelectorAll('input[name="units"]');
    for (var i = 0; i < radios.length; i++) radios[i].addEventListener('change', showUnits);
    showUnits();

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var cm, kg;
        if (units() === 'metric') {
            cm = num('h-cm');
            kg = num('w-kg');
        } else {
            cm = (num('h-ft') * 12 + num('h-in')) * 2.54;
            kg = (num('w-st') * 14 + num('w-lb')) * 0.45359237;
        }
        for (var r = 0; r < rows.length; r++) rows[r].classList.remove('is-you');
        out.textContent = '';
        if (!(cm >= 50 && cm <= 300 && kg >= 20 && kg <= 500)) {
            var p = document.createElement('p');
            p.textContent = form.getAttribute('data-error');
            out.appendChild(p);
            return;
        }
        var m = cm / 100;
        var bmi = Math.round(kg / (m * m) * 10) / 10;
        var cat = category(bmi);
        var row = document.querySelector('#bmi-bands tr[data-cat="' + cat + '"]');
        if (row) row.classList.add('is-you');
        var big = document.createElement('p');
        big.className = 'big';
        big.textContent = bmi.toFixed(1).replace('.', dec);
        var catText = document.createElement('p');
        catText.textContent = row ? row.querySelector('th').textContent : '';
        var title = document.createElement('p');
        title.textContent = out.getAttribute('data-your') || '';
        if (title.textContent) out.appendChild(title);
        out.appendChild(big);
        out.appendChild(catText);
    });
})();
