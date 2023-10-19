'use client'

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useSettings } from '@/hooks'
import { Label } from '@/components/ui/label'
import { ModeToggle } from '@/components/mode-toggle'

const SettingModal = () => {
  const setting = useSettings()
  return (
    <Dialog open={setting.isOpen} onOpenChange={setting.onClose}>
      <DialogContent>
        <DialogHeader className=" border-b pb-3">
          <h2 className="text-lg font-medium">My settings</h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>Appearance</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Customize how Divine Stone looks on your device
            </span>
          </div>
          <ModeToggle />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingModal
