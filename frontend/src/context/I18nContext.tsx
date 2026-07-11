import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'am' | 'om';

type Dict = Record<string, string>;

const en: Dict = {
  // Nav
  'nav.home': 'Home',
  'nav.listings': 'Listings',
  'nav.messages': 'Messages',
  'nav.post': 'Post',
  'nav.more': 'More',
  'nav.saved': 'Saved',
  'nav.dashboard': 'Dashboard',
  'nav.login': 'Login',
  'nav.register': 'Register',
  'nav.logout': 'Log out',
  'nav.menu': 'Menu',
  'nav.language': 'Language',

  // Hero / home
  'hero.title': 'Find homes for rent in Ethiopia',
  'hero.subtitle': 'Discover apartments, houses, and studios across Ethiopian cities.',
  'hero.cta': 'View listings',
  'hero.searchPlaceholder': 'Location, price, property type…',

  // Common
  'common.email': 'Email',
  'common.password': 'Password',
  'common.phone': 'Phone',
  'common.fullName': 'Full name',
  'common.continue': 'Continue',
  'common.loading': 'Please wait…',
  'common.tryAgain': 'Something went wrong. Try again.',
  'common.hidePassword': 'Hide password',
  'common.showPassword': 'Show password',

  // Login
  'login.title': 'Welcome back',
  'login.subtitle': 'Sign in to continue',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in…',
  'login.forgot': 'Forgot password?',
  'login.noAccount': 'No account yet?',
  'login.createOne': 'Create one',
  'login.invalidEmail': 'Enter a valid email address.',
  'login.enterPassword': 'Enter your password.',
  'login.welcomeBack': 'Welcome back, {name}!',
  'login.failed': 'Could not sign in',

  // Register
  'register.title': 'Create your account',
  'register.subtitle': 'Sign up to save homes and message owners',
  'register.submit': 'Sign up',
  'register.submitting': 'Creating account…',
  'register.hasAccount': 'Already have an account?',
  'register.signIn': 'Sign in',
  'register.roleLegend': 'How will you use YENE BET?',
  'register.roleRenter': "I'm looking for a place",
  'register.roleOwner': "I'm listing my property",
  'register.confirmPassword': 'Confirm password',
  'register.passwordHint': 'At least 8 characters',
  'register.repeatPassword': 'Repeat password',
  'register.passwordMismatch': 'Passwords do not match',
  'register.passwordShort': 'Password must be at least 8 characters',
  'register.invalidPhone': 'Enter a valid phone number (at least 9 digits).',
  'register.failed': 'Could not create account',
  'register.success': 'Account created!',
  'register.successTitle': 'Account created',
  'register.successBody':
    'Check your email for the verification code, or continue to the app if email is not configured.',
  'register.enterCode': 'Enter verification code',
  'register.continueApp': 'Continue to app',
  'register.namePlaceholder': 'Your full name',

  // Verify email
  'verify.title': 'Verify your email',
  'verify.subtitle':
    'If email is configured, enter the code from your inbox. If you never received a code, use Resend / unlock account, then sign in.',
  'verify.code': 'Verification code',
  'verify.codePlaceholder': '6-digit code (if you received one)',
  'verify.submit': 'Verify',
  'verify.verifying': 'Verifying…',
  'verify.resend': 'Resend / unlock account',
  'verify.working': 'Working…',
  'verify.success': 'Your email is verified.',
  'verify.continueLogin': 'Continue to sign in',
  'verify.backLogin': 'Back to sign in',
  'verify.enterEmailFirst': 'Enter your email first.',

  // Forgot password
  'forgot.title': 'Forgot password',
  'forgot.subtitle': "We'll email reset instructions if an account exists for that address.",
  'forgot.submit': 'Send reset link',
  'forgot.submitting': 'Sending…',
  'forgot.sentTitle': 'Check your email',
  'forgot.sentBody':
    'If an account exists for that email, you will receive password reset instructions shortly.',
  'forgot.backLogin': 'Back to sign in',
};

