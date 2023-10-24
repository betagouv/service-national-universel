import React from 'react'

type OwnProps = {
  title: string
  titleComponent?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode[]
}

export default function Subeader({ title, titleComponent, children, actions }: OwnProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>

        {/* Title */}
        <div>
          <h1 className="text-gray-900 text-sm leading-[normal]">{title}</h1>
          {titleComponent}
        </div>

        {/* Children */}
        {children && <div>{children}</div>}
      </div>

      {/* Actions */}
      {actions && <div className="ml-6">{actions}</div>}
    </div>
  )
}
