// src/index.js

/**
 * Converts a string from half-width ASCII to full-width ASCII.
 * @param {string} str - The input string to convert.
 * @returns {string} The converted string in full-width ASCII.
 */
function toFullWidthAscii(str = "") {
  return String(str)
    .replace(/ /g, "\u3000")
    .replace(/[\u0021-\u007E]/g, (ch) => {
      return String.fromCharCode(ch.charCodeAt(0) - 0x20 + 0xff00);
    });
}

/**
 * Converts a string from full-width ASCII to half-width ASCII.
 * @param {string} str - The input string to convert.
 * @returns {string} The converted string in half-width ASCII.
 */
function toHalfWidthAscii(str = "") {
  return String(str)
    .replace(/\u3000/g, " ")
    .replace(/[\uFF01-\uFF5E]/g, (ch) => {
      return String.fromCharCode(ch.charCodeAt(0) - 0xff00 + 0x20);
    });
}

// -------------------------- Halfwidth Kana <-> Fullwidth Katakana --------------------------

// Comprehensive mapping for halfwidth katakana U+FF66..U+FF9D etc.
const HW_KATA = [
  "ｦ",
  "ｧ",
  "ｨ",
  "ｩ",
  "ｪ",
  "ｫ",
  "ｬ",
  "ｭ",
  "ｮ",
  "ｯ",
  "ｰ",
  "ｱ",
  "ｲ",
  "ｳ",
  "ｴ",
  "ｵ",
  "ｶ",
  "ｷ",
  "ｸ",
  "ｹ",
  "ｺ",
  "ｻ",
  "ｼ",
  "ｽ",
  "ｾ",
  "ｿ",
  "ﾀ",
  "ﾁ",
  "ﾂ",
  "ﾃ",
  "ﾄ",
  "ﾅ",
  "ﾆ",
  "ﾇ",
  "ﾈ",
  "ﾉ",
  "ﾊ",
  "ﾋ",
  "ﾌ",
  "ﾍ",
  "ﾎ",
  "ﾏ",
  "ﾐ",
  "ﾑ",
  "ﾒ",
  "ﾓ",
  "ﾔ",
  "ﾕ",
  "ﾖ",
  "ﾗ",
  "ﾘ",
  "ﾙ",
  "ﾚ",
  "ﾛ",
  "ﾜ",
  "ﾝ",
  "ﾞ",
  "ﾟ",
];
const FW_KATA = [
  "ヲ",
  "ァ",
  "ィ",
  "ゥ",
  "ェ",
  "ォ",
  "ャ",
  "ュ",
  "ョ",
  "ッ",
  "ー",
  "ア",
  "イ",
  "ウ",
  "エ",
  "オ",
  "カ",
  "キ",
  "ク",
  "ケ",
  "コ",
  "サ",
  "シ",
  "ス",
  "セ",
  "ソ",
  "タ",
  "チ",
  "ツ",
  "テ",
  "ト",
  "ナ",
  "ニ",
  "ヌ",
  "ネ",
  "ノ",
  "ハ",
  "ヒ",
  "フ",
  "ヘ",
  "ホ",
  "マ",
  "ミ",
  "ム",
  "メ",
  "モ",
  "ヤ",
  "ユ",
  "ヨ",
  "ラ",
  "リ",
  "ル",
  "レ",
  "ロ",
  "ワ",
  "ン",
  "゛",
  "゜",
];

const HW_TO_FW_KATA = {};
const FW_TO_HW_KATA = {};
for (let i = 0; i < HW_KATA.length; i++) {
  HW_TO_FW_KATA[HW_KATA[i]] = FW_KATA[i];
  FW_TO_HW_KATA[FW_KATA[i]] = HW_KATA[i];
}

/**
 * Converts half-width katakana (with optional dakuten/handakuten markers ﾞ/ﾟ)
 * to full-width katakana. Handles sokuon sequences like ｯ + consonant -> small tsu.
 * @param {string} str - The input string in half-width katakana.
 * @returns {string} The converted string in full-width katakana.
 */
