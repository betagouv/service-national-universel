import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import ReactLoaderSpinner from "react-loader-spinner";

const Loader = () => (
  <div className="w-full h-full flex justify-center items-center">
    <ReactLoaderSpinner type="Oval" color="#342484" height={100} width={100} />
  </div>
);

export default Loader;
