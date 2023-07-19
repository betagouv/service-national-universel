"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly &&
      (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })),
      keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2
      ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
      : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";

  return (
    (_typeof =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (obj) {
            return typeof obj;
          }
        : function (obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          }),
    _typeof(obj)
  );
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if ((typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {
      if (it) o = it;
      var i = 0;
      var F = function () {};
      return {
        s: F,
        n: function () {
          if (i >= o.length)
            return {
              done: true,
            };
          return {
            done: false,
            value: o[i++],
          };
        },
        e: function (e) {
          throw e;
        },
        f: F,
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

var formatDay = function formatDay(date) {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
};
var formatDateFR = function formatDateFR(d) {
  if (!d) return "-";
  var date = new Date(d);
  return date.toLocaleDateString("fr-FR");
};
var formatToActualTime = function formatToActualTime(d) {
  if (!d) return "-";
  var date = new Date(d);
  var localTime = date.toLocaleTimeString(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
  localTime = localTime.replace(/:/, "h ");
  localTime = localTime.replace(/:/, "min ");
  return localTime;
};
var formatLongDateFR = function formatLongDateFR(d) {
  if (!d) return "-";
  var date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
var formatDateFRTimezoneUTC = function formatDateFRTimezoneUTC(d) {
  if (!d) return "-";
  var date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    timeZone: "UTC",
  });
};
var formatLongDateUTC = function formatLongDateUTC(d) {
  if (!d) return "-";
  var date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};
var formatLongDateUTCWithoutTime = function formatLongDateUTCWithoutTime(d) {
  if (!d) return "-";
  var date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    timeZone: "UTC",
  });
};
var formatStringLongDate = function formatStringLongDate(date) {
  if (!date) return "-";
  var d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
var formatStringDate = function formatStringDate(date) {
  if (!date) return "-";
  var d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
var formatStringDateTimezoneUTC = function formatStringDateTimezoneUTC(date) {
  if (!date) return "-";
  var d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};
var formatStringDateWithDayTimezoneUTC = function formatStringDateWithDayTimezoneUTC(date) {
  if (!date) return "-";
  var d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};
function dateForDatePicker(d) {
  return new Date(d).toISOString().split("T")[0];
}
function getAge(d) {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var date = new Date(d);
  date.setHours(0, 0, 0, 0);
  var diffTime = Math.abs(date - now);
  var age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  if (!age || isNaN(age)) return "?";
  return age;
}
var getLimitDateForPhase2 = function getLimitDateForPhase2(cohort) {
  if (cohort === "2019") return "23 mars 2021";
  if (cohort === "2020") return "31 décembre 2021 ";
  return "30 juin 2022";
};
var COHESION_STAY_END = {
  2019: new Date("06/28/2019"),
  2020: new Date("07/02/2021"),
  2021: new Date("07/02/2021"),
  "Février 2022": new Date("02/25/2022"),
  "Juin 2022": new Date("06/24/2022"),
  "Juillet 2022": new Date("07/15/2022"),
  "Février 2023 - C": new Date("03/03/2023"),
  "Avril 2023 - A": new Date("04/21/2023"),
  "Avril 2023 - B": new Date("04/28/2023"),
  "Juin 2023": new Date("06/23/2023"),
  "Juillet 2023": new Date("07/17/2023"),
};
function isIsoDate(str) {
  if (!Date.parse(str)) {
    return false;
  }
  var d = new Date(str);
  return d.toISOString() === str;
}
function calculateAge(birthDate, otherDate) {
  birthDate = new Date(birthDate);
  otherDate = new Date(otherDate);
  var years = otherDate.getFullYear() - birthDate.getFullYear();
  if (otherDate.getMonth() < birthDate.getMonth() || (otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate())) {
    years--;
  }
  return years;
}

var departmentLookUp = {
  "01": "Ain",
  "02": "Aisne",
  "03": "Allier",
  "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes",
  "07": "Ardèche",
  "08": "Ardennes",
  "09": "Ariège",
  10: "Aube",
  11: "Aude",
  12: "Aveyron",
  13: "Bouches-du-Rhône",
  14: "Calvados",
  15: "Cantal",
  16: "Charente",
  17: "Charente-Maritime",
  18: "Cher",
  19: "Corrèze",
  20: "Corse",
  21: "Côte-d'Or",
  22: "Côtes-d'Armor",
  23: "Creuse",
  24: "Dordogne",
  25: "Doubs",
  26: "Drôme",
  27: "Eure",
  28: "Eure-et-Loir",
  29: "Finistère",
  "2A": "Corse-du-Sud",
  "2B": "Haute-Corse",
  30: "Gard",
  31: "Haute-Garonne",
  32: "Gers",
  33: "Gironde",
  34: "Hérault",
  35: "Ille-et-Vilaine",
  36: "Indre",
  37: "Indre-et-Loire",
  38: "Isère",
  39: "Jura",
  40: "Landes",
  41: "Loir-et-Cher",
  42: "Loire",
  43: "Haute-Loire",
  44: "Loire-Atlantique",
  45: "Loiret",
  46: "Lot",
  47: "Lot-et-Garonne",
  48: "Lozère",
  49: "Maine-et-Loire",
  50: "Manche",
  51: "Marne",
  52: "Haute-Marne",
  53: "Mayenne",
  54: "Meurthe-et-Moselle",
  55: "Meuse",
  56: "Morbihan",
  57: "Moselle",
  58: "Nièvre",
  59: "Nord",
  60: "Oise",
  61: "Orne",
  62: "Pas-de-Calais",
  63: "Puy-de-Dôme",
  64: "Pyrénées-Atlantiques",
  65: "Hautes-Pyrénées",
  66: "Pyrénées-Orientales",
  67: "Bas-Rhin",
  68: "Haut-Rhin",
  69: "Rhône",
  70: "Haute-Saône",
  71: "Saône-et-Loire",
  72: "Sarthe",
  73: "Savoie",
  74: "Haute-Savoie",
  75: "Paris",
  76: "Seine-Maritime",
  77: "Seine-et-Marne",
  78: "Yvelines",
  79: "Deux-Sèvres",
  80: "Somme",
  81: "Tarn",
  82: "Tarn-et-Garonne",
  83: "Var",
  84: "Vaucluse",
  85: "Vendée",
  86: "Vienne",
  87: "Haute-Vienne",
  88: "Vosges",
  89: "Yonne",
  90: "Territoire de Belfort",
  91: "Essonne",
  92: "Hauts-de-Seine",
  93: "Seine-Saint-Denis",
  94: "Val-de-Marne",
  95: "Val-d'Oise",
  971: "Guadeloupe",
  "971b": "Saint-Barthélemy",
  972: "Martinique",
  973: "Guyane",
  974: "La Réunion",
  975: "Saint-Pierre-et-Miquelon",
  976: "Mayotte",
  978: "Saint-Martin",
  984: "Terres australes et antarctiques françaises",
  986: "Wallis-et-Futuna",
  987: "Polynésie française",
  988: "Nouvelle-Calédonie",
};
var departmentList = Object.values(departmentLookUp);
var getDepartmentNumber = function getDepartmentNumber(d) {
  return Object.keys(departmentLookUp).find(function (key) {
    return departmentLookUp[key] === d;
  });
};
var getDepartmentByZip = function getDepartmentByZip(zip) {
  if (!zip) return;
  if (zip.length !== 5) return;
  var departmentCode;
  if (parseInt(zip) >= 96000) {
    departmentCode = zip.substr(0, 3);
  } else {
    departmentCode = zip.substr(0, 2);
  }
  return departmentLookUp[departmentCode];
};
var getRegionByZip = function getRegionByZip(zip) {
  if (!zip) return;
  if (zip.length !== 5) return;
  var department = getDepartmentByZip(zip);
  return department2region[department];
};
var regionList = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Saint-Pierre-et-Miquelon",
  "Mayotte",
  "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

// Attention : Polynésie française et Nouvelle-Calédonie ne sont pas des DROMS mais des cas à part.
var regionsListDROMS = [
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Saint-Pierre-et-Miquelon",
  "Mayotte",
  "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna",
];
var department2region = {
  Ain: "Auvergne-Rhône-Alpes",
  Aisne: "Hauts-de-France",
  Allier: "Auvergne-Rhône-Alpes",
  "Alpes-de-Haute-Provence": "Provence-Alpes-Côte d'Azur",
  "Hautes-Alpes": "Provence-Alpes-Côte d'Azur",
  "Alpes-Maritimes": "Provence-Alpes-Côte d'Azur",
  Ardèche: "Auvergne-Rhône-Alpes",
  Ardennes: "Grand Est",
  Ariège: "Occitanie",
  Aube: "Grand Est",
  Aude: "Occitanie",
  Aveyron: "Occitanie",
  "Bouches-du-Rhône": "Provence-Alpes-Côte d'Azur",
  Calvados: "Normandie",
  Cantal: "Auvergne-Rhône-Alpes",
  Charente: "Nouvelle-Aquitaine",
  "Charente-Maritime": "Nouvelle-Aquitaine",
  Cher: "Centre-Val de Loire",
  Corrèze: "Nouvelle-Aquitaine",
  "Côte-d'Or": "Bourgogne-Franche-Comté",
  "Côtes-d'Armor": "Bretagne",
  Creuse: "Nouvelle-Aquitaine",
  Dordogne: "Nouvelle-Aquitaine",
  Doubs: "Bourgogne-Franche-Comté",
  Drôme: "Auvergne-Rhône-Alpes",
  Eure: "Normandie",
  "Eure-et-Loir": "Centre-Val de Loire",
  Finistère: "Bretagne",
  "Corse-du-Sud": "Corse",
  "Haute-Corse": "Corse",
  Corse: "Corse",
  Gard: "Occitanie",
  "Haute-Garonne": "Occitanie",
  Gers: "Occitanie",
  Gironde: "Nouvelle-Aquitaine",
  Hérault: "Occitanie",
  "Ille-et-Vilaine": "Bretagne",
  Indre: "Centre-Val de Loire",
  "Indre-et-Loire": "Centre-Val de Loire",
  Isère: "Auvergne-Rhône-Alpes",
  Jura: "Bourgogne-Franche-Comté",
  Landes: "Nouvelle-Aquitaine",
  "Loir-et-Cher": "Centre-Val de Loire",
  Loire: "Auvergne-Rhône-Alpes",
  "Haute-Loire": "Auvergne-Rhône-Alpes",
  "Loire-Atlantique": "Pays de la Loire",
  Loiret: "Centre-Val de Loire",
  Lot: "Occitanie",
  "Lot-et-Garonne": "Nouvelle-Aquitaine",
  Lozère: "Occitanie",
  "Maine-et-Loire": "Pays de la Loire",
  Manche: "Normandie",
  Marne: "Grand Est",
  "Haute-Marne": "Grand Est",
  Mayenne: "Pays de la Loire",
  "Meurthe-et-Moselle": "Grand Est",
  Meuse: "Grand Est",
  Morbihan: "Bretagne",
  Moselle: "Grand Est",
  Nièvre: "Bourgogne-Franche-Comté",
  Nord: "Hauts-de-France",
  Oise: "Hauts-de-France",
  Orne: "Normandie",
  "Pas-de-Calais": "Hauts-de-France",
  "Puy-de-Dôme": "Auvergne-Rhône-Alpes",
  "Pyrénées-Atlantiques": "Nouvelle-Aquitaine",
  "Hautes-Pyrénées": "Occitanie",
  "Pyrénées-Orientales": "Occitanie",
  "Bas-Rhin": "Grand Est",
  "Haut-Rhin": "Grand Est",
  Rhône: "Auvergne-Rhône-Alpes",
  "Haute-Saône": "Bourgogne-Franche-Comté",
  "Saône-et-Loire": "Bourgogne-Franche-Comté",
  Sarthe: "Pays de la Loire",
  Savoie: "Auvergne-Rhône-Alpes",
  "Haute-Savoie": "Auvergne-Rhône-Alpes",
  Paris: "Île-de-France",
  "Seine-Maritime": "Normandie",
  "Seine-et-Marne": "Île-de-France",
  Yvelines: "Île-de-France",
  "Deux-Sèvres": "Nouvelle-Aquitaine",
  Somme: "Hauts-de-France",
  Tarn: "Occitanie",
  "Tarn-et-Garonne": "Occitanie",
  Var: "Provence-Alpes-Côte d'Azur",
  Vaucluse: "Provence-Alpes-Côte d'Azur",
  Vendée: "Pays de la Loire",
  Vienne: "Nouvelle-Aquitaine",
  "Haute-Vienne": "Nouvelle-Aquitaine",
  Vosges: "Grand Est",
  Yonne: "Bourgogne-Franche-Comté",
  "Territoire de Belfort": "Bourgogne-Franche-Comté",
  Essonne: "Île-de-France",
  "Hauts-de-Seine": "Île-de-France",
  "Seine-Saint-Denis": "Île-de-France",
  "Val-de-Marne": "Île-de-France",
  "Val-d'Oise": "Île-de-France",
  Guadeloupe: "Guadeloupe",
  Martinique: "Martinique",
  Guyane: "Guyane",
  "La Réunion": "La Réunion",
  "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon",
  Mayotte: "Mayotte",
  "Saint-Barthélemy": "Guadeloupe",
  "Saint-Martin": "Guadeloupe",
  "Terres australes et antarctiques françaises": "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna": "Wallis-et-Futuna",
  "Polynésie française": "Polynésie française",
  "Nouvelle-Calédonie": "Nouvelle-Calédonie",
};
var region2department = {
  "Auvergne-Rhône-Alpes": ["Ain", "Allier", "Ardèche", "Cantal", "Drôme", "Isère", "Loire", "Haute-Loire", "Puy-de-Dôme", "Rhône", "Savoie", "Haute-Savoie"],
  "Bourgogne-Franche-Comté": ["Côte-d'Or", "Doubs", "Jura", "Nièvre", "Haute-Saône", "Saône-et-Loire", "Yonne", "Territoire de Belfort"],
  Bretagne: ["Côtes-d'Armor", "Finistère", "Ille-et-Vilaine", "Morbihan"],
  "Centre-Val de Loire": ["Cher", "Eure-et-Loir", "Indre", "Indre-et-Loire", "Loir-et-Cher", "Loiret"],
  Corse: ["Corse", "Corse-du-Sud", "Haute-Corse"],
  "Grand Est": ["Ardennes", "Aube", "Marne", "Haute-Marne", "Meurthe-et-Moselle", "Meuse", "Moselle", "Bas-Rhin", "Haut-Rhin", "Vosges"],
  "Hauts-de-France": ["Aisne", "Nord", "Oise", "Pas-de-Calais", "Somme"],
  "Île-de-France": ["Paris", "Seine-et-Marne", "Yvelines", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Val-d'Oise"],
  Normandie: ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"],
  "Nouvelle-Aquitaine": [
    "Charente",
    "Charente-Maritime",
    "Corrèze",
    "Creuse",
    "Dordogne",
    "Gironde",
    "Landes",
    "Lot-et-Garonne",
    "Pyrénées-Atlantiques",
    "Deux-Sèvres",
    "Vienne",
    "Haute-Vienne",
  ],
  Occitanie: ["Ariège", "Aude", "Aveyron", "Gard", "Haute-Garonne", "Gers", "Hérault", "Lot", "Lozère", "Hautes-Pyrénées", "Pyrénées-Orientales", "Tarn", "Tarn-et-Garonne"],
  "Pays de la Loire": ["Loire-Atlantique", "Maine-et-Loire", "Mayenne", "Sarthe", "Vendée"],
  "Provence-Alpes-Côte d'Azur": ["Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes", "Bouches-du-Rhône", "Var", "Vaucluse"],
  Guadeloupe: ["Guadeloupe", "Saint-Martin", "Saint-Barthélemy"],
  Martinique: ["Martinique"],
  Guyane: ["Guyane"],
  "La Réunion": ["La Réunion"],
  "Saint-Pierre-et-Miquelon": ["Saint-Pierre-et-Miquelon"],
  Mayotte: ["Mayotte"],
  "Terres australes et antarctiques françaises": ["Terres australes et antarctiques françaises"],
  "Wallis-et-Futuna": ["Wallis-et-Futuna"],
  "Polynésie française": ["Polynésie française"],
  "Nouvelle-Calédonie": ["Nouvelle-Calédonie"],
};
var region2zone = {
  "Auvergne-Rhône-Alpes": "A",
  "Bourgogne-Franche-Comté": "A",
  Bretagne: "B",
  "Centre-Val de Loire": "B",
  Corse: "Corse",
  "Grand Est": "B",
  "Hauts-de-France": "B",
  "Île-de-France": "C",
  Normandie: "B",
  "Nouvelle-Aquitaine": "A",
  Occitanie: "C",
  "Pays de la Loire": "B",
  "Provence-Alpes-Côte d'Azur": "B",
  Guadeloupe: "DOM",
  Martinique: "DOM",
  Guyane: "DOM",
  "La Réunion": "DOM",
  "Saint-Pierre-et-Miquelon": "DOM",
  Mayotte: "DOM",
  "Terres australes et antarctiques françaises": "DOM",
  "Wallis-et-Futuna": "DOM",
  "Polynésie française": "PF",
  "Nouvelle-Calédonie": "NC",
  Etranger: "Etranger",
};
var getRegionForEligibility = function getRegionForEligibility(young) {
  var region = young.schooled ? young.schoolRegion : young.region;
  if (!region) {
    var dep =
      (young === null || young === void 0 ? void 0 : young.schoolDepartment) ||
      (young === null || young === void 0 ? void 0 : young.department) ||
      getDepartmentByZip(young === null || young === void 0 ? void 0 : young.zip);
    if (dep && (!isNaN(dep) || ["2A", "2B", "02A", "02B"].includes(dep))) {
      if (dep.substring(0, 1) === "0" && dep.length === 3) dep = departmentLookUp[dep.substring(1)];
      else dep = departmentLookUp[dep];
    }
    region = department2region[dep] || getRegionByZip(young === null || young === void 0 ? void 0 : young.zip);
  }
  if (!region) region = "Etranger";
  return region;
};
var isFromMetropole = function isFromMetropole(young) {
  var region = getRegionForEligibility(young);
  return region2zone[region] === "A" || region2zone[region] === "B" || region2zone[region] === "C";
};
var isFromDOMTOM = function isFromDOMTOM(young) {
  var region = getRegionForEligibility(young);
  return region2zone[region] === "DOM";
};
var isFromFrenchPolynesia = function isFromFrenchPolynesia(young) {
  var region = getRegionForEligibility(young);
  return region2zone[region] === "PF";
};
var isFromNouvelleCaledonie = function isFromNouvelleCaledonie(young) {
  var region = getRegionForEligibility(young);
  return region2zone[region] === "NC";
};
var regionAndDepartments = {
  departmentLookUp: departmentLookUp,
  departmentList: departmentList,
  getDepartmentNumber: getDepartmentNumber,
  regionList: regionList,
  regionsListDROMS: regionsListDROMS,
  department2region: department2region,
  region2department: region2department,
  getDepartmentByZip: getDepartmentByZip,
  getRegionByZip: getRegionByZip,
  region2zone: region2zone,
  getRegionForEligibility: getRegionForEligibility,
  isFromMetropole: isFromMetropole,
  isFromDOMTOM: isFromDOMTOM,
  isFromFrenchPolynesia: isFromFrenchPolynesia,
  isFromNouvelleCaledonie: isFromNouvelleCaledonie,
};

var ROLES = {
  ADMIN: "admin",
  REFERENT_DEPARTMENT: "referent_department",
  REFERENT_REGION: "referent_region",
  RESPONSIBLE: "responsible",
  SUPERVISOR: "supervisor",
  HEAD_CENTER: "head_center",
  VISITOR: "visitor",
  DSNJ: "dsnj",
  TRANSPORTER: "transporter",
};
var SUB_ROLES = {
  manager_department: "manager_department",
  assistant_manager_department: "assistant_manager_department",
  manager_phase2: "manager_phase2",
  secretariat: "secretariat",
  coordinator: "coordinator",
  assistant_coordinator: "assistant_coordinator",
  none: "",
};
var SUPPORT_ROLES = {
  admin: "Modérateur",
  referent: "Référent",
  structure: "Structure",
  head_center: "Chef de Centre",
  young: "Volontaire",
  public: "Public",
  visitor: "Visiteur",
};
var VISITOR_SUBROLES = {
  recteur_region: "Recteur de région académique",
  recteur: "Recteur d’académie",
  vice_recteur: "Vice-recteur d'académie",
  dasen: "Directeur académique des services de l’éducation nationale (DASEN)",
  sgra: "Secrétaire général de région académique (SGRA)",
  sga: "Secrétaire général d’académie (SGA)",
  drajes: "Délégué régional académique à la jeunesse, à l’engagement et aux sports (DRAJES)",
  other: "Autre",
};
var CENTER_ROLES = {
  chef: "Chef de centre",
  adjoint: "Chef de centre adjoint",
  cadre_specialise: "Cadre spécialisé",
  cadre_compagnie: "Cadre de compagnie",
  tuteur: "Tuteur de maisonnée",
};
var ROLES_LIST = Object.values(ROLES);
var SUB_ROLES_LIST = Object.values(SUB_ROLES);
var SUPPORT_ROLES_LIST = Object.keys(SUPPORT_ROLES);
var VISITOR_SUB_ROLES_LIST = Object.keys(VISITOR_SUBROLES);

// TODO - Geography department ref-ref array-array ref-ref/struc|young array-string
var sameGeography = function sameGeography(actor, target) {
  var actorAndTargetInTheSameRegion =
    ((actor === null || actor === void 0 ? void 0 : actor.region) &&
      (actor === null || actor === void 0 ? void 0 : actor.region) === (target === null || target === void 0 ? void 0 : target.region)) ||
    region2department[actor === null || actor === void 0 ? void 0 : actor.region].includes(target === null || target === void 0 ? void 0 : target.department);
  var actorAndTargetInTheSameDepartment =
    (actor === null || actor === void 0 ? void 0 : actor.department) &&
    (actor === null || actor === void 0 ? void 0 : actor.department.includes(target === null || target === void 0 ? void 0 : target.department));
  switch (actor === null || actor === void 0 ? void 0 : actor.role) {
    case ROLES.REFERENT_REGION:
      return actorAndTargetInTheSameRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return actorAndTargetInTheSameDepartment;
    default:
      return actorAndTargetInTheSameDepartment || actorAndTargetInTheSameRegion;
  }
};
var referentInSameGeography = function referentInSameGeography(actor, target) {
  return isReferent(actor) && sameGeography(actor, target);
};
function canInviteUser(actorRole, targetRole) {
  // Admins can invite any user
  if (actorRole === ROLES.ADMIN) return true;

  // REFERENT_DEPARTMENT can invite REFERENT_DEPARTMENT, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
  if (actorRole === ROLES.REFERENT_DEPARTMENT) {
    return [ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(targetRole);
  }

  // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER, VISITOR
  if (actorRole === ROLES.REFERENT_REGION) {
    return [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.VISITOR].includes(targetRole);
  }

  // RESPONSIBLE and SUPERVISOR can invite only RESPONSIBLE and SUPERVISOR.
  if (actorRole === ROLES.RESPONSIBLE || actorRole === ROLES.SUPERVISOR) {
    return targetRole === ROLES.RESPONSIBLE || targetRole === ROLES.SUPERVISOR;
  }
  return false;
}
var canDeleteStructure = function canDeleteStructure(actor, target) {
  return isAdmin(actor) || referentInSameGeography(actor, target);
};
var canDeleteYoung = function canDeleteYoung(actor, target) {
  return isAdmin(actor) || referentInSameGeography(actor, target) || actor._id.toString() === target._id.toString();
};
function canEditYoung(actor, young) {
  var isAdmin = actor.role === ROLES.ADMIN;
  var isHeadCenter = actor.role === ROLES.HEAD_CENTER;
  var actorAndTargetInTheSameRegion = actor.region === young.region;
  var actorAndTargetInTheSameDepartment = actor.department.includes(young.department);
  var referentRegionFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
  var referentDepartmentFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actorAndTargetInTheSameDepartment;
  var authorized = isAdmin || isHeadCenter || referentRegionFromTheSameRegion || referentDepartmentFromTheSameDepartment;
  return authorized;
}
function canDeleteReferent(_ref) {
  var actor = _ref.actor,
    originalTarget = _ref.originalTarget,
    structure = _ref.structure;
  // TODO: we must handle rights more precisely.
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  var isMe = actor._id === originalTarget._id;
  var isAdmin = actor.role === ROLES.ADMIN;
  var isSupervisor = actor.role === ROLES.SUPERVISOR;
  var geographicTargetData = {
    region: originalTarget.region || (structure === null || structure === void 0 ? void 0 : structure.region),
    department: originalTarget.department || [structure === null || structure === void 0 ? void 0 : structure.department],
  };
  var actorAndTargetInTheSameRegion = actor.region === geographicTargetData.region;
  // Check si il y a au moins un match entre les departements de la target et de l'actor
  var actorAndTargetInTheSameDepartment = actor.department.some(function (department) {
    return geographicTargetData.department.includes(department);
  });
  var targetIsReferentRegion = originalTarget.role === ROLES.REFERENT_REGION;
  var targetIsReferentDepartment = originalTarget.role === ROLES.REFERENT_DEPARTMENT;
  var targetIsSupervisor = originalTarget.role === ROLES.SUPERVISOR;
  var targetIsResponsible = originalTarget.role === ROLES.RESPONSIBLE;
  var targetIsVisitor = originalTarget.role === ROLES.VISITOR;
  var targetIsHeadCenter = originalTarget.role === ROLES.HEAD_CENTER;

  // actor is referent region
  var referentRegionFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsReferentRegion && actorAndTargetInTheSameRegion;
  var referentDepartmentFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsReferentDepartment && actorAndTargetInTheSameRegion;
  var referentResponsibleFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
  var responsibleFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
  var visitorFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsVisitor && actorAndTargetInTheSameRegion;
  var headCenterFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsHeadCenter && actorAndTargetInTheSameRegion;

  // actor is referent department
  var referentDepartmentFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && targetIsReferentDepartment && actorAndTargetInTheSameDepartment;
  var responsibleFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && targetIsResponsible && actorAndTargetInTheSameDepartment;
  var headCenterFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && targetIsHeadCenter && actorAndTargetInTheSameDepartment;

  // same substructure
  var responsibleFromSameStructure = (targetIsResponsible || targetIsSupervisor) && actor.structureId === originalTarget.structureId;
  var supervisorOfMainStructure = structure && isSupervisor && actor.structureId === structure.networkId;
  var authorized =
    isAdmin ||
    referentRegionFromTheSameRegion ||
    referentDepartmentFromTheSameRegion ||
    referentResponsibleFromTheSameRegion ||
    responsibleFromTheSameRegion ||
    visitorFromTheSameRegion ||
    headCenterFromTheSameRegion ||
    referentDepartmentFromTheSameDepartment ||
    responsibleFromTheSameDepartment ||
    headCenterFromTheSameDepartment ||
    (responsibleFromSameStructure && !isMe) ||
    supervisorOfMainStructure;
  return authorized;
}
function canViewPatchesHistory(actor) {
  var isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
  return isAdminOrReferent;
}
function canDeletePatchesHistory(actor, target) {
  var isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
  var isOwner = actor._id.toString() === target._id.toString();
  return isAdminOrReferent || isOwner;
}
function canViewEmailHistory(actor) {
  var isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  return isAdminOrReferent;
}
function canViewNotes(actor) {
  var isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  return isAdminOrReferent;
}
function canViewReferent(actor, target) {
  var isMe = actor.id === target.id;
  var isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  var isResponsibleModifyingResponsible = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) && [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role);
  var isHeadCenter = actor.role === ROLES.HEAD_CENTER && [ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(target.role);
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  return isMe || isAdminOrReferent || isResponsibleModifyingResponsible || isHeadCenter;
}
function canUpdateReferent(_ref2) {
  var _originalTarget$depar;
  var actor = _ref2.actor,
    originalTarget = _ref2.originalTarget,
    _ref2$modifiedTarget = _ref2.modifiedTarget,
    modifiedTarget = _ref2$modifiedTarget === void 0 ? null : _ref2$modifiedTarget,
    structure = _ref2.structure;
  var isMe = actor._id === originalTarget._id;
  var isAdmin = actor.role === ROLES.ADMIN;
  var withoutChangingRole = modifiedTarget === null || !("role" in modifiedTarget) || modifiedTarget.role === originalTarget.role;
  var isResponsibleModifyingResponsibleWithoutChangingRole =
    // Is responsible...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) &&
    // ... modifying responsible ...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(originalTarget.role) &&
    withoutChangingRole;
  var isSupervisorModifyingTeamMember =
    // Is supervisor...
    actor.role === ROLES.SUPERVISOR &&
    // ... modifying team member ...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(originalTarget.role) &&
    actor.structureId === originalTarget.structureId;
  var isMeWithoutChangingRole =
    // Is me ...
    isMe &&
    // ... without changing its role.
    withoutChangingRole;

  // TODO: we must handle rights more precisely.
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  var isReferentModifyingReferentWithoutChangingRole =
    // Is referent...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role) &&
    // ... modifying referent ...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE].includes(originalTarget.role) &&
    // ... witout changing its role.
    (modifiedTarget === null || [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE].includes(modifiedTarget.role));
  var isReferentModifyingHeadCenterWithoutChangingRole =
    // Is referent...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role) &&
    // ... modifying referent ...
    originalTarget.role === ROLES.HEAD_CENTER &&
    // ... witout changing its role.
    (modifiedTarget === null || [ROLES.HEAD_CENTER].includes(modifiedTarget.role));
  var geographicTargetData = {
    region: originalTarget.region || (structure === null || structure === void 0 ? void 0 : structure.region),
    // many users have an array like [""] for department
    department:
      (_originalTarget$depar = originalTarget.department) !== null && _originalTarget$depar !== void 0 && _originalTarget$depar.length && originalTarget.department[0] !== ""
        ? originalTarget.department
        : [structure === null || structure === void 0 ? void 0 : structure.department],
  };
  var isActorAndTargetInTheSameRegion = actor.region === geographicTargetData.region;
  // Check si il y a au moins un match entre les departements de la target et de l'actor
  var isActorAndTargetInTheSameDepartment = actor.department.some(function (department) {
    return geographicTargetData.department.includes(department);
  });
  var authorized =
    (isMeWithoutChangingRole ||
      isAdmin ||
      isSupervisorModifyingTeamMember ||
      isResponsibleModifyingResponsibleWithoutChangingRole ||
      isReferentModifyingReferentWithoutChangingRole ||
      isReferentModifyingHeadCenterWithoutChangingRole) &&
    (actor.role === ROLES.REFERENT_REGION ? isActorAndTargetInTheSameRegion || isReferentModifyingHeadCenterWithoutChangingRole : true) &&
    (actor.role === ROLES.REFERENT_DEPARTMENT
      ? ([ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(originalTarget.role) || isMe) &&
        (isActorAndTargetInTheSameDepartment || isReferentModifyingHeadCenterWithoutChangingRole)
      : true);
  return authorized;
}
function canViewYoungMilitaryPreparationFile(actor, young) {
  var isAdmin = actor.role === ROLES.ADMIN;
  var isReferentDepartmentFromTargetDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department);
  var isReferentRegionFromTargetRegion = actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  var authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
  return authorized;
}
function canRefuseMilitaryPreparation(actor, young) {
  return canViewYoungMilitaryPreparationFile(actor, young) || [ROLES.RESPONSIBLE, ROLES.REFERENT_REGION].includes(actor.role);
}
function canViewYoungFile(actor, target) {
  var targetCenter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var isAdmin = actor.role === ROLES.ADMIN;
  var isReferentDepartmentFromTargetDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(target.department);
  var isReferentRegionFromTargetRegion = actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  var isReferentCenterFromSameDepartmentTargetCenter = actor.department === (targetCenter === null || targetCenter === void 0 ? void 0 : targetCenter.department);
  var isReferentCenterFromSameRegionTargetCenter = actor.region === (targetCenter === null || targetCenter === void 0 ? void 0 : targetCenter.region);
  var authorized =
    isAdmin ||
    isReferentDepartmentFromTargetDepartment ||
    isReferentRegionFromTargetRegion ||
    isReferentCenterFromSameDepartmentTargetCenter ||
    isReferentCenterFromSameRegionTargetCenter;
  return authorized;
}
function canCreateOrUpdateCohesionCenter(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
}
function canCreateEvent(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canCreateOrUpdateSessionPhase1(actor, target) {
  var isAdmin = actor.role === ROLES.ADMIN;
  var isReferent = [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  var isHeadCenter = actor.role === ROLES.HEAD_CENTER && target && actor._id.toString() === target.headCenterId;
  return isAdmin || isReferent || isHeadCenter;
}
function canSearchSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.TRANSPORTER].includes(actor.role);
}
function canViewSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
}
function canPutSpecificDateOnSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function isSessionEditionOpen(actor, cohort) {
  switch (actor === null || actor === void 0 ? void 0 : actor.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.HEAD_CENTER:
      return true;
    case ROLES.REFERENT_REGION:
      return cohort === null || cohort === void 0 ? void 0 : cohort.sessionEditionOpenForReferentRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return cohort === null || cohort === void 0 ? void 0 : cohort.sessionEditionOpenForReferentDepartment;
    case ROLES.TRANSPORTER:
      return cohort === null || cohort === void 0 ? void 0 : cohort.sessionEditionOpenForTransporter;
    default:
      return false;
  }
}
function isPdrEditionOpen(actor, cohort) {
  switch (actor === null || actor === void 0 ? void 0 : actor.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.REFERENT_REGION:
      return cohort === null || cohort === void 0 ? void 0 : cohort.pdrEditionOpenForReferentRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return cohort === null || cohort === void 0 ? void 0 : cohort.pdrEditionOpenForReferentDepartment;
    case ROLES.TRANSPORTER:
      return cohort === null || cohort === void 0 ? void 0 : cohort.pdrEditionOpenForTransporter;
    default:
      return false;
  }
}
var isBusEditionOpen = function isBusEditionOpen(actor, cohort) {
  switch (actor === null || actor === void 0 ? void 0 : actor.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.TRANSPORTER:
      return cohort === null || cohort === void 0 ? void 0 : cohort.busEditionOpenForTransporter;
    default:
      return false;
  }
};
function isLigneBusDemandeDeModificationOpen(actor, cohort) {
  if (actor.role === ROLES.ADMIN) return true;
  if (actor.role === ROLES.REFERENT_REGION) return (cohort === null || cohort === void 0 ? void 0 : cohort.isTransportPlanCorrectionRequestOpen) || false;
  return false;
}
function canSendTimeScheduleReminderForSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canSendImageRightsForSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canCreateOrModifyMission(user, mission, structure) {
  if (user.role === ROLES.SUPERVISOR) {
    return user.structureId === mission.structureId || user.structureId === (structure === null || structure === void 0 ? void 0 : structure.networkId);
  }
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) || (user.role === ROLES.RESPONSIBLE && user.structureId === mission.structureId);
}
function canCreateOrUpdateProgram(user, program) {
  var isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
  return (
    isAdminOrReferent &&
    !((user.role === ROLES.REFERENT_DEPARTMENT && !user.department.includes(program.department)) || (user.role === ROLES.REFERENT_REGION && user.region !== program.region))
  );
}
function canModifyStructure(user, structure) {
  var isAdmin = user.role === ROLES.ADMIN;
  var isReferentRegionFromSameRegion = user.role === ROLES.REFERENT_REGION && user.region === structure.region;
  var isReferentDepartmentFromSameDepartment = user.role === ROLES.REFERENT_DEPARTMENT && user.department.includes(structure.department);
  var isResponsibleModifyingOwnStructure = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && structure._id.equals(user.structureId);
  var isSupervisorModifyingChild = user.role === ROLES.SUPERVISOR && user.structureId === structure.networkId;
  return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment || isResponsibleModifyingOwnStructure || isSupervisorModifyingChild;
}
function canCreateStructure(user) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role);
}
function canSendPlanDeTransport(user) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.TRANSPORTER].includes(user.role);
}
function isAdmin(user) {
  return ROLES.ADMIN === user.role;
}
function isReferent(user) {
  return [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
}
function isSupervisor(user) {
  return ROLES.SUPERVISOR === user.role;
}
function isReferentOrAdmin(user) {
  return isAdmin(user) || isReferent(user);
}
var isTemporaryAffected = function isTemporaryAffected(young) {
  return (
    (young === null || young === void 0 ? void 0 : young.statusPhase1) === "WAITING_AFFECTATION" &&
    ["AFFECTED", "WAITING_LIST"].includes(young === null || young === void 0 ? void 0 : young.statusPhase1Tmp)
  );
};
var FORCE_DISABLED_ASSIGN_COHESION_CENTER = false;
var canAssignCohesionCenter = function canAssignCohesionCenter(actor, target) {
  return isReferentOrAdmin(actor) && (!(target !== null && target !== void 0 && target.statusPhase1Tmp) || !isTemporaryAffected(target));
};
var FORCE_DISABLED_ASSIGN_MEETING_POINT = false;
var canAssignMeetingPoint = function canAssignMeetingPoint(actor, target) {
  return isReferentOrAdmin(actor) && (!(target !== null && target !== void 0 && target.statusPhase1Tmp) || !isTemporaryAffected(target));
};
var canEditPresenceYoung = function canEditPresenceYoung(actor, _target) {
  // todo affiner les droits
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
};
var canSigninAs = function canSigninAs(actor, target) {
  if (isAdmin(actor)) return true;
  if (!isReferent(actor)) return false;
  if (target.constructor.modelName !== "young") return false;
  var isReferentRegionFromSameRegion = actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  var isReferentDepartmentFromSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(target.department);
  return isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment;
};
var canSendFileByMailToYoung = function canSendFileByMailToYoung(actor, young) {
  var isAdmin = actor.role === ROLES.ADMIN;
  var isReferentRegionFromSameRegion = actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  var isReferentDepartmentFromSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department);
  return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment;
};
function canSearchAssociation(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canViewCohesionCenter(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.TRANSPORTER].includes(actor.role);
}
function canGetReferentByEmail(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
}
function canViewMeetingPoints(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.TRANSPORTER].includes(actor.role);
}
function canUpdateMeetingPoint(actor, meetingPoint) {
  if (isAdmin(actor)) return true;
  if ([ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role)) {
    if (!meetingPoint) return true;
    return referentInSameGeography(actor, meetingPoint);
  }
  if (actor.role === ROLES.TRANSPORTER) {
    return true;
  }
  return false;
}
function canDeleteMeetingPoint(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}
function canDeleteMeetingPointSession(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canCreateMeetingPoint(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}
function canSearchMeetingPoints(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}
function canViewMeetingPointId(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
}
function canUpdateInscriptionGoals(actor) {
  return actor.role === ROLES.ADMIN;
}
function canViewInscriptionGoals(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.VISITOR].includes(actor.role);
}
function canViewTicketTags(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canGetYoungByEmail(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canViewYoung(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canViewBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canUpdateBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
}
function canCreateBus(actor) {
  return actor.role === ROLES.ADMIN;
}
function canViewMission(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canViewStructures(actor) {
  if (actor.constructor.modelName === "young") return true;
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canModifyMissionStructureId(actor) {
  return actor.role === ROLES.ADMIN;
}
function canViewStructureChildren(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canDownloadYoungDocuments(actor, target, type = null, _applications) {
  if (type === "certificate" || type === "convocation") {
    return [ROLES.RESPONSIBLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  } else {
    return (
      canEditYoung(actor, target) || [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role)
      // && applications?.length
    );
  }
}

function canInviteYoung(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canSendTemplateToYoung(actor, young) {
  return canEditYoung(actor, young);
}
function canViewYoungApplications(actor, young) {
  return canEditYoung(actor, young) || [ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
}
function canCreateYoungApplication(actor, young) {
  return canEditYoung(actor, young) || [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canCreateOrUpdateContract(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canViewContract(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canCreateOrUpdateDepartmentService(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canChangeYoungCohort(actor, young) {
  var isAdmin = actor.role === ROLES.ADMIN;
  var isReferentDepartmentFromTargetDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department);
  var isReferentRegionFromTargetRegion = actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  var authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
  return authorized;
}
function canViewDepartmentService(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(actor.role);
}
function canAssignManually(actor, young, cohort) {
  if (!cohort) return false;
  return (
    (actor.role === ROLES.ADMIN && cohort.manualAffectionOpenForAdmin) ||
    (actor.role === ROLES.REFERENT_REGION && actor.region === young.region && cohort.manualAffectionOpenForReferentRegion) ||
    (actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department) && cohort.manualAffectionOpenForReferentDepartment)
  );
}
function canSearchInElasticSearch(actor, index) {
  if (index === "mission") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
  } else if (index === "school" || index === "schoolramses") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(actor.role);
  } else if (index === "young-having-school-in-department") {
    return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young-having-school-in-region") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
  } else if (index === "cohesionyoung") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (/* legacy and new name */ index === "sessionphase1young" || index === "sessionphase1") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.TRANSPORTER].includes(actor.role);
  } else if (index === "structure") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
  } else if (index === "referent") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(actor.role);
  } else if (index === "application") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
  } else if (index === "cohesioncenter") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
  } else if (index === "team") {
    return [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "modificationbus") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young-having-meeting-point-in-geography") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
  } else if (index === "young-by-school") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "aggregate-status") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "lignebus") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
  }
  return false;
}
function canSendTutorTemplate(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}
function canShareSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER].includes(actor.role);
}
function canApplyToPhase2(young) {
  var now = new Date();
  return ["DONE", "EXEMPTED"].includes(young.statusPhase1) && now >= COHESION_STAY_END[young.cohort];
}
function canViewTableDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canEditTableDeRepartitionDepartment(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
}
function canEditTableDeRepartitionRegion(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}
function canViewSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}
function canCreateSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canEditSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canDeleteSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canViewLigneBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER, ROLES.HEAD_CENTER].includes(actor.role);
}
function canUpdateLigneBus(actor) {
  return [
    ROLES.ADMIN,
    ROLES.TRANSPORTER,
    // ROLES.REFERENT_REGION,
    // ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}
function canCreateLigneBus(actor) {
  return [
    ROLES.ADMIN,
    // ROLES.REFERENT_REGION,
    // ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}
function canDeleteLigneBus(actor) {
  return [
    ROLES.ADMIN,
    // ROLES.REFERENT_REGION,
    // ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}
function canSearchLigneBus(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
}
function canExportLigneBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}
function canExportConvoyeur(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}
function canEditLigneBusTeam(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
}
function canEditLigneBusGeneralInfo(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}
function canEditLigneBusCenter(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}
function canEditLigneBusPointDeRassemblement(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function ligneBusCanCreateDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
}
function ligneBusCanViewDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER].includes(actor.role);
}
function ligneBusCanSendMessageDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
}
function ligneBusCanEditStatusDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}
function ligneBusCanEditOpinionDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}
function ligneBusCanEditTagsDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}
function canCreateTags(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}
function isSuperAdmin(actor) {
  return [ROLES.ADMIN].includes(actor.role) && actor.subRole === "god";
}

