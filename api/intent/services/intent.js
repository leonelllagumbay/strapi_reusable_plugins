'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const step2list = {
  ational: 'ate',
  tional: 'tion',
  enci: 'ence',
  anci: 'ance',
  izer: 'ize',
  bli: 'ble',
  alli: 'al',
  entli: 'ent',
  eli: 'e',
  ousli: 'ous',
  ization: 'ize',
  ation: 'ate',
  ator: 'ate',
  alism: 'al',
  iveness: 'ive',
  fulness: 'ful',
  ousness: 'ous',
  aliti: 'al',
  iviti: 'ive',
  biliti: 'ble',
  logi: 'log'
};
const step3list = {
  icate: 'ic',
  ative: '',
  alize: 'al',
  iciti: 'ic',
  ical: 'ic',
  ful: '',
  ness: ''
},
  c = '[^aeiou]',          // consonant
  v = '[aeiouy]',          // vowel
  C = c + '[^aeiouy]*',    // consonant sequence
  V = v + '[aeiou]*',      // vowel sequence
  mgr0 = '^(' + C + ')?' + V + C,               // [C]VC... is m>0
  meq1 = '^(' + C + ')?' + V + C + '(' + V + ')?$',  // [C]VC[V] is m=1
  mgr1 = '^(' + C + ')?' + V + C + V + C,       // [C]VCVC... is m>1
  sV = '^(' + C + ')?' + v;                   // vowel in stem

const reMgr0 = new RegExp(mgr0);
const reMgr1 = new RegExp(mgr1);
const reMeq1 = new RegExp(meq1);
const reSV = new RegExp(sV);
const reA1a = /^(.+?)(ss|i)es$/;
const re2A1a = /^(.+?)([^s])s$/;
const reB1b = /^(.+?)eed$/;
const re2B1b = /^(.+?)(ed|ing)$/;
const reB1bB2 = /.$/;
const re2B1bB2 = /(at|bl|iz)$/;
const re3x1bx2 = new RegExp('([^aeiouylsz])\\1$');
const re4x1bx2 = new RegExp('^" + C + v + "[^aeiouwxy]$');
const rex1c = /^(.+?[^aeiou])y$/;
const rex2 =
  // tslint:disable-next-line: max-line-length
  /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
const rex3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
const rex4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
const re2x4 = /^(.+?)(s|t)(ion)$/;
const rex5 = /^(.+?)e$/;
const rex5x1 = /ll$/;
const re3x5 = new RegExp('^" + C + v + "[^aeiouwxy]$');


const stemmer = (w) => {
  let stem,
    suffix,
    firstch,
    re,
    re2,
    re3,
    re4;
  if (w.length < 3) { return w; }
  firstch = w.substr(0, 1);
  if (firstch === 'y') {
    w = firstch.toUpperCase() + w.substr(1);
  }
  // Step 1a
  re = reA1a;
  re2 = re2A1a;
  if (re.test(w)) {
    w = w.replace(re, '$1$2');
  } else if (re2.test(w)) {
    w = w.replace(re2, '$1$2');
  }
  // Step 1b
  re = reB1b;
  re2 = re2B1b;
  if (re.test(w)) {
    const fp = re.exec(w);
    re = reMgr0;
    if (re.test(fp[1])) {
      re = reB1bB2;
      w = w.replace(re, '');
    }
  } else if (re2.test(w)) {
    const fp = re2.exec(w);
    stem = fp[1];
    re2 = reSV;
    if (re2.test(stem)) {
      w = stem;
      re2 = re2B1bB2;
      re3 = re3x1bx2;
      re4 = re4x1bx2;
      if (re2.test(w)) {
        w = w + 'e';
      } else if (re3.test(w)) {
        re = reB1bB2; w = w.replace(re, '');
      } else if (re4.test(w)) {
        w = w + 'e';
      }
    }
  }

  // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is
  // not the first letter of the word (so cry -> cri, by -> by, say -> say)
  re = rex1c;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp[1];
    w = stem + 'i';
  }
  // Step 2
  re = rex2;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp[1];
    suffix = fp[2];
    re = reMgr0;
    if (re.test(stem)) {
      w = stem + step2list[suffix];
    }
  }
  // Step 3
  re = rex3;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp[1];
    suffix = fp[2];
    re = reMgr0;
    if (re.test(stem)) {
      w = stem + step3list[suffix];
    }
  }
  // Step 4
  re = rex4;
  re2 = re2x4;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp[1];
    re = reMgr1;
    if (re.test(stem)) {
      w = stem;
    }
  } else if (re2.test(w)) {
    const fp = re2.exec(w);
    stem = fp[1] + fp[2];
    re2 = reMgr1;
    if (re2.test(stem)) {
      w = stem;
    }
  }
  // Step 5
  re = rex5;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp[1];
    re = reMgr1;
    re2 = reMeq1;
    re3 = re3x5;
    if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
      w = stem;
    }
  }
  re = rex5x1;
  re2 = reMgr1;
  if (re.test(w) && re2.test(w)) {
    re = reB1bB2;
    w = w.replace(re, '');
  }
  // and turn initial Y back to y
  if (firstch === 'y') {
    w = firstch.toLowerCase() + w.substr(1);
  }
  return w;
}

module.exports = stemmer;

