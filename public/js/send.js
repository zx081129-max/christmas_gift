/* global window, document */

const wishCountEl = document.getElementById('wish-count');
const countdownEl = document.getElementById('countdown-value');
const form = document.getElementById('wish-form');
const messageInput = document.getElementById('wish-message');
const countrySelect = document.getElementById('wish-country');
const submitButton = document.getElementById('wish-submit');
const page5Editing = document.getElementById('page-5-editing');
const page5Error = document.getElementById('page-5-error');
const page5Content = document.getElementById('page-5-content');
const messageCounter = document.getElementById('page-5-counter');

let countdownNumberEls = null;
let isSubmitting = false;
let statCountEl = null;
let statCountValue = '';
let statSheenTimer = null;
let phaseWatcherTimer = null;
let lastPhase = null;
let isPhaseTransitioning = false;
const maxMessageLength = 30;

const ISO_COUNTRIES = [
  {
    "code": "AF",
    "name": "Afghanistan"
  },
  {
    "code": "AX",
    "name": "Åland Islands"
  },
  {
    "code": "AL",
    "name": "Albania"
  },
  {
    "code": "DZ",
    "name": "Algeria"
  },
  {
    "code": "AS",
    "name": "American Samoa"
  },
  {
    "code": "AD",
    "name": "Andorra"
  },
  {
    "code": "AO",
    "name": "Angola"
  },
  {
    "code": "AI",
    "name": "Anguilla"
  },
  {
    "code": "AQ",
    "name": "Antarctica"
  },
  {
    "code": "AG",
    "name": "Antigua and Barbuda"
  },
  {
    "code": "AR",
    "name": "Argentina"
  },
  {
    "code": "AM",
    "name": "Armenia"
  },
  {
    "code": "AW",
    "name": "Aruba"
  },
  {
    "code": "AU",
    "name": "Australia"
  },
  {
    "code": "AT",
    "name": "Austria"
  },
  {
    "code": "AZ",
    "name": "Azerbaijan"
  },
  {
    "code": "BS",
    "name": "Bahamas"
  },
  {
    "code": "BH",
    "name": "Bahrain"
  },
  {
    "code": "BD",
    "name": "Bangladesh"
  },
  {
    "code": "BB",
    "name": "Barbados"
  },
  {
    "code": "BY",
    "name": "Belarus"
  },
  {
    "code": "BE",
    "name": "Belgium"
  },
  {
    "code": "BZ",
    "name": "Belize"
  },
  {
    "code": "BJ",
    "name": "Benin"
  },
  {
    "code": "BM",
    "name": "Bermuda"
  },
  {
    "code": "BT",
    "name": "Bhutan"
  },
  {
    "code": "BO",
    "name": "Bolivia"
  },
  {
    "code": "BQ",
    "name": "Bonaire, Sint Eustatius and Saba"
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina"
  },
  {
    "code": "BW",
    "name": "Botswana"
  },
  {
    "code": "BV",
    "name": "Bouvet Island"
  },
  {
    "code": "BR",
    "name": "Brazil"
  },
  {
    "code": "IO",
    "name": "British Indian Ocean Territory"
  },
  {
    "code": "BN",
    "name": "Brunei Darussalam"
  },
  {
    "code": "BG",
    "name": "Bulgaria"
  },
  {
    "code": "BF",
    "name": "Burkina Faso"
  },
  {
    "code": "BI",
    "name": "Burundi"
  },
  {
    "code": "KH",
    "name": "Cambodia"
  },
  {
    "code": "CM",
    "name": "Cameroon"
  },
  {
    "code": "CA",
    "name": "Canada"
  },
  {
    "code": "CV",
    "name": "Cape Verde"
  },
  {
    "code": "KY",
    "name": "Cayman Islands"
  },
  {
    "code": "CF",
    "name": "Central African Republic"
  },
  {
    "code": "TD",
    "name": "Chad"
  },
  {
    "code": "CL",
    "name": "Chile"
  },
  {
    "code": "CX",
    "name": "Christmas Island"
  },
  {
    "code": "CC",
    "name": "Cocos (Keeling) Islands"
  },
  {
    "code": "CO",
    "name": "Colombia"
  },
  {
    "code": "KM",
    "name": "Comoros"
  },
  {
    "code": "CK",
    "name": "Cook Islands"
  },
  {
    "code": "CR",
    "name": "Costa Rica"
  },
  {
    "code": "CI",
    "name": "Cote d'Ivoire"
  },
  {
    "code": "HR",
    "name": "Croatia"
  },
  {
    "code": "CU",
    "name": "Cuba"
  },
  {
    "code": "CW",
    "name": "Curaçao"
  },
  {
    "code": "CY",
    "name": "Cyprus"
  },
  {
    "code": "CZ",
    "name": "Czech Republic"
  },
  {
    "code": "CD",
    "name": "Democratic Republic of the Congo"
  },
  {
    "code": "DK",
    "name": "Denmark"
  },
  {
    "code": "DJ",
    "name": "Djibouti"
  },
  {
    "code": "DM",
    "name": "Dominica"
  },
  {
    "code": "DO",
    "name": "Dominican Republic"
  },
  {
    "code": "EC",
    "name": "Ecuador"
  },
  {
    "code": "EG",
    "name": "Egypt"
  },
  {
    "code": "SV",
    "name": "El Salvador"
  },
  {
    "code": "GQ",
    "name": "Equatorial Guinea"
  },
  {
    "code": "ER",
    "name": "Eritrea"
  },
  {
    "code": "EE",
    "name": "Estonia"
  },
  {
    "code": "SZ",
    "name": "Eswatini"
  },
  {
    "code": "ET",
    "name": "Ethiopia"
  },
  {
    "code": "FK",
    "name": "Falkland Islands (Malvinas)"
  },
  {
    "code": "FO",
    "name": "Faroe Islands"
  },
  {
    "code": "FJ",
    "name": "Fiji"
  },
  {
    "code": "FI",
    "name": "Finland"
  },
  {
    "code": "FR",
    "name": "France"
  },
  {
    "code": "GF",
    "name": "French Guiana"
  },
  {
    "code": "PF",
    "name": "French Polynesia"
  },
  {
    "code": "TF",
    "name": "French Southern Territories"
  },
  {
    "code": "GA",
    "name": "Gabon"
  },
  {
    "code": "GE",
    "name": "Georgia"
  },
  {
    "code": "DE",
    "name": "Germany"
  },
  {
    "code": "GH",
    "name": "Ghana"
  },
  {
    "code": "GI",
    "name": "Gibraltar"
  },
  {
    "code": "GR",
    "name": "Greece"
  },
  {
    "code": "GL",
    "name": "Greenland"
  },
  {
    "code": "GD",
    "name": "Grenada"
  },
  {
    "code": "GP",
    "name": "Guadeloupe"
  },
  {
    "code": "GU",
    "name": "Guam"
  },
  {
    "code": "GT",
    "name": "Guatemala"
  },
  {
    "code": "GG",
    "name": "Guernsey"
  },
  {
    "code": "GN",
    "name": "Guinea"
  },
  {
    "code": "GW",
    "name": "Guinea-Bissau"
  },
  {
    "code": "GY",
    "name": "Guyana"
  },
  {
    "code": "HT",
    "name": "Haiti"
  },
  {
    "code": "HM",
    "name": "Heard Island and McDonald Islands"
  },
  {
    "code": "VA",
    "name": "Holy See (Vatican City State)"
  },
  {
    "code": "HN",
    "name": "Honduras"
  },
  {
    "code": "HK",
    "name": "Hong Kong"
  },
  {
    "code": "HU",
    "name": "Hungary"
  },
  {
    "code": "IS",
    "name": "Iceland"
  },
  {
    "code": "IN",
    "name": "India"
  },
  {
    "code": "ID",
    "name": "Indonesia"
  },
  {
    "code": "IQ",
    "name": "Iraq"
  },
  {
    "code": "IE",
    "name": "Ireland"
  },
  {
    "code": "IR",
    "name": "Islamic Republic of Iran"
  },
  {
    "code": "IM",
    "name": "Isle of Man"
  },
  {
    "code": "IL",
    "name": "Israel"
  },
  {
    "code": "IT",
    "name": "Italy"
  },
  {
    "code": "JM",
    "name": "Jamaica"
  },
  {
    "code": "JP",
    "name": "Japan"
  },
  {
    "code": "JE",
    "name": "Jersey"
  },
  {
    "code": "JO",
    "name": "Jordan"
  },
  {
    "code": "KZ",
    "name": "Kazakhstan"
  },
  {
    "code": "KE",
    "name": "Kenya"
  },
  {
    "code": "KI",
    "name": "Kiribati"
  },
  {
    "code": "XK",
    "name": "Kosovo"
  },
  {
    "code": "KW",
    "name": "Kuwait"
  },
  {
    "code": "KG",
    "name": "Kyrgyzstan"
  },
  {
    "code": "LA",
    "name": "Lao People's Democratic Republic"
  },
  {
    "code": "LV",
    "name": "Latvia"
  },
  {
    "code": "LB",
    "name": "Lebanon"
  },
  {
    "code": "LS",
    "name": "Lesotho"
  },
  {
    "code": "LR",
    "name": "Liberia"
  },
  {
    "code": "LY",
    "name": "Libya"
  },
  {
    "code": "LI",
    "name": "Liechtenstein"
  },
  {
    "code": "LT",
    "name": "Lithuania"
  },
  {
    "code": "LU",
    "name": "Luxembourg"
  },
  {
    "code": "MO",
    "name": "Macao"
  },
  {
    "code": "MG",
    "name": "Madagascar"
  },
  {
    "code": "MW",
    "name": "Malawi"
  },
  {
    "code": "MY",
    "name": "Malaysia"
  },
  {
    "code": "MV",
    "name": "Maldives"
  },
  {
    "code": "ML",
    "name": "Mali"
  },
  {
    "code": "MT",
    "name": "Malta"
  },
  {
    "code": "MH",
    "name": "Marshall Islands"
  },
  {
    "code": "MQ",
    "name": "Martinique"
  },
  {
    "code": "MR",
    "name": "Mauritania"
  },
  {
    "code": "MU",
    "name": "Mauritius"
  },
  {
    "code": "YT",
    "name": "Mayotte"
  },
  {
    "code": "MX",
    "name": "Mexico"
  },
  {
    "code": "FM",
    "name": "Micronesia, Federated States of"
  },
  {
    "code": "MD",
    "name": "Moldova, Republic of"
  },
  {
    "code": "MC",
    "name": "Monaco"
  },
  {
    "code": "MN",
    "name": "Mongolia"
  },
  {
    "code": "ME",
    "name": "Montenegro"
  },
  {
    "code": "MS",
    "name": "Montserrat"
  },
  {
    "code": "MA",
    "name": "Morocco"
  },
  {
    "code": "MZ",
    "name": "Mozambique"
  },
  {
    "code": "MM",
    "name": "Myanmar"
  },
  {
    "code": "NA",
    "name": "Namibia"
  },
  {
    "code": "NR",
    "name": "Nauru"
  },
  {
    "code": "NP",
    "name": "Nepal"
  },
  {
    "code": "NL",
    "name": "Netherlands"
  },
  {
    "code": "NC",
    "name": "New Caledonia"
  },
  {
    "code": "NZ",
    "name": "New Zealand"
  },
  {
    "code": "NI",
    "name": "Nicaragua"
  },
  {
    "code": "NE",
    "name": "Niger"
  },
  {
    "code": "NG",
    "name": "Nigeria"
  },
  {
    "code": "NU",
    "name": "Niue"
  },
  {
    "code": "NF",
    "name": "Norfolk Island"
  },
  {
    "code": "KP",
    "name": "North Korea"
  },
  {
    "code": "MP",
    "name": "Northern Mariana Islands"
  },
  {
    "code": "NO",
    "name": "Norway"
  },
  {
    "code": "OM",
    "name": "Oman"
  },
  {
    "code": "PK",
    "name": "Pakistan"
  },
  {
    "code": "PW",
    "name": "Palau"
  },
  {
    "code": "PA",
    "name": "Panama"
  },
  {
    "code": "PG",
    "name": "Papua New Guinea"
  },
  {
    "code": "PY",
    "name": "Paraguay"
  },
  {
    "code": "CN",
    "name": "People's Republic of China"
  },
  {
    "code": "PE",
    "name": "Peru"
  },
  {
    "code": "PH",
    "name": "Philippines"
  },
  {
    "code": "PN",
    "name": "Pitcairn"
  },
  {
    "code": "PL",
    "name": "Poland"
  },
  {
    "code": "PT",
    "name": "Portugal"
  },
  {
    "code": "PR",
    "name": "Puerto Rico"
  },
  {
    "code": "QA",
    "name": "Qatar"
  },
  {
    "code": "CG",
    "name": "Republic of the Congo"
  },
  {
    "code": "GM",
    "name": "Republic of The Gambia"
  },
  {
    "code": "RE",
    "name": "Reunion"
  },
  {
    "code": "RO",
    "name": "Romania"
  },
  {
    "code": "RU",
    "name": "Russian Federation"
  },
  {
    "code": "RW",
    "name": "Rwanda"
  },
  {
    "code": "BL",
    "name": "Saint Barthélemy"
  },
  {
    "code": "SH",
    "name": "Saint Helena"
  },
  {
    "code": "KN",
    "name": "Saint Kitts and Nevis"
  },
  {
    "code": "LC",
    "name": "Saint Lucia"
  },
  {
    "code": "MF",
    "name": "Saint Martin (French part)"
  },
  {
    "code": "PM",
    "name": "Saint Pierre and Miquelon"
  },
  {
    "code": "VC",
    "name": "Saint Vincent and the Grenadines"
  },
  {
    "code": "WS",
    "name": "Samoa"
  },
  {
    "code": "SM",
    "name": "San Marino"
  },
  {
    "code": "ST",
    "name": "Sao Tome and Principe"
  },
  {
    "code": "SA",
    "name": "Saudi Arabia"
  },
  {
    "code": "SN",
    "name": "Senegal"
  },
  {
    "code": "RS",
    "name": "Serbia"
  },
  {
    "code": "SC",
    "name": "Seychelles"
  },
  {
    "code": "SL",
    "name": "Sierra Leone"
  },
  {
    "code": "SG",
    "name": "Singapore"
  },
  {
    "code": "SX",
    "name": "Sint Maarten (Dutch part)"
  },
  {
    "code": "SK",
    "name": "Slovakia"
  },
  {
    "code": "SI",
    "name": "Slovenia"
  },
  {
    "code": "SB",
    "name": "Solomon Islands"
  },
  {
    "code": "SO",
    "name": "Somalia"
  },
  {
    "code": "ZA",
    "name": "South Africa"
  },
  {
    "code": "GS",
    "name": "South Georgia and the South Sandwich Islands"
  },
  {
    "code": "KR",
    "name": "South Korea"
  },
  {
    "code": "SS",
    "name": "South Sudan"
  },
  {
    "code": "ES",
    "name": "Spain"
  },
  {
    "code": "LK",
    "name": "Sri Lanka"
  },
  {
    "code": "PS",
    "name": "State of Palestine"
  },
  {
    "code": "SD",
    "name": "Sudan"
  },
  {
    "code": "SR",
    "name": "Suriname"
  },
  {
    "code": "SJ",
    "name": "Svalbard and Jan Mayen"
  },
  {
    "code": "SE",
    "name": "Sweden"
  },
  {
    "code": "CH",
    "name": "Switzerland"
  },
  {
    "code": "SY",
    "name": "Syrian Arab Republic"
  },
  {
    "code": "TW",
    "name": "Taiwan, Province of China"
  },
  {
    "code": "TJ",
    "name": "Tajikistan"
  },
  {
    "code": "TH",
    "name": "Thailand"
  },
  {
    "code": "MK",
    "name": "The Republic of North Macedonia"
  },
  {
    "code": "TL",
    "name": "Timor-Leste"
  },
  {
    "code": "TG",
    "name": "Togo"
  },
  {
    "code": "TK",
    "name": "Tokelau"
  },
  {
    "code": "TO",
    "name": "Tonga"
  },
  {
    "code": "TT",
    "name": "Trinidad and Tobago"
  },
  {
    "code": "TN",
    "name": "Tunisia"
  },
  {
    "code": "TR",
    "name": "Türkiye"
  },
  {
    "code": "TM",
    "name": "Turkmenistan"
  },
  {
    "code": "TC",
    "name": "Turks and Caicos Islands"
  },
  {
    "code": "TV",
    "name": "Tuvalu"
  },
  {
    "code": "UG",
    "name": "Uganda"
  },
  {
    "code": "UA",
    "name": "Ukraine"
  },
  {
    "code": "AE",
    "name": "United Arab Emirates"
  },
  {
    "code": "GB",
    "name": "United Kingdom"
  },
  {
    "code": "TZ",
    "name": "United Republic of Tanzania"
  },
  {
    "code": "UM",
    "name": "United States Minor Outlying Islands"
  },
  {
    "code": "US",
    "name": "United States of America"
  },
  {
    "code": "UY",
    "name": "Uruguay"
  },
  {
    "code": "UZ",
    "name": "Uzbekistan"
  },
  {
    "code": "VU",
    "name": "Vanuatu"
  },
  {
    "code": "VE",
    "name": "Venezuela"
  },
  {
    "code": "VN",
    "name": "Vietnam"
  },
  {
    "code": "VG",
    "name": "Virgin Islands, British"
  },
  {
    "code": "VI",
    "name": "Virgin Islands, U.S."
  },
  {
    "code": "WF",
    "name": "Wallis and Futuna"
  },
  {
    "code": "EH",
    "name": "Western Sahara"
  },
  {
    "code": "YE",
    "name": "Yemen"
  },
  {
    "code": "ZM",
    "name": "Zambia"
  },
  {
    "code": "ZW",
    "name": "Zimbabwe"
  }
];

