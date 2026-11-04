<?php
/**
 * Public website: the same pages in English, German, Spanish and French.
 *
 * English lives at the bare paths (/, /features ...); the others under /de/, /es/, /fr/.
 * Text comes from site/lang/{en,de,es,fr}.json, which share one set of keys
 * (scripts/check-site-lang.py fails the build if one is missing). nginx sends every
 * public page to index.php, which calls Site::fromPath() and renders site/pages/<page>.php.
 * Direct web access to /site/ is blocked in nginx.
 */
final class Site
{
    const BASE = 'https://weightloss-tracker.com';

    /** code => [own name, html lang, og:locale, hreflang] in switcher order */
    const LANGS = [
        'en' => ['English', 'en-GB', 'en_GB', 'en'],
        'de' => ['Deutsch', 'de', 'de_DE', 'de'],
        'es' => ['Español', 'es', 'es_ES', 'es'],
        'fr' => ['Français', 'fr', 'fr_FR', 'fr'],
    ];

    /** page => path segment ('' is the home page). Same slugs in every language. */
    const PAGES = [
        'home' => '',
        'features' => 'features',
        'how-it-works' => 'how-it-works',
        'faq' => 'faq',
        'bmi-calculator' => 'bmi-calculator',
        'about' => 'about',
        'login' => 'login',
    ];

    /** Pages kept out of search results (still linked and translated). */
    const NOINDEX = ['login'];

    public $lang;
    public $page;
    private $t;
    private static $cache = [];

    public function __construct(string $lang, string $page)
    {
        $this->lang = isset(self::LANGS[$lang]) ? $lang : 'en';
        $this->page = isset(self::PAGES[$page]) ? $page : 'home';
        $this->t = self::load($this->lang);
    }

    /** Works out language and page from a URL path; unknown paths give the English home page. */
    public static function fromPath(string $path): self
    {
        $parts = array_values(array_filter(explode('/', $path), 'strlen'));
        $lang = 'en';
        if ($parts && isset(self::LANGS[$parts[0]]) && $parts[0] !== 'en') {
            $lang = array_shift($parts);
        }
        $slug = $parts[0] ?? '';
        $page = array_search($slug, self::PAGES, true);
        if ($page === false || count($parts) > 1) {
            $page = 'home';
        }
        return new self($lang, $page);
    }

    public static function load(string $lang): array
    {
        if (!isset(self::$cache[$lang])) {
            $json = file_get_contents(__DIR__ . '/lang/' . $lang . '.json');
            self::$cache[$lang] = json_decode($json, true) ?: [];
        }
        return self::$cache[$lang];
    }

    /** Text for a key, as written in the language file (may hold <strong>, <em> or links). */
    public function t(string $key): string
    {
        return $this->t[$key] ?? self::load('en')[$key] ?? $key;
    }

    /** Text for a key with tags removed and escaped, for attributes and plain places. */
    public function a(string $key): string
    {
        return self::h($this->plain($key));
    }

    public function plain(string $key): string
    {
        return html_entity_decode(strip_tags($this->t($key)), ENT_QUOTES, 'UTF-8');
    }

    public static function h(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    }

    /** Site-relative path of a page in a language, e.g. /de/features or / */
    public static function path(string $lang, string $page): string
    {
        $slug = self::PAGES[$page];
        return '/' . ($lang === 'en' ? '' : $lang . '/') . $slug;
    }

    public function link(string $page): string
    {
        return self::path($this->lang, $page);
    }

    public static function url(string $lang, string $page): string
    {
        return self::BASE . self::path($lang, $page);
    }

    public function htmlLang(): string
    {
        return self::LANGS[$this->lang][1];
    }

    /** <link rel="alternate" hreflang> for every language plus x-default (English). */
    public function alternates(): string
    {
        $out = [];
        foreach (self::LANGS as $code => $info) {
            $out[] = '<link rel="alternate" hreflang="' . $info[3] . '" href="' . self::url($code, $this->page) . '">';
        }
        $out[] = '<link rel="alternate" hreflang="x-default" href="' . self::url('en', $this->page) . '">';
        return implode("\n    ", $out);
    }

    /** aria-current for the main navigation */
    public function cur(string $page): string
    {
        return $this->page === $page ? ' aria-current="page"' : '';
    }

    /** Cache-busting version for a file under the web root */
    public static function v(string $path): string
    {
        $t = @filemtime(dirname(__DIR__) . '/' . ltrim($path, '/'));
        return '/' . ltrim($path, '/') . '?v=' . ($t ? $t : '1');
    }

