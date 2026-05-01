import { create } from 'zustand'

export type ModalKey = 'buchung' | 'notes' | 'export' | 'teilen' | 'druck' | null

interface ShellStore {
  openModal: ModalKey
  pillOpen:  boolean
  cmdOpen:   boolean
  notifOpen: boolean
  userOpen:  boolean
  ringOpen:  boolean
  setOpenModal: (key: ModalKey) => void
  setPillOpen:  (v: boolean) => void
  setCmdOpen:   (v: boolean) => void
  setNotifOpen: (v: boolean) => void
  setUserOpen:  (v: boolean) => void
  setRingOpen:  (v: boolean) => void
  closeAll: () => void
}

export const useShellStore = create<ShellStore>((set) => ({
  openModal: null,
  pillOpen:  false,
  cmdOpen:   false,
  notifOpen: false,
  userOpen:  false,
  ringOpen:  false,
  setOpenModal: (openModal) => set({ openModal }),
  setPillOpen:  (pillOpen)  => set({ pillOpen }),
  setCmdOpen:   (cmdOpen)   => set({ cmdOpen }),
  setNotifOpen: (notifOpen) => set({ notifOpen }),
  setUserOpen:  (userOpen)  => set({ userOpen }),
  setRingOpen:  (ringOpen)  => set({ ringOpen }),
  closeAll: () => set({ pillOpen: false, notifOpen: false, userOpen: false, ringOpen: false }),
}))