const COUNTRY_NAME_OVERRIDES = {
  CN: 'China'
};

const ISO_COUNTRY_BY_CODE = ISO_COUNTRIES.reduce((acc, item) => {
  acc[item.code] = COUNTRY_NAME_OVERRIDES[item.code] || item.name;
  return acc;
}, {});

function getCountryListWithOverrides() {
  const normalized = ISO_COUNTRIES.map((item) => {
    if (COUNTRY_NAME_OVERRIDES[item.code]) {
      return { ...item, name: COUNTRY_NAME_OVERRIDES[item.code] };
    }
    return item;
  });
  const sorted = normalized.slice().sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return [{ code: 'Christmas Land', name: 'Christmas Land' }, ...sorted];
}

function renderCountryOptions(list, selectedCode) {
  const placeholderText = '你所在的国家 / 地区';
  countrySelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = !selectedCode;
  placeholder.textContent = placeholderText;
  countrySelect.appendChild(placeholder);

  list.forEach(({ code, name }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    if (selectedCode && code === selectedCode) {
      option.selected = true;
    }
    countrySelect.appendChild(option);
  });
}

function initCountrySelect() {
  renderCountryOptions(getCountryListWithOverrides(), '');
}
function ensureCountdownStructure() {
  if (countdownNumberEls) {
    return;
  }
  countdownEl.textContent = '';
  const units = [
    { key: 'days', label: '天' },
    { key: 'hours', label: '小时' },
    { key: 'minutes', label: '分' },
    { key: 'seconds', label: '秒' }
  ];
  countdownNumberEls = {};
  units.forEach((unit, index) => {
    const numberSpan = document.createElement('span');
    numberSpan.className = 'countdown-number';
    numberSpan.dataset.unit = unit.key;
    numberSpan.textContent = '00';

    const unitSpan = document.createElement('span');
    unitSpan.className = 'countdown-unit';
    unitSpan.textContent = unit.label;

    countdownEl.appendChild(numberSpan);
    countdownEl.appendChild(document.createTextNode(' '));
    countdownEl.appendChild(unitSpan);
    if (index < units.length - 1) {
      countdownEl.appendChild(document.createTextNode(' '));
    }

    countdownNumberEls[unit.key] = numberSpan;
  });
}