var _invitationReferent;
var YOUNG_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  REINSCRIPTION: "REINSCRIPTION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
  IN_PROGRESS: "IN_PROGRESS",
  WITHDRAWN: "WITHDRAWN",
  DELETED: "DELETED",
  WAITING_LIST: "WAITING_LIST",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
  ABANDONED: "ABANDONED",
  NOT_AUTORISED: "NOT_AUTORISED",
};
var YOUNG_STATUS_PHASE1 = {
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
  AFFECTED: "AFFECTED",
  EXEMPTED: "EXEMPTED",
  DONE: "DONE",
  NOT_DONE: "NOT_DONE",
  WITHDRAWN: "WITHDRAWN",
  WAITING_LIST: "WAITING_LIST",
};
var YOUNG_STATUS_PHASE1_MOTIF = {
  ILLNESS: "ILLNESS",
  DEATH: "DEATH",
  ADMINISTRATION_CANCEL: "ADMINISTRATION_CANCEL",
  OTHER: "OTHER",
};
var YOUNG_STATUS_PHASE2 = {
  WAITING_REALISATION: "WAITING_REALISATION",
  IN_PROGRESS: "IN_PROGRESS",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
};
var CONTRACT_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VALIDATED: "VALIDATED",
};
var YOUNG_STATUS_PHASE3 = {
  WAITING_REALISATION: "WAITING_REALISATION",
  WAITING_VALIDATION: "WAITING_VALIDATION",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
};
var YOUNG_PHASE = {
  INSCRIPTION: "INSCRIPTION",
  COHESION_STAY: "COHESION_STAY",
  INTEREST_MISSION: "INTEREST_MISSION",
  CONTINUE: "CONTINUE",
};
var PHASE_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  IN_COMING: "IN_COMING",
  VALIDATED: "VALIDATED",
  CANCEL: "CANCEL",
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
};
var SESSION_STATUS = {
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
};
var APPLICATION_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_ACCEPTATION: "WAITING_ACCEPTATION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
  CANCEL: "CANCEL",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  ABANDON: "ABANDON",
};
var EQUIVALENCE_STATUS = {
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
};
var PROFESSIONNAL_PROJECT = {
  UNIFORM: "UNIFORM",
  OTHER: "OTHER",
  UNKNOWN: "UNKNOWN",
};
var PROFESSIONNAL_PROJECT_PRECISION = {
  FIREFIGHTER: "FIREFIGHTER",
  POLICE: "POLICE",
  ARMY: "ARMY",
};
var MISSION_DOMAINS = {
  CITIZENSHIP: "CITIZENSHIP",
  CULTURE: "CULTURE",
  DEFENSE: "DEFENSE",
  EDUCATION: "EDUCATION",
  ENVIRONMENT: "ENVIRONMENT",
  HEALTH: "HEALTH",
  SECURITY: "SECURITY",
  SOLIDARITY: "SOLIDARITY",
  SPORT: "SPORT",
  MILITARY: "MILITARY",
};
var YOUNG_SITUATIONS = {
  GENERAL_SCHOOL: "GENERAL_SCHOOL",
  PROFESSIONAL_SCHOOL: "PROFESSIONAL_SCHOOL",
  AGRICULTURAL_SCHOOL: "AGRICULTURAL_SCHOOL",
  SPECIALIZED_SCHOOL: "SPECIALIZED_SCHOOL",
  APPRENTICESHIP: "APPRENTICESHIP",
  EMPLOYEE: "EMPLOYEE",
  INDEPENDANT: "INDEPENDANT",
  SELF_EMPLOYED: "SELF_EMPLOYED",
  ADAPTED_COMPANY: "ADAPTED_COMPANY",
  POLE_EMPLOI: "POLE_EMPLOI",
  MISSION_LOCALE: "MISSION_LOCALE",
  CAP_EMPLOI: "CAP_EMPLOI",
  NOTHING: "NOTHING", // @todo find a better key --'
};

var YOUNG_SCHOOLED_SITUATIONS = {
  GENERAL_SCHOOL: YOUNG_SITUATIONS.GENERAL_SCHOOL,
  PROFESSIONAL_SCHOOL: YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // AGRICULTURAL_SCHOOL: constants.YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  SPECIALIZED_SCHOOL: YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  APPRENTICESHIP: YOUNG_SITUATIONS.APPRENTICESHIP,
};
var FORMAT = {
  CONTINUOUS: "CONTINUOUS",
  DISCONTINUOUS: "DISCONTINUOUS",
  AUTONOMOUS: "AUTONOMOUS",
};
var REFERENT_ROLES = ROLES;
var REFERENT_DEPARTMENT_SUBROLE = {
  manager_department: SUB_ROLES.manager_department,
  assistant_manager_department: SUB_ROLES.assistant_manager_department,
  manager_phase2: SUB_ROLES.manager_phase2,
  secretariat: SUB_ROLES.secretariat,
};
var REFERENT_REGION_SUBROLE = {
  coordinator: SUB_ROLES.coordinator,
  assistant_coordinator: SUB_ROLES.assistant_coordinator,
  manager_phase2: SUB_ROLES.manager_phase2,
};
var MISSION_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
  REFUSED: "REFUSED",
  CANCEL: "CANCEL",
  ARCHIVED: "ARCHIVED",
};
var PERIOD = {
  WHENEVER: "WHENEVER",
  DURING_HOLIDAYS: "DURING_HOLIDAYS",
  DURING_SCHOOL: "DURING_SCHOOL",
};
var TRANSPORT = {
  PUBLIC_TRANSPORT: "PUBLIC_TRANSPORT",
  BIKE: "BIKE",
  MOTOR: "MOTOR",
  CARPOOLING: "CARPOOLING",
  OTHER: "OTHER",
};
var MISSION_PERIOD_DURING_HOLIDAYS = {
  SUMMER: "SUMMER",
  AUTUMN: "AUTUMN",
  DECEMBER: "DECEMBER",
  WINTER: "WINTER",
  SPRING: "SPRING",
};
var MISSION_PERIOD_DURING_SCHOOL = {
  EVENING: "EVENING",
  END_DAY: "END_DAY",
  WEEKEND: "WEEKEND",
};
var STRUCTURE_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
};
var DEFAULT_STRUCTURE_NAME = "Ma nouvelle Structure";
var COHORTS = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022", "Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023", "Juillet 2023"];
var COHORTS_BEFORE_JULY_2023 = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022", "Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023"];
var INTEREST_MISSION_LIMIT_DATE = {
  2019: "23 mars 2021",
  2020: "31 décembre 2021",
  2021: "30 juin 2022",
};
var ES_NO_LIMIT = 10000;
var SENDINBLUE_TEMPLATES = {
  SIGNIN_2FA: "1144",
  FORGOT_PASSWORD: "157",
  invitationReferent:
    ((_invitationReferent = {}),
    _defineProperty(_invitationReferent, ROLES.REFERENT_DEPARTMENT, "158"),
    _defineProperty(_invitationReferent, ROLES.REFERENT_REGION, "159"),
    _defineProperty(_invitationReferent, ROLES.RESPONSIBLE, "160"),
    _defineProperty(_invitationReferent, ROLES.SUPERVISOR, "160"),
    _defineProperty(_invitationReferent, ROLES.ADMIN, "161"),
    _defineProperty(_invitationReferent, ROLES.HEAD_CENTER, "162"),
    _defineProperty(_invitationReferent, ROLES.VISITOR, "286"),
    _defineProperty(_invitationReferent, ROLES.DSNJ, "662"),
    _defineProperty(_invitationReferent, ROLES.TRANSPORTER, "662"),
    _defineProperty(_invitationReferent, "NEW_STRUCTURE", "160"),
    _defineProperty(_invitationReferent, "NEW_STRUCTURE_MEMBER", "163"),
    _invitationReferent),
  INVITATION_YOUNG: "166",
  //session phase 1
  SHARE_SESSION_PHASE1: "419",
  //PHASE 2
  ATTACHEMENT_PHASE_2_APPLICATION: "571",
  // contract
  VALIDATE_CONTRACT: "176",
  REVALIDATE_CONTRACT: "175",
  referent: {
    WELCOME_REF_DEP: "378",
    WELCOME_REF_REG: "391",
    YOUNG_CHANGE_COHORT: "324",
    DEPARTURE_CENTER: "935",
    RECAP_BI_HEBDO_DEPARTMENT: "231",
    // MIG
    MISSION_WAITING_CORRECTION: "164",
    MISSION_WAITING_VALIDATION: "194",
    MISSION_VALIDATED: "63",
    MISSION_END: "213",
    MISSION_CANCEL: "233",
    NEW_MISSION: "192",
    NEW_MISSION_REMINDER: "195",
    MISSION_REFUSED: "165",
    CANCEL_APPLICATION: "155",
    CANCEL_APPLICATION_PHASE_2_VALIDATED: "599",
    ABANDON_APPLICATION: "214",
    VALIDATE_APPLICATION_TUTOR: "196",
    NEW_APPLICATION_MIG: "156",
    YOUNG_VALIDATED: "173",
    APPLICATION_REMINDER: "197",
    CONTRACT_DRAFT: "199",
    STRUCTURE_REGISTERED: "191",
    MISSION_ARCHIVED: "204",
    MISSION_ARCHIVED_1_WEEK_NOTICE: "205",
    // PREPA MILITAIRE
    MILITARY_PREPARATION_DOCS_SUBMITTED: "149",
    MILITARY_PREPARATION_DOCS_VALIDATED: "148",
    NEW_APPLICATION: "new-application",
    RELANCE_APPLICATION: "relance-application",
    //PHASE 3
    VALIDATE_MISSION_PHASE3: "174",
    // Support
    MESSAGE_NOTIFICATION: "218",
    //EQUIVALENCE
    EQUIVALENCE_WAITING_VERIFICATION: "341",
    // Account deletion
    DELETE_ACCOUNT_NOTIFICATION_1: "615",
    DELETE_ACCOUNT_NOTIFICATION_2: "616",
    INSTRUCTION_END_REMINDER: 874,
  },
  young: {
    CHANGE_COHORT: "325",
    WAITING_LIST: "601",
    WITHDRAWN: "61",
    // le contenu est specifique a la reinscription, il faudrait faire un message plus générique a terme
    ARCHIVED: "269",
    INSCRIPTION_STARTED: "219",
    INSCRIPTION_VALIDATED: "167",
    INSCRIPTION_REACTIVATED: "168",
    INSCRIPTION_WAITING_CORRECTION: "169",
    INSCRIPTION_REMIND_CORRECTION: "169",
    INSCRIPTION_WAITING_LIST: "171",
    INSCRIPTION_REFUSED: "172",
    INSTRUCTION_END_WAITING_VALIDATION_ELIGIBLE: "978",
    INSTRUCTION_END_WAITING_VALIDATION_NOT_ELIGIBLE: "656",
    INSTRUCTION_END_WAITING_CORRECTION_ELIGIBLE: "936",
    INSTRUCTION_END_WAITING_CORRECTION_NOT_ELIGIBLE: "658",
    PARENT_CONSENTED: "612",
    PARENT_DID_NOT_CONSENT: "613",
    PARENT2_DID_NOT_CONSENT: "634",
    PHASE1_AFFECTATION: "663",
    // MIG
    REFUSE_APPLICATION: "152",
    CANCEL_APPLICATION: "180",
    VALIDATE_APPLICATION: "151",
    MISSION_PROPOSITION: "170",
    MISSION_CANCEL: "261",
    MISSION_ARCHIVED: "227",
    MISSION_ARCHIVED_AUTO: "289",
    PHASE_2_VALIDATED: "154",
    MISSION_PROPOSITION_AUTO: "237",
    // PREPA MILITAIRE
    MILITARY_PREPARATION_DOCS_VALIDATED: "145",
    MILITARY_PREPARATION_DOCS_CORRECTION: "146",
    MILITARY_PREPARATION_DOCS_REFUSED: "147",
    //PHASE 3
    VALIDATE_PHASE3: "200",
    DOCUMENT: "182",
    CONTRACT_VALIDATED: "183",
    // Personal and situation changes
    DEPARTMENT_IN: "215",
    DEPARTMENT_OUT: "216",
    //Phase 1 pj
    PHASE_1_PJ_WAITING_VERIFICATION: "348",
    PHASE_1_PJ_WAITING_CORRECTION: "349",
    PHASE_1_PJ_VALIDATED: "350",
    PHASE_1_FOLLOW_UP_MEDICAL_FILE: "354",
    PHASE_1_AFFECTATION: "421",
    //send a download link to the young
    LINK: "410",
    //EQUIVALENCE
    EQUIVALENCE_REFUSED: "342",
    EQUIVALENCE_VALIDATED: "343",
    EQUIVALENCE_WAITING_VERIFICATION: "344",
    EQUIVALENCE_WAITING_CORRECTION: "346",
    APPLICATION_CANCEL_1_WEEK_NOTICE: "198",
    APPLICATION_CANCEL_13_DAY_NOTICE: "594",
  },
  YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL: "302",
  parent: {
    OUTDATED_ID_PROOF: "610",
    PARENT1_CONSENT: "605",
    PARENT2_CONSENT: "609",
    PARENT1_CONSENT_REMINDER: "621",
    PARENT_YOUNG_COHORT_CHANGE: "665",
    PARENT1_RESEND_IMAGERIGHT: "671",
    PARENT2_RESEND_IMAGERIGHT: "671",
    PARENT2_IMAGERIGHT_REMINDER: "852",
  },
  headCenter: {
    TIME_SCHEDULE_REMINDER: "697",
  },
  PLAN_TRANSPORT: {
    MODIFICATION_REFUSEE: "673",
    DEMANDE_DE_MODIFICATION: "672",
    MODIFICATION_ACCEPTEE: "674",
    MODIFICATION_SCHEMA: "810",
    NOTIF_REF: "1131",
  },
};
var SENDINBLUE_SMS = {
  PARENT1_CONSENT: {
    template: function template(young, cta) {
      return "Bonjour,\nNous avons besoin de votre accord pour que "
        .concat(young.firstName, " ")
        .concat(young.lastName, " participe au SNU !\nCliquez ici pour le donner : ")
        .concat(cta, "\nService National Universel");
    },
    tag: "sms_1",
  },
  PARENT2_CONSENT: {
    template: function template(young, cta) {
      return "Bonjour,\n"
        .concat(young.firstName, " ")
        .concat(young.lastName, " souhaite participer au SNU !\nDonnez votre accord pour l\u2019utilisation de son droit \xE0 l\u2019image en cliquant ici : ")
        .concat(cta, "\nService National Universel");
    },
    tag: "sms_2",
  },
  PARENT1_CONSENT_REMINDER: {
    template: function template(young, cta) {
      return "Bonjour,\nVous n\u2019avez pas encore donn\xE9 votre accord pour que "
        .concat(young.firstName, " ")
        .concat(young.lastName, " participe au SNU !\nCliquez ici pour le donner : ")
        .concat(cta, "\nService National Universel");
    },
    tag: "sms_3",
  },
  OUTDATED_ID_PROOF: {
    template: function template(young, cta) {
      return "Bonjour,\nLa pi\xE8ce d\u2019identit\xE9 de "
        .concat(young.firstName, " ")
        .concat(young.lastName, " est ou sera p\xE9rim\xE9e au moment du s\xE9jour.\nCliquez ici pour les d\xE9marches \xE0 suivre : ")
        .concat(cta, "\nService National Universel");
    },
    tag: "sms_4",
  },
};
var WITHRAWN_REASONS = [
  {
    value: "unavailable_perso",
    label: "Non disponibilité pour motif familial ou personnel",
  },
  {
    value: "unavailable_pro",
    label: "Non disponibilité pour motif scolaire ou professionnel",
  },
  {
    value: "change_date_july_2023",
    label: "Changements des dates de mon séjour du 5 au 17 juillet 2023",
    cohortOnly: ["Juillet 2023"],
  },
  {
    value: "no_interest",
    label: "Perte d'intérêt pour le SNU",
  },
  {
    value: "bad_affectation",
    label: "L'affectation ne convient pas",
  },
  {
    value: "can_not_go_metting_point",
    label: "Impossibilité de se rendre au point de rassemblement",
  },
  {
    value: "bad_mission",
    label: "L'offre de mission ne convient pas",
    phase2Only: true,
  },
  {
    value: "other",
    label: "Autre",
  },
];

//A decaler dans ./date au fur et a mesure
var COHESION_STAY_LIMIT_DATE = {
  2019: "du 16 au 28 juin 2019",
  2020: "du 21 juin au 2 juillet 2021",
  2021: "du 21 juin au 2 juillet 2021",
  "Février 2022": "du 13 au 25 Février 2022",
  "Juin 2022": "du 12 au 24 Juin 2022",
  "Juillet 2022": "du 3 au 15 Juillet 2022",
  "Février 2023 - C": "du 19 Février au 3 Mars 2023",
  "Avril 2023 - B": "du 16 au 28 Avril 2023",
  "Avril 2023 - A": "du 9 au 21 Avril 2023",
  "Juin 2023": "du 11 au 23 Juin 2023",
  "Juillet 2023": "du 5 au 17 Juillet 2023",
  "à venir": "à venir",
};
var COHESION_STAY_START = {
  2019: new Date("06/16/2019"),
  2020: new Date("06/21/2020"),
  2021: new Date("06/21/2021"),
  "Février 2022": new Date("02/13/2022"),
  "Juin 2022": new Date("06/12/2022"),
  "Juillet 2022": new Date("07/03/2022"),
  "Février 2023 - C": new Date("02/19/2023"),
  "Avril 2023 - A": new Date("04/09/2023"),
  "Avril 2023 - B": new Date("04/16/2023"),
  "Juin 2023": new Date("06/11/2023"),
  "Juillet 2023": new Date("07/05/2023"),
};
var START_DATE_SESSION_PHASE1 = {
  "Février 2022": new Date("03/13/2022"),
  "Juin 2022": new Date("06/12/2022"),
  "Juillet 2022": new Date("07/03/2022"),
  "Février 2023 - C": new Date("02/19/2023"),
  "Avril 2023 - A": new Date("04/09/2023"),
  "Avril 2023 - B": new Date("04/16/2023"),
  "Juin 2023": new Date("06/11/2023"),
  "Juillet 2023": new Date("07/04/2023"),
};
var START_DATE_PHASE1 = {
  2019: new Date("06/09/2019"),
  2020: new Date("06/14/2021"),
  2021: new Date("06/14/2021"),
  "Février 2022": new Date("02/06/2022"),
  "Juin 2022": new Date("06/05/2022"),
  "Juillet 2022": new Date("06/27/2022"),
};
var END_DATE_PHASE1 = {
  2019: new Date("06/29/2019"),
  2020: new Date("07/03/2021"),
  2021: new Date("07/03/2021"),
  "Février 2022": new Date("02/26/2022"),
  "Juin 2022": new Date("06/25/2022"),
  "Juillet 2022": new Date("07/16/2022"),
};
var PHASE1_YOUNG_ACCESS_LIMIT = {
  "Février 2023 - C": new Date(2023, 0, 12),
  // before 9 janvier 2023 morning
  "Avril 2023 - A": new Date(2023, 1, 14),
  // before 14 fevrier 2023 morning
  "Avril 2023 - B": new Date(2023, 1, 28),
  // before 28 fevrier 2023 morning
  "Juin 2023": new Date(2023, 3, 19),
  // before 19 avril 2023 morning
  "Juillet 2023": new Date(2023, 4, 11), // before 11 mai 2023 morning
};

