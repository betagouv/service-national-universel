import React from "react";

const YoungLine = ({ youngs, checkedYoungs, setCheckedYoungs }) => {
  if (!youngs) return <></>;

  if (!youngs || !youngs.length)
    return (
      <div className="flex justify-center items-center h-[80%] mt-[10%]">
        <span className="text-center mx-5">Aucun volontaire</span>
      </div>
    );

  return youngs.map((young) => {
    return (
      <div className="flex w-full gap-3 items-center border-b mb-2 px-1 py-2 bg-white" key={`youngFilter-${young._id}`}>
        {checkedYoungs ? (
          <input
            id={young._id}
            className="accent-snu-purple-800"
            type="checkbox"
            checked={(checkedYoungs || []).some((checkedYoung) => checkedYoung._id === young._id)}
            onChange={() => {
              const found = (checkedYoungs || []).find((checkedYoung) => checkedYoung._id === young._id);
              console.log("✍️  found:", found);
              if (!found) setCheckedYoungs((prev) => [...prev, young]);
              else setCheckedYoungs((prev) => prev.filter((checkedYoung) => checkedYoung._id !== young._id));
            }}
          />
        ) : (
          <></>
        )}
        <label htmlFor={young._id} className="my-0">
          {young.firstName} {young.lastName}
        </label>
      </div>
    );
  });
};

export default YoungLine;