function updateCountdownDisplay(parts) {
  if (!parts) {
    return;
  }
  ensureCountdownStructure();
  Object.keys(parts).forEach((key) => {
    if (countdownNumberEls[key]) {
      countdownNumberEls[key].textContent = parts[key];
    }
  });
}

function updateCountdownFromPhaseData(data) {
  if (!data || !data.countdown) {
    return;
  }
  updateCountdownDisplay(data.countdown);
}

function startPhaseWatcher() {
  if (phaseWatcherTimer) {
    return;
  }
  const startTransition = () => {
    if (isPhaseTransitioning) {
      return;
    }
    isPhaseTransitioning = true;
    if (phaseWatcherTimer) {
      window.clearInterval(phaseWatcherTimer);
      phaseWatcherTimer = null;
    }
    document.body.classList.add('is-fading-out');
    window.setTimeout(() => {
      window.location.replace('/receive.html');
    }, 3900);
  };
  const poll = async () => {
    try {
      const data = await window.Phase.getPhase();
      updateCountdownFromPhaseData(data);
      if (!lastPhase) {
        lastPhase = data.phase;
      }
      if (lastPhase === 'send' && data.phase === 'receive') {
        startTransition();
        return;
      }
      lastPhase = data.phase;
    } catch (err) {
      // Ignore transient errors while polling.
    }
  };
  poll();
  phaseWatcherTimer = window.setInterval(poll, 1000);
}

