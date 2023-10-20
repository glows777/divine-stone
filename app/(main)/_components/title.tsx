'use client'

import React, { useRef, useState } from 'react'

import { Doc } from '@/convex/_generated/dataModel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface TitleProps {
  initialData: Doc<'documents'>
}

const Title = ({ initialData }: TitleProps) => {
  const update = useMutation(api.document.update)

  const [title, setTitle] = useState(initialData.title || 'Untitled')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const enableInput = () => {
    setIsEditing(true)
    setTitle(initialData.title)

    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length)
    })
  }
  const disableInput = () => {
    setIsEditing(false)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    update({ id: initialData._id, title: e.target.value || 'Untitled' })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      disableInput()
    }
  }

  return (
    <>
      <div className="flex items-center gap-x-1">
        {!!initialData.icon && <p>{initialData.icon}</p>}
        {isEditing ? (
          <Input
            ref={inputRef}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={title}
            onClick={enableInput}
            onBlur={disableInput}
            className=" h-7 px-2 focus-visible:ring-transparent"
          />
        ) : (
          <Button
            onClick={enableInput}
            variant="ghost"
            size="sm"
            className=" font-normal h-auto p-1"
          >
            {' '}
            <span className="truncate">{initialData?.title}</span>
          </Button>
        )}
      </div>
    </>
  )
}

Title.Skeleton = function TitleSkeleton() {
  return (
    <Skeleton className="h-6 w-20 rounded-md" />
  )
}

export default Title
