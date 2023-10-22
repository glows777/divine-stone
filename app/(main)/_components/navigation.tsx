'use client'

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  SearchIcon,
  SettingsIcon,
  Trash,
} from 'lucide-react'
import { useParams, usePathname, useRouter} from 'next/navigation'
import React, { ElementRef, useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { useMutation } from 'convex/react'

import { cn } from '@/lib/utils'
import { api } from '@/convex/_generated/api'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import UserItem from './user-item'
import Item from './item'
import { toast } from 'sonner'
import DocumentList from './document-list'
import TrashBox from './trash-box'
import { useSearch, useSettings } from '@/hooks'
import Navbar from './navbar'

const Navigation = () => {
  const params = useParams()
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pathname = usePathname()
  const create = useMutation(api.document.create)
  const onOpen = useSearch((store) => store.onOpen)
  const settings = useSettings()

  const isResizingRef = useRef(false)
  const sidebarRef = useRef<ElementRef<'aside'>>(null)
  const navbarRef = useRef<ElementRef<'div'>>(null)

  const [isResetting, setIsResetting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(isMobile)

  const resetWidth = useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false)
      setIsResetting(true)

      sidebarRef.current.style.width = isMobile ? '100%' : '240px'
      navbarRef.current.style.setProperty(
        'width',
        isMobile ? '0' : 'calc(100% - 240px)'
      )
      navbarRef.current.style.setProperty('left', isMobile ? '100%' : '240px')

      // * 为什么是 300
      // * 因为 下面的 动画就是 300ms
      // * 配合起来 则会在 300ms 后，移除这个 属性
      setTimeout(() => setIsResetting(false), 300)
    }
  }, [isMobile])

  useEffect(() => {
    // * 如果是大小变化为移动端大小，则关闭侧边栏
    if (isMobile) collapse()
    else resetWidth()
  }, [isMobile, resetWidth])

  useEffect(() => {
    if (isMobile) collapse()
  }, [isMobile, pathname])

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault()
    event.stopPropagation()

    isResizingRef.current = true

    document.addEventListener('mousemove', handleMousemove)
    document.addEventListener('mouseup', handleMouseup)
  }
  const handleMousemove = (e: MouseEvent) => {
    if (!isResizingRef.current) return

    let newWidth = e.clientX
    if (newWidth < 240) newWidth = 240
    if (newWidth > 480) newWidth = 480

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`
      navbarRef.current.style.setProperty('left', `${newWidth}px`)
      navbarRef.current.style.setProperty('width', `calc(100% - ${newWidth}px)`)
    }
  }
  const handleMouseup = () => {
    isResizingRef.current = false
    document.removeEventListener('mousemove', handleMousemove)
    document.removeEventListener('mouseup', handleMouseup)
  }



  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true)
      setIsResetting(true)

      sidebarRef.current.style.width = '0'
      navbarRef.current.style.setProperty('left', '0')
      navbarRef.current.style.setProperty('width', '100%')

      setTimeout(() => setIsResetting(false), 300)
    }
  }

  const handleCreate = () => {
    const promise = create({
      title: 'Untitled',
    }).then(documentId => router.push(`/documents/${documentId}`))

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    })
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          'group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]',
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'w-0'
        )}
      >
        <div
          role="button"
          onClick={collapse}
          className={cn(
            'h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition',
            isMobile && 'opacity-100'
          )}
        >
          <ChevronsLeft className=" h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item onClick={onOpen} label="search" icon={SearchIcon} isSearch />
          <Item onClick={settings.onOpen} label="setting" icon={SettingsIcon} />
          <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
        </div>
        <div className=" mt-4">
          <DocumentList />
          <Item onClick={handleCreate} icon={Plus} label="Add a page" />
          <Popover>
            <PopoverTrigger className=" mt-4 w-full">
              <Item icon={Trash} label="Trash" />
            </PopoverTrigger>
            <PopoverContent
              className=" p-0 w-72"
              side={isMobile ? 'bottom' : 'right'}
            >
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>
        <div
          className=" opacity-0 group-hover/sidebar:opacity-100
        transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          ' absolute top-0 z-[99999]  w-[calc(100%-240px)]',
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'left-0 w-full'
        )}
      >
        {params.documentId ? (
          <Navbar onResetWidth={resetWidth} isCollapsed={isCollapsed} />
        ) : (
          <nav className=" bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                role="button"
                onClick={resetWidth}
                className=" h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </div>
    </>
  )
}

export default Navigation