function measureDigitHeight(countEl) {
  const styles = window.getComputedStyle(countEl);
  const fontSize = parseFloat(styles.fontSize);
  let lineHeight = parseFloat(styles.lineHeight);
  if (Number.isNaN(lineHeight)) {
    lineHeight = Math.round(fontSize * 1.2);
  }
  const height = Math.round(lineHeight);
  countEl.style.setProperty('--digit-height', `${height}px`);
  countEl.dataset.digitHeight = String(height);
  return height;
}

function setDigitTransform(digitEl, index, animate, delayMs, digitHeight) {
  const strip = digitEl.querySelector('.stat-digit-strip');
  if (!strip) {
    return;
  }
  if (animate) {
    strip.style.transitionDuration = '420ms';
    strip.style.transitionTimingFunction = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    strip.style.transitionDelay = `${delayMs}ms`;
  } else {
    strip.style.transitionDuration = '0ms';
    strip.style.transitionDelay = '0ms';
  }
  strip.style.transform = `translate3d(0, ${-index * digitHeight}px, 0)`;
  digitEl.dataset.index = String(index);
}

function buildStatCount(valueString) {
  const countEl = document.createElement('span');
  countEl.className = 'stat-count';
  countEl.setAttribute('aria-label', valueString);
  const digits = valueString.split('');
  digits.forEach((char) => {
    if (!/\d/.test(char)) {
      const sep = document.createElement('span');
      sep.className = 'stat-sep';
      sep.textContent = char;
      countEl.appendChild(sep);
      return;
    }
    const digitEl = document.createElement('span');
    digitEl.className = 'stat-digit';
    digitEl.dataset.index = char;

    const strip = document.createElement('span');
    strip.className = 'stat-digit-strip';
    for (let i = 0; i < 20; i += 1) {
      const num = document.createElement('span');
      num.className = 'stat-digit-num';
      num.textContent = String(i % 10);
      strip.appendChild(num);
    }
    digitEl.appendChild(strip);
    countEl.appendChild(digitEl);
  });
  return countEl;
}

