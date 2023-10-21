'use client'

import Toolbar from '@/components/toolbar'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'

interface DocumentIdPageProps {
  params: {
    documentId: Id<'documents'>
  }
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const document = useQuery(api.document.getById, {
    documentId: params.documentId,
  })

  if (document === undefined) {
    return <p>loading...</p>
  }
  if (document === null) {
    return null
  }

  return (
    <div>
      <div className=" h-[30vh]" />
      <div className=" md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
      </div>
    </div>
  )
}

export default DocumentIdPage