var CONSENTMENT_TEXTS = {
  young: [
    "A lu et accepte les Conditions générales d'utilisation de la plateforme du Service national universel ;",
    "A pris connaissance des modalités de traitement de mes données personnelles ;",
    "Est volontaire, sous le contrôle des représentants légaux, pour effectuer la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d'intérêt général ;",
    "Certifie l'exactitude des renseignements fournis ;",
    "Si en terminale, a bien pris connaissance que si je suis convoqué(e) pour les épreuves du second groupe du baccalauréat entre le 6 et le 8 juillet 2022, je ne pourrai pas participer au séjour de cohésion entre le 3 et le 15 juillet 2022(il n’y aura ni dérogation sur la date d’arrivée au séjour de cohésion ni report des épreuves).",
  ],
  parents: [
    "Confirmation d'être titulaire de l'autorité parentale / le représentant légal du volontaire ;",
    "Autorisation du volontaire à participer à la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d & apos; intérêt général ;",
    "Engagement à renseigner le consentement relatif aux droits à l'image avant le début du séjour de cohésion ;",
    "Engagement à renseigner l'utilisation d'autotest COVID avant le début du séjour de cohésion ;",
    "Engagement à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires à son arrivée au centre de séjour de cohésion ;",
    "Engagement à ce que le volontaire soit à jour de ses vaccinations obligatoires, c'est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les volontaires résidents de Guyane, la fièvre jaune.",
  ],
};
var FILE_STATUS_PHASE1 = {
  TO_UPLOAD: "TO_UPLOAD",
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
};
var MINISTRES = [
  {
    date_end: "07-25-2020",
    ministres: [
      "Jean-Michel Blanquer, Ministre de l’Éducation Nationale, de la Jeunesse et des Sports",
      "Gabriel Attal, Secrétaire d’État auprès du ministre Éducation Nationale et de la Jeunesse",
    ],
    template: "certificates/certificateTemplate-2019.png",
  },
  {
    date_end: "05-19-2022",
    ministres: [
      "Jean-Michel Blanquer, Ministre de l’Éducation Nationale, de la Jeunesse et des Sports",
      "Sarah El Haïry, Secrétaire d’État auprès du ministre de l'Éducation Nationale et de la Jeunesse",
    ],
    template: "certificates/certificateTemplate.png",
  },
  {
    date_end: "07-04-2022",
    ministres: ["Pap Ndiaye, Ministre de l’Éducation Nationale et de la Jeunesse"],
    template: "certificates/certificateTemplate_2022.png",
  },
  {
    date_end: "04-05-2023",
    ministres: [
      "Pap Ndiaye, Ministre de l’Éducation Nationale et de la Jeunesse",
      "Sébastien Lecornu, Ministre des Armées",
      "Sarah El Haïry, Secrétaire d'État après du ministre de 'Éducation nationale et de la Jeunesse et du ministre des Armées, \
      chargée de la jeunesse et du Service national universel",
    ],
    template: "certificates/certificateTemplate_juillet_2022.png",
  },
  {
    date_end: "01-01-2100",
    // ! Changer ici à l'ajout d'un nouveau
    ministres: [
      "Pap Ndiaye, Ministre de l’Éducation Nationale et de la Jeunesse",
      "Sébastien Lecornu, Ministre des Armées",
      "Sarah El Haïry, Secrétaire d'État après du ministre de 'Éducation nationale et de la Jeunesse et du ministre des Armées, \
      chargée de la jeunesse et du Service national universel",
    ],
    template: "certificates/certificateTemplate2023.png",
  },
];
var FILE_KEYS = [
  "cniFiles",
  "highSkilledActivityProofFiles",
  "parentConsentmentFiles",
  "autoTestPCRFiles",
  "imageRightFiles",
  "dataProcessingConsentmentFiles",
  "rulesFiles",
  "equivalenceFiles",
];
var MILITARY_FILE_KEYS = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
var ENGAGEMENT_TYPES = [
  "Service Civique",
  "BAFA",
  "Jeune Sapeur Pompier",
  "Certification Union Nationale du Sport scolaire (UNSS)",
  "Engagements lycéens",
  "Préparation militaire hors offre MIG des armées",
];
var UNSS_TYPE = [
  "Jeunes arbitres",
  "Jeunes juges",
  "Jeunes coachs / capitaines",
  "Jeunes dirigeants",
  "Jeunes écoresponsables",
  "Jeunes interprètes",
  "Jeunes organisateurs",
  "Jeunes reporters",
  "Jeunes secouristes",
  "Jeunes vice-présidents",
];
var ENGAGEMENT_LYCEEN_TYPES = [
  "Elu au sein du conseil des délégués pour la vie lycéenne (CVL)",
  "Elu au sein du conseil académique de la vie lycéenne (CAVL)",
  "Elu au sein des conseils régionaux des jeunes",
];
var GRADES = {
  NOT_SCOLARISE: "NOT_SCOLARISE",
  "4eme": "4eme",
  "3eme": "3eme",
  "2ndePro": "2ndePro",
  "2ndeGT": "2ndeGT",
  "1ereGT": "1ereGT",
  "1erePro": "1erePro",
  TermGT: "TermGT",
  TermPro: "TermPro",
  CAP: "CAP",
  Autre: "Autre",
};
var TEMPLATE_DESCRIPTIONS = {
  1: "Le contact favori est le SMS + clic sur le bouton “confirmer” à la fin de l’inscription",
  2: "Moyen de contact favori est le SMS + Clic sur le bouton “confirmer” à la fin de l’inscription",
  3: "J+7 après l’envoi du 1er SMS si aucune action n’a été faite par le représentant légal (accord ou désaccord)",
  4: "Si l’ID du jeune est / sera périmée au moment du séjour + moment où le jeune renseigne la date de péremption de son ID",
  61: "Statut parcours SNU : désisté",
  63: 'Statut de la Mission "validée',
  65: 'Statut inscription "en attente de validation',
  145: "Dossier d’éligibilité aux PM validé",
  146: "Mise en attente de correction du dossier d’éligibilité aux PM",
  147: "Refus de documents pour une préparation militaire",
  148: "Nouveau déclencheur : candidat clique sur candidater à une PM OU Dossier PM validé par le référent départemental",
  149:
    "Le dossier d’éligibilité PM passe en statut ‘en attente de vérification” (/Volontaire a uploadé ses 3 ou 4 pièces ET candidaté à une PM)\n" +
    "Dans le cas de multi-candidatures, le référent n’est sollicité qu’une fois : lors de la première candidature. Une fois que le dossier est validé, le référent n’est plus sollicité et c’est les tuteurs des PM qui reçoivent https://www.notion.so/TUTEUR-PREPARATION-MILITAIRE-Jeune-valid-65c7a1c14e6740afbf93eed8f51157d7",
  150: "Clic sur \"Valider et envoyer le contrat d'engagement aux parties prenantes",
  151: 'Statut pour la mission "validée',
  152: "Statut candidature ⇒ refusée",
  154: "Validation de la phase 2 Félicitations pour votre engagement : vous avez validé la phase 2 du SNU !",
  155: 'Statut pour la mission "annulée',
  156: 'Statut du volontaire sur la mission "en attente de validation',
  157: "Click sur Démarche de réinitialisation de mot de passe",
  158: "Création d’un compte pour un nouveau référent",
  159: "Invitation d'un nouveau référent régional",
  160: "Invitation d'une nouvelle structure (avec responsable de structure renseigné)",
  161: "Invitation d'un  nouveau modérateur sur la plateforme",
  162: "Invitation mail de création de compte",
  163: "Un responsable de la structure (ou un administrateur SNU) invite un nouveau responsable dans la structure",
  164: 'Statut de la Mission "en attente de correction',
  165: 'Statut de la Mission "refusée',
  166: "Création manuelle d'une inscription",
  167: "Phase 0 : validée",
  168: "Création manuelle d'un volontaire par un référent",
  169: "Statut inscription ⇒ en attente de correction",
  170: "Mission proposée à un volontaire par un tiers",
  171: "Passage sur liste complémentaire à l’instruction du dossier",
  172: "Statut inscription ⇒ refusée",
  173: "Volontaire est approuvé sur la mission ⇒ quand la structure / le tuteur clique sur “approuver la candidature”",
  174: "Statut phase 3 : en attente de validation",
  175: "Click sur Enregistrer les modifications alors que le contrat était déjà envoyé et validé par le signataire.",
  176: 'Click depuis le contrat sur "Enregistrer et envoyer \xE0 toutes les parties -prenantes" OU click sur "Renvoyer le lien du contrat d\'engagement',
  180: "Statut candidature ⇒ annulée par le volontaire",
  182: "Clic sur le lien : je m'envoi un document depuis la plateforme",
  183: "Toutes les parties-prenantes ont validé le contrat d'engagement (statut contrat : Validé)",
  185: "Candidature à une PM",
  191: "Création (validation automatique) de la structure (2ème étape)",
  192: "Quand une mission passe du statut “brouillon” à “en attente de validation”",
  194: 'Statut de la Mission "en attente de validation',
  195: "Mission en attente de validation depuis 7 jours",
  196: 'Statut du volontaire sur la mission "approuvée',
  197: "Rappel candidature pas répondu à J+7",
  198: "Relance quand le volontaire n'a pas accepté ou décliné la mission au bout de 7 jours",
  199: "Le contrat d’engagement est en brouillon depuis plus de au moins 24h",
  200: "Validation de la phase 3",
  201: "Statut de PM : En attente de vérification d'éligibilité",
  204: "Statut de la mission Archivée",
  205: 'J-7 Statut de la mission "archivée',
  208: "Réponse reçue sur un ticket",
  209: "Relance quand le contrat d'engagement n'a pas été envoyé - statut “brouillon” (J+7 après validation de la candidature)",
  211: "Un référent créé une nouvelle structure avec une mission depuis la plateforme",
  212: "Mail hebdo aux structures, tous les lundi à 12h",
  213: "Fin de la mission (date du contrat d'engagement ou date de la fiche mission) : mail envoyé automatiquement le lundi de la semaine suivante à 9h",
  214: "Volontaire abandonne sa mission",
  215: "Changement de département d'adresse du volontaire",
  216: "Changement de département d'adresse du volontaire",
  217: "Un agent a répondu à sa demande depuis la plateforme, besoin d'aide.",
  218: "Demande d'aide reçue (étiquette : AGENT_Referent departemental + AGENT_Referent  regional)",
  219: "Fin de la pré-inscription avant le passage à l’inscription",
  220: 'Relance - inscription "En cours" depuis 3, 7, 20 jours (délai challengeable) - scenario : https://automation.sendinblue.com/scenarios/3#',
  221: 'Statut inscription "en attente de correction" depuis 3, 7, 20 jours (délai challengeable) - Scenario : https://automation.sendinblue.com/scenarios/7#',
  227: "Statut de la mission ⇒ archivée, envoi à tous les candidats dont le statut n'est pas : Validée ou Effectuée",
  228: "Clic sur le bouton : relancer le volontaire pour téléversement des pièces PM (Par référent ou admin)",
  229: "Récapitulatif hebdo activité sur région , envoyé 1 fois par semaine (mercredi ?)",
  231: "Envoi le mardi & jeudi (8h)",
  232: "Récapitulatif quotidien envoyé à 8heures (sauf we) lorsqu'il y a de l'activité",
  233: "Statut mission ⇒ annulée",
  234: "Changement de statut phase 1 => effectuée",
  237: "Email 1 fois par semaine si au moins 1 mission dans un périmètre de 20Km autour du jeune.",
  241: "Envoi le lundi (à 8h)",
  251: "En cas de réaffectation post-désistement (ou affectation manuelle)",
  261: "Statut de la mission ⇒ annulée, envoi à tous les candidats dont le statut n'est pas : Validée ou Effectuée",
  267: "SCRIPT réinscription volontaire désisté",
  268: "SCRIPT - Réinscription des volontaires désistés",
  269: "Click sur Anonymisation par modérateur",
  275: "Relance après changement de statut phase 1→ effectuée (relance M1, M3 et M6)",
  276: "Relance après changement de statut phase 2 → effectuée (relance M1, M6 et M12)",
  286: "Création d’un compte visiteur par un tiers",
  289: "Une mission est archivée automatiquement à la fin de sa date de validité",
  302: "Le volontaire est noté présent par le chef de centre",
  324: "Un volontaire a effectué un changement de séjour",
  325: "Changement de cohorte par un volontaire",
  331: 'Relance - inscription "En cours" - scenario : https://www.notion.so/eb431335b0dc43f5aff6fe2dba3ae649',
  341: "Un volontaire déposant une demande d’équivalence MIG",
  342: "Demande d’équivalence MIG refusée",
  343: "Demande d'équivalence MIG a été acceptée",
  344: "Volontaire a demandé la vérification de son dossier équivalence MIG",
  346: "Le référent demande la correction du dossier équivalence MIG",
  348: "Un volontaire a téléversé un document sur son compte volontaire",
  349: "Demande de correction sur un document",
  350: "Un document déposé a bien été validé",
  353: "Demande du référent de rajouter des documents clic sur le bouton relance volontaire",
  354: "Le référent clique sur le bouton relance pour demander la fiche sanitaire au volontaire",
  378: "Activation du compte d’un référent départemental",
  391: "Activation du compte d’un référent régional",
  410: "Bouton mail valider son séjour",
  419: "Génération de la liste pour consultation PDF",
  421: "Un jeune en liste complémentaire surbooking passe en affecté",
  571: "",
  588: "Relance du volontaire suite à action d’un administrateur (référent / modérateur)",
  594: "J+13 après la proposition de mission si le statut de la candidature est toujours “waiting_validation”",
  599: "Quand les candidatures d’un volontaire sont annulées parce qu’il a réalisé ses 84h de MIG",
  601: "Quand un jeune laisse son adresse mail sur la page inscription hors période d’inscription https://moncompte.snu.gouv.fr/inscription",
  602: "Réception d’une demande (quel que soit le canal) sur le support",
  605: "Clic sur le bouton “confirmer” à la fin de la préinscription",
  609: "",
  610: "Si l’ID du jeune est / sera périmée au moment du séjour",
  611: "Pré-inscription terminée - Clic sur “m’inscrire au SNU”",
  612: "Quand le représentant légal clique sur “Donner mon consentement”",
  613: "Quand le représentant légal ne donne pas son consentement",
  615: "Un référent est inactif sur la plateforme depuis 6 mois",
  616: "J+7 après l’envoi du template 615",
  620: "Clic sur le bouton s’inscrire au SNU et attente du consentement du représentant légal",
  621: "Relance à J+7 du dernier envoi du template 605",
  623: "Quand le représentant légal clique sur “Donner mon consentement”",
  634: "Quand le représentant légal ne donne pas son consentement",
  637: "La création d’une session sur un centre pour demander la validation de la session, à destination des modérateurs suivants",
  650: "Clôture des instructions - dossier non finalisé - basculement autre cohorte",
  651: "Clôture instruction - dossier non finalisé - plus éligible au SNU",
  655: "Jeunes restés en waiting validation après clôture instruction + encore éligibles SNU",
  656: "Jeunes restés en waiting validation après clôture instruction + non éligibles SNU",
  657: "Jeunes restés en waiting correction après clôture instruction + encore éligibles SNU",
  658: "Jeunes restés en waiting correction après clôture instruction + non éligibles SNU",
  662: "Invitation mail de création de compte",
  663: "Changement manuel ou automatique de l’affectation et / ou du PDR",
  665: "Quand un volontaire ou un référent change de séjour - A ne pas envoyer si le représentant légal n’a pas encore donné son consentement",
  671: "Un modérateur, référent régional ou référent départemental demande au RL une modification du droit à l’image",
  672: "Demande de modification sur le plan de transport",
  673: "La demande de modification de la ligne a été refusée",
  674: "La demande de modification de la ligne a été validée",
  697: "Quand un référent / modérateur clique sur le bouton “relance” pour demander au chef de centre de téléverser l’EDT de son séjour",
  935: "Jeunes restés en waiting validation après clôture instruction + encore éligibles SNU",
  936: "Jeunes restés en waiting correction après clôture instruction + encore éligibles SNU",
};
var MIME_TYPES = {
  EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
var STRUCTURE_LEGAL_STATUS = {
  PUBLIC: "PUBLIC",
  ASSOCIATION: "ASSOCIATION",
  PRIVATE: "PRIVATE",
  OTHER: "OTHER",
};

var translate = function translate(value) {
  switch (value) {
    case "NONE":
      return "Aucun";
    case "AFFECTED":
      return "Affectée";
    case "NOT_DONE":
      return "Non réalisée";
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_ACCEPTATION":
      return "En attente d'acceptation";
    case "WAITING_VERIFICATION":
      return "En attente de vérification d'éligibilité";
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "WAITING_CONSENT":
      return "En attente du consentement";
    case "CONFIRM":
      return "Confirmation";
    case "CORRECTED":
      return "Corrigée";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validée";
    case "DELETED":
      return "Supprimée";
    case "WAITING_LIST":
      return "Sur liste complémentaire";
    case "NOT_AUTORISED":
      return "Non autorisé";
    case "REINSCRIPTION":
      return "Réinscription";
    case "CONTINUOUS":
      return "Mission regroupée sur des journées";
    case "DISCONTINUOUS":
      return "Mission répartie sur des heures";
    case "AUTONOMOUS":
      return "En autonomie";
    case "DRAFT":
      return "Brouillon";
    case "REFUSED":
      return "Refusée";
    case "CANCEL":
      return "Annulée";
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "EXEMPTED":
      return "Dispensée";
    case "ILLNESS":
      return "Maladie d'un proche ou du volontaire";
    case "DEATH":
      return "Décès d'un proche ou du volontaire";
    case "ADMINISTRATION_CANCEL":
      return "Annulation du séjour par l'administration (COVID 19)";
    case "ABANDON":
      return "Abandonnée";
    case "ABANDONED":
      return "Inscription abandonnée";
    case "ARCHIVED":
      return "Archivée";
    case "DONE":
      return "Effectuée";
    case "WITHDRAWN":
      return "Désistée";
    case "NOT_COMPLETED":
      return "Non achevée";
    case "PRESELECTED":
      return "Présélectionnée";
    case "SIGNED_CONTRACT":
      return "Contrat signé";
    case "ASSOCIATION":
      return "Association";
    case "PUBLIC":
      return "Structure publique";
    case "PRIVATE":
      return "Structure privée";
    case "OTHER":
      return "Autre";
    case "GENERAL_SCHOOL":
      return "En voie générale ou technologique";
    case "PROFESSIONAL_SCHOOL":
      return "En voie professionnelle (hors apprentissage)";
    case "AGRICULTURAL_SCHOOL":
      return "En lycée agricole";
    case "SPECIALIZED_SCHOOL":
      return "En enseignement adapté";
    case "APPRENTICESHIP":
      return "En apprentissage";
    case "EMPLOYEE":
      return "Salarié(e)";
    case "INDEPENDANT":
      return "Indépendant(e)";
    case "SELF_EMPLOYED":
      return "Auto-entrepreneur";
    case "ADAPTED_COMPANY":
      return "En ESAT, CAT ou en entreprise adaptée";
    case "POLE_EMPLOI":
      return "Inscrit(e) à Pôle emploi";
    case "MISSION_LOCALE":
      return "Inscrit(e) à la Mission locale";
    case "CAP_EMPLOI":
      return "Inscrit(e) à Cap emploi";
    case "NOTHING":
      return "Inscrit(e) nulle part";
    case "admin":
      return "Modérateur";
    case "dsnj":
      return "DSNJ";
    case "transporter":
      return "Transporteur";
    case "referent_department":
      return "Référent départemental";
    case "referent_region":
      return "Référent régional";
    case "responsible":
      return "Responsable";
    case "head_center":
      return "Chef de centre";
    case "visitor":
      return "Visiteur";
    case "supervisor":
      return "Superviseur";
    case "manager_department":
      return "Chef de projet départemental";
    case "assistant_manager_department":
      return "Chef de projet départemental adjoint";
    case "manager_department_phase2":
      return "Référent départemental phase 2";
    case "manager_phase2":
      return "Référent phase 2";
    case "secretariat":
      return "Secrétariat";
    case "coordinator":
      return "Coordinateur régional";
    case "assistant_coordinator":
      return "Coordinateur régional adjoint";
    case "recteur_region":
      return "Recteur de région académique";
    case "recteur":
      return "Recteur d'académie";
    case "vice_recteur":
      return "Vice-recteur d'académie";
    case "dasen":
      return "Directeur académique des services de l'éducation nationale (DASEN)";
    case "sgra":
      return "Secrétaire général de région académique (SGRA)";
    case "sga":
      return "Secrétaire général d'académie (SGA)";
    case "drajes":
      return "Délégué régional académique à la jeunesse, à l'engagement et aux sports (DRAJES)";
    case "INSCRIPTION":
      return "Inscription";
    case "COHESION_STAY":
      return "Séjour de cohésion";
    case "INTEREST_MISSION":
      return "Mission d'intérêt général";
    case "CONTINUE":
      return "Poursuivre le SNU";
    case "SUMMER":
      return "Vacances d'été (juillet ou août)";
    case "AUTUMN":
      return "Vacances d'automne";
    case "DECEMBER":
      return "Vacances de fin d'année (décembre)";
    case "WINTER":
      return "Vacances d'hiver";
    case "SPRING":
      return "Vacances de printemps";
    case "EVENING":
      return "En soirée";
    case "END_DAY":
      return "Pendant l'après-midi";
    case "WEEKEND":
      return "Durant le week-end";
    case "CITIZENSHIP":
      return "Citoyenneté";
    case "CULTURE":
      return "Culture";
    case "DEFENSE":
      return "Défense et mémoire";
    case "EDUCATION":
      return "Éducation";
    case "ENVIRONMENT":
      return "Environnement";
    case "HEALTH":
      return "Santé";
    case "SECURITY":
      return "Sécurité";
    case "SOLIDARITY":
      return "Solidarité";
    case "MILITARY":
      return "Militaire";
    case "SPORT":
      return "Sport";
    case "UNIFORM":
      return "Corps en uniforme";
    case "UNKNOWN":
      return "Non connu pour le moment";
    case "FIREFIGHTER":
      return "Pompiers";
    case "POLICE":
      return "Police";
    case "ARMY":
      return "Militaire";
    case "WHENEVER":
      return "N’importe quand";
    case "DURING_HOLIDAYS":
      return "Sur les vacances scolaires";
    case "DURING_SCHOOL":
      return "Sur le temps extra-scolaire";
    case "true":
      return "Oui";
    case "false":
      return "Non";
    case "male":
      return "Homme";
    case "female":
      return "Femme";
    case "father":
      return "Père";
    case "mother":
      return "Mère";
    case "representant":
      return "Autre";
    case "SERVER_ERROR":
      return "Erreur serveur";
    case "NOT_FOUND":
      return "Ressource introuvable";
    case "PASSWORD_TOKEN_EXPIRED_OR_INVALID":
      return "Lien expiré ou token invalide";
    case "USER_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "PASSWORD_NOT_VALIDATED":
      return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
    case "INVITATION_TOKEN_EXPIRED_OR_INVALID":
      return "Invitation invalide";
    case "USER_NOT_FOUND":
      return "Utilisateur introuvable";
    case "USER_NOT_EXISTS":
      return "L'utilisateur n'existe pas";
    case "OPERATION_UNAUTHORIZED":
      return "Opération non autorisée";
    case "FILE_CORRUPTED":
      return "Ce fichier est corrompu";
    case "FILE_INFECTED":
      return "Votre fichier a été détecté comme un virus";
    case "FILE_SCAN_DOWN":
      return "Nous rencontrons actuellement un problème avec le téléversement des pièces jointes sur cette page. Veuillez retenter un peu plus tard. Excusez-nous pour la gène occasionnée.";
    case "FILE_SCAN_DOWN_SUPPORT":
      return "Nous rencontrons actuellement un problème avec le téléversement des pièces jointes sur cette page. Envoyez votre message sans pièce jointe ou retentez plus tard. Veuillez nous excuser pour la gène occasionnée.";
    case "UPLOAD_IN_PROGRESS":
      return "Le téléversement de pièce jointe peut prendre un peu de temps, merci de ne pas rafraîchir la page et de patienter quelques instants.";
    case "YOUNG_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "OPERATION_NOT_ALLOWED":
      return "Opération non autorisée";
    case "BIKE":
      return "Vélo";
    case "MOTOR":
      return "Motorisé";
    case "CARPOOLING":
      return "Covoiturage";
    case "WAITING_REALISATION":
      return "En attente de réalisation";
    case "PUBLIC_TRANSPORT":
      return "Transport en commun";
    case "IN_COMING":
      return "À venir";
    case "other":
      return "Autre";
    case "SENT":
      return "Envoyée";
    case "UNSUPPORTED_TYPE":
      return "Type non pris en charge";
    case "LINKED_OBJECT":
      return "Objet lié";
    case "LINKED_MISSIONS":
      return "Objet lié à une mission";
    case "LINKED_STRUCTURE":
      return "Objet lié à une structure";
    case "NO_TEMPLATE_FOUND":
      return "Template introuvable";
    case "INVALID_BODY":
      return "Requête invalide";
    case "INVALID_PARAMS":
      return "Requête invalide";
    case "EMAIL_OR_PASSWORD_INVALID":
      return "Email ou mot de passe invalide";
    case "PASSWORD_INVALID":
      return "Mot de passe invalide";
    case "EMAIL_INVALID":
      return "Email invalide";
    case "EMAIL_ALREADY_USED":
      return "Cette adresse e-mail est déjà utilisée";
    case "EMAIL_AND_PASSWORD_REQUIRED":
      return "Email et mot de passe requis";
    case "PASSWORD_NOT_MATCH":
      return "Les mots de passe ne correspondent pas";
    case "NEW_PASSWORD_IDENTICAL_PASSWORD":
      return "Le nouveau mot de passe est identique à l'ancien";
    case "YOUNG_NOT_FOUND":
      return "Jeune(s) introuvable(s)";
    case "cniNew":
      return "CNI (nouveau format)";
    case "cniOld":
      return "CNI (ancien format)";
    case "passport":
      return "Passeport";
    case "NOT_SCOLARISE":
      return "Non scolarisé";
    case "REMINDER_SENT":
      return "La relance a bien été envoyée";
    case "BAD_REQUEST":
      return "Votre demande n'a pas pu être prise en compte";
    case "COPIED_TO_CLIPBOARD":
      return "Copié dans le presse-papiers";
    case "COORDONNEES":
      return "Coordonnées";
    case "REPRESENTANTS":
      return "Représentants";
    case "DOCUMENTS":
      return "Documents";
    case "mobilityNearHome":
      return "De leur domicile";
    case "mobilityNearSchool":
      return "De leur établissement";
    case "mobilityNearRelative":
      return "De l'hébergement d'un proche";
    default:
      return value;
  }
};
var translateInscriptionStatus = function translateInscriptionStatus(value) {
  switch (value) {
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "REINSCRIPTION":
      return "Réinscription";
    case "VALIDATED":
      return "Validée sur liste principale";
    case "REFUSED":
      return "Refusée";
    case "IN_PROGRESS":
      return "En cours";
    case "WITHDRAWN":
      return "Désistée";
    case "DELETED":
      return "Supprimée";
    case "WAITING_LIST":
      return "Validée sur liste complémentaire";
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "ABANDONED":
      return "Inscription abandonnée";
    case "NOT_AUTORISED":
      return "Non autorisée";
    default:
      return value;
  }
};
var translateVisibilty = function translateVisibilty(v) {
  switch (v) {
    case "VISIBLE":
      return "Ouverte";
    case "HIDDEN":
      return "Fermée";
    default:
      return v;
  }
};
var translateState = function translateState(state) {
  switch (state) {
    case "open":
    case "OPEN":
      return "ouvert";
    case "new":
    case "NEW":
      return "nouveau";
    case "closed":
    case "CLOSED":
      return "archivé";
    case "pending reminder":
    case "PENDING REMINDER":
      return "rappel en attente";
    case "pending closure":
    case "PENDING CLOSURE":
      return "clôture en attente";
    case "pending":
    case "PENDING":
      return "en attente";
    default:
      return state;
  }
};
var translateCohort = function translateCohort(cohort) {
  switch (cohort) {
    case "Février 2022":
      return "du 13 au 25 Février 2022";
    case "Juin 2022":
      return "du 12 au 24 Juin 2022";
    case "Juillet 2022":
      return "du 3 au 15 Juillet 2022";
    case "Février 2023 - C":
      return "du 19 Février au 3 Mars 2023";
    case "Avril 2023 - B":
      return "du 16 au 28 Avril 2023";
    case "Avril 2023 - A":
      return "du 9 au 21 Avril 2023";
    case "Juin 2023":
      return "du 11 au 23 Juin 2023";
    case "Juillet 2023":
      return "du 4 au 16 Juillet 2023";
    default:
      return cohort;
  }
};
var translateCohortTemp = function translateCohortTemp(young) {
  var cohort = young.cohort;
  switch (cohort) {
    case "Février 2022":
      return "du 13 au 25 Février 2022";
    case "Juin 2022":
      return "du 12 au 24 Juin 2022";
    case "Juillet 2022":
      return "du 3 au 15 Juillet 2022";
    case "Février 2023 - C":
      return "du 19 Février au 3 Mars 2023";
    case "Avril 2023 - B":
      return "du 16 au 28 Avril 2023";
    case "Avril 2023 - A":
      return "du 9 au 21 Avril 2023";
    case "Juin 2023":
      return "du 11 au 23 Juin 2023";
    case "Juillet 2023":
      if ([].concat(_toConsumableArray(regionsListDROMS), ["Polynésie française"]).includes(young.region)) {
        return "du 4 au 16 Juillet 2023";
      }
      return "du 5 au 17 Juillet 2023";
    default:
      return cohort;
  }
};
var translateSessionStatus = function translateSessionStatus(statut) {
  switch (statut) {
    case "VALIDATED":
      return "Validé";
    case "DRAFT":
      return "Brouillon";
    default:
      return statut;
  }
};
var translatePhase1 = function translatePhase1(phase1) {
  switch (phase1) {
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "AFFECTED":
      return "Affectée";
    case "EXEMPTED":
      return "Dispensée";
    case "DONE":
      return "Validée";
    case "NOT_DONE":
      return "Non réalisée";
    case "WITHDRAWN":
      return "Désistée";
    case "CANCEL":
      return "Annulée";
    case "WAITING_LIST":
      return "Sur liste complémentaire";
    case "IN_COMING":
      return "À venir";
    default:
      return phase1;
  }
};
var translatePhase2 = function translatePhase2(phase2) {
  switch (phase2) {
    case "WAITING_REALISATION":
      return "Inactif";
    case "IN_PROGRESS":
      return "Actif";
    case "VALIDATED":
      return "Validée";
    case "WITHDRAWN":
      return "Désistée";
    case "IN_COMING":
      return "À venir";
    default:
      return phase2;
  }
};
var translateContractStatus = function translateContractStatus(contract) {
  switch (contract) {
    case "DRAFT":
      return "Brouillon";
    case "SENT":
      return "Envoyé";
    case "VALIDATED":
      return "Validé";
    default:
      return contract;
  }
};
var translateApplication = function translateApplication(candidature) {
  switch (candidature) {
    case "WAITING_VALIDATION":
      return "Candidature en attente de validation";
    case "WAITING_VERIFICATION":
      return "En attente de vérification d'éligibilité";
    case "WAITING_ACCEPTATION":
      return "Proposition de mission en attente";
    case "VALIDATED":
      return "Candidature approuvée";
    case "REFUSED":
      return "Candidature non retenue";
    case "CANCEL":
      return "Candidature annulée";
    case "IN_PROGRESS":
      return "Mission en cours";
    case "DONE":
      return "Mission effectuée";
    case "ABANDON":
      return "Mission abandonnée";
    case "N/A":
      return "Aucune candidature ni proposition";
    default:
      return candidature;
  }
};
var translateApplicationForYoungs = function translateApplicationForYoungs(candidature) {
  switch (candidature) {
    case "WAITING_VALIDATION":
      return "Candidature en attente";
    case "WAITING_VERIFICATION":
      return "Candidature en attente";
    case "WAITING_ACCEPTATION":
      return "Proposition de mission en attente";
    case "VALIDATED":
      return "Candidature approuvée";
    case "REFUSED":
      return "Candidature non retenue";
    case "CANCEL":
      return "Candidature annulée";
    case "IN_PROGRESS":
      return "Mission en cours";
    case "DONE":
      return "Mission effectuée";
    case "ABANDON":
      return "Mission abandonnée";
    default:
      return candidature;
  }
};
var translateEngagement = function translateEngagement(engagement) {
  switch (engagement) {
    case "DRAFT":
      return "Brouillon";
    case "SENT":
      return "Envoyée";
    case "VALIDATED":
      return "Contrat signé";
    default:
      return engagement;
  }
};
var translateFileStatusPhase1 = function translateFileStatusPhase1(status) {
  switch (status) {
    case "TO_UPLOAD":
      return "À renseigner";
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "VALIDATED":
      return "Validé";
    case "cohesionStayMedical":
      return "fiche sanitaire";
    case "autoTestPCR":
      return "consentement à l’utilisation d’autotest COVID";
    case "imageRight":
      return "consentement de droit à l'image";
    case "rules":
      return "règlement intérieur";
    default:
      return status;
  }
};
var translateStatusMilitaryPreparationFiles = function translateStatusMilitaryPreparationFiles(status) {
  switch (status) {
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "VALIDATED":
      return "Validé";
    case "REFUSED":
      return "Refusé";
    default:
      return status;
  }
};
var translateEquivalenceStatus = function translateEquivalenceStatus(status) {
  switch (status) {
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "VALIDATED":
      return "Validée";
    case "REFUSED":
      return "Refusée";
    default:
      return status;
  }
};
var translateAddFilePhase2WithoutPreposition = function translateAddFilePhase2WithoutPreposition(status) {
  switch (status) {
    case "contractAvenantFiles":
      return "Avenant au contrat d’engagement";
    case "justificatifsFiles":
      return "Document justificatif";
    case "feedBackExperienceFiles":
      return "Retour d\u2019exp\xE9rience (rapport de MIG)";
    case "othersFiles":
      return "Document";
    default:
      return status;
  }
};
var translateAddFilePhase2 = function translateAddFilePhase2(status) {
  switch (status) {
    case "contractAvenantFiles":
      return "un avenant au contrat d’engagement";
    case "justificatifsFiles":
      return "un document justificatif";
    case "feedBackExperienceFiles":
      return "un retour d\u2019exp\xE9rience (rapport de MIG)";
    case "othersFiles":
      return "un document";
    default:
      return status;
  }
};
var translateAddFilesPhase2 = function translateAddFilesPhase2(status) {
  switch (status) {
    case "contractAvenantFiles":
      return "plusieurs avenants au contrat d’engagement";
    case "justificatifsFiles":
      return "plusieurs documents justificatifs";
    case "feedBackExperienceFiles":
      return "plusieurs retours d\u2019exp\xE9riences (rapport de MIG)";
    case "othersFiles":
      return "plusieurs documents";
    default:
      return status;
  }
};
var translateSource = function translateSource(bool) {
  if (bool === "true") return "JVA";
  else return "SNU";
};
var translateFilter = function translateFilter(label) {
  switch (label) {
    // Volontaires
    case "SEARCH":
      return "Rechercher";
    case "STATUS":
      return "Statut";
    case "COHORT":
      return "Cohorte";
    case "ORIGINAL_COHORT":
      return "Cohorte d'origine";
    case "DEPARTMENT":
      return "Département";
    case "REGION":
      return "Région";
    case "STATUS_PHASE_1":
      return "Status phase 1";
    case "STATUS_PHASE_2":
      return "Statut phase2";
    case "STATUS_PHASE_3":
      return "Statut phase 3";
    case "APPLICATION_STATUS":
      return "Statut de la candidature";
    case "LOCATION":
      return "Lieu";
    case "CONTRACT_STATUS":
      return "Statut du contrat";
    case "MEDICAL_FILE_RECEIVED":
      return "Fichier médical réceptionné";
    case "COHESION_PRESENCE":
      return "Présence à l'arrivée";
    case "MILITARY_PREPARATION_FILES_STATUS":
      return "Statut des fichiers de PM";
    case "EQUIVALENCE_STATUS":
      return "Statut de la demande d'équivalence";
    case "HANDICAP":
      return "Handicap";
    case "GRADE":
      return "Classe";
    case "IMAGE_RIGHT":
      return "Droit à l'image";
    case "IMAGE_RIGHT_STATUS":
      return "Droit à l'image - Statut";
    case "RULES":
      return "Règlement intérieur";
    case "AUTOTEST":
      return "Utilisation d'autotest";
    case "AUTOTEST_STATUS":
      return "Utilisation d'autotest - Statut";
    case "SPECIFIC_AMENAGEMENT":
      return "Aménagement spécifique";
    case "SAME_DEPARTMENT":
      return "Affectation dans son département (handicap)";
    case "ALLERGIES":
      return "Allergies ou intolérances";
    case "COHESION_PARTICIPATION":
      return "Confirmation de participation au séjour de cohésion";
    case "COHESION_JDM":
      return "Présence à la JDM";
    case "DEPART":
      return "Départ renseigné";
    case "DEPART_MOTIF":
      return "Motif du départ";
    case "SAME_DEPARTMENT_SPORT":
      return "Affectation dans son département (sport)";
    case "PMR":
      return "Aménagement PMR";
    case "PPS":
      return "PPS";
    case "PAI":
      return "PAI";
    case "QPV":
      return "QPV";
    case "ZRR":
      return "ZRR";
    case "PLANE":
      return "Voyage en avion";

    // Missions
    case "DOMAIN":
      return "Domaine";
    case "PLACES":
      return "Places restantes";
    case "TUTOR":
      return "Tuteur";
    case "STRUCTURE":
      return "Structure";
    case "MILITARY_PREPARATION":
      return "Préparation militaire";
    case "DATE":
      return "Date";
    case "SOURCE":
      return "Source";
    case "VISIBILITY":
      return "Visibilité";
    case "PLACESTATUS":
      return "Place occupées";
    case "APPLICATIONSTATUS":
      return "Statut de candidature";

    // Structures
    case "LEGAL_STATUS":
      return "Statut juridique";
    case "CORPS":
      return "Corps en uniforme";
    case "WITH_NETWORK":
      return "Affiliation à un réseau national";
    case "TYPE":
      return "Type";
    case "SOUS-TYPE":
      return "Sous-type";
    default:
      return label;
  }
};
var translateGrade = function translateGrade(grade) {
  switch (grade) {
    case "NOT_SCOLARISE":
      return "Non scolarisé(e)";
    case "4eme":
      return "4ème";
    case "3eme":
      return "3ème";
    case "2nde":
      return "2nde";
    case "1ere":
      return "1ère";
    case "1ere CAP":
      return "1ère CAP";
    case "Terminale":
      return "Terminale";
    case "TERM_CAP":
      return "Terminale CAP";
    case "2ndePro":
      return "2nde professionnelle";
    case "2ndeGT":
      return "2nde génerale et technologique";
    case "1erePro":
      return "1ere professionnelle";
    case "1ereGT":
      return "1ere génerale et technologique";
    case "CAP":
      return "CAP";
    case "Autre":
      return "Autre";
    case "TermGT":
      return "Terminale génerale et technologique";
    case "TermPro":
      return "Terminale professionnelle";
    default:
      return grade;
  }
};
var translateField = function translateField(field) {
  switch (field) {
    case "firstName":
      return "Prénom";
    case "lastName":
      return "Nom";
    case "gender":
      return "Sexe";
    case "cohort":
      return "Cohorte";
    case "originalCohort":
      return "Cohorte d'origine";
    case "email":
      return "Email";
    case "phone":
      return "Téléphone";
    case "birthdateAt":
      return "Date de naissance";
    case "birthCountry":
      return "Pays de naissance";
    case "birthCity":
      return "Ville de naissance";
    case "birthCityZip":
      return "Code postal de naissance";
    case "address":
      return "Adresse";
    case "zip":
      return "Code postal";
    case "city":
      return "Ville";
    case "country":
      return "Pays";
    case "hostLastName":
      return "Nom de l'hébergeur";
    case "hostFirstName":
      return "Prénom de l'hébergeur";
    case "hostRelationship":
      return "Lien avec l'hébergeur";
    case "foreignAddress":
      return "Adresse - étranger";
    case "foreignZip":
      return "Code postal - étranger";
    case "foreignCity":
      return "Ville - étranger";
    case "foreignCountry":
      return "Pays - étranger";
    case "department":
      return "Département";
    case "academy":
      return "Académie";
    case "region":
      return "Région";
    case "situation":
      return "Situation";
    case "grade":
      return "Niveau";
    case "schoolType":
      return "Type d'établissement";
    case "schoolName":
      return "Nom de l'établissement";
    case "schoolZip":
      return "Code postal de l'établissement";
    case "schoolCity":
      return "Ville de l'établissement";
    case "schoolDepartment":
      return "Département de l'établissement";
    case "schoolRegion":
      return "Région de l'établissement";
    case "qpv":
      return "Quartier Prioritaire de la ville";
    case "populationDensity":
      return "Zone Rurale";
    case "handicap":
      return "Handicap";
    case "ppsBeneficiary":
      return "PPS";
    case "paiBeneficiary":
      return "PAI";
    case "specificAmenagment":
      return "Aménagement spécifique";
    case "specificAmenagmentType":
      return "Nature de l'aménagement spécifique";
    case "reducedMobilityAccess":
      return "Aménagement pour mobilité réduite";
    case "handicapInSameDepartment":
      return "Besoin d'être affecté(e) dans le département de résidence";
    case "allergies":
      return "Allergies ou intolérances alimentaires";
    case "highSkilledActivity":
      return "Activité de haut-niveau";
    case "highSkilledActivityType":
      return "Nature de l'activité de haut-niveau";
    case "highSkilledActivityInSameDepartment":
      return "Activités de haut niveau nécessitant d'être affecté dans le département de résidence";
    case "highSkilledActivityProofFiles":
      return "Document activité de haut-niveau";
    case "medicosocialStructure":
      return "Structure médico-sociale";
    case "medicosocialStructureName":
      return "Nom de la structure médico-sociale";
    case "medicosocialStructureAddress":
      return "Adresse de la structure médico-sociale";
    case "medicosocialStructureZip":
      return "Code postal de la structure médico-sociale";
    case "medicosocialStructureCity":
      return "Ville de la structure médico-sociale";
    case "parent1Status":
      return "Statut du représentant légal 1";
    case "parent1FirstName":
      return "Prénom du représentant légal 1";
    case "parent1LastName":
      return "Nom du représentant légal 1";
    case "parent1Email":
      return "Email du représentant légal 1";
    case "parent1Phone":
      return "Téléphone du représentant légal 1";
    case "parent1Address":
      return "Adresse du représentant légal 1";
    case "parent1Zip":
      return "Code postal du représentant légal 1";
    case "parent1City":
      return "Ville du représentant légal 1";
    case "parent1Department":
      return "Département du représentant légal 1";
    case "parent1Region":
      return "Région du représentant légal 1";
    case "parent2Status":
      return "Statut du représentant légal 2";
    case "parent2FirstName":
      return "Prénom du représentant légal 2";
    case "parent2LastName":
      return "Nom du représentant légal 2";
    case "parent2Email":
      return "Email du représentant légal 2";
    case "parent2Phone":
      return "Téléphone du représentant légal 2";
    case "parent2Address":
      return "Adresse du représentant légal 2";
    case "parent2Zip":
      return "Code postal du représentant légal 2";
    case "parent2City":
      return "Ville du représentant légal 2";
    case "parent2Department":
      return "Département du représentant légal 2";
    case "parent2Region":
      return "Région du représentant légal 2";
    case "cniExpirationDate":
      return "Date d'expiration de la CNI";
    case "cniFile":
      return "Pièce d'identité";
    case "latestCNIFileExpirationDate":
      return "Date d'expiration de la pièce d'identité";
    default:
      return field;
  }
};
var translateCorrectionReason = function translateCorrectionReason(reason) {
  switch (reason) {
    case "UNREADABLE":
      return "Pièce illisible";
    case "MISSING_FRONT":
      return "Recto à fournir";
    case "MISSING_BACK":
      return "Verso à fournir";
    case "NOT_SUITABLE":
      return "Pièce ne convenant pas...";
    case "OTHER":
      return "Autre";
    default:
      return reason;
  }
};
var translateApplicationFileType = function translateApplicationFileType(type) {
  switch (type) {
    case "contractAvenantFiles":
      return "Avenant au contrat d'engagement";
    case "justificatifsFiles":
      return "Document justificatif";
    case "feedBackExperienceFiles":
      return "Retour d'expérience";
    case "othersFiles":
      return "Autre";
    default:
      return type;
  }
};
var translateAction = function translateAction(action) {
  switch (action) {
    case "add":
      return "Ajout";
    case "replace":
      return "Modification";
    case "remove":
      return "Suppression";
    default:
      return action;
  }
};
var translateTypologieCenter = function translateTypologieCenter(typology) {
  switch (typology) {
    case "PUBLIC_ETAT":
      return "Public / État";
    case "PUBLIC_COLLECTIVITE":
      return "Public / Collectivité territoriale";
    case "PRIVE_ASSOCIATION":
      return "Privé / Association ou fondation";
    case "PRIVE_AUTRE":
      return "Privé / Autre";
    default:
      return typology;
  }
};
var translateDomainCenter = function translateDomainCenter(domain) {
  switch (domain) {
    case "ETABLISSEMENT":
      return "Etablissement d’enseignement";
    case "VACANCES":
      return "Centre de vacances";
    case "FORMATION":
      return "Centre de formation";
    case "AUTRE":
      return "Autres";
    default:
      return domain;
  }
};
var translateMission = function translateMission(mission) {
  switch (mission) {
    case "FULL":
      return "Toutes les places occupées";
    case "EMPTY":
      return "Aucune place occupée";
    case "ONE_OR_MORE":
      return "Au moins une place occupée";
    default:
      return mission;
  }
};
var translateCniExpired = function translateCniExpired(cniExpired) {
  switch (cniExpired) {
    case "true":
      return "En attente";
    default:
      return "Validée";
  }
};

// --------------------------------------------------------------
// Utilisé pour traduire l'historique des plans de transport

var globalFields = {
  createdAt: "Date de création",
  updatedAt: "Date de modification",
};
var busPatchFields = {
  cohort: "Cohorte de la ligne de bus",
  busId: "Numero de bus",
  departuredDate: "Date de départ",
  returnDate: "Date de retour",
  youngCapacity: "Capacité de jeunes",
  totalCapacity: "Capacité totale",
  followerCapacity: "Capacité d'accompagnateurs",
  youngSeatsTaken: "Nombre de jeunes",
  travelTime: "Temps de route",
  lunchBreak: "Pause déjeuner aller",
  lunchBreakReturn: "Pause déjeuner retour",
  sessionId: "Session",
  centerId: "Centre de destination",
  centerArrivalTime: "Heure d'arrivée au centre",
  centerDepartureTime: "Heure de départ du centre",
  meetingPointsIds: "Points de rassemblement",
  km: "Distance",
};
var lineToPointFields = {
  lineId: "Id de la ligne de bus",
  meetingPointId: "Point de rassemblement",
  busArrivalHour: "Heure d'arrivée du bus",
  departureHour: "Heure de départ",
  meetingHour: "Heure de convocation",
  returnHour: "Heure de retour",
  transportType: "Type de transport",
  stepPoints: "Point d'étape",
};
var busModificationFields = {
  cohort: "Cohorte de la ligne de bus",
  lineId: "Id de la ligne de bus",
  lineName: "Nom de la ligne de bus",
  requestMessage: "Message de la demande de modification",
  requestUserId: "Utilisateur ayant fait la demande",
  requestUserName: "Nom de l'utilisateur ayant fait la demande",
  requestUserRole: "Rôle de l'utilisateur ayant fait la demande",
  tagIds: "Tags de la demande",
  status: "Statut de la demande",
  statusUserId: "Id de l'utilisateur ayant changé le statut de la demande",
  statusUserName: "Nom de l'utilisateur ayant changé le statut de la demande",
  statusDate: "Date du changement de statut de la demande",
  opinion: "Avis sur la demande",
  opinionUserId: "Id de l'utilisateur ayant donné son avis sur la demande",
  opinionUserName: "Nom de l'utilisateur ayant donné son avis sur la demande",
  opinionDate: "Date de l'avis sur la demande",
  messages: "Conversation sur la demande",
};
var allBusPatchesFields = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, globalFields), busPatchFields), lineToPointFields), busModificationFields);
function translateBusPatchesField(path) {
  // const translationKey = Object.keys(allBusPatchesFields).find((key) => path.includes(key));
  // return translationKey ? allBusPatchesFields[translationKey] : path;
  return allBusPatchesFields[path] ? allBusPatchesFields[path] : path;
}
var translation = {
  translate: translate,
  translateState: translateState,
  translateCohort: translateCohort,
  translateCohortTemp: translateCohortTemp,
  translateSessionStatus: translateSessionStatus,
  translatePhase1: translatePhase1,
  translateContractStatus: translateContractStatus,
  translatePhase2: translatePhase2,
  translateApplication: translateApplication,
  translateApplicationForYoungs: translateApplicationForYoungs,
  translateEngagement: translateEngagement,
  translateFileStatusPhase1: translateFileStatusPhase1,
  translateStatusMilitaryPreparationFiles: translateStatusMilitaryPreparationFiles,
  translateEquivalenceStatus: translateEquivalenceStatus,
  translateAddFilePhase2: translateAddFilePhase2,
  translateAddFilesPhase2: translateAddFilesPhase2,
  translateAddFilePhase2WithoutPreposition: translateAddFilePhase2WithoutPreposition,
  translateVisibilty: translateVisibilty,
  translateFilter: translateFilter,
  translateSource: translateSource,
  translateGrade: translateGrade,
  translateField: translateField,
  translateCorrectionReason: translateCorrectionReason,
  translateApplicationFileType: translateApplicationFileType,
  translateAction: translateAction,
  translateTypologieCenter: translateTypologieCenter,
  translateDomainCenter: translateDomainCenter,
  translateMission: translateMission,
  translateBusPatchesField: translateBusPatchesField,
  translateInscriptionStatus: translateInscriptionStatus,
  translateCniExpired: translateCniExpired,
};