function renderStatCount(valueString) {
  wishCountEl.innerHTML = '已经有 <span class="stat-count"></span> 句祝福被写下';
  const placeholder = wishCountEl.querySelector('.stat-count');
  const built = buildStatCount(valueString);
  placeholder.replaceWith(built);
  statCountEl = built;
  const digitHeight = measureDigitHeight(statCountEl);
  const digits = statCountEl.querySelectorAll('.stat-digit');
  digits.forEach((digitEl) => {
    const index = Number(digitEl.dataset.index) || 0;
    setDigitTransform(digitEl, index, false, 0, digitHeight);
  });
}

function triggerStatSheen(delayMs) {
  if (!statCountEl) {
    return;
  }
  if (statSheenTimer) {
    window.clearTimeout(statSheenTimer);
  }
  statSheenTimer = window.setTimeout(() => {
    statCountEl.classList.remove('is-sheening');
    void statCountEl.offsetWidth;
    statCountEl.classList.add('is-sheening');
  }, delayMs);
}

function updateStatCount(value) {
  const nextString = String(value);
  if (!statCountEl) {
    statCountValue = nextString;
    renderStatCount(nextString);
    return;
  }
  const prevString = statCountValue || '';
  const maxLen = Math.max(prevString.length, nextString.length);
  const prevPadded = prevString.padStart(maxLen, '0');
  const nextPadded = nextString.padStart(maxLen, '0');

  const existingDigits = statCountEl.querySelectorAll('.stat-digit');
  if (existingDigits.length !== maxLen) {
    renderStatCount(prevPadded);
  }

  const digitHeight = Number(statCountEl.dataset.digitHeight) || measureDigitHeight(statCountEl);
  const digits = Array.from(statCountEl.querySelectorAll('.stat-digit'));
  const changedIndices = [];
  digits.forEach((digitEl, index) => {
    if (prevPadded[index] !== nextPadded[index]) {
      changedIndices.push(index);
    } else {
      const currentIndex = Number(digitEl.dataset.index) || Number(prevPadded[index]) || 0;
      setDigitTransform(digitEl, currentIndex, false, 0, digitHeight);
    }
  });

  const rightToLeft = changedIndices.slice().sort((a, b) => b - a);
  const delayMap = new Map();
  rightToLeft.forEach((index, order) => {
    delayMap.set(index, order * 40);
  });

  digits.forEach((digitEl, index) => {
    const targetDigit = Number(nextPadded[index]);
    if (Number.isNaN(targetDigit)) {
      return;
    }
    let currentIndex = Number(digitEl.dataset.index);
    if (!Number.isFinite(currentIndex)) {
      currentIndex = Number(prevPadded[index]) || 0;
    }
    if (currentIndex >= 10) {
      currentIndex -= 10;
      setDigitTransform(digitEl, currentIndex, false, 0, digitHeight);
    }
    const currentDigit = currentIndex % 10;
    const steps = (targetDigit - currentDigit + 10) % 10;
    if (steps === 0) {
      return;
    }
    const targetIndex = currentIndex + steps;
    const delayMs = delayMap.get(index) || 0;
    setDigitTransform(digitEl, targetIndex, true, delayMs, digitHeight);
  });

  statCountValue = nextString;
  if (changedIndices.length) {
    const maxDelay = Math.max(...changedIndices.map((index) => delayMap.get(index) || 0));
    triggerStatSheen(maxDelay + 440);
  }
}

