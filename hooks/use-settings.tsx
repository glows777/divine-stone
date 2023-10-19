'use client'

import { create } from 'zustand'

interface UseSettingsInterface {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useSettings = create<UseSettingsInterface>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}))
