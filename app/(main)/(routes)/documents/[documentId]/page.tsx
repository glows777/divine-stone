'use client'

import Cover from '@/components/cover'
import Toolbar from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
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
    return (
      <div>
      <Cover.Skeleton />
      <div className=" placeholder:md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
        <div className=" space-y-4 pl-8 pt-4">
          <Skeleton className=" h-14 w-[50%]" />
          <Skeleton className=" h-4 w-[80%]" />
          <Skeleton className=" h-4 w-[40%]" />
          <Skeleton className=" h-4 w-[60%]" />
        </div>
      </div>
    </div>
    )
  }
  if (document === null) {
    return null
  }

  return (
    <div>
      <Cover url={document.coverImage} />
      <div className=" md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
      </div>
    </div>
  )
}

export default DocumentIdPage
