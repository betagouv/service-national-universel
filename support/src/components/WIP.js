const WIP = ({ children }) => {
  return (
    <div className="flex h-full w-full flex-shrink flex-col items-center justify-center">
      {/* <h1 className="mb-10">{title}</h1> */}
      <p className="mb-10">👷Cette page est en cours de construction...👷‍♀️</p>
      {children}
    </div>
  );
};

export default WIP;
