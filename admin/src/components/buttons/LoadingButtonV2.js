import React from "react";
import { Spinner } from "reactstrap";

export default function LoadingButton({ loading, children, disabled, loadingText, ...rest }) {
  return (
    <button
      disabled={loading || disabled}
      className="text-center text-white font-medium rounded-md p-2 hover:bg-snu-purple-600 hover:drop-shadow w-full bg-snu-purple-300"
      {...rest}>
      {loading && loadingText && (
        <>
          <Spinner size="sm" key={loadingText} className="border-[0.1em] mr-[0.5em]" />
          {loadingText}
        </>
      )}
      {loading && !loadingText && <Spinner size="sm" className="border-[0.1em]" />}
      {!loading && children}
    </button>
  );
}
