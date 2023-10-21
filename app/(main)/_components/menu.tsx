'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { MoreHorizontal, Trash } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface MenuProps {
  documentId: Id<'documents'>
}

const Menu = ({ documentId }: MenuProps) => {
  const archive = useMutation(api.document.archive)
  const router = useRouter()
  const { user } = useUser()

  const onArchive = () => {
    const promise = archive({ id: documentId })

    toast.promise(promise, {
      loading: 'Moving to trash...',
      success: 'Note moved to trash!',
      error: 'Failed to archive note.'
    })
    router.push('/documents')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='sm' variant='ghost'>
        <MoreHorizontal className=" h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onArchive}>
          <Trash className=" h-4 w-4 mr-2" /> 
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className=" text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Menu