async function loadStats() {
  const res = await fetch('/api/stats');
  if (!res.ok) {
    wishCountEl.innerHTML = '已经有 <span class="stat-count">...</span> 句祝福被写下';
    statCountEl = null;
    statCountValue = '';
    return;
  }
  const data = await res.json();
  updateStatCount(data.count);
}

function updateSubmitState() {
  submitButton.disabled = isSubmitting;
}

function setSubmittedState() {
  page5Editing.classList.add('is-exiting');
  window.setTimeout(() => {
    page5Editing.remove();
    const submittedEl = document.createElement('div');
    submittedEl.id = 'page-5-submitted';
    submittedEl.className = 'page-5-state page-5-submitted';
    submittedEl.innerHTML = `
      <p class="page-5-success-text">
        我们已经接收到你的祝福。<br />
        谢谢你，把善意留在这里。
      </p>
      <a id="page-5-share" class="page-5-share" href="#">把这个网站分享给别人</a>
    `;
    page5Content.appendChild(submittedEl);
    const shareLink = submittedEl.querySelector('#page-5-share');
    shareLink.addEventListener('click', (event) => {
      event.preventDefault();
      if (window.Slides && typeof window.Slides.goToSlide === 'function') {
        window.Slides.goToSlide(5);
      }
    });
    window.requestAnimationFrame(() => {
      submittedEl.classList.add('is-visible');
    });
    updateSubmitState();
  }, 240);
}

