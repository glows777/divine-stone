'use client'

import { useState, useEffect } from 'react'
import { File } from 'lucide-react'
import { useQuery } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { useRouter } from 'next/navigation'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { useSearch } from '@/hooks'
import { api } from '@/convex/_generated/api'

const SearchCommand = () => {
  const { user } = useUser()
  const router = useRouter()
  const documents = useQuery(api.document.getSearch)
  const [isMounted, setIsMounted] = useState(false)

  const toggle = useSearch((store) => store.toggle)
  const onClose = useSearch((store) => store.onClose)
  const isOpen = useSearch((store) => store.isOpen)

  // * 这里 用了 useState 去做 管理，当isMounted 为 true 时，才会渲染，避免了 被渲染在 服务端
  // * 即使 我们使用了 use client 去标识 但是如果 在这个过程中调用了 一些 浏览器的 api，还是会出现错误，因为在 server 端中，没有这些 api
  //   * 为了解决这个 错误，我们 使用 useEffect 去做检测， useEffect 会在 client 的时候才会执行，此时使用浏览器的 api
  // * 我们使用 的 command 组件中 会出现 hydration-error 的情况
  // * During React hydration, useEffect is called. This means browser APIs like window are available to use without hydration mismatches.
  // * https://nextjs.org/docs/messages/react-hydration-error
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggle])

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`)
    onClose()
  }

  if (!isMounted) {
    return null
  }
  return (
    <>
      <CommandDialog open={isOpen} onOpenChange={onClose}>
        <CommandInput
          placeholder={`Search ${user?.fullName}'s Divine Stone...`}
        />
        <CommandList>
          <CommandEmpty>Not results found.</CommandEmpty>
          <CommandGroup heading="Documents">
            {documents?.map((document) => (
              <CommandItem
                key={document._id}
                value={`${document._id}-${document.title}`}
                title={document.title}
                onSelect={onSelect}
              >
                {document.icon ? (
                  <p className=" mr-2 text-[18px]">{document.icon}</p>
                ) : (
                  <File className=" mr-2 w-4 h-4" />
                )}
                <span>{document.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default SearchCommand
