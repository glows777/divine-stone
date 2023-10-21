'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog'
import { SingleImageDropzone } from '@/components/single-image-dropzone'
import { useCoverImage } from '@/hooks'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useEdgeStore } from '@/lib/edgestore'

const CoverImageModal = () => {
  const coverImage = useCoverImage()
  const params = useParams()
  const update = useMutation(api.document.update)
  const { edgestore } = useEdgeStore()

  const [file, setFile] = useState<File>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onClose = () => {
    setFile(undefined)
    setIsSubmitting(false)
    coverImage.onClose()
  }

  const onChange = async (file?: File) => {
    if (!file) {
      return
    }
    setIsSubmitting(true)
    setFile(file)

    const res = await edgestore.publicFiles.upload({
      file,
      options: {
        replaceTargetUrl: coverImage.url,
      },
    })
    await update({
      id: params.documentId as Id<'documents'>,
      coverImage: res.url,
    })
    onClose()
  }
  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className=" text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className=' w-full outline-none'
          disabled={isSubmitting}
          onChange={onChange}
          value={file}
        />
      </DialogContent>
    </Dialog>
  )
}

export default CoverImageModal
