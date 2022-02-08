import { Picker } from "emoji-mart";
import { useEffect, useRef, useState } from "react";

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

const EmojiPicker = ({ insertEmoji, className }) => {
  const [theme, setTheme] = useState("light");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, right: 0 });
  const pickerButtonRef = useRef(null);

  const onOpenEmojiPicker = () => {
    const { top, left } = pickerButtonRef.current.getBoundingClientRect();
    // picker is 420h x 340w
    const idealTop = top + 24; // 24px is the svg button size
    const pickerTop = Math.min(window.innerHeight - 420, idealTop);
    const idealLeft = Math.min(left, window.innerWidth - 340 - 24);
    const pickerLeft = idealTop > pickerTop ? idealLeft + 24 : idealLeft;
    setPickerPosition({ top: pickerTop, left: pickerLeft });
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && theme === "light") {
      setTheme("dark");
    }
  }, []);

  const onSelect = ({ native }) => {
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
    // insertEmoji(String.fromCodePoint(parseInt(Number(`0x${unified}`), 10)));
    insertEmoji(native);
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <>
      <svg
        ref={pickerButtonRef}
        onClick={onOpenEmojiPicker}
        xmlns="http://www.w3.org/2000/svg"
        className={`relative h-6 w-6 cursor-pointer text-gray-400 mr-2 ${className}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="fixed z-10 with-emoji" style={pickerPosition}>
        {!!showEmojiPicker && <Picker i18n={i18n} set="emojione" enableFrequentEmojiSort onSelect={onSelect} native theme={theme} title="SNU" />}
      </div>
    </>
  );
};

export default EmojiPicker;
