import React from "react";
import Loader from "./Loader";

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader />
    </div>
  );
}