const am: Dict = {
  ...en,
  'nav.home': 'መነሻ',
  'nav.listings': 'ዝርዝሮች',
  'nav.messages': 'መልዕክቶች',
  'nav.post': 'ለጥፍ',
  'nav.more': 'ተጨማሪ',
  'nav.saved': 'የተቀመጡ',
  'nav.dashboard': 'ዳሽቦርድ',
  'nav.login': 'ግባ',
  'nav.register': 'ተመዝገብ',
  'nav.logout': 'ውጣ',
  'nav.menu': 'ምናሌ',
  'nav.language': 'ቋንቋ',

  'hero.title': 'በኢትዮጵያ የሚከራዩ ቤቶች ያግኙ',
  'hero.subtitle': 'በአዲስ አበባ እና በሌሎች ከተሞች አፓርታማ፣ ቤት እና ስቱዲዮ ያግኙ።',
  'hero.cta': 'ዝርዝሮችን ይመልከቱ',
  'hero.searchPlaceholder': 'ቦታ፣ ዋጋ፣ የቤት አይነት…',

  'common.email': 'ኢሜይል',
  'common.password': 'የይለፍ ቃል',
  'common.phone': 'ስልክ',
  'common.fullName': 'ሙሉ ስም',
  'common.continue': 'ቀጥል',
  'common.loading': 'እባክዎ ይጠብቁ…',
  'common.tryAgain': 'ችግር ተፈጥሯል። እንደገና ይሞክሩ።',
  'common.hidePassword': 'የይለፍ ቃል ደብቅ',
  'common.showPassword': 'የይለፍ ቃል አሳይ',

  'login.title': 'እንኳን ደህና መጡ',
  'login.subtitle': 'ለመቀጠል ይግቡ',
  'login.submit': 'ግባ',
  'login.submitting': 'በመግባት ላይ…',
  'login.forgot': 'የይለፍ ቃል ረሱ?',
  'login.noAccount': 'መለያ የለዎትም?',
  'login.createOne': 'ይፍጠሩ',
  'login.invalidEmail': 'ትክክለኛ ኢሜይል ያስገቡ።',
  'login.enterPassword': 'የይለፍ ቃልዎን ያስገቡ።',
  'login.welcomeBack': 'እንኳን ደህና መጡ፣ {name}!',
  'login.failed': 'መግባት አልተቻለም',

  'register.title': 'መለያ ይፍጠሩ',
  'register.subtitle': 'ቤቶችን ለማስቀመጥ እና ከባለቤቶች ጋር ለመነጋገር ይመዝገቡ',
  'register.submit': 'ተመዝገብ',
  'register.submitting': 'መለያ በመፍጠር ላይ…',
  'register.hasAccount': 'መለያ አለዎት?',
  'register.signIn': 'ግባ',
  'register.roleLegend': 'YENE BETን እንዴት ይጠቀማሉ?',
  'register.roleRenter': 'ቤት እፈልጋለሁ',
  'register.roleOwner': 'ንብረቴን እዘረዝራለሁ',
  'register.confirmPassword': 'የይለፍ ቃል አረጋግጥ',
  'register.passwordHint': 'ቢያንስ 8 ቁምፊዎች',
  'register.repeatPassword': 'የይለፍ ቃል ድገም',
  'register.passwordMismatch': 'የይለፍ ቃላት አይዛመዱም',
  'register.passwordShort': 'የይለፍ ቃል ቢያንስ 8 ቁምፊ መሆን አለበት',
  'register.invalidPhone': 'ትክክለኛ ስልክ ቁጥር ያስገቡ (ቢያንስ 9 አሃዞች)።',
  'register.failed': 'መለያ መፍጠር አልተቻለም',
  'register.success': 'መለያ ተፈጥሯል!',
  'register.successTitle': 'መለያ ተፈጥሯል',
  'register.successBody': 'የማረጋገጫ ኮድ ለኢሜይልዎ ተልኳል፣ ወይም ወደ መተግበሪያው ይቀጥሉ።',
  'register.enterCode': 'የማረጋገጫ ኮድ ያስገቡ',
  'register.continueApp': 'ወደ መተግበሪያው ቀጥል',
  'register.namePlaceholder': 'ሙሉ ስምዎ',

  'verify.title': 'ኢሜይልዎን ያረጋግጡ',
  'verify.subtitle':
    'ኮድ ከደረሰዎት ያስገቡ። ካልደረሰዎት «እንደገና ላክ / መለያ ክፈት»ን ይጠቀሙ፣ ከዚያ ይግቡ።',
  'verify.code': 'የማረጋገጫ ኮድ',
  'verify.codePlaceholder': '6 አሃዝ ኮድ',
  'verify.submit': 'አረጋግጥ',
  'verify.verifying': 'በማረጋገጥ ላይ…',
  'verify.resend': 'እንደገና ላክ / መለያ ክፈት',
  'verify.working': 'በሥራ ላይ…',
  'verify.success': 'ኢሜይልዎ ተረጋግጧል።',
  'verify.continueLogin': 'ወደ መግቢያ ቀጥል',
  'verify.backLogin': 'ወደ መግቢያ ተመለስ',
  'verify.enterEmailFirst': 'መጀመሪያ ኢሜይልዎን ያስገቡ።',

  'forgot.title': 'የይለፍ ቃል ረሳሁ',
  'forgot.subtitle': 'መለያ ካለ፣ የማደስ መመሪያ ወደ ኢሜይል ይላካል።',
  'forgot.submit': 'የማደስ አገናኝ ላክ',
  'forgot.submitting': 'በመላክ ላይ…',
  'forgot.sentTitle': 'ኢሜይልዎን ይመልከቱ',
  'forgot.sentBody': 'መለያ ካለ፣ የይለፍ ቃል ማደስ መመሪያ በቅርቡ ይደርስዎታል።',
  'forgot.backLogin': 'ወደ መግቢያ ተመለስ',
};

