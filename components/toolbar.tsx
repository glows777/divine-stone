'use client'

import React, { ElementRef, useRef, useState } from 'react'
import { ImageIcon, Smile, X } from 'lucide-react'
import { useMutation } from 'convex/react'
import TextareaAutosize from 'react-textarea-autosize'

import { Doc } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'

import IconPicker from './icon-picker'

interface ToolbarProps {
  initialData: Doc<'documents'>
  preview?: boolean
}

const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const update = useMutation(api.document.update)
  const removeIcon = useMutation(api.document.removeIcon)

  const inputRef = useRef<ElementRef<'textarea'>>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialData.title)

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    })
  }
  const onRemoveIcon = () => {
    removeIcon({
      id: initialData._id,
    })
  }

  const enableInput = () => {
    if (preview) return
    setIsEditing(true)
    setTimeout(() => {
      setTitle(initialData.title)
      inputRef.current?.focus()
    }, 0)
  }
  const disableInput = () => setIsEditing(false)
  const onKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      disableInput()
    }
  }

  const onChange = (title: string) => {
    setTitle(title)
    update({
      id: initialData._id,
      title,
    })
  }

  return (
    // * 4种 策略
    // * 有 icon，是 owner，可以更改
    // * 有 icon，不是 owner，不可以更改
    // * 没有 icon，是 owner，可更改
    // ** 没有 icon，不是 owner，
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            size="icon"
            variant="outline"
            className=" rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
          >
            <X className=" h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              onClick={() => {}}
              size="sm"
              variant="outline"
              className=" text-muted-foreground text-xs"
            >
              <Smile className=" h-4 w-4 mr-2" />
              Add icon
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={() => {}}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add cover
          </Button>
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeydown}
          onBlur={disableInput}
          value={title}
          className=" text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
        />
      ) : (
        <div
          onClick={enableInput}
          className=" pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}
    </div>
  )
}

export default Toolbar
