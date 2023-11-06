import React from 'react'

type OwnProps = {
  children: React.ReactNode;
  className?: string;
}

export default function Section({ children, className }: OwnProps) { 
  return (
    <section className={"m-auto max-w-[792px] " + className}>{children}</section>
  )
}
