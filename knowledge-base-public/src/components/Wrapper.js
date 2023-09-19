import { useContext } from "react";
import useUser from "../hooks/useUser";
import { AiOutlineInfoCircle } from "react-icons/ai";
import SeeAsContext from "../contexts/seeAs";
import { translateRoleBDC } from "../utils/constants";
import Header from "./Header";
import Footer from "./Footer";

const Wrapper = ({ home, children }) => {
  const { user } = useUser();
  const { setSeeAs, seeAs } = useContext(SeeAsContext);
  const withSeeAs = ["admin", "referent_department", "referent_region"].includes(user?.role);
  const withSeeAsPublicAndYoung = ["public", "young"].includes(seeAs);

  return (
    <>
      <Header home={home} withSeeAs={withSeeAsPublicAndYoung} />
      {!!seeAs && withSeeAs && user?.role !== seeAs && (
        <div className="bg-blue-50 flex items-center justify-center gap-4 p-4 w-full">
          <AiOutlineInfoCircle className="text-blue-500 text-xl flex-none" />
          <p className="text-sm text-blue-800">
            Vous visualisez la base de connaissance en tant que {translateRoleBDC[seeAs]}.{" "}
            <button onClick={() => setSeeAs("admin")} className="noprint text-sm text-blue-800 underline reset">
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