var departmentToAcademy = {
  Allier: "Clermont-Ferrand",
  Cantal: "Clermont-Ferrand",
  "Haute-Loire": "Clermont-Ferrand",
  "Puy-de-Dôme": "Clermont-Ferrand",
  Ardèche: "Grenoble",
  Drôme: "Grenoble",
  Isère: "Grenoble",
  Savoie: "Grenoble",
  "Haute-Savoie": "Grenoble",
  Ain: "Lyon",
  Loire: "Lyon",
  Rhône: "Lyon",
  Doubs: "Besançon",
  Jura: "Besançon",
  "Haute-Saône": "Besançon",
  "Territoire de Belfort": "Besançon",
  "Côte-d'Or": "Dijon",
  Nièvre: "Dijon",
  "Saône-et-Loire": "Dijon",
  Yonne: "Dijon",
  "Côtes-d'Armor": "Rennes",
  Finistère: "Rennes",
  "Ille-et-Vilaine": "Rennes",
  Morbihan: "Rennes",
  Cher: "Orléans-Tours",
  "Eure-et-Loir": "Orléans-Tours",
  Indre: "Orléans-Tours",
  "Indre-et-Loire": "Orléans-Tours",
  "Loir-et-Cher": "Orléans-Tours",
  Loiret: "Orléans-Tours",
  "Corse-du-Sud": "Corse",
  "Haute-Corse": "Corse",
  "Meurthe-et-Moselle": "Nancy-Metz",
  Meuse: "Nancy-Metz",
  Moselle: "Nancy-Metz",
  Vosges: "Nancy-Metz",
  Ardennes: "Reims",
  Aube: "Reims",
  Marne: "Reims",
  "Haute-Marne": "Reims",
  "Bas-Rhin": "Strasbourg",
  "Haut-Rhin": "Strasbourg",
  Aisne: "Amiens",
  Oise: "Amiens",
  Somme: "Amiens",
  Nord: "Lille",
  "Pas-de-Calais": "Lille",
  "Seine-et-Marne": "Créteil",
  "Seine-Saint-Denis": "Créteil",
  "Val-de-Marne": "Créteil",
  Paris: "Paris",
  Yvelines: "Versailles",
  Essonne: "Versailles",
  "Hauts-de-Seine": "Versailles",
  "Val-d'Oise": "Versailles",
  Calvados: "Normandie",
  Eure: "Normandie",
  Manche: "Normandie",
  Orne: "Normandie",
  "Seine-Maritime": "Normandie",
  Dordogne: "Bordeaux",
  Gironde: "Bordeaux",
  Landes: "Bordeaux",
  "Lot-et-Garonne": "Bordeaux",
  "Pyrénées-Atlantiques": "Bordeaux",
  Corrèze: "Limoges",
  Creuse: "Limoges",
  "Haute-Vienne": "Limoges",
  Charente: "Poitiers",
  "Charente-Maritime": "Poitiers",
  "Deux-Sèvres": "Poitiers",
  Vienne: "Poitiers",
  Aude: "Montpellier",
  Gard: "Montpellier",
  Hérault: "Montpellier",
  Lozère: "Montpellier",
  "Pyrénées-Orientales": "Montpellier",
  Ariège: "Toulouse",
  Aveyron: "Toulouse",
  "Haute-Garonne": "Toulouse",
  Gers: "Toulouse",
  Lot: "Toulouse",
  "Hautes-Pyrénées": "Toulouse",
  Tarn: "Toulouse",
  "Tarn-et-Garonne": "Toulouse",
  "Loire-Atlantique": "Nantes",
  "Maine-et-Loire": "Nantes",
  Mayenne: "Nantes",
  Sarthe: "Nantes",
  Vendée: "Nantes",
  "Alpes-de-Haute-Provence": "Aix-Marseille",
  "Hautes-Alpes": "Aix-Marseille",
  "Bouches-du-Rhône": "Aix-Marseille",
  Vaucluse: "Aix-Marseille",
  "Alpes-Maritimes": "Nice",
  Var: "Nice",
  Guadeloupe: "Guadeloupe",
  Martinique: "Martinique",
  Mayotte: "Mayotte",
  Guyane: "Guyane",
  "La Réunion": "La Réunion",
  "Nouvelle-Calédonie": "Nouvelle-Calédonie",
  "Polynésie française": "Polynésie française",
  "Wallis-et-Futuna": "Wallis-et-Futuna",
  "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon",
};
var academyToDepartments = {
  "Clermont-Ferrand": ["Allier", "Cantal", "Haute-Loire", "Puy-de-Dôme"],
  Grenoble: ["Ardèche", "Drôme", "Isère", "Savoie", "Haute-Savoie"],
  Lyon: ["Ain", "Loire", "Rhône"],
  Besançon: ["Doubs", "Jura", "Haute-Saône", "Territoire de Belfort"],
  Dijon: ["Côte-d'Or", "Nièvre", "Saône-et-Loire", "Yonne"],
  Rennes: ["Côtes-d'Armor", "Finistère", "Ille-et-Vilaine", "Morbihan"],
  "Orléans-Tours": ["Cher", "Eure-et-Loir", "Indre", "Indre-et-Loire", "Loir-et-Cher", "Loiret"],
  Corse: ["Corse-du-Sud", "Haute-Corse"],
  "Nancy-Metz": ["Meurthe-et-Moselle", "Meuse", "Moselle", "Vosges"],
  Reims: ["Ardennes", "Aube", "Marne", "Haute-Marne"],
  Strasbourg: ["Bas-Rhin", "Haut-Rhin"],
  Amiens: ["Aisne", "Oise", "Somme"],
  Lille: ["Nord", "Pas-de-Calais"],
  Créteil: ["Seine-et-Marne", "Seine-Saint-Denis", "Val-de-Marne"],
  Paris: ["Paris"],
  Versailles: ["Yvelines", "Essonne", "Hauts-de-Seine", "Val-d'Oise"],
  Normandie: ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"],
  Bordeaux: ["Dordogne", "Gironde", "Landes", "Lot-et-Garonne", "Pyrénées-Atlantiques"],
  Limoges: ["Corrèze", "Creuse", "Haute-Vienne"],
  Poitiers: ["Charente", "Charente-Maritime", "Deux-Sèvres", "Vienne"],
  Montpellier: ["Aude", "Gard", "Hérault", "Lozère", "Pyrénées-Orientales"],
  Toulouse: ["Ariège", "Aveyron", "Haute-Garonne", "Gers", "Lot", "Hautes-Pyrénées", "Tarn", "Tarn-et-Garonne"],
  Nantes: ["Loire-Atlantique", "Maine-et-Loire", "Mayenne", "Sarthe", "Vendée"],
  "Aix-Marseille": ["Alpes-de-Haute-Provence", "Hautes-Alpes", "Bouches-du-Rhône", "Vaucluse"],
  Nice: ["Alpes-Maritimes", "Var"],
  Guadeloupe: "Guadeloupe",
  Martinique: "Martinique",
  Mayotte: "Mayotte",
  Guyane: "Guyane",
  "La Réunion": "La Réunion",
  "Nouvelle-Calédonie": "Nouvelle-Calédonie",
  "Polynésie française": "Polynésie française",
  "Wallis-et-Futuna": "Wallis-et-Futuna",
  "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon",
};
var academyList = _toConsumableArray(new Set(Object.values(departmentToAcademy)));

var colors = {
  purple: "#5145cd",
  blue: "#2563EB",
  transPurple: "#5145cd66",
  darkPurple: "#382F79",
  green: "#6CC763",
  darkGreen: "#1C7713",
  red: "#BE3B12",
  lightOrange: "#ffa987",
  orange: "#FE7B52",
  yellow: "#FEB951",
  pink: "#F8A9AD",
  lightGold: "#d9bb71",
  extraLightGrey: "#fafafa",
  lightGrey: "#d7d7d7",
  grey: "#6e757c",
  lightBlueGrey: "#e6ebfa",
  darkBlue: "#00008b",
  black: "#111111",
};
var PHASE_STATUS_COLOR = {
  VALIDATED: colors.green,
  DONE: colors.green,
  CANCEL: colors.orange,
  EXEMPTED: colors.orange,
  IN_PROGRESS: colors.purple,
  AFFECTED: colors.purple,
  WITHDRAWN: colors.red,
  WAITING_ACCEPTATION: colors.yellow,
};
var APPLICATION_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_VERIFICATION: colors.orange,
  WAITING_ACCEPTATION: colors.yellow,
  VALIDATED: colors.green,
  DONE: colors.darkGreen,
  REFUSED: colors.pink,
  CANCEL: colors.lightOrange,
  IN_PROGRESS: colors.darkPurple,
  ABANDON: colors.red,
};
var EQUIVALENCE_STATUS_COLORS = {
  WAITING_VERIFICATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  REFUSED: colors.pink,
};
var YOUNG_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  REFUSED: colors.pink,
  IN_PROGRESS: colors.darkPurple,
  WITHDRAWN: colors.lightGrey,
  WAITING_REALISATION: colors.orange,
  AFFECTED: colors.darkPurple,
  WAITING_AFFECTATION: colors.yellow,
  WAITING_ACCEPTATION: colors.yellow,
  NOT_ELIGIBLE: colors.orange,
  CANCEL: colors.orange,
  EXEMPTED: colors.orange,
  DONE: colors.green,
  NOT_DONE: colors.red,
  WAITING_LIST: colors.lightOrange,
  DELETED: colors.lightGrey,
  ABANDONED: colors.red,
  NOT_AUTORISED: colors.black,
  REINSCRIPTION: colors.darkPurple,
};
var MISSION_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  DRAFT: colors.lightGold,
  REFUSED: colors.pink,
  CANCEL: colors.lightOrange,
  ARCHIVED: colors.lightGrey,
};
var STRUCTURE_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  DRAFT: colors.lightGold,
};
var CONTRACT_STATUS_COLORS = {
  DRAFT: colors.yellow,
  SENT: colors.orange,
  VALIDATED: colors.green,
};

