#!/usr/bin/env node
// Tests the stone weight parser (parseStoneInput in app/frontend/js/global.js) and the hint shown under
// stone weight fields. Run: node scripts/test-stone-parser.js  (exit code 1 on any failure)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../app/frontend/js/global.js'), 'utf8');
const store = {};
const ctx = {
    console,
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
    window: {},
    document: { querySelector: () => null, readyState: 'complete', addEventListener() {} },
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } },
    navigator: { language: 'en-GB' },
    location: { href: 'http://localhost/', origin: 'http://localhost' },
};
ctx.window = ctx;
ctx.fetch = () => Promise.resolve();
vm.createContext(ctx);
vm.runInContext(src, ctx);
const { parseStoneInput, stoneInputHint } = ctx;

let fails = 0;
function check(name, got, want) {
    const ok = (Number.isNaN(want) && Number.isNaN(got)) || got === want;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${got}, want ${want}`);
}
const kg = s => { const v = parseStoneInput(s); return Number.isNaN(v) ? NaN : v.toFixed(2); };

// Pounds only (read first, so these are never split into stones and pounds)
check('"187.4 lb"', kg('187.4 lb'), '85.00');
check('"187.4 lbs"', kg('187.4 lbs'), '85.00');
check('"187.4 pounds"', kg('187.4 pounds'), '85.00');
check('"200 lb"', kg('200 lb'), '90.72');
check('"200lbs"', kg('200lbs'), '90.72');
check('"5.4 lb"', kg('5.4 lb'), '2.45');
// Stones and pounds
check('"13 st 5.4 lb"', kg('13 st 5.4 lb'), '85.00');
check('"13 5.4"', kg('13 5.4'), '85.00');
check('"13st5.4lb"', kg('13st5.4lb'), '85.00');
check('"13 st 5.4"', kg('13 st 5.4'), '85.00');
check('"13 stone 5 pounds"', kg('13 stone 5 pounds'), '84.82');
check('"0 st 5 lb"', kg('0 st 5 lb'), '2.27');
check('"13 st 0 lb"', kg('13 st 0 lb'), '82.55');
// Stones only; a bare number is decimal stones
check('"13 st"', kg('13 st'), '82.55');
check('"13st"', kg('13st'), '82.55');
check('"13.5"', kg('13.5'), '85.73');
check('"13.5 st"', kg('13.5 st'), '85.73');
// Comma decimals (de, es, fr)
check('"13,5" (de/es/fr)', kg('13,5'), '85.73');
check('"13 st 5,4 lb" (de/es/fr)', kg('13 st 5,4 lb'), '85.00');
check('"13 5,4" (de/es/fr)', kg('13 5,4'), '85.00');
check('"187,4 lb" (de/es/fr)', kg('187,4 lb'), '85.00');
// Not understood
check('"13 st lb"', kg('13 st lb'), NaN);
check('"13 st 14 lb" (pounds must be under 14)', kg('13 st 14 lb'), NaN);
check('"13 20"', kg('13 20'), NaN);
check('"13.5 st 2 lb" (stones must be whole with pounds)', kg('13.5 st 2 lb'), NaN);
check('"-13"', kg('-13'), NaN);
check('"13 st -2 lb"', kg('13 st -2 lb'), NaN);
check('"abc"', kg('abc'), NaN);
check('""', kg(''), NaN);
// The hint shown before saving
check('hint "13.5"', stoneInputHint('13.5'), '= 13 st 7.0 lb');
check('hint "187.4 lb"', stoneInputHint('187.4 lb'), '= 13 st 5.4 lb');
check('hint "13 5.4"', stoneInputHint('13 5.4'), '= 13 st 5.4 lb');
check('hint ""', stoneInputHint(''), '');
check('hint "13 st lb"', stoneInputHint('13 st lb'), 'Type e.g. 13 st 5 lb');

console.log(fails ? `\n${fails} FAILED` : '\nAll stone parser tests passed');
process.exit(fails ? 1 : 0);
