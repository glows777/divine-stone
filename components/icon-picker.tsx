'use client'

import React from 'react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from 'next-themes'

import {
  PopoverContent,
  PopoverTrigger,
  Popover,
} from '@/components/ui/popover'

interface IconPickerProps {
  // eslint-disable-next-line no-unused-vars
  onChange: (icon: string) => void
  children: React.ReactNode
  asChild?: boolean
}
const themeMap = {
  light: Theme.LIGHT,
  dark: Theme.DARK,
}

const IconPicker = ({ onChange, children, asChild }: IconPickerProps) => {
  const { resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || 'light') as keyof typeof themeMap
  const theme = themeMap[currentTheme]

  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className=" p-0 w-full border-none shadow-none">
        <EmojiPicker
          height={350}
          theme={theme}
          onEmojiClick={(data) => onChange(data.emoji)}
        />
      </PopoverContent>
    </Popover>
  )
}

export default IconPicker