/** Afaan Oromoo */
const om: Dict = {
  ...en,
  'nav.home': 'Mana',
  'nav.listings': 'Tarreewwan',
  'nav.messages': 'Ergaawwan',
  'nav.post': 'Maxxansi',
  'nav.more': 'Dabalata',
  'nav.saved': 'Kuufaman',
  'nav.dashboard': 'Daashboordii',
  'nav.login': 'Seeni',
  'nav.register': 'Galmaa’i',
  'nav.logout': 'Ba’i',
  'nav.menu': 'Meenuu',
  'nav.language': 'Afaan',

  'hero.title': 'Mana kireeffachuu Itoophiyaa keessatti argadhu',
  'hero.subtitle': 'Apaartaamaa, mana fi istuudiyoo magaalaalee Itoophiyaa keessatti argadhu.',
  'hero.cta': 'Tarreewwan ilaali',
  'hero.searchPlaceholder': 'Bakka, gatii, gosa mana…',

  'common.email': 'Imeelii',
  'common.password': 'Jecha iccitii',
  'common.phone': 'Bilbilaa',
  'common.fullName': 'Maqaa guutuu',
  'common.continue': 'Itti fufi',
  'common.loading': 'Maaloo eegi…',
  'common.tryAgain': 'Rakkoo uumameera. Deebi’ii yaali.',
  'common.hidePassword': 'Jecha iccitii dhoksi',
  'common.showPassword': 'Jecha iccitii agarsiisi',

  'login.title': 'Baga nagaan deebitan',
  'login.subtitle': 'Itti fufuuf seeni',
  'login.submit': 'Seeni',
  'login.submitting': 'Seenaa jira…',
  'login.forgot': 'Jecha iccitii dagattanii?',
  'login.noAccount': 'Akkaawuntii hin qabduu?',
  'login.createOne': 'Tokko uumi',
  'login.invalidEmail': 'Imeelii sirrii galchi.',
  'login.enterPassword': 'Jecha iccitii kee galchi.',
  'login.welcomeBack': 'Baga nagaan deebitan, {name}!',
  'login.failed': 'Seenuu hin dandeenye',

  'register.title': 'Akkaawuntii kee uumi',
  'register.subtitle': 'Mana kuufachuu fi qabeenyota waliin haasa’uuf galmaa’i',
  'register.submit': 'Galmaa’i',
  'register.submitting': 'Akkaawuntii uumaa jira…',
  'register.hasAccount': 'Akkaawuntii qabdaa?',
  'register.signIn': 'Seeni',
  'register.roleLegend': 'YENE BET akkamitti fayyadamta?',
  'register.roleRenter': 'Mana barbaada',
  'register.roleOwner': 'Qabeenya koo tarreessa',
  'register.confirmPassword': 'Jecha iccitii mirkaneessi',
  'register.passwordHint': 'Yoo xiqqaate arfiilee 8',
  'register.repeatPassword': 'Jecha iccitii irra deebi’i',
  'register.passwordMismatch': 'Jechoota iccitii wal hin simatan',
  'register.passwordShort': 'Jecha iccitii yoo xiqqaate arfiilee 8 ta’uu qaba',
  'register.invalidPhone': 'Lakkoofsa bilbilaa sirrii galchi (yoo xiqqaate 9).',
  'register.failed': 'Akkaawuntii uumuu hin dandeenye',
  'register.success': 'Akkaawuntii uumameera!',
  'register.successTitle': 'Akkaawuntii uumameera',
  'register.successBody':
    'Koodii mirkaneessaa imeelii keetti ilaali, yookiin yoo imeelii hin jirre gara appitti itti fufi.',
  'register.enterCode': 'Koodii mirkaneessaa galchi',
  'register.continueApp': 'Gara appitti itti fufi',
  'register.namePlaceholder': 'Maqaa kee guutuu',

  'verify.title': 'Imeelii kee mirkaneessi',
  'verify.subtitle':
    'Koodiin yoo sii qaqqabe galchi. Hin arganne taanaan “Irra deebi’ii ergi / ban” fayyadami, sana booda seeni.',
  'verify.code': 'Koodii mirkaneessaa',
  'verify.codePlaceholder': 'Koodii digirii 6',
  'verify.submit': 'Mirkaneessi',
  'verify.verifying': 'Mirkaneessaa jira…',
  'verify.resend': 'Irra deebi’ii ergi / akkaawuntii bani',
  'verify.working': 'Hojjechaa jira…',
  'verify.success': 'Imeelii kee mirkanaa’eera.',
  'verify.continueLogin': 'Gara seenutti itti fufi',
  'verify.backLogin': 'Gara seenutti deebi’i',
  'verify.enterEmailFirst': 'Dura imeelii kee galchi.',

  'forgot.title': 'Jecha iccitii dagadhe',
  'forgot.subtitle': 'Akkaawuntii yoo jiraate qajeelfama haaromsuu imeelii dhaan ni ergina.',
  'forgot.submit': 'Linkii haaromsuu ergi',
  'forgot.submitting': 'Ergaa jira…',
  'forgot.sentTitle': 'Imeelii kee ilaali',
  'forgot.sentBody':
    'Akkaawuntii yoo jiraate, qajeelfama jecha iccitii haaromsuu yeroo dhihootti ni argatta.',
  'forgot.backLogin': 'Gara seenutti deebi’i',
};

const LOCALES: Record<Locale, Dict> = { en, am, om };

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
} | null>(null);

const STORAGE_KEY = 'houserental_locale';

function isLocale(v: string | null): v is Locale {
  return v === 'en' || v === 'am' || v === 'om';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const s = localStorage.getItem(STORAGE_KEY);
    return isLocale(s) ? s : 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'om' ? 'om' : locale;
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const table = LOCALES[locale];
      let text = table[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Compact language select for nav / auth pages */
export function LanguageSelect({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">{t('nav.language')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="bg-transparent text-xs sm:text-sm font-medium text-brandNavy dark:text-slate-200 py-1.5 pr-6 rounded-lg border border-border/60 dark:border-slate-600 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
        aria-label={t('nav.language')}
      >
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
        <option value="om">Afaan Oromoo</option>
      </select>
    </label>
  );
}
