import Loader from "./Loader";

export const Button = ({ loading, children, className, onClick, disabled, type = "button" }) => {
  return (
    <button className={`relative ${loading ? "loading" : ""} ${className}`} onClick={onClick} type={type} disabled={loading || disabled}>
      {children}
      {!!loading && <Loader color="#bbbbbb" size={20} className="absolute inset-0" />}
    </button>
  );
};

export const CancelButton = ({ loading, onClick, type, children, disabled, className = "" }) => (
  <Button className={`bg-white !border-2 border-red-500  text-red-500 ${className}`} disabled={disabled} onClick={onClick} type={type} loading={loading}>
    {children}
  </Button>
);
