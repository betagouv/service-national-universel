import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { apiURL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

async function fetchPrograms() {
  const res = await fetch(`${apiURL}/program/public/engagements`);
  const { ok, data } = await res.json();
  if (!ok) throw new Error("Une erreur s'est produite lors du chargement des programmes.");
  return data;
}

export function Programs() {
  // TODO: put in cellar instead of asset folder
  const images = import.meta.globEager("../../../../assets/programmes-engagement/*");

  const [open, setOpen] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
    refetchOnWindowFocus: false,
  });

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    toastr.error("Une erreur s'est produite lors du chargement des programmes.");
    return null;
  }

  const dataToDisplay = open ? data : data.slice(0, 6);

  return (
    <section className="mt-24 px-4 md:px-24">
      <p className="w-fit mx-auto text-xs font-medium text-blue-600 bg-blue-100 px-1 rounded">EXPLOREZ D'AUTRES POSSIBILITES</p>

      <h2 className="text-center font-bold text-4xl m-0 mt-2">Trouvez un engagement par vous-même</h2>

      <div className="mt-12 border rounded-xl p-3 max-w-4xl mx-auto">
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

      <div className="mt-12 mx-auto w-96 grid grid-cols-2 gap-x-4 lg:hidden">
        <div className="">
          {dataToDisplay.slice(0, dataToDisplay.length / 2).map((program) => {
            const image = program.imageFile ? program.imageFile : images[`../../../../assets/programmes-engagement/${program.imageString}`]?.default;
            return (
              <div key={program.url} className="hover:text-gray-800 h-64 p-1">
                <a href={program.url} rel="noreferrer" target="_blank">
                  <div className="aspect-square rounded-full mx-auto overflow-hidden">
                    <img src={image} alt={program.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="text-center font-bold mt-2 text-sm">{program.name}</p>
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-32">
          {dataToDisplay.slice(dataToDisplay.length / 2, dataToDisplay.length).map((program) => {
            const image = program.imageFile ? program.imageFile : images[`../../../../assets/programmes-engagement/${program.imageString}`]?.default;
            return (
              <div key={program.url} className="hover:text-gray-800 h-64 p-1">
                <a href={program.url} rel="noreferrer" target="_blank">
                  <div className="aspect-square rounded-full mx-auto overflow-hidden">
                    <img src={image} alt={program.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="text-center font-bold mt-2 text-sm">{program.name}</p>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-24 max-w-4xl mx-auto hidden lg:grid grid-cols-3 gap-y-16">
        {dataToDisplay.map((program) => {
          const image = program.imageFile ? program.imageFile : images[`../../../../assets/programmes-engagement/${program.imageString}`]?.default;
          return (
            <a key={program.url} href={program.url} rel="noreferrer" target="_blank" className="hover:text-gray-800">
              <div className="aspect-square rounded-full mx-auto overflow-hidden w-56">
                <img src={image} alt={program.name} className="h-full w-full object-cover" />
              </div>
              <p className="text-center text-sm font-bold mt-4">{program.name}</p>
            </a>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <button onClick={() => setOpen(!open)} className="text-gray-600 text-sm underline underline-offset-2">
          {open ? "Afficher moins" : "Afficher tout"}
        </button>
      </div>
    </section>
  );
}
