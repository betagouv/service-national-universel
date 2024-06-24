function generateRandomEmail() {
  const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let email = "test";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * randomChars.length);
    email += randomChars.charAt(randomIndex);
  }
  const timestamp = Date.now();
  const newEmail = `${email}${timestamp}@gmail.com`;
  return newEmail;
}

// oui on peut utiliser Faker à la place de cette fonction, mais des noms d'elfes c'est quand même plus classe ;P
function generateRandomName() {
  const syllables = [
    "ael",
    "aer",
    "ai",
    "al",
    "an",
    "ar",
    "as",
    "ath",
    "aur",
    "bar",
    "bel",
    "bril",
    "cal",
    "cel",
    "cir",
    "dal",
    "del",
    "din",
    "eir",
    "el",
    "en",
    "er",
    "eth",
    "fae",
    "fal",
    "fin",
    "gal",
    "gel",
    "gil",
    "hal",
    "hel",
    "il",
    "in",
    "ir",
    "is",
    "ith",
    "kae",
    "kel",
    "kir",
    "lae",
    "laf",
    "las",
    "lin",
    "lof",
    "mal",
    "mel",
    "min",
    "nae",
    "nel",
    "nis",
    "nor",
    "or",
    "orin",
    "par",
    "pel",
    "per",
    "qua",
    "quel",
    "rae",
    "ral",
    "rel",
    "rin",
    "rof",
    "sal",
    "sel",
    "sil",
    "tae",
    "tah",
    "tel",
    "tin",
    "ul",
    "um",
    "ur",
    "us",
    "val",
    "var",
    "vel",
    "vil",
    "wal",
    "wel",
    "wil",
    "xal",
    "xel",
    "yin",
    "yol",
    "zal",
    "zel",
    "zil",
  ];

  const randomName = [];

  const numberOfSyllables = Math.floor(Math.random() * 2) + 2;

  for (let i = 0; i < numberOfSyllables; i++) {
    const randomIndex = Math.floor(Math.random() * syllables.length);
    const syllable = syllables[randomIndex];
    randomName.push(syllable);
  }

  const modifiedName = randomName.join("");
  const generatedName = capitalizeFirstLetter(modifiedName);

  return generatedName;
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateAddress() {
  const randomNum = Math.floor(Math.random() * 30) + 1; // Génération d'un nombre de 1 à 30
  const name1 = generateRandomName();
  const name2 = generateRandomName();
  const newAddress = `${randomNum} rue ${name1} ${name2}`; // Construction de la nouvelle adresse
  return newAddress;
}

function getRandomMonth() {
  return Math.floor(Math.random() * 12);
}

function getRandomDayOfMonth() {
  return Math.floor(Math.random() * 28) + 1;
}

function generateBirthdate() {
  const currentDate = new Date();
  const minAge = 15;
  const maxAge = 17;
  const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthdate = new Date(currentDate.getFullYear() - randomAge, getRandomMonth(), getRandomDayOfMonth());
  return birthdate;
}

function getYoungLocation(zipCode) {
  if (!zipCode) return null;
  const departements = [
    { nom: "Ain", code: "01", latitude: 46.20439, longitude: 5.22878 },
    { nom: "Aisne", code: "02", latitude: 49.5645, longitude: 3.62084 },
    { nom: "Allier", code: "03", latitude: 46.56028, longitude: 3.34062 },
    { nom: "Alpes-de-Haute-Provence", code: "04", latitude: 44.0924, longitude: 6.23598 },
    { nom: "Hautes-Alpes", code: "05", latitude: 44.5596, longitude: 6.07948 },
    { nom: "Alpes-Maritimes", code: "06", latitude: 43.6952, longitude: 7.26559 },
    { nom: "Ardèche", code: "07", latitude: 44.931109, longitude: 4.890954 },
    { nom: "Ardennes", code: "08", latitude: 49.762085, longitude: 4.726096 },
    { nom: "Ariège", code: "09", latitude: 42.963701, longitude: 1.606701 },
    { nom: "Aube", code: "10", latitude: 48.295691, longitude: 4.074401 },
    { nom: "Aude", code: "11", latitude: 43.212161, longitude: 2.353663 },
    { nom: "Aveyron", code: "12", latitude: 44.352905, longitude: 2.573611 },
    { nom: "Bouches-du-Rhône", code: "13", latitude: 43.296174, longitude: 5.369953 },
    { nom: "Calvados", code: "14", latitude: 49.182863, longitude: -0.370679 },
    { nom: "Cantal", code: "15", latitude: 44.922203, longitude: 2.441401 },
    { nom: "Charente", code: "16", latitude: 45.649925, longitude: 0.159489 },
    { nom: "Charente-Maritime", code: "17", latitude: 46.159112, longitude: -1.152043 },
    { nom: "Cher", code: "18", latitude: 47.083744, longitude: 2.395892 },
    { nom: "Corrèze", code: "19", latitude: 45.268374, longitude: 1.773754 },
    { nom: "Côte-d'Or", code: "21", latitude: 47.322047, longitude: 5.04148 },
    { nom: "Côtes-d'Armor", code: "22", latitude: 48.51418, longitude: -2.765835 },
    { nom: "Creuse", code: "23", latitude: 46.167699, longitude: 1.871002 },
    { nom: "Dordogne", code: "24", latitude: 45.184029, longitude: 0.721115 },
    { nom: "Doubs", code: "25", latitude: 47.237829, longitude: 6.024054 },
    { nom: "Drôme", code: "26", latitude: 44.932495, longitude: 4.890173 },
    { nom: "Eure", code: "27", latitude: 49.024014, longitude: 1.150838 },
    { nom: "Eure-et-Loir", code: "28", latitude: 48.446857, longitude: 1.489253 },
    { nom: "Finistère", code: "29", latitude: 48.079359, longitude: -4.32502 },
    { nom: "Corse-du-Sud", code: "2A", latitude: 41.927064, longitude: 8.734682 },
    { nom: "Haute-Corse", code: "2B", latitude: 42.663529, longitude: 9.449874 },
    { nom: "Haute-Corse", code: "20", latitude: 42.663529, longitude: 9.449874 },
    { nom: "Gard", code: "30", latitude: 43.836699, longitude: 4.360054 },
    { nom: "Haute-Garonne", code: "31", latitude: 43.604652, longitude: 1.444209 },
    { nom: "Gers", code: "32", latitude: 43.64555, longitude: 0.586898 },
    { nom: "Gironde", code: "33", latitude: 44.837789, longitude: -0.57918 },
    { nom: "Hérault", code: "34", latitude: 43.610769, longitude: 3.876716 },
    { nom: "Ille-et-Vilaine", code: "35", latitude: 48.113475, longitude: -1.675708 },
    { nom: "Indre", code: "36", latitude: 46.809762, longitude: 1.69129 },
    { nom: "Indre-et-Loire", code: "37", latitude: 47.394144, longitude: 0.68484 },
    { nom: "Isère", code: "38", latitude: 45.18756, longitude: 5.735782 },
    { nom: "Jura", code: "39", latitude: 46.670511, longitude: 5.552793 },
    { nom: "Landes", code: "40", latitude: 44.012129, longitude: -0.985194 },
    { nom: "Loir-et-Cher", code: "41", latitude: 47.586092, longitude: 1.335947 },
    { nom: "Loire", code: "42", latitude: 45.439695, longitude: 4.387178 },
    { nom: "Haute-Loire", code: "43", latitude: 45.043267, longitude: 3.88474 },
    { nom: "Loire-Atlantique", code: "44", latitude: 47.218371, longitude: -1.553621 },
    { nom: "Loiret", code: "45", latitude: 47.902964, longitude: 1.909251 },
    { nom: "Lot", code: "46", latitude: 44.447522, longitude: 1.441989 },
    { nom: "Lot-et-Garonne", code: "47", latitude: 44.20486, longitude: 0.621185 },
    { nom: "Lozère", code: "48", latitude: 44.516388, longitude: 3.500345 },
    { nom: "Maine-et-Loire", code: "49", latitude: 47.478419, longitude: -0.563166 },
    { nom: "Manche", code: "50", latitude: 49.182863, longitude: -1.650929 },
    { nom: "Marne", code: "51", latitude: 48.956682, longitude: 4.36274 },
    { nom: "Haute-Marne", code: "52", latitude: 48.111338, longitude: 5.13945 },
    { nom: "Mayenne", code: "53", latitude: 48.078515, longitude: -0.772838 },
    { nom: "Meurthe-et-Moselle", code: "54", latitude: 48.691002, longitude: 6.184417 },
    { nom: "Meuse", code: "55", latitude: 48.765335, longitude: 5.577256 },
    { nom: "Morbihan", code: "56", latitude: 47.65511, longitude: -2.761847 },
    { nom: "Moselle", code: "57", latitude: 49.119309, longitude: 6.175716 },
    { nom: "Nièvre", code: "58", latitude: 47.000232, longitude: 3.493213 },
    { nom: "Nord", code: "59", latitude: 50.62925, longitude: 3.057256 },
    { nom: "Oise", code: "60", latitude: 49.417949, longitude: 2.826142 },
    { nom: "Orne", code: "61", latitude: 48.431533, longitude: 0.091463 },
    { nom: "Pas-de-Calais", code: "62", latitude: 50.69421, longitude: 2.849694 },
    { nom: "Puy-de-Dôme", code: "63", latitude: 45.783298, longitude: 3.082329 },
    { nom: "Pyrénées-Atlantiques", code: "64", latitude: 43.29578, longitude: -0.370797 },
    { nom: "Hautes-Pyrénées", code: "65", latitude: 43.232951, longitude: 0.078082 },
    { nom: "Pyrénées-Orientales", code: "66", latitude: 42.688659, longitude: 2.894833 },
    { nom: "Bas-Rhin", code: "67", latitude: 48.573406, longitude: 7.752111 },
    { nom: "Haut-Rhin", code: "68", latitude: 47.750839, longitude: 7.335888 },
    { nom: "Rhône", code: "69", latitude: 45.758018, longitude: 4.835659 },
    { nom: "Haute-Saône", code: "70", latitude: 47.624762, longitude: 6.15659 },
    { nom: "Saône-et-Loire", code: "71", latitude: 46.658713, longitude: 4.566092 },
    { nom: "Sarthe", code: "72", latitude: 48.00766, longitude: 0.19828 },
    { nom: "Savoie", code: "73", latitude: 45.566299, longitude: 5.920794 },
    { nom: "Haute-Savoie", code: "74", latitude: 46.070847, longitude: 6.412112 },
    { nom: "Paris", code: "75", latitude: 48.856614, longitude: 2.352222 },
    { nom: "Seine-Maritime", code: "76", latitude: 49.443232, longitude: 1.099971 },
    { nom: "Seine-et-Marne", code: "77", latitude: 48.84143, longitude: 2.65239 },
    { nom: "Yvelines", code: "78", latitude: 48.804865, longitude: 2.13404 },
    { nom: "Deux-Sèvres", code: "79", latitude: 46.649577, longitude: -0.434814 },
    { nom: "Somme", code: "80", latitude: 49.896557, longitude: 2.302222 },
    { nom: "Tarn", code: "81", latitude: 43.9298, longitude: 2.148 },
    { nom: "Tarn-et-Garonne", code: "82", latitude: 44.022103, longitude: 1.352447 },
    { nom: "Var", code: "83", latitude: 43.432468, longitude: 6.7352 },
    { nom: "Vaucluse", code: "84", latitude: 43.933243, longitude: 4.89236 },
    { nom: "Vendée", code: "85", latitude: 46.84072, longitude: -1.3488 },
    { nom: "Vienne", code: "86", latitude: 46.58122, longitude: 0.33525 },
    { nom: "Haute-Vienne", code: "87", latitude: 45.835421, longitude: 1.261746 },
    { nom: "Vosges", code: "88", latitude: 48.17445, longitude: 6.45118 },
    { nom: "Yonne", code: "89", latitude: 47.797334, longitude: 3.56689 },
    { nom: "Territoire de Belfort", code: "90", latitude: 47.639674, longitude: 6.863849 },
    { nom: "Essonne", code: "91", latitude: 48.632908, longitude: 2.18828 },
    { nom: "Hauts-de-Seine", code: "92", latitude: 48.896684, longitude: 2.25666 },
    { nom: "Seine-Saint-Denis", code: "93", latitude: 48.915361, longitude: 2.447746 },
    { nom: "Val-de-Marne", code: "94", latitude: 48.793409, longitude: 2.45877 },
    { nom: "Val-d'Oise", code: "95", latitude: 49.032393, longitude: 2.080958 },
    { nom: "Guadeloupe", code: "971", latitude: 16.265, longitude: -61.551 },
    { nom: "Martinique", code: "972", latitude: 14.641528, longitude: -61.024174 },
    { nom: "Guyane", code: "973", latitude: 3.933889, longitude: -53.125782 },
    { nom: "La Réunion", code: "974", latitude: -21.115141, longitude: 55.536384 },
    { nom: "Mayotte", code: "976", latitude: -12.8275, longitude: 45.166244 },
  ];

  let depCode;
  if (zipCode.startsWith("97")) {
    depCode = zipCode.substring(0, 3);
  } else {
    depCode = zipCode.substring(0, 2);
  }

  const department = departements.find((dep) => dep.code === depCode);

  if (department) {
    return {
      latitude: department.latitude,
      longitude: department.longitude,
    };
  }

  return { latitude: 48.856614, longitude: 2.352222 };
}

function generateNewPhoneNumber() {
  let phoneNumber = "07";

  for (let i = 0; i < 8; i++) {
    phoneNumber += Math.floor(Math.random() * 10).toString();
  }

  return phoneNumber;
}

const starify = (value) => {
  if (!value) return undefined;
  const str = value.toString();
  const stars = str?.replace(/\S/g, "*");
  return stars;
};

const STAR_EMAIL = "*******@*******.***";

module.exports = {
  STAR_EMAIL,
  generateRandomEmail,
  generateRandomName,
  generateAddress,
  generateBirthdate,
  getYoungLocation,
  generateNewPhoneNumber,
  starify,
};
