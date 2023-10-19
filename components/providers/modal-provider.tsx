'use client'

import { useState, useEffect } from 'react'

import SettingModal from '@/components/modals/settings-modal'

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
    </>
  )
}

export default ModalProvider
