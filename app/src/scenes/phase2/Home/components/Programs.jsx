import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  const { isPending, error, data } = useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
    refetchOnWindowFocus: false,
  });

  if (isPending) return <Loader />;

  if (error) return <div>Erreur lors du chargement des données.</div>;

  const programs = open ? data : data.slice(0, 6);

  return (
    <section className="mt-24 px-4 md:px-24">
      <p className="w-fit mx-auto text-xs font-medium text-blue-600 bg-blue-100 px-1 rounded">EXPLOREZ D'AUTRES POSSIBILITES</p>

      <h2 className="text-center font-bold text-4xl m-0 mt-2">Trouvez un engagement par vous-même</h2>

      <div className="mt-12 border rounded-xl p-3 max-w-5xl mx-auto">
        <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
          <div className="flex gap-4 items-center md:border-r border-b md:border-b-0 px-3 pb-[0.75rem] md:pb-0">
            <div className="rounded-full bg-blue-france-sun-113 flex justify-center w-6 h-6 flex-none">
              <p className="text-white text-sm">1</p>
            </div>
            <p>
              Candidatez à <strong>l'engagement de votre choix</strong> ci-dessous en toute autonomie
            </p>
          </div>
          <div className="flex gap-4 items-center px-3 pt-[0.75rem] md:p-0">
            <div className="rounded-full bg-blue-france-sun-113 flex justify-center w-6 h-6 flex-none">
              <p className="text-white text-sm">2</p>
            </div>
            <p>
              <strong>Une fois terminé</strong>,{" "}
              <Link to="/phase2/equivalence" className="underline underline-offset-2">
                ajoutez-le
              </Link>{" "}
              à vos engagements réalisés.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 mx-auto w-80 md:w-auto max-w-4xl gap-4 md:gap-x-24 md:gap-y-12 grid grid-cols-2 md:grid-cols-3">
        {programs.map((program) => {
          const image = getProgramImage(program);
          return (
            <div key={program.url} className="h-56 md:h-auto even:top-28 md:even:top-0 relative">
              <a href={program.url} rel="noreferrer" target="_blank" className="hover:text-gray-800 ">
                <div className="aspect-square rounded-full mx-auto overflow-hidden">
                  <img src={image} alt={program.name} className="h-full w-full object-cover" />
                </div>
                <p className="text-center font-bold mt-2 text-sm line-clamp-3">{program.name}</p>
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-36 text-center">
        <button onClick={() => setOpen(!open)} className="text-gray-600 text-sm underline underline-offset-2">
          {open ? "Afficher moins" : "Afficher tout"}
        </button>
      </div>
    </section>
  );
}
