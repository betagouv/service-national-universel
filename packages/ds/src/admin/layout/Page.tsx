import React from "react";

type OwnProps = {
  children: React.ReactNode;
<<<<<<< HEAD
  className?: string;
};

export default function Page({ children, className }: OwnProps) {
  return <div className={"p-8 " + className}>{children}</div>;
=======
};

export default function Page({ children }: OwnProps) {
  return <div className="p-8">{children}</div>;
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
}
