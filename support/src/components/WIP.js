const WIP = ({ title, children }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full flex-shrink">
      {/* <h1 className="mb-10">{title}</h1> */}
      <p className="mb-10">👷Cette page est en cours de construction...👷‍♀️</p>
      {children}
    </div>
  );
};

export default WIP;
