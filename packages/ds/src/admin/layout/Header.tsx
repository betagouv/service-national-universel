import React from 'react'
import { HiChevronRight } from "react-icons/hi";

type OwnProps = {
  breadcrumb?: Array<{
    title: string | React.ReactNode
    href: string
  }>
  title: string
  titleComponent?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode[]
}

export default function Header({ breadcrumb, title, titleComponent, children, actions }: OwnProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>

        {/* Breadcrumb */}
        {breadcrumb && <div className="flex items-center justify-start mb-2">
          {breadcrumb?.length && breadcrumb.map((item, index) => <>
            <div key={item.title + String(index)} className="flex text-xs leading-[20px]">
              {item.href ? <a href={item.href} className="text-gray-500 leading-[20px]">{item.title}</a> : <div className="text-gray-500 leading-[20px]">{item.title}</div>}
            </div>
            {index < breadcrumb.length - 1 ? <div className="mx-2 text-gray-500">
              <HiChevronRight size={20} />
            </div> : null}
          </>)}
        </div>}

        {/* Title */}
        <div className="flex items-start justify-center">
          <h1 className="text-gray-900 text-3xl font-bold leading-9">{title}</h1>
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
