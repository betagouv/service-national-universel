import React from "react";
import LineChart from "../graphs/LineChart";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import * as XLSX from "xlsx";
import FileSaver from "file-saver";

export default function TotalInscription({ totalInscriptions, goal }) {
  const dataInscription = totalInscriptions?.reduce((acc, curr) => {
    if (!acc.length) {
      acc.push(curr.doc_count);
    } else {
      acc.push(acc[acc.length - 1] + curr.doc_count);
    }
    return acc;
  }, []);

  // Create a goal array with the same length as the data array
  const dataGoal = dataInscription.reduce((acc, curr, index) => {
    const totalSegments = dataInscription.length - 1;
    const segmentSize = goal / totalSegments;
    if (!acc.length) {
      acc.push(0);
    } else {
      const segmentValue = segmentSize * index;
      acc.push(segmentValue);
    }
    return acc;
  }, []);
  // Add the final goal value to ensure it reaches the goal exactly
  dataGoal.push(goal);

  const labels = totalInscriptions.map((item) => item.key_as_string);
  const tooltips = totalInscriptions.map((item, index) => {
    return {
      value: dataInscription[index],
      date: item.key_as_string,
    };
  });

  const exportData = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    var worksheet = XLSX.utils.aoa_to_sheet([
      ["Objectifs", goal],
      [
        "Mois",
        ...totalInscriptions.map((item) => {
          const date = new Date(item.key);
          const dateformatOptions = { year: "numeric", month: "long" };
          const dateFormated = new Intl.DateTimeFormat("fr-FR", dateformatOptions).format(date);
          return dateFormated.charAt(0).toUpperCase() + dateFormated.slice(1);
        }),
      ],
      ["Inscrits", ...totalInscriptions.map((item) => item.doc_count)],
      ["Cumulés", ...dataInscription],
    ]);
    const wb = { Sheets: { ["Données"]: worksheet }, SheetNames: ["Données"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const data = new Blob([excelBuffer], { type: fileType });
    const now = new Date();
    const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
    const exportTime = `${now.getHours()}${now.getMinutes()}`;
    FileSaver.saveAs(data, `${exportDate}_${exportTime}_Courbes_des_inscriptions.xlsx`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] w-full">
      <div className="flex justify-between">
        <h1 className="text-base font-bold text-gray-900">Courbe des inscriptions</h1>
        <p className="text-base text-gray-900 text-right ">
          Objectif : <p className="inline font-bold">{goal}</p>
        </p>
      </div>
      <div className="flex justify-between">
        <p className="text-xs text-gray-400 mb-2">(chiffres en temps réel)</p>
        <ButtonSecondary onClick={exportData}>Exporter les chiffres</ButtonSecondary>
      </div>
      <LineChart dataSet1={dataInscription} dataSet2={dataGoal} labels={labels} tooltips={tooltips} />
    </div>
  );
}
