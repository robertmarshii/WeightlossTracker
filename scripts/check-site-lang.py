#!/usr/bin/env python3
"""Checks the public website's text files: python3 -I scripts/check-site-lang.py

Fails (exit 1) when:
- a key is missing from, or extra in, de/es/fr compared with en (app/frontend/site/lang/*.json)
- a text is empty, or its links/<strong> tags differ from the English text
- a page template uses a key that is not in en.json
- a key in en.json is used nowhere (dead text)
- a screenshot named by a template is missing for a language
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "app" / "frontend"
LANG_DIR = ROOT / "site" / "lang"
LANGS = ["en", "de", "es", "fr"]
errors = []

files = {}
for lang in LANGS:
    try:
        files[lang] = json.loads((LANG_DIR / f"{lang}.json").read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        errors.append(f"{lang}.json: cannot read ({e})")
en = files.get("en", {})


def tags(text):
    return sorted(re.findall(r"<(a|strong|em)\b", text)) + sorted(re.findall(r'href="([^"]*)"', text))


for lang, t in files.items():
    missing, extra = sorted(set(en) - set(t)), sorted(set(t) - set(en))
    if missing:
        errors.append(f"{lang}: missing keys {missing}")
    if extra:
        errors.append(f"{lang}: extra keys {extra}")
    for key, value in t.items():
        if not isinstance(value, str) or not value.strip():
            errors.append(f"{lang} {key}: empty")
        elif key in en and tags(value) != tags(en[key]):
            errors.append(f"{lang} {key}: links or tags differ from English")

# Keys used in templates (literal keys, plus the patterns built in loops)
source = "\n".join(p.read_text(encoding="utf-8") for p in (ROOT / "site").rglob("*.php"))
used = set(re.findall(r"""->(?:t|a|plain)\(['"]([a-z0-9.\-]+)['"]\)""", source))
site = (ROOT / "site" / "Site.php").read_text(encoding="utf-8")
faq = re.findall(r"'([a-z]+)'", re.search(r"const SITE_FAQ = \[(.*?)\];", site).group(1))
used |= {f"faq.{k}.{x}" for k in faq for x in ("q", "a")}
used |= {f"src.{k}" for k in re.findall(r"'([a-z]+)' => 'https", site)}
dynamic = [r"^home\.feat\.\d\.[hp]$", r"^features\.[a-z]+\.(h|p|l\d)$", r"^how\.\d\.[hp]$", r"^about\.s\d\.[hp]$",
           r"^about\.now\.l\d$", r"^shot\.", r"^msg\.", r"^(home|features|how|faqpage|bmi|about|login)\.(title|desc|h1)$"]
for key in sorted(used - set(en)):
    errors.append(f"template uses missing key {key}")
for key in sorted(set(en) - used):
    if not any(re.match(d, key) for d in dynamic):
        errors.append(f"en.json key {key} is not used by any template")

# Screenshots named in templates exist for every language
shots = set(re.findall(r"""shot\(\s*['"]([a-z\-]+)['"]""", source))
for pf in (ROOT / "site" / "pages").glob("*.php"):
    text = pf.read_text(encoding="utf-8")
    for arr in re.findall(r"\$(?:rows|sections|steps|stages)\s*=\s*\[(.*?)\];", text, re.S):
        shots |= set(re.findall(r"'([a-z]+(?:-[a-z]+)?)'", arr)) & {p.stem for p in (ROOT / "images" / "site" / "en").glob("*.webp")}
for name in sorted(shots):
    for lang in LANGS:
        if not (ROOT / "images" / "site" / lang / f"{name}.webp").exists():
            errors.append(f"screenshot {lang}/{name}.webp missing")
    if f"shot.{name}" not in en:
        errors.append(f"no alt text shot.{name}")

if errors:
    print("\n".join(errors))
    print(f"FAIL: {len(errors)} problem(s)")
    sys.exit(1)
print(f"OK: {len(en)} keys in {len(LANGS)} languages, {len(shots)} screenshots")
