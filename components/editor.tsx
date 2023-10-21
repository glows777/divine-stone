'use client'

import { useTheme } from 'next-themes'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { BlockNoteView, useBlockNote } from '@blocknote/react'
import '@blocknote/core/style.css'

import { useEdgeStore } from '@/lib/edgestore'

interface EditorProps {
  onChange: (content: string) => void
  initialContent?: string
  editable?: boolean
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme()
  const { edgestore } = useEdgeStore()

  const theme = resolvedTheme === 'light' ? 'light' : 'dark'
  const handleFileUpload = async (file: File) => {
    const res = await edgestore.publicFiles.upload({
      file,
    })
    return res.url
  }

  const editor: BlockNoteEditor = useBlockNote({
    editable,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2))
    },
    uploadFile: handleFileUpload,
  })

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={theme}
      />
    </div>
  )
}

export default Editor
