import { Picker } from "emoji-mart";
import { useEffect, useState } from "react";

// https://github.com/missive/emoji-mart#i18n
const i18n = {
  search: "Recherche",
  clear: "Effacer", // Accessible label on "clear" button
  notfound: "Pas d'emoji correspondant",
  skintext: "Choisissez une teinte par défaut",
  categories: {
    search: "Résultats",
    recent: "Fréquemment utilisés",
    smileys: "Smileys & Émotions",
    people: "Personnes & Corps",
    nature: "Animaux & Nature",
    foods: "Nourriture & Boissons",
    activity: "Activités",
    places: "Voyages & Lieux",
    objects: "Objets",
    symbols: "Symboles",
    flags: "Drapeaux",
    custom: "Personnalisés",
  },
  categorieslabel: "Catégories d'emojis", // Accessible title for the list of categories
  skintones: {
    1: "Teint de peau par défaut",
    2: "Teint clair",
    3: "Teint moyen-clair",
    4: "Teint moyen",
    5: "Teint moyen-foncé",
    6: "Teint foncé",
  },
};

const EmojiPicker = ({ insertEmoji }) => {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && theme === "light") {
      setTheme("dark");
    }
  }, []);

  const onSelect = ({ id, name, short_names, colons, emoticons, unified, skin, native }) => {
    insertEmoji(String.fromCodePoint(parseInt(Number(`0x${unified}`), 10)));
    /*
  "id": "heart_eyes",
    "name": "Smiling Face with Heart-Shaped Eyes",
    "short_names": [
        "heart_eyes"
    ],
    "colons": ":heart_eyes:",
    "emoticons": [],
    "unified": "1f60d",
    "skin": null,
    "native": "😍"
  */
  };

  return <Picker i18n={i18n} set="apple" enableFrequentEmojiSort onSelect={onSelect} native theme={theme} title="SNU" />;
};

export default EmojiPicker;
