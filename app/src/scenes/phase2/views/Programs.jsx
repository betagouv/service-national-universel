import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "@/components/Loader";
import api from "../../../services/api";

export default function Programs() {
  // const imagePath = "../../../assets/programmes-engagement";
  // const images = import.meta.globEager("../../../assets/programmes-engagement/*");
  // const getProgramImage = (program) => {
  //   return program.imageFile ? program.imageFile : images[`${imagePath}/${program.imageString}`]?.default;
  // };

  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgram = async () => {
    try {
      const response = await api.get(`/program/${id}`);
      if (response.ok) {
        setProgram(response.data);
      } else {
        console.error("Failed to fetch program data");
      }
    } catch (error) {
      console.error("Error fetching program data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!program) {
    return <div>Program not found</div>;
  }

  // const image = getProgramImage(program);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full">
        {/* <img src={image} alt={program.name} className="w-full h-[250px] object-cover" /> */}
      </div>
      <div className="mx-6 flex flex-col items-center justify-center w-full max-w-lg mt-6">
        <section>
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md py-2.5 text-center block mb-4">
            Candidater sur le site web
          </a>
          <div>
            <h1 className="text-2xl font-bold mb-2">Tout savoir sur ce programme</h1>
            <p className="mb-4">{program.description}</p>
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-2">C'est pour ?</h1>
            <p className="mb-4">{program.descriptionFor}</p>
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-2">Est-ce indemnisé ?</h1>
            <p className="mb-4">{program.descriptionMoney}</p>
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-2">Quelle durée d'engagement ?</h1>
            <p className="mb-4">{program.descriptionDuration}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
