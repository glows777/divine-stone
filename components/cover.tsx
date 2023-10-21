'use client'

import Image from 'next/image'
import { ImageIcon, X } from 'lucide-react'
import { useMutation } from 'convex/react'
import { useParams } from 'next/navigation'

import { useEdgeStore } from '@/lib/edgestore'
import { cn } from '@/lib/utils'
import { useCoverImage } from '@/hooks'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'

interface CoverImageProps {
  url?: string
  preview?: boolean
}

const Cover = ({ url, preview }: CoverImageProps) => {
  const { edgestore } = useEdgeStore()
  const coverImage = useCoverImage()
  const params = useParams()
  const removeCoverImage = useMutation(api.document.removeCoverImage)

  const onRemove = async () => {
    if (url) {
      await edgestore.publicFiles.delete({ url })
    }
    await removeCoverImage({
      id: params.documentId as Id<'documents'>,
    })
  }

  return (
    <div
      className={cn(
        'relative w-full h-[35vh] group',
        !url && 'h-[12vh]',
        url && 'bg-muted'
      )}
    >
      {!!url && <Image src={url} fill className=" object-cover" alt="Cover" />}
      {!!url && !preview && (
        <div className=" opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className=" w-full h-[12vh]" />
}

export default Cover