function setSubmittingState(active) {
  isSubmitting = active;
  submitButton.textContent = active ? '提交中…' : '把祝福留在这里';
  updateSubmitState();
}

const WORD_TOKEN_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu;

function getTokenMatches(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return { text: value || '', matches: [] };
  }
  const matches = [];
  for (const match of value.matchAll(WORD_TOKEN_REGEX)) {
    if (typeof match.index === 'number') {
      matches.push({ index: match.index, length: match[0].length });
    }
  }
  return { text: value, matches };
}

function clampMessageLength(value) {
  const { text, matches } = getTokenMatches(value);
  if (matches.length <= maxMessageLength) {
    return value;
  }
  const last = matches[maxMessageLength - 1];
  const endIndex = last.index + last.length;
  return text.slice(0, endIndex);
}

function getMessageLength(value) {
  const { matches } = getTokenMatches(value);
  return matches.length;
}

function updateMessageCounter(value) {
  if (!messageCounter) {
    return;
  }
  const length = getMessageLength(value);
  messageCounter.textContent = `${length} / ${maxMessageLength}`;
  if (maxMessageLength - length <= 5) {
    messageCounter.classList.add('is-near-limit');
  } else {
    messageCounter.classList.remove('is-near-limit');
  }
}

function setError(message) {
  page5Error.textContent = message;
}

function getCanonicalUrl() {
  return window.location.href;
}

function isMobileDevice() {
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
    return navigator.userAgentData.mobile;
  }
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
}

function openAppUrl(appUrl) {
  if (!appUrl || !document.body) {
    return false;
  }
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = appUrl;
  document.body.appendChild(iframe);
  window.setTimeout(() => {
    iframe.remove();
  }, 1000);
  return true;
}

let shareToastEl = null;
let shareToastTimer = null;

function ensureShareToast() {
  if (shareToastEl) {
    return shareToastEl;
  }
  shareToastEl = document.createElement('div');
  shareToastEl.className = 'share-toast';
  document.body.appendChild(shareToastEl);
  return shareToastEl;
}

