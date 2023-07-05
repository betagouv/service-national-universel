import { useContext } from "react";
import useUser from "../hooks/useUser";
import SeeAsContext from "../contexts/seeAs";
import { translateRoleBDC } from "../utils/constants";
import Header from "./Header";
import Footer from "./Footer";
import { AiOutlineInfoCircle } from "react-icons/ai";

const Wrapper = ({ children }) => {
  const { user } = useUser();
  const { setSeeAs, seeAs } = useContext(SeeAsContext);
  const withSeeAs = ["admin", "referent_department", "referent_region"].includes(user?.role);

  return (
    <>
      <Header withSeeAs={withSeeAs} />
      {!!seeAs && withSeeAs && user?.role !== seeAs && (
        <div className="bg-blue-50 flex items-center justify-center gap-4 p-4 w-full">
          <AiOutlineInfoCircle className="text-blue-500 text-xl flex-none" />
          <p className="text-sm text-blue-800">Vous visualisez la base de connaissance en tant que {translateRoleBDC[seeAs]}.{" "}
            <button onClick={() => setSeeAs("admin")} className="noprint text-sm text-blue-800 underline">
              Rétablir la vue par défaut.
            </button>
          </p>
        </div>
      )}
      <main className="bg-[#F3F4F6] print:bg-transparent">{children}</main>
      <Footer />
    </>
  );
};

export default Wrapper;
