/**
 * CALCULATEUR DES 11 JOURS FÉRIÉS LÉGAUX FRANÇAIS
 * Basé sur l'algorithme de Butcher / Meeus pour le calcul de Pâques (Art. L. 3133-1 du Code du Travail)
 * Indispensable pour exclure les jours fériés des jours ouvrés indemnisables (Art. L. 5424-11).
 */

export function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function getFrenchPublicHolidays(year) {
  const holidays = {};

  const add = (d, label) => {
    const iso = d.toISOString().split('T')[0];
    holidays[iso] = label;
  };

  // Fêtes civiles et religieuses fixes
  add(new Date(year, 0, 1, 12), "Jour de l'An");
  add(new Date(year, 4, 1, 12), "Fête du Travail");
  add(new Date(year, 4, 8, 12), "Victoire 1945");
  add(new Date(year, 6, 14, 12), "Fête Nationale");
  add(new Date(year, 7, 15, 12), "Assomption");
  add(new Date(year, 10, 1, 12), "Toussaint");
  add(new Date(year, 10, 11, 12), "Armistice 1918");
  add(new Date(year, 11, 25, 12), "Noël");

  // Fêtes mobiles calculées à partir de Pâques
  const easter = getEasterSunday(year);

  // Lundi de Pâques (Pâques + 1 jour)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  add(easterMonday, "Lundi de Pâques");

  // Jeudi de l'Ascension (Pâques + 39 jours)
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  add(ascension, "Jeudi de l'Ascension");

  // Lundi de Pentecôte (Pâques + 50 jours)
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 50);
  add(pentecost, "Lundi de Pentecôte");

  return holidays;
}

export function isFrenchPublicHoliday(date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00Z') : date;
  const year = d.getFullYear();
  const holidays = getFrenchPublicHolidays(year);
  const iso = d.toISOString().split('T')[0];
  return holidays[iso] || null;
}
