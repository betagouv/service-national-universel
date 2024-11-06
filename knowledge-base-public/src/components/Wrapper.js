import { useContext } from "react";
import useUser from "../hooks/useUser";
import { AiOutlineInfoCircle } from "react-icons/ai";
import SeeAsContext from "../contexts/seeAs";
import { translateRoleBDC } from "../utils/constants";
import Header from "./Header";
import Footer from "./Footer";

const Wrapper = ({ home, children }) => {
  const { user: originalUser } = useUser();
  const { setSeeAs, seeAs } = useContext(SeeAsContext);

  const getModifiedRole = (role) => {
    return role === "referent_department" || role === "referent_region" ? "referent" : role;
  };

  const user = {
    ...originalUser,
    role: getModifiedRole(originalUser.role),
  };

  const withSeeAs = [
    "admin",
    "referent",
    "head_center",
    "structure",
    "visitor",
    "dsnj",
    "administrateur_cle_coordinateur_cle",
    "administrateur_cle_referent_etablissement",
    "referent_classe",
  ].includes(user?.role);
  const withSeeAsPublicAndYoung = ["public", "young", "young_cle"].includes(seeAs);

  return (
    <>
      <Header home={home} withSeeAs={withSeeAsPublicAndYoung} />
      {!!seeAs && withSeeAs && user?.role !== seeAs && (
        <div className="bg-blue-50 flex items-center justify-center gap-4 p-4 w-full">
          <AiOutlineInfoCircle className="text-blue-500 text-xl flex-none" />
          <p className="text-sm text-blue-800">
            Vous visualisez la base de connaissance en tant que {translateRoleBDC[seeAs]}.{" "}
            <button onClick={() => setSeeAs(user?.role)} className="noprint text-sm text-blue-800 underline reset">
              Rétablir la vue par défaut.
            </button>
          </p>
        </div>
      )}
      <main className="bg-gray-100 print:bg-transparent">{children}</main>
      <Footer />
    </>
  );
};

export default Wrapper;
