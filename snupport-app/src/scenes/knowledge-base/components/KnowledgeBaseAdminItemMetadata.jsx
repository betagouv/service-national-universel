import React, { useContext, useEffect, useMemo, useState } from "react";
import { useHistory, Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import slugify from "slugify";
import { useSelector } from "react-redux";
import { HiChevronDown, HiChevronRight, HiOutlineDuplicate, HiOutlineClock, HiOutlineTrash } from "react-icons/hi";

import InputWithEmojiPicker from "./InputWithEmojiPicker";
import IconsPicker, { RedIcon } from "./IconsPicker";
import { Button, CancelButton, OutlinedButton } from "./Buttons";
import Modal from "./Modal";
import ResizablePanel from "./ResizablePanel";
import KnowledgeBaseContext from "../contexts/knowledgeBase";
import API from "../../../services/api";
import Avatar from "../../../components/Avatar";
import { buildItemTree } from "../utils/knowledgeBaseTree";
import Loader from "../../../components/Loader";
import FeedbacksEdit from "./FeedbacksEdit";
import { translateRoleBDC } from "../../../utils";

const KnowledgeBaseAdminItemMetadata = ({ visible }) => {
  const history = useHistory();
  const params = useParams();
  const organisation = useSelector((state) => state.Auth.organisation);

  const [showIconChooser, setShowIconChooser] = useState(false);
  const [references, setReferences] = useState(null);

  const { flattenedKB, knowledgeBaseTree, setFlattenedKB, refreshKB } = useContext(KnowledgeBaseContext);
  const slug = params?.slug;
  const [item, parent] = useMemo(() => {
    if (!flattenedKB?.length) return [knowledgeBaseTree, null];
    if (!slug?.length) return [knowledgeBaseTree, null];
    const itemTree = buildItemTree(slug, flattenedKB, knowledgeBaseTree);
    if (!itemTree) {
      history.push("/knowledge-base");
      return [knowledgeBaseTree, null];
    }
    return [itemTree, flattenedKB?.find((i) => i._id === itemTree?.parentId)];
  }, [slug, flattenedKB]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
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
    const response = await API.patch({ path: `/knowledge-base/${item._id}`, body });
    setIsSubmitting(false);
    if (response.code) return toast.error(response.code);
    if (itemSlug !== item.slug) {
      setFlattenedKB([...flattenedKB, response.data]);
      history.replace(`/knowledge-base/${response.data.slug}`);
    }
    refreshKB();
    toast.success("Élément enregistré !");
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const onDelete = async (event) => {
    event.preventDefault();
    setIsDeleting(true);
    if (window.confirm("Voulez-vous vraiment supprimer cet élément ? Cette opération est définitive")) {
      const response = await API.delete({ path: `/knowledge-base/${item._id}` });
      setIsDeleting(false);
      if (response.code === "ARTICLES_REFERING_TO_ITEMS") {
        setReferences(response.data);
        return;
      }
      if (response.error) return toast.error(response.error);
      if (response.code) return toast.error(response.code);
      toast.success("Élément supprimé !");
      const parent = flattenedKB.find((otherItems) => otherItems._id === item.parentId);
      refreshKB();
      history.replace(`/knowledge-base/${parent?.slug || ""}`);
    }
    setIsDeleting(false);
  };
  const onDuplicate = async (event) => {
    event.preventDefault();
    const response = await API.post({ path: `/knowledge-base/duplicate/${item._id}` });
    if (response.error) return toast.error(response.error);
    if (response.code) return toast.error(response.code);
    toast.success("Élément duppliqué !");
    setFlattenedKB([...flattenedKB, response.data]);
    history.replace(`/knowledge-base/${response.data.slug}`);
    refreshKB();
  };

  const [itemImageSrc, setItemImageSrc] = useState(item.imageSrc);
  const [isSettingImg, setIsSettingImg] = useState(false);
  const onUploadImage = async (event) => {
    setIsSettingImg(true);
    const imageRes = await API.uploadFile("/knowledge-base/picture", event.target.files);
    if (imageRes.code === "FILE_CORRUPTED") {
      setIsSettingImg(false);
      return toast.error("Le fichier semble corrompu", "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support");
    }
    if (!imageRes.ok) return toast.error("Une erreur s'est produite lors du téléversement de votre fichier");
    const response = await API.patch({ path: `/knowledge-base/${item._id}`, body: { imageSrc: imageRes.data } });
    setIsSettingImg(false);
    if (response.code) return toast.error(response.code);
    refreshKB();
    setItemImageSrc(response.data.imageSrc);
    toast.success("Fichier téléversé");
  };

  const [isDeletingImg, setIsDeletingImg] = useState(false);
  const onDeleteImage = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cet image ? Cette opération est définitive")) {
      setIsDeletingImg(true);
      const response = await API.patch({ path: `/knowledge-base/${item._id}`, body: { imageSrc: null } });
      setIsDeletingImg(false);
      if (response.code) return toast.error(response.code);
      refreshKB();
    }
  };

  useEffect(() => {
    setItemSlug(item.slug);
  }, [item.slug]);

  const [itemIcon, setItemIcon] = useState(item.icon);
  const [isSettingIcon, setIsSettingIcon] = useState(false);
  const onChooseIcon = () => setShowIconChooser(true);
  const onSelectIcon = async (icon) => {
    setIsSettingIcon(true);
    const response = await API.patch({ path: `/knowledge-base/${item._id}`, body: { icon } });
    setIsSettingIcon(false);
    if (response.code) return toast.error(response.code);
    refreshKB();
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
    <>
      <ResizablePanel className={`z-10 flex shrink-0 grow-0 overflow-hidden border-l-2 ${visible ? "w-80" : "hidden w-0"}`} name="admin-knowledge-base-metadata" position="right">
        <div className="overflow-auto">
          <form onSubmit={onSubmit} className="flex h-full w-full shrink-0 grow-0 flex-col items-start px-4 pb-6 pt-6" key={item._id}>
            <p className="mb-5">
              <em>Nombre de vues: {item.read}</em>
              <br />
              {item?.updatedAt && (
                <em>
                  Dernière modification:{" "}
                  {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.updatedAt))}
                </em>
              )}
            </p>
            <label className="font-bold" htmlFor="title">
              Titre
            </label>
            <InputWithEmojiPicker
              inputClassName="p-2"
              className="mb-5 w-full border-2 bg-white"
              placeholder={`Titre ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
              name="title"
              value={title}
              onChange={onTitleChange}
            />
            <label className="font-bold" htmlFor="slug">
              Slug (Url)
            </label>
            <input
              className="mb-5 w-full border-2 p-2"
              placeholder={`Slug ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
              name="slug"
              value={itemSlug}
              onChange={onItemSlugChange}
            />
            {shouldChangeSlug() && (
              <span className=" -mt-5 mb-5 cursor-pointer text-sm italic text-gray-500" onClick={() => setItemSlug(makeTitleSlug(title))}>
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
              className="mb-5 w-full shrink-0 border-2 p-2"
              placeholder={`Description ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
              name="description"
              defaultValue={item.description}
            />
            <label className="font-bold" htmlFor="keywords">
              Mots clés
            </label>
            <input className="mb-5 w-full shrink-0 border-2 p-2" placeholder="Mots clés" name="keywords" defaultValue={item.keywords} />
            {item.type === "section" && (
              <>
                <label className="font-bold" htmlFor="imageSrc">
                  Image (option)
                </label>
                <input
                  className={`mb-2 w-full shrink-0 border-2 p-2 ${!itemImageSrc ? "mb-5" : ""}`}
                  accept="image/jpeg,image/png"
                  name="imageSrc"
                  type="file"
                  onChange={onUploadImage}
                  placeholder="Choisissez un fichier"
                  disabled={isSettingImg}
                />
                {!!itemImageSrc && (
                  <div className="show-button-on-hover relative mb-5 flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-t-lg bg-gray-300 ">
                    <img alt={item.title} className="relative h-40 w-full shrink-0 bg-gray-300 object-contain" src={item.imageSrc} />
                    <div className="button-container absolute flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-80 transition-opacity">
                      <CancelButton className="absolute m-auto" onClick={onDeleteImage} loading={isDeletingImg} disabled={isDeletingImg}>
                        Supprimer
                      </CancelButton>
                    </div>
                  </div>
                )}
                <label className="font-bold" htmlFor="imageSrc">
                  Icon (option - sera remplacée par l'image si elle existe)
                </label>
                {!!itemIcon && <RedIcon icon={itemIcon} showText={false} />}
                <OutlinedButton type="button" onClick={onChooseIcon} loading={isSettingIcon} disabled={isSettingIcon}>
                  Choisir
                </OutlinedButton>
                <IconsPicker isOpen={showIconChooser} onRequestClose={() => setShowIconChooser(false)} onSelect={onSelectIcon} />
              </>
            )}
            <fieldset className="mb-5">
              <legend className="">Visible par:</legend>
              <span className="mb-2 block text-xs italic leading-none text-gray-500">Note: seul les rôles autorisés par l'entité parent sont disponibles</span>

              <div className="ml-4 flex flex-col">
                {organisation.knowledgeBaseRoles.map((role) => {
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
                      <label className={`mr-2 ${disabled ? "italic text-gray-300" : ""}`} id={role} disabled={disabled} htmlFor={`allowedRoles.${role}`}>
                        {translateRoleBDC[role]}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex items-center justify-start">
              <label htmlFor="status">Visibilité: </label>
              <select className="ml-5 border-2 p-2" name="status" defaultValue={item.status}>
                <option value="PUBLISHED">Publié</option>
                <option value="DRAFT">Brouillon</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
            <div className="mt-8 mb-2 flex w-full flex-wrap items-center justify-around gap-2">
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting || isDeleting} className="flex-1 !px-4">
                Enregistrer
              </Button>
              <IconButton onClick={onDuplicate} loading={isDeleting} disabled={isSubmitting || isDeleting} icon={<HiOutlineDuplicate color="#5145cc" />} />
              <IconButton onClick={onDelete} loading={isDeleting} disabled={isSubmitting || isDeleting} icon={<HiOutlineTrash color="#C93D38" />} />
            </div>
            <FeedbacksEdit item={item} />
          </form>
        </div>
      </ResizablePanel>
      <Modal isOpen={!!references} onRequestClose={() => setReferences(null)}>
        <div className="flex h-full w-full flex-col items-center p-12">
          <h2 className="mb-8 text-lg font-bold">⛔️ Cet article est réferencé dans d'autres articles</h2>
          <p className="text-justify">
            Il y a une référence de cet article que vous souhaitez supprimer dans d'autres articles.
            <br /> Il faut les mettre à jour avant de pouvoir supprimer celui-ci.
            <br />{" "}
            <em>
              <small>Vous pouvez cliquer sur les articles ci-dessous, ils s'ouvriront dans une autre page.</small>
            </em>
            <br />
            <br />
            {references?.map((reference) => (
              <React.Fragment key={reference._id}>
                <Link to={`/knowledge-base/${reference.slug}`} className="leading-7 underline">
                  {reference.title}
                </Link>
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
      </Modal>
    </>
  );
};

const IconButton = ({ icon, onClick, disabled, loading }) => (
  <button
    disabled={loading || disabled}
    className="flex h-full max-h-[40px] grow items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 transition-colors hover:bg-gray-50"
    onClick={onClick}
  >
    {!!loading && <Loader color="#bbbbbb" size={20} />}
    {!loading && <span className="text-2xl text-gray-400">{icon}</span>}
  </button>
);

const makeTitleSlug = (title) =>
  slugify(title, {
    replacement: "-",
    remove: /[*+~.()'"!?:@]/g,
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "fr", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

export default KnowledgeBaseAdminItemMetadata;
