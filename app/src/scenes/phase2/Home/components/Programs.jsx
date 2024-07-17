import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { fetchPrograms } from "../../repo";

// TODO: put in cellar instead of asset folder: dynamic content should not be in the bundle
const imagePath = "../../../../assets/programmes-engagement";
const images = import.meta.globEager("../../../../assets/programmes-engagement/*");
const getProgramImage = (program) => {
  return program.imageFile ? program.imageFile : images[`${imagePath}/${program.imageString}`]?.default;
};

export function Programs() {
  const [open, setOpen] = useState(false);
  const { isPending, error, data } = useQuery({ queryKey: ["programs"], queryFn: fetchPrograms });

  if (isPending) return <Loader />;
  if (error) return <div>Erreur lors du chargement des données.</div>;

  const programs = open ? data : data.slice(0, 6);

  return (
    <>
      <div className="mt-12 md:mt-20 mx-auto gap-x-4 md:gap-x-24 md:gap-y-20 grid grid-cols-2 md:grid-cols-3 w-fit">
        {programs.map((program) => {
          const image = getProgramImage(program);
          return (
            <div key={program.url} className="h-56 last:h-28 md:h-auto w-40 md:w-44 even:top-28 md:even:top-0 relative">
              <a href={program.url} rel="noreferrer" target="_blank" className="hover:text-gray-800 ">
                <div className="aspect-square w-28 md:w-44 rounded-full mx-auto overflow-hidden">
                  <img src={image} alt={program.name} className="h-full w-full object-cover" />
                </div>
                <p className="text-center font-bold mt-2 md:pt-[1rem] text-sm md:text-base line-clamp-3">{program.name}</p>
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-20 md:mt-12 text-center">
        <button onClick={() => setOpen(!open)} className="text-gray-600 text-sm underline underline-offset-2">
          {open ? "Afficher moins" : "Afficher tout"}
        </button>
      </div>
    </>
  );
}
