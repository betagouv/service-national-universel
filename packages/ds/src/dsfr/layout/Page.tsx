import React from 'react'

type OwnProps = {
  children: React.ReactNode;
  className?: string;
}

export default function Page({ children, className }: OwnProps) {
  return (
    <main className={"min-h-screen " + className} style={{ backgroundColor: "var(--light-accent-beige-gris-galet-975, #F9F6F2)" }}>{children}</main>
  )
}
