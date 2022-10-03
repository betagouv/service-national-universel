import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";

export default function StepSejour() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  let stays = {};

  function getAvailableStays() {
    // insert logic to select cohort according to birthdate & location
    return [
      {
        cohort: "Février 2023 - Zone A",
        date: "du 19 février au 3 mars",
      },
    ];
  }

  React.useEffect(() => {
    console.log(data);
  }, []);

  return (
    <>
      <div>Etape 2 sur 3</div>
      <div>Séjour de cohésion</div>
      <h1>Choisissez la date du séjour</h1>
      <h2>Séjours de cohésion disponibles</h2>
      {getAvailableStays().map((e) => StayButton(data, setData))}
    </>
  );
}

function StayButton(data, setData, stay) {
  return (
    <div
      className="border"
      onClick={() => {
        setData({ ...data, cohort: stay.cohort });
        // history.push("/preinscription/sejour");
        console.log(data);
      }}>
      <div>
        Séjour du <strong>{stay.sejour}</strong>
      </div>
    </div>
  );
}
