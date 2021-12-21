import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import ReactLoaderSpinner from "react-loader-spinner";

const Loader = ({ color = "#342484", size = 100, className }) => (
  <div className={`w-full h-full flex justify-center items-center ${className}`}>
    <ReactLoaderSpinner type="Oval" color={color} height={size} width={size} />
  </div>
);

export default Loader;
