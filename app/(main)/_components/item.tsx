'use client'

import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  PlusCircle,
  Trash,
} from 'lucide-react'
import { useMutation } from 'convex/react'
import React from 'react'
import { toast } from 'sonner'
import { useUser } from '@clerk/clerk-react'

import { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface ItemProps {
  label: string
  onClick: () => void
  icon: LucideIcon
  id?: Id<'documents'>
  documentIcon?: string
  active?: boolean
  expanded?: boolean
  level?: number
  isSearch?: boolean
  onExpand?: () => void
}

const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  documentIcon,
  active,
  expanded,
  isSearch,
  onExpand,
  level = 0,
}: ItemProps) => {
  const create = useMutation(api.document.create)
  const archive = useMutation(api.document.archive)
  const router = useRouter()
  const { user } = useUser()

  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    onExpand?.()
  }

  const onArchive = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    if (!id) return

    const promise = archive({ id })

    toast.promise(promise, {
      loading: 'Moving to trash...',
      success: 'Note moved to trash!',
      error: 'Failed to archive note.',
    })
  }
  const onCreate = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    if (!id) return

    const promise = create({
      title: 'Untitled',
      parentDocument: id,
    }).then((documentId) => {
      if (!expanded) {
        onExpand?.()
      }
      router.push(`/document/${documentId}`)
    })

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    })
  }
  return (
    <div
      onClick={onClick}
      role="button"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : '12px' }}
      className={cn(
        ' group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium',
        active && ' bg-primary/5 text-primary'
      )}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-neutral-300 dark:bg-neural-600 mr-1"
          onClick={handleExpand}
        >
          <ChevronIcon className=" h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      )}
      {documentIcon ? (
        <div className=" shrink-0 mr-2 text-[18px]">{documentIcon}</div>
      ) : (
        <Icon className=" shrink-0 h-[18px] mr-2 text-muted-foreground" />
      )}
      <span className=" truncate">{label}</span>
      {isSearch && (
        <div
          className=" ml-auto pointer-events-none inline-flex h-5 select-none
            items-center gap-1 rounded border bg-muted px-1.5
             font-mono text-[10px] font-medium text-muted-foreground opacity-100
        "
        >
          <span className=" text-xs">⌘</span>K
        </div>
      )}
      {!!id && (
        <div className=" ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
              <div className=" opacity-0 hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                <MoreHorizontal className=" h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className=" w-60"
              align="start"
              side="right"
              forceMount
            >
              <DropdownMenuItem onClick={onArchive}>
                <div className=" flex items-start justify-center">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className=" text-xs text-muted-foreground p-2">
                Last edited by: {user?.fullName}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            className=" opacity-0 group-hover:opacity-100 h-full
          ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
            role="button"
            onClick={onCreate}
          >
            <PlusCircle className=" h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{ paddingLeft: level ? `${level * 12 + 25}px` : '12px' }}
      className=" flex gap-x-2 py-[3px]"
    >
      <Skeleton className=" h-4 w-4" />
      <Skeleton className=" h-4 w-[30%]" />
    </div>
  )
}

export default Item
