import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import ReactLoaderSpinner from "react-loader-spinner";

const Loader = ({ color = "#342484", size = 100, className = "" }) => (
  <div className={`flex h-full w-full items-center justify-center ${className}`}>
    <ReactLoaderSpinner type="Oval" color={color} height={size} width={size} />
  </div>
);

export default Loader;