var translateIndexes = function translateIndexes(index) {
  switch (index) {
    case "young":
      return "volontaires";
    case "mission":
      return "Missions";
    case "application":
      return "candidatures";
    default:
      return index;
  }
};
var youngExportFields = [
  {
    id: "identity",
    title: "Identité du volontaire",
    desc: ["Prénom", "Nom", "Sexe", "Cohorte", "Cohorte d'origine"],
    fields: ["firstName", "lastName", "gender", "cohort", "originalCohort"],
  },
  {
    id: "contact",
    title: "Contact du volontaire",
    desc: ["Email", "Téléphone"],
    fields: ["email", "phone", "phoneZone"],
  },
  {
    id: "birth",
    title: "Date et lieu de naissance du volontaire",
    desc: ["Date de naissance", "Pays de naissance", "Ville de naissance", "Code postal de naissance"],
    fields: ["birthdateAt", "birthCountry", "birthCity", "birthCityZip", "latestCNIFileExpirationDate"],
  },
  {
    id: "address",
    title: "Lieu de résidence du volontaire",
    desc: [
      "Adresse postale",
      "Code postal",
      "Ville",
      "Pays",
      "Nom de l'hébergeur",
      "Prénom de l'hébergeur",
      "Lien avec l'hébergeur",
      "Adresse - étranger",
      "Code postal - étranger",
      "Ville - étranger",
      "Pays - étranger",
    ],
    fields: ["address", "zip", "city", "country", "hostLastName", "hostFirstName", "hostRelationship", "foreignAddress", "foreignZip", "foreignCity", "foreignCountry"],
  },
  {
    id: "location",
    title: "Localisation du volontaire",
    desc: ["Département", "Académie", "Région"],
    fields: ["department", "academy", "region"],
  },
  {
    id: "schoolSituation",
    title: "Situation scolaire",
    desc: [
      "Niveau",
      "Type d'établissement",
      "Nom de l'établissement",
      "Code postal de l'établissement",
      "Ville de l'établissement",
      "Département de l'établissement",
      "UAI de l'établissement",
    ],
    fields: ["schoolId", "situation", "grade", "schoolType", "schoolName", "schoolZip", "schoolCity", "schoolDepartment"],
  },
  {
    id: "situation",
    title: "Situation particulière",
    desc: [
      "Quartier Prioritaire de la ville",
      "Zone Rurale",
      "Handicap",
      "PPS",
      "PAI",
      "Aménagement spécifique",
      "Nature de l'aménagement spécifique",
      "Aménagement pour mobilité réduite",
      "Besoin d'être affecté(e) dans le département de résidence",
      "Allergies ou intolérances alimentaires",
      "Activité de haut-niveau",
      "Nature de l'activité de haut-niveau",
      "Activités de haut niveau nécessitant d'être affecté dans le département de résidence",
      "Document activité de haut-niveau",
      "Structure médico-sociale",
      "Nom de la structure médico-sociale",
      "Adresse de la structure médico-sociale",
      "Code postal de la structure médico-sociale",
      "Ville de la structure médico-sociale",
    ],
    fields: [
      "qpv",
      "populationDensity",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "specificAmenagment",
      "specificAmenagmentType",
      "reducedMobilityAccess",
      "handicapInSameDepartment",
      "allergies",
      "highSkilledActivity",
      "highSkilledActivityType",
      "highSkilledActivityInSameDepartment",
      "highSkilledActivityProofFiles",
      "medicosocialStructure",
      "medicosocialStructureName",
      "medicosocialStructureAddress",
      "medicosocialStructureZip",
      "medicosocialStructureCity",
    ],
  },
  {
    id: "representative1",
    title: "Représentant légal 1",
    desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
    fields: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent1Address",
      "parent1Zip",
      "parent1City",
      "parent1Department",
      "parent1Region",
      "parent1PhoneZone",
    ],
  },
  {
    id: "representative2",
    title: "Représentant légal 2",
    desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
    fields: [
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
      "parent2Address",
      "parent2Zip",
      "parent2City",
      "parent2Department",
      "parent2Region",
      "parent2PhoneZone",
    ],
  },
  {
    id: "consent",
    title: "Consentement",
    desc: ["Consentement des représentants légaux."],
    fields: ["parentConsentment"],
  },
  {
    id: "status",
    title: "Statut",
    desc: ["Statut général", "Statut phase 1", "Statut phase 2", "Statut phase 3", "Date du dernier statut"],
    fields: ["status", "phase", "statusPhase1", "statusPhase2", "statusPhase3", "lastStatusAt"],
  },
  {
    id: "phase1Affectation",
    title: "Phase 1 - Affectation ",
    desc: ["ID", "Code", "Nom", "Ville", "Département et région du centre"],
    fields: ["cohesionCenterId", "sessionPhase1Id"],
  },
  {
    id: "phase1Transport",
    title: "Phase 1 - Transport",
    desc: [
      "Autonomie",
      "Numéro de bus",
      "Les informations de transports transmises par email",
      "ID du bus",
      "Nom du point de rassemblement",
      "Adresse du point de rassemblement",
      "Ville du point de rassemblement",
      "Dates d'aller et de retour",
      "Heures de départ et de convocation",
      "Heure de retour",
      "Voyage en avion",
    ],
    fields: ["meetingPointId", "ligneId", "transportInfoGivenByLocal", "deplacementPhase1Autonomous", "isTravelingByPlane"],
  },
  {
    id: "phase1DocumentStatus",
    title: "Phase 1 - Statut des documents",
    desc: ["Droit à l'image", "Autotest PCR", "Règlement intérieur", "Fiche sanitaire"],
    fields: ["imageRightFilesStatus", "autoTestPCRFilesStatus", "rulesYoung", "cohesionStayMedicalFileReceived"],
  },
  {
    id: "phase1DocumentAgreement",
    title: "Phase 1 - Accords",
    desc: ["Accords pour droit à l'image et autotests PCR."],
    fields: ["imageRight", "autoTestPCR"],
  },
  {
    id: "phase1Attendance",
    title: "Phase 1 - Présence",
    desc: ["Présence à l'arrivé", "Présence à la JDM", "Date de départ", "Motif de départ", "Commentaire du départ"],
    fields: ["cohesionStayPresence", "presenceJDM", "departSejourAt", "departSejourMotif", "departSejourMotifComment"],
  },
  {
    id: "phase2",
    title: "Phase 2",
    desc: [
      "Domaines MIG 1, MIG 2 et MIG 3",
      "Projet professionnel",
      "Période privilégiée",
      "Choix de périodes",
      "Mobilité",
      "Mobilité autour d'un proche",
      "Information du proche",
      "Mode de transport",
      "Format de mission",
      "Engagement hors SNU",
      "Souhait MIG",
    ],
    fields: [
      "domains",
      "professionnalProject",
      "professionnalProjectPrecision",
      "period",
      "periodRanking",
      "mobilityNearSchool",
      "mobilityNearHome",
      "mobilityNearRelative",
      "mobilityNearRelativeName",
      "mobilityNearRelativeAddress",
      "mobilityNearRelativeZip",
      "mobilityNearRelativeCity",
      "mobilityTransport",
      "missionFormat",
      "engaged",
      "engagedDescription",
      "desiredLocation",
    ],
  },
  {
    id: "accountDetails",
    title: "Compte",
    desc: ["Dates de création, d'édition et de dernière connexion"],
    fields: ["createdAt", "updatedAt", "lastLoginAt"],
  },
  {
    id: "desistement",
    title: "Désistement",
    desc: ["Raison du désistement", "Message de désistement"],
    fields: ["withdrawnReason", "withdrawnMessage"],
  },
];
var missionExportFields = [
  {
    id: "missionInfo",
    title: "Informations sur la mission",
    desc: [
      "Titre de la mission",
      "Date du début",
      "Date de fin",
      "Nombre de volontaires recherchés",
      "Places restantes sur la mission",
      "Visibilité de la mission",
      "Source de la mission",
    ],
    fields: ["_id", "name", "startAt", "endAt", "placesTotal", "placesLeft", "visibility", "isJvaMission"],
  },
  {
    id: "status",
    title: "Statut de la mission",
    desc: ["Statut de la mission", "Créée le", "Mise à jour le", "Commentaire sur le statut"],
    fields: ["status", "createdAt", "updatedAt", "statusComment"],
  },
  {
    id: "missionType",
    title: "Type de mission",
    desc: ["Domaine principal de la mission", "Domaine(s) secondaire(s) de la mission", "Préparation militaire"],
    fields: ["mainDomain", "format", "isMilitaryPreparation"],
  },
  {
    id: "missionDetails",
    title: "Détails de la mission",
    desc: ["Objectifs de la mission", "Actions concrètes", "Contraintes", "Durée", "Fréquence estimée", "Période de réalisation", "Hébergement proposé", "Hébergement payant"],
    fields: ["description", "actions", "contraintes", "duration", "frequence", "period", "hebergement", "hebergementPayant"],
  },
  {
    id: "tutor",
    title: "Tuteur de la mission",
    desc: ["Id du tuteur", "Nom du tuteur", "Prénom du tuteur", "Email du tuteur", "Portable du tuteur", "Téléphone du tuteur"],
    fields: ["tutorId"],
  },
  {
    id: "location",
    title: "Localisation de la mission",
    desc: ["Adresse", "Code postal", "Ville", "Département", "Région"],
    fields: ["address", "zip", "city", "department", "region"],
  },
  {
    id: "structureInfo",
    title: "Informations sur la structure",
    desc: ["Id de la structure", "Nom de la structure", "Statut juridique de la structure", "Type de structure", "Sous-type de structure", "Présentation de la structure"],
    fields: ["structureId"],
  },
  {
    id: "structureLocation",
    title: "Localisation de la structure",
    desc: ["Adresse de la structure", "Code postal de la structure", "Ville de la structure", "Département de la structure", "Région de la structure"],
    fields: ["structureId"],
  },
];
var structureExportFields = [
  {
    id: "structureInfo",
    title: "Informations sur la structure",
    desc: ["Nom de la structure", "Statut juridique", "Type de structure", "Sous-type de structure", "Présentation de la structure"],
    fields: ["name", "legalStatus", "types", "sousTypes", "description"],
  },
  {
    id: "location",
    title: "Localisation de la structure",
    desc: ["Adresse de la structure", "Code postal de la structure", "Ville de la structure", "Département de la structure", "Région de la structure"],
    fields: ["address", "zip", "city", "department", "region"],
  },
  {
    id: "details",
    title: "Détails",
    desc: ["Site internet", "Facebook", "Twitter", "Instagram", "Numéro de SIRET"],
    fields: ["website", "facebook", "twitter", "instagram", "siret"],
  },
  {
    id: "network",
    title: "Tête de réseau",
    desc: ["Est une tête de réseau", "Nom de la tête de réseau"],
    fields: ["isNetwork", "networkName"],
  },
  {
    id: "team",
    title: "Equipe",
    desc: [
      "Taille d'équipe",
      "Membre 1 - Nom",
      "Membre 1 - Prénom",
      "Membre 1 - Email",
      "Membre 2 - Nom",
      "Membre 2 - Prénom",
      "Membre 2 - Email",
      "Membre 3 - Nom",
      "Membre 3 - Prénom",
      "Membre 3 - Email",
    ],
    fields: [],
  },
  {
    id: "status",
    title: "Statut",
    desc: ["Créé lé", "Mis à jour le", "Statut général"],
    fields: ["createdAt", "updatedAt", "status"],
  },
];
var applicationExportFieldsStructure = [
  {
    id: "identity",
    title: "Identité du volontaire",
    desc: ["Cohorte", "Prénom", "Nom", "Sexe", "Date de naissance"],
    fields: ["youngCohort", "youngFirstName", "youngLastName", "gender", "youngBirthdateAt"],
  },
  {
    id: "contact",
    title: "Contact du volontaire",
    desc: ["Email", "Téléphone"],
    fields: ["youngId", "youngEmail"],
  },
  {
    id: "address",
    title: "Lieu de résidence du volontaire",
    desc: ["Adresse postale du volontaire", "Code postal du volontaire", "Ville du volontaire", "Pays du volontaire"],
    fields: ["youngId"],
  },
  {
    id: "location",
    title: "Localisation du volontaire",
    desc: ["Département du volontaire", "Académie du volontaire", "Région du volontaire"],
    fields: ["youngId"],
  },
  {
    id: "proche",
    title: "Localisation de l'adresse d'un proche déclaré",
    desc: ["Adresse postale du proche", "Code postal du proche", "Ville du proche"],
    fields: ["mobilityNearRelativeAddress", "mobilityNearRelativeZip", "mobilityNearRelativeCity"],
  },
  {
    id: "application",
    title: "Candidature",
    desc: [
      "Statut de la candidature",
      "Choix - Ordre de la candidature",
      "Candidature créée le",
      "Candidature mise à jour le",
      "Statut du contrat d'engagement",
      "Pièces jointes à l’engagement",
      "Statut du dossier d'éligibilité PM",
    ],
    fields: [
      "youngId",
      "status",
      "priority",
      "createdAt",
      "updatedAt",
      "contractAvenantFiles",
      "justificatifsFiles",
      "feedBackExperienceFiles",
      "othersFiles",
      "contractStatus",
      "eligibilityStatus",
    ],
  },
  {
    id: "missionInfo",
    title: "Informations sur la mission",
    desc: ["ID de la mission", "Titre de la mission", "Date du début", "Date de fin", "Domaine d'action principal", "Préparation militaire"],
    fields: ["missionId"],
  },
  {
    id: "missionTutor",
    title: "Tuteur de la mission",
    desc: ["Nom du tuteur", "Prénom du tuteur", "Email du tuteur", "Portable du tuteur", "Téléphone du tuteur"],
    fields: ["tutorId"],
  },
  {
    id: "missionLocation",
    title: "Localisation de la mission",
    desc: ["Adresse", "Code postal", "Ville", "Département", "Région"],
    fields: ["missionId"],
  },
  {
    id: "structureInfo",
    title: "Informations sur la structure",
    desc: ["Id de la structure", "Nom de la structure", "Statut juridique de la structure", "Type de structure", "Sous-type de structure", "Présentation de la structure"],
    fields: ["structureId"],
  },
  {
    id: "structureLocation",
    title: "Localisation de la structure",
    desc: ["Adresse de la structure", "Code postal de la structure", "Ville de la structure", "Département de la structure", "Région de la structure"],
    fields: ["structureId"],
  },
  {
    id: "status",
    title: "Statut",
    desc: ["Statut général", "Statut phase 2", "Statut de la candidature", "Commentaire sur le statut"],
    fields: ["youngId", "status", "statusComment"],
  },
  {
    id: "choices",
    title: "Préférences de MIG du volontaire",
    desc: [
      "Domaine de MIG 1",
      "Domaine de MIG 2",
      "Domaine de MIG 3",
      "Projet professionnel",
      "Information supplémentaire sur le projet professionnel",
      "Période privilégiée pour réaliser des missions",
      "Choix 1 période",
      "Choix 2 période",
      "Choix 3 période",
      "Choix 4 période",
      "Choix 5 période",
      "Mobilité aux alentours de son établissement",
      "Mobilité aux alentours de son domicile",
      "Mobilité aux alentours d'un de ses proches",
      "Adresse du proche",
      "Mode de transport",
      "Format de mission",
      "Engagement dans une structure en dehors du SNU",
      "Description engagement ",
      "Souhait MIG",
    ],
    fields: ["youngId", "professionnalProjectPrecision", "period"],
  },
  {
    id: "representative1",
    title: "Représentant légal 1",
    desc: [
      "Statut représentant légal 1",
      "Prénom représentant légal 1",
      "Nom représentant légal 1",
      "Email représentant légal 1",
      "Téléphone représentant légal 1",
      "Adresse représentant légal 1",
      "Code postal représentant légal 1",
      "Ville représentant légal 1",
      "Département représentant légal 1",
      "Région représentant légal 1",
    ],
    fields: ["youngId"],
  },
  {
    id: "representative2",
    title: "Représentant légal 2",
    desc: [
      "Statut représentant légal 2",
      "Prénom représentant légal 2",
      "Nom représentant légal 2",
      "Email représentant légal 2",
      "Téléphone représentant légal 2",
      "Adresse représentant légal 2",
      "Code postal représentant légal 2",
      "Ville représentant légal 2",
      "Département représentant légal 2",
      "Région représentant légal 2",
    ],
    fields: ["youngId"],
  },
];
var applicationExportFields = [
  {
    id: "identity",
    title: "Identité du volontaire",
    desc: ["Cohorte", "Prénom", "Nom", "Sexe", "Date de naissance"],
    fields: ["youngId", "youngCohort", "youngFirstName", "youngLastName", "youngBirthdateAt"],
  },
  {
    id: "contact",
    title: "Contact du volontaire",
    desc: ["Email", "Téléphone"],
    fields: ["youngId", "youngEmail"],
  },
  {
    id: "address",
    title: "Lieu de résidence du volontaire",
    desc: ["Issu de QPV", "Adresse postale du volontaire", "Code postal du volontaire", "Ville du volontaire", "Pays du volontaire"],
    fields: ["youngId"],
  },
  {
    id: "location",
    title: "Localisation du volontaire",
    desc: ["Département du volontaire", "Académie du volontaire", "Région du volontaire"],
    fields: ["youngId"],
  },
  {
    id: "application",
    title: "Candidature",
    desc: [
      "Statut de la candidature",
      "Choix - Ordre de la candidature",
      "Candidature créée le",
      "Candidature mise à jour le",
      "Statut du contrat d'engagement",
      "Pièces jointes à l’engagement",
      "Statut du dossier d'éligibilité PM",
    ],
    fields: ["youngId", "status", "priority", "createdAt", "updatedAt", "contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles", "contractStatus"],
  },
  {
    id: "missionInfo",
    title: "Informations sur la mission",
    desc: ["ID de la mission", "Titre de la mission", "Date du début", "Date de fin", "Domaine d'action principal", "Préparation militaire"],
    fields: ["missionId"],
  },
  {
    id: "missionTutor",
    title: "Tuteur de la mission",
    desc: ["Nom du tuteur", "Prénom du tuteur", "Email du tuteur", "Portable du tuteur", "Téléphone du tuteur"],
    fields: ["tutorId"],
  },
  {
    id: "missionLocation",
    title: "Localisation de la mission",
    desc: ["Adresse", "Code postal", "Ville", "Département", "Région"],
    fields: ["missionId"],
  },
  {
    id: "structureInfo",
    title: "Informations sur la structure",
    desc: ["Id de la structure", "Nom de la structure", "Statut juridique de la structure", "Type de structure", "Sous-type de structure", "Présentation de la structure"],
    fields: ["structureId"],
  },
  {
    id: "structureLocation",
    title: "Localisation de la structure",
    desc: ["Adresse de la structure", "Code postal de la structure", "Ville de la structure", "Département de la structure", "Région de la structure"],
    fields: ["structureId"],
  },
  {
    id: "status",
    title: "Statut",
    desc: ["Statut général", "Statut phase 2", "Statut de la candidature"],
    fields: ["youngId", "status"],
  },
  {
    id: "choices",
    title: "Préférences de MIG du volontaire",
    desc: [
      "Domaine de MIG 1",
      "Domaine de MIG 2",
      "Domaine de MIG 3",
      "Projet professionnel",
      "Information supplémentaire sur le projet professionnel",
      "Période privilégiée pour réaliser des missions",
      "Choix 1 période",
      "Choix 2 période",
      "Choix 3 période",
      "Choix 4 période",
      "Choix 5 période",
      "Mobilité aux alentours de son établissement",
      "Mobilité aux alentours de son domicile",
      "Mobilité aux alentours d'un de ses proches",
      "Adresse du proche",
      "Mode de transport",
      "Format de mission",
      "Engagement dans une structure en dehors du SNU",
      "Description engagement ",
      "Souhait MIG",
    ],
    fields: ["youngId", "professionnalProjectPrecision", "period"],
  },
  {
    id: "representative1",
    title: "Représentant légal 1",
    desc: [
      "Statut représentant légal 1",
      "Prénom représentant légal 1",
      "Nom représentant légal 1",
      "Email représentant légal 1",
      "Téléphone représentant légal 1",
      "Adresse représentant légal 1",
      "Code postal représentant légal 1",
      "Ville représentant légal 1",
      "Département représentant légal 1",
      "Région représentant légal 1",
    ],
    fields: ["youngId"],
  },
  {
    id: "representative2",
    title: "Représentant légal 2",
    desc: [
      "Statut représentant légal 2",
      "Prénom représentant légal 2",
      "Nom représentant légal 2",
      "Email représentant légal 2",
      "Téléphone représentant légal 2",
      "Adresse représentant légal 2",
      "Code postal représentant légal 2",
      "Ville représentant légal 2",
      "Département représentant légal 2",
      "Région représentant légal 2",
    ],
    fields: ["youngId"],
  },
];
var youngPlanDeTranportExportFields = [
  {
    id: "identity",
    title: "Identité du volontaire",
    desc: ["Prénom", "Nom", "Sexe", "Cohorte", "Cohorte d'origine"],
    fields: ["firstName", "lastName", "gender", "cohort", "originalCohort"],
  },
  {
    id: "contact",
    title: "Contact du volontaire",
    desc: ["Email", "Téléphone"],
    fields: ["email", "phone", "phoneZone"],
  },
  {
    id: "location",
    title: "Localisation du volontaire",
    desc: ["Département", "Académie", "Région"],
    fields: ["department", "academy", "region"],
  },
  {
    id: "representative1",
    title: "Représentant légal 1",
    desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
    fields: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent1PhoneZone",
      "parent1Address",
      "parent1Zip",
      "parent1City",
      "parent1Department",
      "parent1Region",
    ],
  },
  {
    id: "representative2",
    title: "Représentant légal 2",
    desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
    fields: [
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
      "parent2PhoneZone",
      "parent2Address",
      "parent2Zip",
      "parent2City",
      "parent2Department",
      "parent2Region",
    ],
  },
  {
    id: "phase1Affectation",
    title: "Phase 1 - Affectation ",
    desc: ["ID", "Code", "Nom", "Ville", "Département et région du centre"],
    fields: ["sessionPhase1Id"],
  },
  {
    id: "phase1Transport",
    title: "Phase 1 - Transport",
    desc: [
      "ID du transport",
      "ID du point de rassemblement",
      "Nom du point de rassemblement",
      "Adresse du point de rassemblement",
      "Ville du point de rassemblement",
      "Département du point de rassemblement",
      "Région du point de rassemblement",
      "Date et heure de départ (Aller)",
      "Date et heure d'arrivée (Retour)",
    ],
    fields: ["ligneId", "meetingPointId"],
  },
  {
    id: "status",
    title: "Statut",
    desc: ["Statut général", "Statut phase 1", "Droit à l'image"],
    fields: ["status", "statusPhase1", "parent1AllowImageRights"],
  },
];
var missionCandidatureExportFields = [
  {
    id: "identity",
    title: "Identité du volontaire",
    desc: ["Prénom", "Nom", "Sexe", "Cohorte", "Cohorte d'origine"],
    fields: ["firstName", "lastName", "gender", "cohort", "originalCohort"],
  },
  {
    id: "contact",
    title: "Contact du volontaire",
    desc: ["Email", "Téléphone"],
    fields: ["email", "phone"],
  },
  {
    id: "imageRight",
    title: "Droit à l'image",
    desc: ["Droit à l'image"],
    fields: ["imageRight"],
  },
  {
    id: "address",
    title: "Lieu de résidence du volontaire",
    desc: ["Issu de QPV", "Adresse", "Code postal", "Ville", "Pays"],
    fields: ["qpv", "address", "zip", "city", "country"],
  },
  {
    id: "location",
    title: "Localisation du volontaire",
    desc: ["Département", "Académie", "Région"],
    fields: ["department", "academy", "region"],
  },
  {
    id: "application",
    title: "Candidature",
    desc: [
      "Statut de la candidature",
      "Choix - Ordre de la candidature",
      "Candidature créée le",
      "Candidature mise à jour le",
      "Statut du contrat d'engagement",
      "Pièces jointes à l’engagement",
      "Statut du dossier d'éligibilité PM",
    ],
    fields: [
      "youngId",
      "status",
      "priority",
      "createdAt",
      "updatedAt",
      "contractAvenantFiles",
      "justificatifsFiles",
      "feedBackExperienceFiles",
      "othersFiles",
      "missionId",
      "contractStatus",
      "eligibilityStatus",
    ],
  },
  {
    id: "missionInfo",
    title: "Informations sur la mission",
    desc: ["ID de la mission", "Titre de la mission", "Date du début", "Date de fin", "Domaine d'action principal", "Préparation militaire"],
    fields: ["_id", "name", "startAt", "endAt", "mainDomain", "isMilitaryPreparation"],
  },
  {
    id: "missionTutor",
    title: "Tuteur de la mission",
    desc: ["Nom du tuteur", "Prénom du tuteur", "Email du tuteur", "Portable du tuteur", "Téléphone du tuteur"],
    fields: ["tutorId", "firstName", "lastName", "email", "phone", "mobile"],
  },
  {
    id: "missionlocation",
    title: "Localisation de la mission",
    desc: ["Adresse de la mission", "Code postal de la mission", "Ville de la mission", "Département de la mission", "Région de la mission"],
    fields: ["address", "zip", "city", "department", "region"],
  },
  {
    id: "structureInfo",
    title: "Informations sur la structure",
    desc: ["Id de la structure", "Nom de la structure", "Statut juridique de la structure", "Type de structure", "Sous-type de structure", "Présentation de la structure"],
    fields: ["structureId", "name", "types", "legalStatus", "sousType", "description"],
  },
  {
    id: "structureLocation",
    title: "Localisation de la structure",
    desc: ["Adresse de la structure", "Code postal de la structure", "Ville de la structure", "Département de la structure", "Région de la structure"],
    fields: ["structureId", "address", "zip", "city", "department", "region"],
  },
  {
    id: "status",
    title: "Statut",
    desc: ["Statut général", "Statut phase 2", "Droit à l'image"],
    fields: ["status", "statusPhase2", "lastStatusAt"],
  },
  {
    id: "representative1",
    title: "Représentant légal 1",
    desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
    fields: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent1Address",
      "parent1Zip",
      "parent1City",
      "parent1Department",
      "parent1Region",
    ],
  },
  {
    id: "representative2",
    title: "Représentant légal 2",
    desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
    fields: [
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
      "parent2Address",
      "parent2Zip",
      "parent2City",
      "parent2Department",
      "parent2Region",
    ],
  },
];

