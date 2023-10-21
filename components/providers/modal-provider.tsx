'use client'

import { useState, useEffect } from 'react'

import SettingModal from '@/components/modals/settings-modal'
import CoverImageModal from '../modals/cover-image-modal'

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }
  return (
    <>
      <SettingModal />
      <CoverImageModal />
    </>
  )
}

export default ModalProvider