function toFullWidthKanaFromHalf(str = "") {
  if (!str) return "";
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const next = str[i + 1];
    if ((next === "ﾞ" || next === "ﾟ") && HW_TO_FW_KATA[ch]) {
      const base = HW_TO_FW_KATA[ch];
      let combined = base;
      if (next === "ﾞ") {
        combined = VOICED_MAP[base] || base + "\u3099"; // combining dakuten as fallback
      } else {
        combined = SEMI_VOICED_MAP[base] || base + "\u309A";
      }
      out += combined;
      i++; // skip marker
      continue;
    }
    if (HW_TO_FW_KATA[ch]) {
      out += HW_TO_FW_KATA[ch];
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Converts full-width katakana to half-width katakana, using dakuten/handakuten mapping where necessary.
 * @param {string} str - The input string in full-width katakana.
 * @returns {string} The converted string in half-width katakana.
 */
function toHalfWidthKanaFromFull(str = "") {
  if (!str) return "";
  let out = "";
  for (const ch of str) {
    if (VOICED_DECOMP[ch]) {
      const [base, marker] = VOICED_DECOMP[ch];
      out += FW_TO_HW_KATA[base] || base;
      out += marker;
      continue;
    }
    out += FW_TO_HW_KATA[ch] || ch;
  }
  return out;
}

// -------------------------- Unicode normalization --------------------------

/**
 * Normalizes the Unicode representation of a string.
 * @param {string} str - The input string to normalize.
 * @param {string} form - The normalization form (NFC, NFD, NFKC, NFKD).
 * @returns {string} The normalized string.
 */
function normalizeUnicode(str = "", form = "NFC") {
  if (!str || typeof str !== "string") return str;
  const allowed = ["NFC", "NFD", "NFKC", "NFKD"];
  if (!allowed.includes(form)) form = "NFC";
  return str.normalize(form);
}

// -------------------------- Space normalization --------------------------

/**
 * Normalizes spaces in a string, converting between full-width and half-width spaces.
 * @param {string} str - The input string to normalize spaces.
 * @param {string} to - The target space type ('full' or 'half').
 * @returns {string} The string with normalized spaces.
 */
function normalizeSpaces(str = "", to = "half") {
  if (to === "full") {
    return String(str)
      .replace(/ /g, "\u3000")
      .replace(/\u00A0/g, "\u3000");
  } else {
    return String(str)
      .replace(/\u3000/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

// -------------------------- Kana conversions (hiragana <-> katakana) --------------------------

/**
 * Converts katakana characters to hiragana.
 * @param {string} str - The input string in katakana.
 * @returns {string} The converted string in hiragana.
 */
function kanaToHiragana(str = "") {
  return String(str).replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Converts hiragana characters to katakana.
 * @param {string} str - The input string in hiragana.
 * @returns {string} The converted string in katakana.
 */
function kanaToKatakana(str = "") {
  return String(str).replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// -------------------------- Romaji -> Katakana (Hepburn-style, greedy) --------------------------

/**
 * Converts romaji (Latin script) to katakana.
 * @param {string} input - The input string in romaji.
 * @returns {string} The converted string in katakana.
 */
function romajiToKatakana(input = "") {
  if (!input) return "";
  let s = String(input)
    .toLowerCase()
    .replace(/[^a-zA-Z\-ʼ'ʼʹāēīōūâêîôû0-9\s]/g, ""); // remove punctuation except dash and diacritics
  s = s
    .replace(/ā/g, "aa")
    .replace(/ē/g, "ee")
    .replace(/ī/g, "ii")
    .replace(/ō/g, "ou")
    .replace(/ū/g, "uu");
  s = s.trim().replace(/\s+/g, " ");
  let out = "";
  for (let i = 0; i < s.length; ) {
    if (s[i] === " ") {
      out += " ";
      i++;
      continue;
    }
    if (
      i + 1 < s.length &&
      s[i] === s[i + 1] &&
      /[bcdfghjklmnpqrstvwxyz]/.test(s[i])
    ) {
      if (s[i] === "n") {
        out += "ン";
        i++;
        continue;
      }
      out += "ッ";
      i++;
      continue;
    }
    if (s[i] === "n") {
      const next = s[i + 1] || "";
      if (next === "'" || next === "ʼ" || next === " " || next === "") {
        out += "ン";
        i += next === "'" || next === "ʼ" ? 2 : 1;
        continue;
      }
      if (/[aiueoyt]/.test(next)) {
      } else {
        out += "ン";
        i++;
        continue;
      }
    }
    let matched = false;
    for (const k of ROMAJI_KEYS) {
      if (s.substring(i, i + k.length) === k) {
        out += ROMAJI_MAP[k];
        i += k.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    if (s[i] === "-" || s[i] === "ー") {
      out += "ー";
      i++;
      continue;
    }
    if (/[aiueo]/.test(s[i])) {
      out += ROMAJI_MAP[s[i]] || "";
      i++;
    } else {
      i++;
    }
  }
  return out;
}

// -------------------------- Date / Era parsing and formatting --------------------------

const ERA_BASES = {
  令和: 2018, // Reiwa year 1 = 2019 -> base 2018 + n = actual year
  平成: 1988, // Heisei 1 = 1989
  昭和: 1925, // Showa 1 = 1926
  大正: 1911,
  明治: 1867,
};

/**
 * Parses a date string in various formats to an ISO date string (YYYY-MM-DD).
 * @param {string} s - The input date string.
 * @returns {string|null} The parsed ISO date string or null if parsing fails.
 */
function parseJapaneseEraDate(s) {
  if (!s) return null;
  s = String(s).trim();
  const isoLike = s.replace(/\//g, "-").replace(/\./g, "-");
  const m = isoLike.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const y = Number(m[1]),
      mm = String(Number(m[2])).padStart(2, "0"),
      dd = String(Number(m[3])).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }
  const jp = s.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (jp) {
    const y = jp[1],
      mm = String(Number(jp[2])).padStart(2, "0"),
      dd = String(Number(jp[3])).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }
  const era = s.match(
    /^(令和|平成|昭和|大正|明治)(\d{1,2})年(\d{1,2})月(\d{1,2})日$/
  );
  if (era) {
    const base = ERA_BASES[era[1]];
    if (base) {
      const y = base + Number(era[2]);
      const mm = String(Number(era[3])).padStart(2, "0"),
        dd = String(Number(era[4])).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    }
  }
  const d = new Date(s);
  if (!isNaN(d.valueOf())) {
    const y = d.getFullYear(),
      mm = String(d.getMonth() + 1).padStart(2, "0"),
      dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }
  return null;
}

/**
 * Formats a date input into a specified format.
 * @param {Date|string} dateInput - The date input (Date object or ISO string).
 * @param {Object} options - Formatting options.
 * @param {string} options.format - The desired output format ('iso', 'jp', 'era').
 * @param {boolean} options.eraShort - Whether to use short era names.
 * @returns {string|null} The formatted date string or null if input is invalid.
 */
function formatJapaneseDate(
  dateInput,
  options = { format: "iso", eraShort: true }
) {
  let iso;
  if (dateInput instanceof Date) {
    iso = `${dateInput.getFullYear()}-${String(
      dateInput.getMonth() + 1
    ).padStart(2, "0")}-${String(dateInput.getDate()).padStart(2, "0")}`;
  } else {
    iso = parseJapaneseEraDate(String(dateInput));
  }
  if (!iso) return null;
  if (options.format === "iso") return iso;
  const [y, m, d] = iso.split("-");
  if (options.format === "jp") return `${y}年${Number(m)}月${Number(d)}日`;
  if (options.format === "era") {
    const yearNum = Number(y);
    const eras = Object.keys(ERA_BASES);
    for (const e of eras) {
      const base = ERA_BASES[e];
      const eraYear = yearNum - base;
      if (eraYear >= 1) {
        return `${e}${eraYear}年${Number(m)}月${Number(d)}日`;
      }
    }
    return `${y}年${Number(m)}月${Number(d)}日`;
  }
  return iso;
}

export {
  toFullWidthAscii,
  toHalfWidthAscii,
  toFullWidthKanaFromHalf,
  toHalfWidthKanaFromFull,
  normalizeUnicode,
  normalizeSpaces,
  kanaToHiragana,
  kanaToKatakana,
  romajiToKatakana,
  parseJapaneseEraDate,
  formatJapaneseDate,
};