function download(file, fileName) {
  if (window.navigator.msSaveOrOpenBlob) {
    //IE11 & Edge
    window.navigator.msSaveOrOpenBlob(file, fileName);
  } else {
    //Other browsers
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}

/**
 * Creates Formdata for file upload and sanitize file names to get past firewall strict validation rules e.g apostrophe
 * @param [File]
 * @returns FormData
 **/
function createFormDataForFileUpload(arr, properties) {
  var files = [];
  if (Array.isArray(arr))
    files = arr.filter(function (e) {
      return _typeof(e) === "object";
    });
  else files = [arr];
  var formData = new FormData();

  // File object name property is read-only, so we need to change it with Object.defineProperty
  var _iterator = _createForOfIteratorHelper(files),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var file = _step.value;
      // eslint-disable-next-line no-control-regex
      var name = encodeURIComponent(file.name.replace(/['/:*?"<>|\x00-\x1F\x80-\x9F]/g, "_").trim());
      Object.defineProperty(file, "name", {
        value: name,
      });
      // We add each file under a different key in order to not squash them
      formData.append(file.name, file, name);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var names = files.map(function (e) {
    return e.name || e;
  });
  var allData = _objectSpread2(
    {
      names: names,
    },
    properties || {},
  );
  formData.append("body", JSON.stringify(allData));
  return formData;
}

var PHONE_ZONES_NAMES = {
  FRANCE: "FRANCE",
  GUADELOUPE: "GUADELOUPE",
  GUYANE: "GUYANE",
  LA_REUNION: "LA_REUNION",
  MARTINIQUE: "MARTINIQUE",
  MAYOTTE: "MAYOTTE",
  NOUVELLE_CALEDONIE: "NOUVELLE_CALEDONIE",
  POLYNESIE_FRANCAISE: "POLYNESIE_FRANCAISE",
  SAINT_BARTHELEMY: "SAINT_BARTHELEMY",
  SAINT_MARTIN: "SAINT_MARTIN",
  SAINT_PIERRE_ET_MIQUELON: "SAINT_PIERRE_ET_MIQUELON",
  WALLIS_ET_FUTUNA: "WALLIS_ET_FUTUNA",
  AUTRE: "AUTRE",
};
var PHONE_ZONES = {
  FRANCE: {
    shortcut: "FR",
    name: "France métropolitaine",
    code: "+33",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUADELOUPE: {
    shortcut: "GP",
    name: "Guadeloupe",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUYANE: {
    shortcut: "GY",
    name: "Guyane",
    code: "+594",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  LA_REUNION: {
    shortcut: "RE",
    name: "La Réunion",
    code: "+262",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MARTINIQUE: {
    shortcut: "MQ",
    name: "Martinique",
    code: "+596",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MAYOTTE: {
    shortcut: "YT",
    name: "Mayotte",
    code: "+262",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  NOUVELLE_CALEDONIE: {
    shortcut: "NC",
    name: "Nouvelle-Calédonie",
    code: "+687",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  POLYNESIE_FRANCAISE: {
    shortcut: "PF",
    name: "Polynésie française",
    code: "+689",
    numberLength: 8,
    errorMessage: "Ce numéro de téléphone doit contenir 8 chiffres.",
    example: "XXXXXXXX",
  },
  SAINT_BARTHELEMY: {
    shortcut: "BL",
    name: "Saint-Barthélémy",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_MARTIN: {
    shortcut: "MF",
    name: "Saint-Martin",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_PIERRE_ET_MIQUELON: {
    shortcut: "PM",
    name: "Saint-Pierre-et-Miquelon",
    code: "+508",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  WALLIS_ET_FUTUNA: {
    shortcut: "WF",
    name: "Wallis-et-Futuna",
    code: "+681",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  AUTRE: {
    shortcut: "Autre",
    name: "Autre",
    code: null,
    numberLength: null,
    errorMessage: null,
    example: null,
  },
};
var PHONE_ZONES_NAMES_ARR = Object.values(PHONE_ZONES_NAMES);
var formatPhoneNumberFromPhoneZone = function formatPhoneNumberFromPhoneZone(phoneNumber, phoneZoneKey) {
  var phoneZone = PHONE_ZONES[phoneZoneKey];
  if (!phoneNumber || !phoneZone || !phoneZone.numberLength) {
    return phoneNumber;
  }
  if (phoneZone.numberLength === 10 && phoneNumber.length === 10) {
    return phoneNumber;
  }
  if (phoneZone.numberLength === 10 && phoneNumber.length === 9) {
    return "0".concat(phoneNumber);
  }
  return phoneNumber;
};
var isPhoneZoneKnown = function isPhoneZoneKnown(_ref) {
  var zoneKey = _ref.zoneKey,
    _ref$throwError = _ref.throwError,
    throwError = _ref$throwError === void 0 ? true : _ref$throwError;
  var isPhoneZoneIncluded = Object.keys(PHONE_ZONES).includes(zoneKey);
  if (!isPhoneZoneIncluded && throwError) {
    throw new Error("Phone zone '".concat(zoneKey, "' unkown. Please check if this phone zone exists in PHONE_ZONES in 'snu-lib/phone-number.js'."));
  }
  return isPhoneZoneIncluded;
};
var isPhoneNumberWellFormated = function isPhoneNumberWellFormated(phoneNumberValue, zoneKey) {
  var phoneZone = PHONE_ZONES[zoneKey];
  if (!(phoneZone !== null && phoneZone !== void 0 && phoneZone.numberLength)) {
    return true;
  }
  var expectedPhoneNumberLength = phoneZone.numberLength;
  if (expectedPhoneNumberLength !== 10) {
    return expectedPhoneNumberLength === phoneNumberValue.length;
  }
  if (expectedPhoneNumberLength === 10) {
    var shouldPhoneNumberStartWithZero = phoneNumberValue.length === expectedPhoneNumberLength;
    var hasPhoneNumberAZero = phoneNumberValue.charAt(0) === "0";
    return (shouldPhoneNumberStartWithZero && hasPhoneNumberAZero) || (!shouldPhoneNumberStartWithZero && phoneNumberValue.length === 9 && !hasPhoneNumberAZero);
  }
};
var concatPhoneNumberWithZone = function concatPhoneNumberWithZone(phoneNumber, zoneKey) {
  var verifiedZoneKey = zoneKey || "AUTRE";
  if (verifiedZoneKey === "AUTRE") {
    return phoneNumber;
  }
  var phoneZone = PHONE_ZONES[verifiedZoneKey];
  return "(".concat(phoneZone.code, ") ").concat(phoneNumber);
};

var PDT_IMPORT_ERRORS = {
  BAD_TOTAL_CAPACITY: "BAD_TOTAL_CAPACITY",
  DOUBLON_BUSNUM: "DOUBLON_BUSNUM",
  BAD_CENTER_ID: "BAD_CENTER_ID",
  BAD_PDR_ID: "BAD_PDR_ID",
  BAD_PDR_DEPARTEMENT: "BAD_PDR_DEPARTEMENT",
  SAME_PDR_ON_LINE: "SAME_PDR_ON_LINE",
  LACKING_YOUNG_CAPACITY: "LACKING_YOUNG_CAPACITY",
  MISSING_DATA: "MISSING_DATA",
  BAD_FORMAT: "BAD_FORMAT",
  UNKNOWN_DEPARTMENT: "UNKNOWN_DEPARTMENT",
  UNKNOWN_TRANSPORT_TYPE: "UNKNOWN_TRANSPORT_TYPE",
  CENTER_WITHOUT_SESSION: "CENTER_WITHOUT_SESSION",
  MISSING_COLUMN: "MISSING_COLUMN",
};
var PDT_IMPORT_ERRORS_TRANSLATION = {
  BAD_TOTAL_CAPACITY: {
    text: "La capacité totale n'est pas bonne.",
    tooltip: "La capacité totale doit être la somme de la capacité volontaires et accompagnateurs.",
  },
  DOUBLON_BUSNUM: {
    text: "Le numéro de ligne %s est en doublon.",
    tooltip: "Veuillez vérifier que chaque numéro de ligne n’apparait qu’une seule fois dans le fichier.",
  },
  BAD_CENTER_ID: {
    text: "ID du centre %s non existant.",
    tooltip: "Les ID des centres sont transmis dans le schéma de répartition.",
  },
  BAD_PDR_ID: {
    text: "ID du PDR %s non existant.",
    tooltip: "Les ID des PDR sont transmis dans le schéma de répartition.",
  },
  BAD_PDR_DEPARTEMENT: {
    text: "Erreur sur le département du PDR %s.",
    tooltip: "Le département du fichier ne correspond pas au département du PDR en base de données.",
  },
  SAME_PDR_ON_LINE: {
    text: "Un même PDR %s apparaît plusieurs fois sur la ligne.",
    tooltip: "Un PDR ne peut appraître qu'une seule fois sur une même ligne.",
  },
  LACKING_YOUNG_CAPACITY: {
    text: "La somme de la capacité volontaires des lignes est inférieure à la somme des volontaires du schéma de répartition affecté dans le centre",
    tooltip: "Veuillez vérifier l'ensemble de ces lignes pour qu'elles répondent au schéma de répartition.",
  },
  MISSING_DATA: {
    text: "Information manquante",
    tooltip: "Veuillez renseigner ce champ.",
  },
  BAD_FORMAT: {
    text: "Format invalide",
    tooltip: "Veuillez vérifier la donnée.",
  },
  UNKNOWN_DEPARTMENT: {
    text: "Département inconnu : %s",
    tooltip: "Veuillez vérifier le code de ce département",
  },
  UNKNOWN_TRANSPORT_TYPE: {
    text: "Type de transport inconnu : %s",
    tooltip: "Le type de transport peut être : bus, train ou avion.",
  },
  CENTER_WITHOUT_SESSION: {
    text: "Le centre %s n'a pas de session sur ce séjour",
    tooltip: "Demandez à un modérateur de créer la session sur le centre.",
  },
  MISSING_COLUMN: {
    text: "Colonne manquante ou mal orthographiée",
    tooltip: "Veuillez vérifier que la colonne est présente / bien orthographiée dans le fichier.",
  },
};
var centersInJulyClosingEarly = [
  {
    _id: {
      $oid: "609bebb10c1cc9a888ae8fba",
    },
    code: "SNU844210",
    code2022: "ARALYO04203",
  },
  {
    _id: {
      $oid: "609bebb20c1cc9a888ae8fc2",
    },
    code: "SNU846313",
    code2022: "ARACLE06301",
  },
  {
    _id: {
      $oid: "609bebc60c1cc9a888ae909b",
    },
    code: "SNU761102",
    code2022: "OCCMON01101",
  },
  {
    _id: {
      $oid: "609bebca0c1cc9a888ae90c7",
    },
    code: "SNU524401",
    code2022: "PDLNAN04401",
  },
  {
    _id: {
      $oid: "60a7dd5aa9f80b075f068cea",
    },
    code: "SNU117511",
    code2022: "IDFPAR07501",
  },
  {
    _id: {
      $oid: "626b07616f7eb607e9b88b90",
    },
    code2022: "ARAGRE03802",
  },
  {
    _id: {
      $oid: "63c553786a71d408cb817985",
    },
    code2022: "GENAM08804",
  },
  {
    _id: {
      $oid: "63da4af647841408c5940c78",
    },
    code2022: "PACNIC00601",
  },
  {
    _id: {
      $oid: "63dff1eeca0dad08c4d81261",
    },
    code2022: "ARAGRE03805",
  },
  // pour test en staging
  {
    _id: {
      $oid: "63873264a4ec702331abec5f",
    },
    code2022: "ARAGRE03805",
  },
];

var oldSessions = [
  {
    name: "2019",
  },
  {
    name: "2020",
  },
  {
    name: "2021",
  },
  {
    name: "Février 2022",
  },
  {
    name: "Juin 2022",
  },
  {
    name: "Juillet 2022",
  },
];
var sessions2023 = [
  {
    id: "2023_02_C",
    name: "Février 2023 - C",
    dateStart: new Date("02/19/2023"),
    dateEnd: new Date("03/03/2023"),
    buffer: 1.7,
    event: "Phase0/CTA preinscription - sejour fevrier C",
    eligibility: {
      zones: ["C"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("03/04/2005"),
      bornBefore: new Date("02/20/2008"),
      inscriptionEndDate: new Date("2023-01-11T23:59:00.000Z"),
      // = 8 janv, date format US
      instructionEndDate: new Date("2023-01-11T23:59:00.000Z"), // = 8 janv, date format US
    },
  },
  {
    id: "2023_04_A",
    name: "Avril 2023 - A",
    dateStart: new Date("04/09/2023"),
    dateEnd: new Date("04/21/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour avril A",
    eligibility: {
      zones: ["A"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("04/22/2005"),
      bornBefore: new Date("04/10/2008"),
      inscriptionEndDate: new Date("2023-02-12T23:59:00.000Z"),
      // = 12 fev
      instructionEndDate: new Date("2023-02-15T23:59:00.000Z"), // = 15 fev
    },
  },
  {
    id: "2023_04_B",
    name: "Avril 2023 - B",
    dateStart: new Date("04/16/2023"),
    dateEnd: new Date("04/28/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour avril B",
    eligibility: {
      zones: ["B", "Corse"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("04/29/2005"),
      bornBefore: new Date("04/17/2008"),
      inscriptionEndDate: new Date("2023-02-26T23:59:00.000Z"),
      instructionEndDate: new Date("2023-03-01T23:59:00.000Z"),
    },
  },
  {
    id: "2023_06",
    name: "Juin 2023",
    dateStart: new Date("06/11/2023"),
    dateEnd: new Date("06/23/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour juin",
    eligibility: {
      zones: ["DOM"],
      schoolLevels: ["NOT_SCOLARISE", "2ndeGT", "Autre"],
      bornAfter: new Date("06/24/2005"),
      bornBefore: new Date("06/12/2008"),
      inscriptionEndDate: new Date("2023-04-24T23:59:00.000Z"),
      instructionEndDate: new Date("2023-05-01T23:59:00.000Z"),
    },
  },
  {
    id: "2023_07",
    name: "Juillet 2023",
    dateStart: new Date("07/04/2023"),
    dateEnd: new Date("07/16/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour juillet",
    eligibility: {
      zones: ["A", "B", "C", "DOM", "PF", "Etranger"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("07/17/2005"),
      bornBefore: new Date("07/05/2008"),
      inscriptionEndDate: new Date("2023-05-08T22:00:00.000Z"),
      // 8 mai
      instructionEndDate: new Date("2023-05-12T22:00:00.000Z"), // 12 mai
    },
  },
];

var ticketStates = {
  1: "new",
  2: "open",
  3: "pending reminder",
  4: "closed",
  7: "pending closure",
};
var ticketStateNameById = function ticketStateNameById(id) {
  return ticketStates[id];
};
var ticketStateIdByName = function ticketStateIdByName(name) {
  return Number(
    Object.keys(ticketStates).reduce(function (ret, key) {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[name],
  );
};
var totalOpenedTickets = function totalOpenedTickets(tickets) {
  return (
    (tickets || []).find(function (group) {
      return group._id === "OPEN";
    }).total || 0
  );
};
var totalNewTickets = function totalNewTickets(tickets) {
  return (
    (tickets || []).find(function (group) {
      return group._id === "NEW";
    }).total || 0
  );
};
var totalClosedTickets = function totalClosedTickets(tickets) {
  return (
    (tickets || []).find(function (group) {
      return group._id === "CLOSED";
    }).total || 0
  );
};

var TRANSPORT_TIMES = {
  ALONE_ARRIVAL_HOUR: "16:00",
  ALONE_DEPARTURE_HOUR: "11:00",
};

/**
 * @param {Object} young
 * @param {Object} session
 * @param {Object} cohort
 * @param {Object} [meetingPoint]
 * @returns {date} the date of departure to the cohesion center from the following resource:
 * 1. The meeting point if they have one (young has a transport line)
 * 2. If not, the session if it has a specific date
 * 3. If not, the default date for the cohort.
 */
function getDepartureDate(young, session, cohort) {
  var meetingPoint = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (
    (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.bus) ||
    (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.ligneBus) ||
    (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.departuredDate)
  )
    return getMeetingPointDepartureDate(meetingPoint);
  if (young !== null && young !== void 0 && young.status && young.status !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return getCenterArrivalDate(young, session, cohort);
  return getGlobalDepartureDate(young, cohort);
}
function getMeetingPointDepartureDate(meetingPoint) {
  var _meetingPoint$bus, _meetingPoint$bus2, _meetingPoint$ligneBu, _meetingPoint$ligneBu2;
  if (meetingPoint !== null && meetingPoint !== void 0 && (_meetingPoint$bus = meetingPoint.bus) !== null && _meetingPoint$bus !== void 0 && _meetingPoint$bus.departuredDate)
    return new Date(
      meetingPoint === null || meetingPoint === void 0
        ? void 0
        : (_meetingPoint$bus2 = meetingPoint.bus) === null || _meetingPoint$bus2 === void 0
        ? void 0
        : _meetingPoint$bus2.departuredDate,
    );
  if (
    meetingPoint !== null &&
    meetingPoint !== void 0 &&
    (_meetingPoint$ligneBu = meetingPoint.ligneBus) !== null &&
    _meetingPoint$ligneBu !== void 0 &&
    _meetingPoint$ligneBu.departuredDate
  )
    return new Date(
      meetingPoint === null || meetingPoint === void 0
        ? void 0
        : (_meetingPoint$ligneBu2 = meetingPoint.ligneBus) === null || _meetingPoint$ligneBu2 === void 0
        ? void 0
        : _meetingPoint$ligneBu2.departuredDate,
    );
  return new Date(meetingPoint === null || meetingPoint === void 0 ? void 0 : meetingPoint.departuredDate);
}
function getCenterArrivalDate(young, session, cohort) {
  if (session !== null && session !== void 0 && session.dateStart) return new Date(session === null || session === void 0 ? void 0 : session.dateStart);
  return getGlobalDepartureDate(young, cohort);
}
function getGlobalDepartureDate(young, cohort) {
  if (young.cohort === "Juillet 2023" && [].concat(_toConsumableArray(regionsListDROMS), ["Polynésie française"]).includes(young.region)) {
    return new Date(2023, 6, 4);
  }
  if (cohort !== null && cohort !== void 0 && cohort.dateStart) return new Date(cohort.dateStart);
  return new Date();
}

/**
 * @param {Object} young
 * @param {object} session
 * @param {object} cohort
 * @param {object} [meetingPoint]
 * @returns {date} the date of departure from the cohesion center from the following resource:
 * 1. The meeting point if they have one (young has a transport line).
 * 2. If not, the session if it has a specific date.
 * 3. If not, the default date for the cohort.
 */
function getReturnDate(young, session, cohort) {
  var meetingPoint = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (
    (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.bus) ||
    (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.ligneBus) ||
    (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.departuredDate)
  )
    return getMeetingPointReturnDate(meetingPoint);
  if (young !== null && young !== void 0 && young.status && young.status !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return getCenterReturnDate(young, session, cohort);
  return getGlobalReturnDate(young, cohort);
}
function getMeetingPointReturnDate(meetingPoint) {
  var _meetingPoint$bus3, _meetingPoint$bus4, _meetingPoint$ligneBu3, _meetingPoint$ligneBu4;
  if (meetingPoint !== null && meetingPoint !== void 0 && (_meetingPoint$bus3 = meetingPoint.bus) !== null && _meetingPoint$bus3 !== void 0 && _meetingPoint$bus3.returnDate)
    return new Date(
      meetingPoint === null || meetingPoint === void 0
        ? void 0
        : (_meetingPoint$bus4 = meetingPoint.bus) === null || _meetingPoint$bus4 === void 0
        ? void 0
        : _meetingPoint$bus4.returnDate,
    );
  if (
    meetingPoint !== null &&
    meetingPoint !== void 0 &&
    (_meetingPoint$ligneBu3 = meetingPoint.ligneBus) !== null &&
    _meetingPoint$ligneBu3 !== void 0 &&
    _meetingPoint$ligneBu3.returnDate
  )
    return new Date(
      meetingPoint === null || meetingPoint === void 0
        ? void 0
        : (_meetingPoint$ligneBu4 = meetingPoint.ligneBus) === null || _meetingPoint$ligneBu4 === void 0
        ? void 0
        : _meetingPoint$ligneBu4.returnDate,
    );
  return new Date(meetingPoint === null || meetingPoint === void 0 ? void 0 : meetingPoint.returnDate);
}
function getCenterReturnDate(young, session, cohort) {
  if (session !== null && session !== void 0 && session.dateEnd) return new Date(session === null || session === void 0 ? void 0 : session.dateEnd);
  return getGlobalReturnDate(young, cohort);
}
function getGlobalReturnDate(young, cohort) {
  if (
    (young === null || young === void 0 ? void 0 : young.cohort) === "Juillet 2023" &&
    [].concat(_toConsumableArray(regionsListDROMS), ["Polynésie française"]).includes(young.region)
  ) {
    return new Date(2023, 6, 16);
  }
  if (cohort !== null && cohort !== void 0 && cohort.dateEnd) return new Date(cohort.dateEnd);
  return new Date();
}

/**
 * @param {object} [meetingPoint]
 * @returns {string} the hour of the departure of the young from the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
function getMeetingHour() {
  var _meetingPoint$ligneTo;
  var meetingPoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  if (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.meetingHour) return meetingPoint.meetingHour;
  if (
    meetingPoint !== null &&
    meetingPoint !== void 0 &&
    (_meetingPoint$ligneTo = meetingPoint.ligneToPoint) !== null &&
    _meetingPoint$ligneTo !== void 0 &&
    _meetingPoint$ligneTo.meetingHour
  )
    return meetingPoint.ligneToPoint.meetingHour;
  return TRANSPORT_TIMES.ALONE_ARRIVAL_HOUR;
}

/**
 * @param {object} [meetingPoint]
 * @returns {string} the hour of the return of the young to the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
function getReturnHour() {
  var _meetingPoint$ligneTo2;
  var meetingPoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  if (meetingPoint !== null && meetingPoint !== void 0 && meetingPoint.returnHour) return meetingPoint.returnHour;
  if (
    meetingPoint !== null &&
    meetingPoint !== void 0 &&
    (_meetingPoint$ligneTo2 = meetingPoint.ligneToPoint) !== null &&
    _meetingPoint$ligneTo2 !== void 0 &&
    _meetingPoint$ligneTo2.returnHour
  )
    return meetingPoint.ligneToPoint.returnHour;
  return TRANSPORT_TIMES.ALONE_DEPARTURE_HOUR;
}

/**
 * Get the transport dates and returns a formatted string
 * e.g "du 5 au 17 juillet 2023"
 * @param {date} departureDate
 * @param {date} returnDate
 * @returns {string}
 */
var transportDatesToString = function transportDatesToString(departureDate, returnDate) {
  if (departureDate.getMonth() === returnDate.getMonth()) {
    return "du "
      .concat(departureDate.getDate(), " au ")
      .concat(returnDate.getDate(), " ")
      .concat(
        departureDate.toLocaleString("fr", {
          month: "long",
          year: "numeric",
        }),
      );
  }
  return "du "
    .concat(departureDate.getDate(), " ")
    .concat(
      departureDate.toLocaleString("fr", {
        month: "long",
      }),
      " au ",
    )
    .concat(returnDate.getDate(), " ")
    .concat(
      returnDate.toLocaleString("fr", {
        month: "long",
        year: "numeric",
      }),
    );
};

var isInRuralArea = function isInRuralArea(v) {
  if (!v.populationDensity) return null;
  return ["PEU DENSE", "TRES PEU DENSE"].includes(v.populationDensity) ? "true" : "false";
};

// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
function isEndOfInscriptionManagement2021() {
  return new Date() > new Date(2021, 4, 7); // greater than 7 mai 2021 morning
}

//force redeploy

function inscriptionModificationOpenForYoungs(cohort, young, env) {
  if (env !== undefined && env !== "production") return true;
  switch (cohort) {
    case "2019":
    case "2020":
    case "2021":
      return false;
    case "2022":
      return new Date() < new Date(2022, 4, 5);
    // before 5 mai 2022 morning
    case "Février 2022":
      return new Date() < new Date(2022, 0, 10);
    // before 10 janvier 2022 morning
    case "Juin 2022":
      return new Date() < new Date(2022, 3, 27);
    // before 27 avril 2022 morning
    case "Juillet 2022":
      return new Date() < new Date(2022, 4, 5);
    // before 5 mai 2022 morning
    case "Février 2023 - C":
      return new Date() <= new Date(2023, 0, 12, 23, 59);
    // before 9 janvier 2023 23h59
    case "Avril 2023 - A":
      return new Date() < new Date(2023, 1, 14, 23, 59);
    // before 14 février 2023 23h59
    case "Avril 2023 - B":
      return new Date() < new Date(2023, 1, 28, 23, 59);
    // before 28 fevrier 2023 23h59
    case "Juin 2023":
      return new Date() < new Date(2023, 4, 11, 23, 59);
    // before 11 mai 2023 - A modifier quand on connaitra la date.
    case "Juillet 2023":
      if (young && regionAndDepartments.isFromFrenchPolynesia(young)) {
        return new Date() < new Date(2023, 5, 1, 23, 59); // before 1 june 2023
      }

      if (young && regionAndDepartments.isFromDOMTOM(young)) {
        return new Date() < new Date(2023, 4, 21, 23, 59); // before 22 mai 2023
      }

      return new Date() < new Date(2023, 4, 11, 23, 59);
    // before 11 mai 2023
    case "à venir":
      return false;
    default:
      return new Date() < new Date(2023, 4, 11, 23, 59);
    // before 11 mai 2023
  }
}

function inscriptionCreationOpenForYoungs(cohort) {
  var allowed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var env = arguments.length > 2 ? arguments[2] : undefined;
  if ((env !== undefined && env !== "production") || allowed) return true;
  switch (cohort) {
    case "Février 2022":
      return new Date() < new Date(2022, 0, 10);
    // before 10 janvier 2022 morning
    case "Juin 2022":
      return new Date() < new Date(2022, 3, 25);
    // before 25 avril 2022 morning
    case "2022":
    case "Juillet 2022":
      return new Date() < new Date(2022, 4, 2);
    // before 2 mai 2022 morning
    default:
      return new Date() < new Date(2023, 4, 11);
    // before 11 mai 2023 morning
  }
}

function reInscriptionModificationOpenForYoungs(cohort, env) {
  if (env !== undefined && env !== "production") return true;
  switch (cohort) {
    default:
      return new Date() < new Date(2023, 4, 11);
    // before 11 mai 2023 morning
  }
}

var getFilterLabel = function getFilterLabel(selected) {
  var placeholder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Choisissez un filtre";
  var prelabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  if (Object.keys(selected).length === 0) return placeholder;
  var translator = function translator(item) {
    if (prelabel === "Statut phase 2") {
      return translation.translatePhase2(item);
    } else if (prelabel === "Statut phase 1") {
      return translation.translatePhase1(item);
    } else if (prelabel === "Statut mission (candidature)") {
      return translation.translateApplication(item);
    } else if (prelabel === "Equivalence de MIG") {
      return translation.translateEquivalenceStatus(item);
    } else if (prelabel === "Statut contrats") {
      return translation.translateEngagement(item);
    } else if (prelabel === "Statut fichier phase 1") {
      return translation.translateFileStatusPhase1(item);
    } else if (prelabel === "Visibilité") {
      return translation.translateVisibilty(item);
    } else if (prelabel === "Pièces jointes") {
      return translation.translateApplicationFileType(item);
    } else if (prelabel === "Dossier d’éligibilité aux Préparations Militaires") {
      return translation.translateStatusMilitaryPreparationFiles(item);
    } else if (prelabel === "Place occupées") {
      return translation.translateMission(item);
    } else if (prelabel === "Statut") {
      return translation.translateInscriptionStatus(item);
    } else {
      return translation.translate(item);
    }
  };
  var translated = Object.keys(selected).map(function (item) {
    return translator(item);
  });
  var value = translated.join(", ");
  if (prelabel) value = prelabel + " : " + value;
  return value;
};
var getSelectedFilterLabel = function getSelectedFilterLabel(selected, prelabel) {
  if (Array.isArray(selected)) {
    if (selected[0] === "FROMDATE" && selected[2] === "TODATE") {
      var formatedFROMDATE = selected[1].split("-").reverse().join("/");
      var formatedTODATE = selected[3].split("-").reverse().join("/");
      return "Date de debut : " + formatedFROMDATE + " • Date de fin : " + formatedTODATE;
    }
  }
  var translator = function translator(item) {
    if (prelabel === "Statut phase 2") {
      return translation.translatePhase2(item);
    } else if (prelabel === "Statut phase 1") {
      return translation.translatePhase1(item);
    } else if (prelabel === "Statut mission (candidature)") {
      return translation.translateApplication(item);
    } else if (prelabel === "Equivalence de MIG") {
      return translation.translateEquivalenceStatus(item);
    } else if (prelabel === "Statut contrats") {
      return translation.translateEngagement(item);
    } else if (prelabel === "Statut fichier phase 1") {
      return translation.translateFileStatusPhase1(item);
    } else if (prelabel === "Visibilité") {
      return translation.translateVisibilty(item);
    } else if (prelabel === "Dossier d’éligibilité aux Préparations Militaires") {
      return translation.translateStatusMilitaryPreparationFiles(item);
    } else if (prelabel === "Source") {
      return translation.translateSource(item);
    } else if (prelabel === "Place occupées") {
      return translation.translateMission(item);
    } else {
      return translation.translate(item);
    }
  };
  var value = "";
  if (_typeof(selected) === "object") {
    translated = selected.map(function (item) {
      return translator(item);
    });
    value = translated.join(", ");
  } else value = selected;
  if (prelabel) value = prelabel + " : " + value;
  return value;
};
var getResultLabel = function getResultLabel(e, pageSize) {
  return ""
    .concat(pageSize * e.currentPage + 1, "-")
    .concat(pageSize * e.currentPage + e.displayedResults, " sur ")
    .concat(e.numberOfResults);
};
var getLabelWithdrawnReason = function getLabelWithdrawnReason(value) {
  var _WITHRAWN_REASONS$fin;
  return (
    ((_WITHRAWN_REASONS$fin = WITHRAWN_REASONS.find(function (e) {
      return e.value === value;
    })) === null || _WITHRAWN_REASONS$fin === void 0
      ? void 0
      : _WITHRAWN_REASONS$fin.label) || value
  );
};
function canUpdateYoungStatus(_ref) {
  var body = _ref.body,
    current = _ref.current;
  if (!body || !current) return true;
  var allStatus = ["status", "statusPhase1", "statusPhase2", "statusPhase3", "statusMilitaryPreparationFiles", "statusPhase2Contract"];
  if (
    !allStatus.some(function (s) {
      return body[s] !== current[s];
    })
  )
    return true;
  var youngStatus = body.status === "VALIDATED" && !["REINSCRIPTION", "VALIDATED"].includes(current.status);
  var youngStatusPhase1 = body.statusPhase1 === "DONE" && current.statusPhase1 !== "DONE";
  var youngStatusPhase2 = body.statusPhase2 === "VALIDATED" && current.statusPhase2 !== "VALIDATED";
  var youngStatusPhase3 = body.statusPhase3 === "VALIDATED" && current.statusPhase3 !== "VALIDATED";
  var youngStatusMilitaryPrepFiles = body.statusMilitaryPreparationFiles === "VALIDATED" && current.statusMilitaryPreparationFiles !== "VALIDATED";
  var youngStatusPhase2Contract = body.statusPhase2Contract === "VALIDATED" && current.statusPhase2Contract !== "VALIDATED";
  var notAuthorized = youngStatus || youngStatusPhase1 || youngStatusPhase2 || youngStatusPhase3 || youngStatusMilitaryPrepFiles || youngStatusPhase2Contract;
  return !notAuthorized;
}
function canUserUpdateYoungStatus(actor) {
  if (actor) {
    return [ROLES.ADMIN].includes(actor.role);
  } else {
    return false;
  }
}
var SESSIONPHASE1ID_CANCHANGESESSION = ["627cd8b873254d073af93147", "6274e6359ea0ba074acf6557"];
var youngCanChangeSession = function youngCanChangeSession(_ref2) {
  var statusPhase1 = _ref2.statusPhase1,
    status = _ref2.status,
    sessionPhase1Id = _ref2.sessionPhase1Id;
  //   console.log([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(status), "alorss?");
  if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(status)) return true;
  if ([YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION].includes(statusPhase1) && status === YOUNG_STATUS.VALIDATED) {
    return true;
  }
  if ([YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE].includes(statusPhase1) && SESSIONPHASE1ID_CANCHANGESESSION.includes(sessionPhase1Id)) {
    return true;
  }
  if (statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) return true;
  return false;
};
var formatPhoneNumberFR = function formatPhoneNumberFR(tel) {
  if (!tel) return "";
  var regex = /^((?:(?:\+|00)33|0)\s*[1-9])((?:[\s.-]*\d{2}){4})$/;
  var global = tel.match(regex);
  if ((global === null || global === void 0 ? void 0 : global.length) !== 3) {
    return tel;
  }
  var rest = global[2].match(/.{1,2}/g);
  var formatted = "".concat(global[1], " ").concat(rest.join(" "));
  return formatted;
};
var formatMessageForReadingInnerHTML = function formatMessageForReadingInnerHTML(content) {
  var message = content.replace(/\\n/g, "<br>").replace(/\\r/g, "<br>");
  return message;
};

exports.APPLICATION_STATUS = APPLICATION_STATUS;
exports.APPLICATION_STATUS_COLORS = APPLICATION_STATUS_COLORS;
exports.CENTER_ROLES = CENTER_ROLES;
exports.COHESION_STAY_END = COHESION_STAY_END;
exports.COHESION_STAY_LIMIT_DATE = COHESION_STAY_LIMIT_DATE;
exports.COHESION_STAY_START = COHESION_STAY_START;
exports.COHORTS = COHORTS;
exports.COHORTS_BEFORE_JULY_2023 = COHORTS_BEFORE_JULY_2023;
exports.CONSENTMENT_TEXTS = CONSENTMENT_TEXTS;
exports.CONTRACT_STATUS = CONTRACT_STATUS;
exports.CONTRACT_STATUS_COLORS = CONTRACT_STATUS_COLORS;
exports.DEFAULT_STRUCTURE_NAME = DEFAULT_STRUCTURE_NAME;
exports.END_DATE_PHASE1 = END_DATE_PHASE1;
exports.ENGAGEMENT_LYCEEN_TYPES = ENGAGEMENT_LYCEEN_TYPES;
exports.ENGAGEMENT_TYPES = ENGAGEMENT_TYPES;
exports.EQUIVALENCE_STATUS = EQUIVALENCE_STATUS;
exports.EQUIVALENCE_STATUS_COLORS = EQUIVALENCE_STATUS_COLORS;
exports.ES_NO_LIMIT = ES_NO_LIMIT;
exports.FILE_KEYS = FILE_KEYS;
exports.FILE_STATUS_PHASE1 = FILE_STATUS_PHASE1;
exports.FORCE_DISABLED_ASSIGN_COHESION_CENTER = FORCE_DISABLED_ASSIGN_COHESION_CENTER;
exports.FORCE_DISABLED_ASSIGN_MEETING_POINT = FORCE_DISABLED_ASSIGN_MEETING_POINT;
exports.FORMAT = FORMAT;
exports.GRADES = GRADES;
exports.INTEREST_MISSION_LIMIT_DATE = INTEREST_MISSION_LIMIT_DATE;
exports.MILITARY_FILE_KEYS = MILITARY_FILE_KEYS;
exports.MIME_TYPES = MIME_TYPES;
exports.MINISTRES = MINISTRES;
exports.MISSION_DOMAINS = MISSION_DOMAINS;
exports.MISSION_PERIOD_DURING_HOLIDAYS = MISSION_PERIOD_DURING_HOLIDAYS;
exports.MISSION_PERIOD_DURING_SCHOOL = MISSION_PERIOD_DURING_SCHOOL;
exports.MISSION_STATUS = MISSION_STATUS;
exports.MISSION_STATUS_COLORS = MISSION_STATUS_COLORS;
exports.PDT_IMPORT_ERRORS = PDT_IMPORT_ERRORS;
exports.PDT_IMPORT_ERRORS_TRANSLATION = PDT_IMPORT_ERRORS_TRANSLATION;
exports.PERIOD = PERIOD;
exports.PHASE1_YOUNG_ACCESS_LIMIT = PHASE1_YOUNG_ACCESS_LIMIT;
exports.PHASE_STATUS = PHASE_STATUS;
exports.PHASE_STATUS_COLOR = PHASE_STATUS_COLOR;
exports.PHONE_ZONES = PHONE_ZONES;
exports.PHONE_ZONES_NAMES = PHONE_ZONES_NAMES;
exports.PHONE_ZONES_NAMES_ARR = PHONE_ZONES_NAMES_ARR;
exports.PROFESSIONNAL_PROJECT = PROFESSIONNAL_PROJECT;
exports.PROFESSIONNAL_PROJECT_PRECISION = PROFESSIONNAL_PROJECT_PRECISION;
exports.REFERENT_DEPARTMENT_SUBROLE = REFERENT_DEPARTMENT_SUBROLE;
exports.REFERENT_REGION_SUBROLE = REFERENT_REGION_SUBROLE;
exports.REFERENT_ROLES = REFERENT_ROLES;
exports.ROLES = ROLES;
exports.ROLES_LIST = ROLES_LIST;
exports.SENDINBLUE_SMS = SENDINBLUE_SMS;
exports.SENDINBLUE_TEMPLATES = SENDINBLUE_TEMPLATES;
exports.SESSION_STATUS = SESSION_STATUS;
exports.START_DATE_PHASE1 = START_DATE_PHASE1;
exports.START_DATE_SESSION_PHASE1 = START_DATE_SESSION_PHASE1;
exports.STRUCTURE_LEGAL_STATUS = STRUCTURE_LEGAL_STATUS;
exports.STRUCTURE_STATUS = STRUCTURE_STATUS;
exports.STRUCTURE_STATUS_COLORS = STRUCTURE_STATUS_COLORS;
exports.SUB_ROLES = SUB_ROLES;
exports.SUB_ROLES_LIST = SUB_ROLES_LIST;
exports.SUPPORT_ROLES = SUPPORT_ROLES;
exports.SUPPORT_ROLES_LIST = SUPPORT_ROLES_LIST;
exports.TEMPLATE_DESCRIPTIONS = TEMPLATE_DESCRIPTIONS;
exports.TRANSPORT = TRANSPORT;
exports.TRANSPORT_TIMES = TRANSPORT_TIMES;
exports.UNSS_TYPE = UNSS_TYPE;
exports.VISITOR_SUBROLES = VISITOR_SUBROLES;
exports.VISITOR_SUB_ROLES_LIST = VISITOR_SUB_ROLES_LIST;
exports.WITHRAWN_REASONS = WITHRAWN_REASONS;
exports.YOUNG_PHASE = YOUNG_PHASE;
exports.YOUNG_SCHOOLED_SITUATIONS = YOUNG_SCHOOLED_SITUATIONS;
exports.YOUNG_SITUATIONS = YOUNG_SITUATIONS;
exports.YOUNG_STATUS = YOUNG_STATUS;
exports.YOUNG_STATUS_COLORS = YOUNG_STATUS_COLORS;
exports.YOUNG_STATUS_PHASE1 = YOUNG_STATUS_PHASE1;
exports.YOUNG_STATUS_PHASE1_MOTIF = YOUNG_STATUS_PHASE1_MOTIF;
exports.YOUNG_STATUS_PHASE2 = YOUNG_STATUS_PHASE2;
exports.YOUNG_STATUS_PHASE3 = YOUNG_STATUS_PHASE3;
exports.academyList = academyList;
exports.academyToDepartments = academyToDepartments;
exports.applicationExportFields = applicationExportFields;
exports.applicationExportFieldsStructure = applicationExportFieldsStructure;
exports.calculateAge = calculateAge;
exports.canApplyToPhase2 = canApplyToPhase2;
exports.canAssignCohesionCenter = canAssignCohesionCenter;
exports.canAssignManually = canAssignManually;
exports.canAssignMeetingPoint = canAssignMeetingPoint;
exports.canChangeYoungCohort = canChangeYoungCohort;
exports.canCreateBus = canCreateBus;
exports.canCreateEvent = canCreateEvent;
exports.canCreateLigneBus = canCreateLigneBus;
exports.canCreateMeetingPoint = canCreateMeetingPoint;
exports.canCreateOrModifyMission = canCreateOrModifyMission;
exports.canCreateOrUpdateCohesionCenter = canCreateOrUpdateCohesionCenter;
exports.canCreateOrUpdateContract = canCreateOrUpdateContract;
exports.canCreateOrUpdateDepartmentService = canCreateOrUpdateDepartmentService;
exports.canCreateOrUpdateProgram = canCreateOrUpdateProgram;
exports.canCreateOrUpdateSessionPhase1 = canCreateOrUpdateSessionPhase1;
exports.canCreateSchemaDeRepartition = canCreateSchemaDeRepartition;
exports.canCreateStructure = canCreateStructure;
exports.canCreateTags = canCreateTags;
exports.canCreateYoungApplication = canCreateYoungApplication;
exports.canDeleteLigneBus = canDeleteLigneBus;
exports.canDeleteMeetingPoint = canDeleteMeetingPoint;
exports.canDeleteMeetingPointSession = canDeleteMeetingPointSession;
exports.canDeletePatchesHistory = canDeletePatchesHistory;
exports.canDeleteReferent = canDeleteReferent;
exports.canDeleteSchemaDeRepartition = canDeleteSchemaDeRepartition;
exports.canDeleteStructure = canDeleteStructure;
exports.canDeleteYoung = canDeleteYoung;
exports.canDownloadYoungDocuments = canDownloadYoungDocuments;
exports.canEditLigneBusCenter = canEditLigneBusCenter;
exports.canEditLigneBusGeneralInfo = canEditLigneBusGeneralInfo;
exports.canEditLigneBusPointDeRassemblement = canEditLigneBusPointDeRassemblement;
exports.canEditLigneBusTeam = canEditLigneBusTeam;
exports.canEditPresenceYoung = canEditPresenceYoung;
exports.canEditSchemaDeRepartition = canEditSchemaDeRepartition;
exports.canEditTableDeRepartitionDepartment = canEditTableDeRepartitionDepartment;
exports.canEditTableDeRepartitionRegion = canEditTableDeRepartitionRegion;
exports.canEditYoung = canEditYoung;
exports.canExportConvoyeur = canExportConvoyeur;
exports.canExportLigneBus = canExportLigneBus;
exports.canGetReferentByEmail = canGetReferentByEmail;
exports.canGetYoungByEmail = canGetYoungByEmail;
exports.canInviteUser = canInviteUser;
exports.canInviteYoung = canInviteYoung;
exports.canModifyMissionStructureId = canModifyMissionStructureId;
exports.canModifyStructure = canModifyStructure;
exports.canPutSpecificDateOnSessionPhase1 = canPutSpecificDateOnSessionPhase1;
exports.canRefuseMilitaryPreparation = canRefuseMilitaryPreparation;
exports.canSearchAssociation = canSearchAssociation;
exports.canSearchInElasticSearch = canSearchInElasticSearch;
exports.canSearchLigneBus = canSearchLigneBus;
exports.canSearchMeetingPoints = canSearchMeetingPoints;
exports.canSearchSessionPhase1 = canSearchSessionPhase1;
exports.canSendFileByMailToYoung = canSendFileByMailToYoung;
exports.canSendImageRightsForSessionPhase1 = canSendImageRightsForSessionPhase1;
exports.canSendPlanDeTransport = canSendPlanDeTransport;
exports.canSendTemplateToYoung = canSendTemplateToYoung;
exports.canSendTimeScheduleReminderForSessionPhase1 = canSendTimeScheduleReminderForSessionPhase1;
exports.canSendTutorTemplate = canSendTutorTemplate;
exports.canShareSessionPhase1 = canShareSessionPhase1;
exports.canSigninAs = canSigninAs;
exports.canUpdateBus = canUpdateBus;
exports.canUpdateInscriptionGoals = canUpdateInscriptionGoals;
exports.canUpdateLigneBus = canUpdateLigneBus;
exports.canUpdateMeetingPoint = canUpdateMeetingPoint;
exports.canUpdateReferent = canUpdateReferent;
exports.canUpdateYoungStatus = canUpdateYoungStatus;
exports.canUserUpdateYoungStatus = canUserUpdateYoungStatus;
exports.canViewBus = canViewBus;
exports.canViewCohesionCenter = canViewCohesionCenter;
exports.canViewContract = canViewContract;
exports.canViewDepartmentService = canViewDepartmentService;
exports.canViewEmailHistory = canViewEmailHistory;
exports.canViewInscriptionGoals = canViewInscriptionGoals;
exports.canViewLigneBus = canViewLigneBus;
exports.canViewMeetingPointId = canViewMeetingPointId;
exports.canViewMeetingPoints = canViewMeetingPoints;
exports.canViewMission = canViewMission;
exports.canViewNotes = canViewNotes;
exports.canViewPatchesHistory = canViewPatchesHistory;
exports.canViewReferent = canViewReferent;
exports.canViewSchemaDeRepartition = canViewSchemaDeRepartition;
exports.canViewSessionPhase1 = canViewSessionPhase1;
exports.canViewStructureChildren = canViewStructureChildren;
exports.canViewStructures = canViewStructures;
exports.canViewTableDeRepartition = canViewTableDeRepartition;
exports.canViewTicketTags = canViewTicketTags;
exports.canViewYoung = canViewYoung;
exports.canViewYoungApplications = canViewYoungApplications;
exports.canViewYoungFile = canViewYoungFile;
exports.canViewYoungMilitaryPreparationFile = canViewYoungMilitaryPreparationFile;
exports.centersInJulyClosingEarly = centersInJulyClosingEarly;
exports.colors = colors;
exports.concatPhoneNumberWithZone = concatPhoneNumberWithZone;
exports.createFormDataForFileUpload = createFormDataForFileUpload;
exports.dateForDatePicker = dateForDatePicker;
exports.department2region = department2region;
exports.departmentList = departmentList;
exports.departmentLookUp = departmentLookUp;
exports.departmentToAcademy = departmentToAcademy;
exports.download = download;
exports.formatDateFR = formatDateFR;
exports.formatDateFRTimezoneUTC = formatDateFRTimezoneUTC;
exports.formatDay = formatDay;
exports.formatLongDateFR = formatLongDateFR;
exports.formatLongDateUTC = formatLongDateUTC;
exports.formatLongDateUTCWithoutTime = formatLongDateUTCWithoutTime;
exports.formatMessageForReadingInnerHTML = formatMessageForReadingInnerHTML;
exports.formatPhoneNumberFR = formatPhoneNumberFR;
exports.formatPhoneNumberFromPhoneZone = formatPhoneNumberFromPhoneZone;
exports.formatStringDate = formatStringDate;
exports.formatStringDateTimezoneUTC = formatStringDateTimezoneUTC;
exports.formatStringDateWithDayTimezoneUTC = formatStringDateWithDayTimezoneUTC;
exports.formatStringLongDate = formatStringLongDate;
exports.formatToActualTime = formatToActualTime;
exports.getAge = getAge;
exports.getDepartmentByZip = getDepartmentByZip;
exports.getDepartmentNumber = getDepartmentNumber;
exports.getDepartureDate = getDepartureDate;
exports.getFilterLabel = getFilterLabel;
exports.getGlobalDepartureDate = getGlobalDepartureDate;
exports.getGlobalReturnDate = getGlobalReturnDate;
exports.getLabelWithdrawnReason = getLabelWithdrawnReason;
exports.getLimitDateForPhase2 = getLimitDateForPhase2;
exports.getMeetingHour = getMeetingHour;
exports.getRegionByZip = getRegionByZip;
exports.getRegionForEligibility = getRegionForEligibility;
exports.getResultLabel = getResultLabel;
exports.getReturnDate = getReturnDate;
exports.getReturnHour = getReturnHour;
exports.getSelectedFilterLabel = getSelectedFilterLabel;
exports.inscriptionCreationOpenForYoungs = inscriptionCreationOpenForYoungs;
exports.inscriptionModificationOpenForYoungs = inscriptionModificationOpenForYoungs;
exports.isAdmin = isAdmin;
exports.isBusEditionOpen = isBusEditionOpen;
exports.isEndOfInscriptionManagement2021 = isEndOfInscriptionManagement2021;
exports.isFromDOMTOM = isFromDOMTOM;
exports.isFromFrenchPolynesia = isFromFrenchPolynesia;
exports.isFromMetropole = isFromMetropole;
exports.isFromNouvelleCaledonie = isFromNouvelleCaledonie;
exports.isInRuralArea = isInRuralArea;
exports.isIsoDate = isIsoDate;
exports.isLigneBusDemandeDeModificationOpen = isLigneBusDemandeDeModificationOpen;
exports.isPdrEditionOpen = isPdrEditionOpen;
exports.isPhoneNumberWellFormated = isPhoneNumberWellFormated;
exports.isPhoneZoneKnown = isPhoneZoneKnown;
exports.isReferentOrAdmin = isReferentOrAdmin;
exports.isSessionEditionOpen = isSessionEditionOpen;
exports.isSuperAdmin = isSuperAdmin;
exports.isSupervisor = isSupervisor;
exports.isTemporaryAffected = isTemporaryAffected;
exports.ligneBusCanCreateDemandeDeModification = ligneBusCanCreateDemandeDeModification;
exports.ligneBusCanEditOpinionDemandeDeModification = ligneBusCanEditOpinionDemandeDeModification;
exports.ligneBusCanEditStatusDemandeDeModification = ligneBusCanEditStatusDemandeDeModification;
exports.ligneBusCanEditTagsDemandeDeModification = ligneBusCanEditTagsDemandeDeModification;
exports.ligneBusCanSendMessageDemandeDeModification = ligneBusCanSendMessageDemandeDeModification;
exports.ligneBusCanViewDemandeDeModification = ligneBusCanViewDemandeDeModification;
exports.missionCandidatureExportFields = missionCandidatureExportFields;
exports.missionExportFields = missionExportFields;
exports.oldSessions = oldSessions;
exports.reInscriptionModificationOpenForYoungs = reInscriptionModificationOpenForYoungs;
exports.region2department = region2department;
exports.region2zone = region2zone;
exports.regionList = regionList;
exports.regionsListDROMS = regionsListDROMS;
exports.sessions2023 = sessions2023;
exports.structureExportFields = structureExportFields;
exports.ticketStateIdByName = ticketStateIdByName;
exports.ticketStateNameById = ticketStateNameById;
exports.totalClosedTickets = totalClosedTickets;
exports.totalNewTickets = totalNewTickets;
exports.totalOpenedTickets = totalOpenedTickets;
exports.translate = translate;
exports.translateAction = translateAction;
exports.translateAddFilePhase2 = translateAddFilePhase2;
exports.translateAddFilePhase2WithoutPreposition = translateAddFilePhase2WithoutPreposition;
exports.translateAddFilesPhase2 = translateAddFilesPhase2;
exports.translateApplication = translateApplication;
exports.translateApplicationFileType = translateApplicationFileType;
exports.translateApplicationForYoungs = translateApplicationForYoungs;
exports.translateBusPatchesField = translateBusPatchesField;
exports.translateCniExpired = translateCniExpired;
exports.translateCohort = translateCohort;
exports.translateCohortTemp = translateCohortTemp;
exports.translateContractStatus = translateContractStatus;
exports.translateCorrectionReason = translateCorrectionReason;
exports.translateDomainCenter = translateDomainCenter;
exports.translateEngagement = translateEngagement;
exports.translateEquivalenceStatus = translateEquivalenceStatus;
exports.translateField = translateField;
exports.translateFileStatusPhase1 = translateFileStatusPhase1;
exports.translateFilter = translateFilter;
exports.translateGrade = translateGrade;
exports.translateIndexes = translateIndexes;
exports.translateInscriptionStatus = translateInscriptionStatus;
exports.translateMission = translateMission;
exports.translatePhase1 = translatePhase1;
exports.translatePhase2 = translatePhase2;
exports.translateSessionStatus = translateSessionStatus;
exports.translateSource = translateSource;
exports.translateState = translateState;
exports.translateStatusMilitaryPreparationFiles = translateStatusMilitaryPreparationFiles;
exports.translateTypologieCenter = translateTypologieCenter;
exports.translateVisibilty = translateVisibilty;
exports.transportDatesToString = transportDatesToString;
exports.youngCanChangeSession = youngCanChangeSession;
exports.youngExportFields = youngExportFields;
exports.youngPlanDeTranportExportFields = youngPlanDeTranportExportFields;
