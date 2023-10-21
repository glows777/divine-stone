'use client'

import Image from 'next/image'
import { useUser } from '@clerk/clerk-react'
import { PlusCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

const DocumentsPage = () => {
  const { user } = useUser()
  const router = useRouter()
  const create = useMutation(api.document.create)

  const handelCreate = () => {
    const promise = create({
      title: 'Untitled',
    }).then((documentId) => router.push(`/documents/${documentId}`))

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    })
  }

  return (
    <div className=" h-full flex  flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        width="300"
        height="300"
        alt="empty"
        className=" dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        width="300"
        height="300"
        alt="empty"
        className=" hidden dark:block"
      />
      <h2 className=" text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Divine Stone
      </h2>
      <Button onClick={handelCreate}>
        <PlusCircle className=" h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  )
}

export default DocumentsPage