    /** In-app screenshot in the page's language, with its real size, alt text from the language file,
     *  and lazy loading unless it is near the top of the page. */
    public function shot(string $name, string $altKey, bool $lazy = true, string $class = 'shot'): string
    {
        static $sizes = null;
        if ($sizes === null) {
            $sizes = json_decode((string) @file_get_contents(__DIR__ . '/shots.json'), true) ?: [];
        }
        $lang = isset($sizes[$name][$this->lang]) ? $this->lang : 'en';
        [$w, $h] = $sizes[$name][$lang] ?? [800, 500];
        if (strpos($name, 'm-') === 0) { // phone shots are taken at 2x
            $w = (int) round($w / 2);
            $h = (int) round($h / 2);
        }
        return '<img class="' . $class . '" src="/images/site/' . $lang . '/' . $name . '.webp" width="' . $w . '" height="' . $h . '" alt="' . $this->a($altKey) . '"'
            . ($lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"') . '>';
    }

    /** Small decorative line icons, drawn inline (no icon font, no extra request). */
    public static function icon(string $name): string
    {
        $paths = [
            'scale' => '<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M8 9a4 4 0 0 1 8 0"/><path d="M12 9l1.5-2"/>',
            'chart' => '<path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/>',
            'target' => '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6"/>',
            'heart' => '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
            'ruler' => '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
            'trophy' => '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6"/>',
            'mail' => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
            'globe' => '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.5 5.2 3.5 8.5s-1 6.2-3.5 8.5c-2.5-2.3-3.5-5.2-3.5-8.5s1-6.2 3.5-8.5z"/>',
            'lock' => '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2.5"/>',
            'gear' => '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
            'pill' => '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M9.6 8.6l4.8 6.8"/>',
            'tick' => '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
            'calc' => '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h1M11.5 12h1M15 12h1M8 16h1M11.5 16h1M15 16h1"/>',
            'phone' => '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
        ];
        return '<svg class="ico" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" '
            . 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . ($paths[$name] ?? '') . '</svg>';
    }
}

/** The app's ring logo, drawn inline. Decorative: the name is next to it as text. */
const SITE_LOGO = '<svg viewBox="0 0 44 44" aria-hidden="true" focusable="false"><rect width="44" height="44" rx="12" fill="rgba(100,150,200,0.3)"/>'
    . '<circle cx="22" cy="22" r="11" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="7"/>'
    . '<circle cx="22" cy="22" r="11" fill="none" stroke="#64a6d8" stroke-width="7" stroke-linecap="round" stroke-dasharray="52 69" transform="rotate(-90 22 22)"/></svg>';

/** Questions on the FAQ page, in order (keys faq.<name>.q / faq.<name>.a). The first five also show on the home page. */
const SITE_FAQ = ['free', 'glp', 'food', 'signin', 'units', 'lang', 'email', 'past', 'bodyfat', 'scale', 'device', 'data', 'help'];
const SITE_FAQ_HOME = ['free', 'glp', 'food', 'signin', 'data'];

const SITE_GOOGLE = '<svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin" aria-hidden="true" focusable="false">'
    . '<path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>'
    . '<path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>'
    . '<path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>'
    . '<path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/></svg>';
const SITE_MICROSOFT = '<svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin" aria-hidden="true" focusable="false">'
    . '<path fill="#F25022" d="M1 1h7v7H1z"/><path fill="#7FBA00" d="M10 1h7v7h-7z"/><path fill="#00A4EF" d="M1 10h7v7H1z"/><path fill="#FFB900" d="M10 10h7v7h-7z"/></svg>';

/** Published sources linked from the Features page (text in src.<key>). */
const SITE_SOURCES = [
    'dpp' => 'https://www.niddk.nih.gov/about-niddk/research-areas/diabetes/diabetes-prevention-program-dpp',
    'bp' => 'https://doi.org/10.1161/01.HYP.0000094221.86888.ae',
    'osa' => 'https://www.nhs.uk/conditions/sleep-apnoea/',
    'liver' => 'https://www.nhs.uk/conditions/non-alcoholic-fatty-liver-disease/',
    'knee' => 'https://doi.org/10.1001/jama.2013.277669',
    'mood' => 'https://doi.org/10.1038/ijo.2011.2',
    'bmi' => 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight',
    'deur' => 'https://doi.org/10.1079/BJN19910073',
];
