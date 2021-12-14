import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { toast } from "react-toastify";
import slugify from "slugify";
import API from "../../services/api";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import InputWithEmojiPicker from "../InputWithEmojiPicker";
import IconsPicker, { RedIcon } from "../IconsPicker";

const AdminKBItemMetadata = ({ visible }) => {
  const router = useRouter();
  const [showIconChooser, setShowIconChooser] = useState(false);

  const { flattenedData, item, parent, mutate } = useKnowledgeBaseData();

  // need to listen to title change to propose updated slug
  const [title, setTitle] = useState(item.title);
  const onTitleChange = (event) => {
    setTitle(event.target.value);
  };

  useEffect(() => {
    setTitle(item.title);
  }, [item.title]);

  const [itemSlug, setItemSlug] = useState(item.slug);
  const onItemSlugChange = (event) => {
    setItemSlug(event.target.value);
  };

  useEffect(() => {
    setItemSlug(item.slug);
  }, [item.slug]);

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = { allowedRoles: [] };
    for (let [key, value] of formData.entries()) {
      if (key === "imageSrc") continue;
      if (key.includes(".")) {
        // allowedRole in fieldset
        const [checkboxFieldset, checkboxName] = key.split(".");
        if (["on", true].includes(value)) body[checkboxFieldset].push(checkboxName);
      } else {
        body[key] = value;
      }
    }
    const response = await API.put({ path: `/support-center/knowledge-base/${item._id}`, body });
    if (response.code) return toast.error(response.code);
    if (itemSlug !== item.slug) {
      await mutate({ ok: true, data: flattenedData.map((i) => (i._id === item._id ? response.data : i)) }, false);
      router.replace(`/admin/knowledge-base/${response.data.slug}`);
    }
    mutate();
    toast.success("Élément enregistré !");
  };

  const onDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cet élément ? Cette opération est définitive")) {
      const response = await API.delete({ path: `/support-center/knowledge-base/${item._id}` });
      if (response.code) return toast.error(response.code);
      toast.success("Élément supprimé !");
      const parent = flattenedData.find((otherItems) => otherItems._id === item.parentId);
      mutate();
      router.replace(`/admin/knowledge-base/${parent?.slug || ""}`);
    }
  };

  const [itemImageSrc, setItemImageSrc] = useState(item.imageSrc);
  const onUploadImage = async (event) => {
    const imageRes = await API.uploadFile("/support-center/knowledge-base/picture", event.target.files);
    if (imageRes.code === "FILE_CORRUPTED") {
      return toast.error("Le fichier semble corrompu", "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support", {
        timeOut: 0,
      });
    }
    if (!imageRes.ok) return toast.error("Une erreur s'est produite lors du téléversement de votre fichier");
    const response = await API.put({ path: `/support-center/knowledge-base/${item._id}`, body: { imageSrc: imageRes.data } });
    if (response.code) return toast.error(response.code);
    mutate();
    setItemImageSrc(response.data.imageSrc);
    toast.success("Fichier téléversé");
  };

  const onDeleteImage = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cet image ? Cette opération est définitive")) {
      const response = await API.put({ path: `/support-center/knowledge-base/${item._id}`, body: { imageSrc: null } });
      if (response.code) return toast.error(response.code);
      mutate();
    }
  };

  useEffect(() => {
    setItemSlug(item.slug);
  }, [item.slug]);

  const [itemIcon, setItemIcon] = useState(item.icon);
  const onChooseIcon = () => setShowIconChooser(true);
  const onSelectIcon = async (icon) => {
    const response = await API.put({ path: `/support-center/knowledge-base/${item._id}`, body: { icon } });
    if (response.code) return toast.error(response.code);
    mutate();
    setItemIcon(response.data.icon);
    setShowIconChooser(false);
  };

  const shouldChangeSlug = () => {
    if (!title) return false;
    if (title === item.title && itemSlug === item.slug) return false; // slug and title don 't mathc volontaryli
    if (itemSlug !== makeTitleSlug(title)) return true;
    if (title !== item.title && itemSlug !== makeTitleSlug(title)) return true;
    return false;
  };

  return (
    <aside className={`flex-grow-0 flex-shrink-0 border-l-2 shadow-lg z-10 resize-x dir-rtl overflow-hidden ${visible ? "w-80" : "w-0 hidden"}`}>
      <form onSubmit={onSubmit} className="flex-grow-0 flex-shrink-0  px-4 py-6 flex flex-col w-full overflow-scroll h-full dir-ltr items-start" key={item._id}>
        <label className="font-bold" htmlFor="title">
          Titre
        </label>
        <InputWithEmojiPicker
          inputClassName="p-2"
          className="border-2 mb-5 bg-white w-full"
          placeholder={`Titre ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
          name="title"
          value={title}
          onChange={onTitleChange}
        />
        <label className="font-bold" htmlFor="group">
          Groupe (option)
        </label>
        <InputWithEmojiPicker inputClassName="p-2" className="border-2 mb-5 bg-white w-full" placeholder="Phase 1, Phase 2, Mon Compte..." name="group" defaultValue={item.group} />
        <label className="font-bold" htmlFor="slug">
          Slug (Url)
        </label>
        <input
          className="p-2 border-2 mb-5 w-full"
          placeholder={`Slug ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
          name="slug"
          value={itemSlug}
          onChange={onItemSlugChange}
        />
        {shouldChangeSlug() && (
          <span className=" text-gray-500 italic text-sm -mt-5 mb-5 cursor-pointer" onClick={() => setItemSlug(makeTitleSlug(title))}>
            {`Remplacer le slug actuel par\u00A0:`}
            <br />
            <span className="underline">{makeTitleSlug(title)}</span>
            {" ?"}
          </span>
        )}
        <label className="font-bold" htmlFor="description">
          Description
        </label>
        <textarea
          className="p-2 border-2 mb-5 w-full flex-shrink-0"
          placeholder={`Description ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
          name="description"
          defaultValue={item.description}
        />
        <label className="font-bold" htmlFor="description">
          Mots clés
        </label>
        <input className="p-2 border-2 mb-5 w-full flex-shrink-0" placeholder="Mots clés" name="description" defaultValue={item.keywords} />
        {item.type === "section" && (
          <>
            <label className="font-bold" htmlFor="imageSrc">
              Image (option)
            </label>
            <input
              className={`p-2 border-2 mb-2 w-full flex-shrink-0 ${!itemImageSrc ? "mb-5" : ""}`}
              accept="image/jpeg,image/png"
              name="imageSrc"
              type="file"
              onChange={onUploadImage}
              placeholder="Choisissez un fichier"
            />
            {!!itemImageSrc && (
              <div className="relative h-40 w-full mb-5 bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden show-button-on-hover rounded-t-lg ">
                <img alt={item.title} className="relative h-40 w-full bg-gray-300 flex-shrink-0 object-contain" src={item.imageSrc} />
                <div className="w-full h-full absolute flex items-center justify-center button-container bg-gray-800 bg-opacity-80 transition-opacity">
                  <button className="absolute m-auto bg-white mt-2 mb-5 !border-2 border-red-500  text-red-500" onClick={onDeleteImage}>
                    Supprimer
                  </button>
                </div>
              </div>
            )}
            <label className="font-bold" htmlFor="imageSrc">
              Icon (option - sera remplacée par l'image si elle existe)
            </label>
            {!!itemIcon && <RedIcon icon={itemIcon} showText={false} />}
            <button type="button" className="bg-white mt-2 mb-5 !border-2 border-snu-purple-300  !text-snu-purple-300" onClick={onChooseIcon}>
              Choisir
            </button>
            <IconsPicker isOpen={showIconChooser} onRequestClose={() => setShowIconChooser(false)} onSelect={onSelectIcon} />
          </>
        )}
        <fieldset className="mb-5">
          <legend className="">Visible par:</legend>
          <span className="mb-2 text-xs italic text-gray-500 leading-none block">Note: seul les rôles autorisés par l'entité parent sont disponibles</span>
          <div className="flex flex-col ml-4">
            {Object.keys(SUPPORT_ROLES).map((role) => {
              const disabled = !!parent && !parent?.allowedRoles.includes(role);
              return (
                <div className="flex items-center" key={role}>
                  <input
                    className="mr-4"
                    id={`allowedRoles.${role}`}
                    disabled={disabled}
                    type="checkbox"
                    name={`allowedRoles.${role}`}
                    defaultChecked={item.allowedRoles?.includes(role)}
                  />
                  <label className={`mr-2 ${disabled ? "text-gray-300 italic" : ""}`} id={role} disabled={disabled} htmlFor={`allowedRoles.${role}`}>
                    {SUPPORT_ROLES[role]}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        <div className="flex justify-start items-center">
          <label htmlFor="status">Visibilité: </label>
          <select className="border-2 ml-5 p-2" name="status" defaultValue={item.status}>
            <option value="PUBLISHED">Publié</option>
            <option value="DRAFT">Brouillon</option>
          </select>
        </div>
        <div className="flex flex-wrap justify-around items-center mt-8 mb-2 w-full">
          <button type="submit" className="mb-2">
            Enregistrer
          </button>
          <button className="bg-white mb-2 !border-2 border-red-500  text-red-500" onClick={onDelete}>
            Supprimer
          </button>
        </div>
      </form>
    </aside>
  );
};

const makeTitleSlug = (title) =>
  slugify(title, {
    replacement: "-",
    remove: /[*+~.()'"!?:@]/g,
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "fr", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

export default AdminKBItemMetadata;
