import { useEffect, useState } from "react";

const useRandomId = () => {
  const [id, setId] = useState();

  const generateRandomId = () => `${Math.floor(Math.random() * 100000)}-${Date.now()}`;

  useEffect(() => {
    setId(generateRandomId());
  }, []);

  return id;
};

export default useRandomId;