function showShareToast(message, duration = 1600) {
  const el = ensureShareToast();
  el.textContent = message;
  el.classList.remove('is-visible');
  window.requestAnimationFrame(() => {
    el.classList.add('is-visible');
  });
  if (shareToastTimer) {
    window.clearTimeout(shareToastTimer);
  }
  shareToastTimer = window.setTimeout(() => {
    el.classList.remove('is-visible');
  }, duration);
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    success = false;
  }
  textarea.remove();
  return success;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function showManualCopyPrompt(text) {
  window.prompt('请手动复制链接', text);
}

function getShareTargets(canonicalUrl) {
  const encodedUrl = encodeURIComponent(canonicalUrl);
  return {
    wechat: { copyOnly: true, appUrl: 'weixin://' },
    qq: { copyOnly: true, appUrl: 'mqq://' },
    x: { url: `https://twitter.com/intent/tweet?url=${encodedUrl}` },
    facebook: { url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    instagram: { url: 'https://www.instagram.com/' },
    douyin: { url: 'https://www.douyin.com/' },
    xiaohongshu: { url: 'https://www.xiaohongshu.com/' },
    tiktok: { url: 'https://www.tiktok.com/' },
    whatsapp: { url: `https://wa.me/?text=${encodedUrl}` },
    telegram: { url: `https://t.me/share/url?url=${encodedUrl}` },
    line: { url: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}` }
  };
}

function openShareUrl(url) {
  if (!url) {
    return false;
  }
  return Boolean(window.open(url, '_blank', 'noopener,noreferrer'));
}

function handleShare(platform) {
  const canonicalUrl = getCanonicalUrl();
  const shareTargets = getShareTargets(canonicalUrl);
  const target = shareTargets[platform];
  if (!target) {
    return;
  }
  const isMobile = isMobileDevice();
  const copyPromise = copyToClipboard(canonicalUrl);
  showShareToast('已复制链接', 1600);
  copyPromise.then((copied) => {
    if (!copied) {
      showManualCopyPrompt(canonicalUrl);
    }
  });
  if (isMobile && target.appUrl) {
    openAppUrl(target.appUrl);
    return;
  }
  if (target.url) {
    window.setTimeout(() => {
      openShareUrl(target.url);
    }, 160);
  }
}

function setupShareLinks() {
  const shareLinks = document.querySelectorAll('[data-share]');
  if (!shareLinks.length) {
    return;
  }
  const canonicalUrl = getCanonicalUrl();
  const shareTargets = getShareTargets(canonicalUrl);
  shareLinks.forEach((link) => {
    const platform = link.dataset.share;
    const target = shareTargets[platform];
    if (!target) {
      return;
    }
    if (target.url) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.href = target.url;
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.href = '#';
      link.setAttribute('role', 'button');
    }
    link.addEventListener('click', (event) => {
      event.preventDefault();
      handleShare(platform);
    });
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isSubmitting) {
    return;
  }
  const formData = new FormData(form);
  const payload = {
    message: formData.get('message'),
    name: formData.get('name'),
    country: formData.get('country')
  };

  if (!payload.message || getMessageLength(payload.message) === 0) {
    setError('请先写下一句祝福。');
    return;
  }

  if (getMessageLength(payload.message) > maxMessageLength) {
    setError('祝福内容请控制在 30 字以内。');
    return;
  }

  if (!payload.country) {
    setError('请选择你所在的国家 / 地区。');
    return;
  }

  const selectedCountry = payload.country;
  payload.country = ISO_COUNTRY_BY_CODE[selectedCountry] || selectedCountry;

  setError('');
  setSubmittingState(true);
  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    setError('提交失败，请稍后再试。');
    setSubmittingState(false);
    return;
  }

  setSubmittingState(false);
  setSubmittedState();
  await loadStats();
});

messageInput.addEventListener('input', (event) => {
  const value = clampMessageLength(event.target.value);
  if (value !== event.target.value) {
    event.target.value = value;
  }
  updateMessageCounter(event.target.value);
  if (page5Error.textContent) {
    setError('');
  }
});

countrySelect.addEventListener('change', () => {
  if (page5Error.textContent) {
    setError('');
  }
});
updateSubmitState();
updateMessageCounter(messageInput.value || '');
initCountrySelect();
setupShareLinks();

(async () => {
  try {
    const phaseData = await window.Phase.requirePhase('send');
    if (!phaseData) {
      return;
    }
    lastPhase = phaseData.phase;
    updateCountdownFromPhaseData(phaseData);
    startPhaseWatcher();
    await loadStats();
  } catch (err) {
    wishCountEl.innerHTML = '已经有 <span class="stat-count">...</span> 句祝福被写下';
    countdownEl.textContent = '...';
  }
})();
