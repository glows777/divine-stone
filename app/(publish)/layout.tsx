import React from 'react'

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=" h-full dark:bg-[#1F1F1F]">
      <main className=" h-full overflow-y-auto">{children}</main>
    </div>
  )
}

export default PublicLayout
