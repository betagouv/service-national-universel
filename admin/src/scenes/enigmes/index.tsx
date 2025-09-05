import React from "react";
import { Redirect, useParams } from "react-router-dom";
import { JSON_stringify } from "snu-lib";
import { toastr } from "react-redux-toastr";

export default function Puzzle() {
  const { id } = useParams<{ id: string }>();
  const d = p?.find((p) => p.id === id);
  if (d) {
    if (d.customScript) eval(d.customScript);
    if (!d.isLast) {
      toastr.success("C'est partie pour une nouvelle enigme !", "🚀");
      return <Redirect to={d.redirectTo} />;
    }
    return (
      <div className="flex w-full h-full items-center justify-center flex-col px-8 pb-8">
        <h1 className="text-4xl mb-5">Congratz 🎉</h1>

        <img
          className="mx-auto"
          src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmhnOGppYzRmNzdvMnhtazMyenVjemZ2NWtydTZhNm5hZW5zZmtmMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DfbpTbQ9TvSX6/giphy.gif"
          alt=""
        />
        <div className="text-center text-lg mt-3">C'est finito !</div>
      </div>
    );
  }
  return (
    <div className="flex w-full h-full items-center justify-center flex-col px-8 pb-8">
      <h1 className="text-4xl mb-5">Mauvais code</h1>

      <img className="mx-auto" src="https://media.giphy.com/media/KKOMG9EB7VqBq/giphy.gif" alt="" />
      <div className="text-center text-lg mt-3">
        "
        <b>
          <i>{id}</i>
        </b>
        " ? 🤔 Inconnu au bataillon.
        <br />
        Please try again !
      </div>
    </div>
  );
}

// @ts-ignore
const p = JSON_stringify(window._p);
