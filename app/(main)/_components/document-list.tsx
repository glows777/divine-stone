'use client'

import { useQuery } from 'convex/react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'

import Item from './item'
import { cn } from '@/lib/utils'
import { FileIcon } from 'lucide-react'

interface DocumentListProps {
  parentDocumentId?: Id<'documents'>
  level?: number
  data?: Doc<'documents'>[]
}

const DocumentList = ({ parentDocumentId, level = 0 }: DocumentListProps) => {
  const params = useParams()
  const router = useRouter()
  const documents = useQuery(api.document.getSidebar, {
    parentDocument: parentDocumentId,
  })

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }))
  }

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`)
  }

  // * 在 convex 中，当正在查询的时候，返回的结果则是 undefined
  // * 如果 成功 或者 失败，结果有 才 可以是 null
  // * 所以 这里 用 documents === undefined 来判断是否在查询，查询则 显示 loading
  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    )
  }

  return (
    <>
      <p
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
        className={cn(
          ' hidden text-sm font-medium text-muted-foreground/80',
          expanded && ' last:block',
          level === 0 && ' hidden'
        )}
      >
        No pages inside
      </p>
      {documents.map((document) => (
        <div key={document._id}>
          <Item
            id={document._id}
            icon={FileIcon}
            label={document.title}
            active={document._id === params.documentId}
            level={level}
            expanded={expanded[document._id]}
            documentIcon={document.icon}
            onClick={() => onRedirect(document._id)}
            onExpand={() => onExpand(document._id)}
          />
          {expanded[document._id] && (
            <DocumentList parentDocumentId={document._id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  )
}

export default DocumentList
