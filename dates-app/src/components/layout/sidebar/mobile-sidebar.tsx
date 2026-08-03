import { SidebarNav } from "@/components/layout/sidebar/sidebar-nav"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { navItems } from "@/config/nav"
import { siteConfig } from "@/config/site"
import { useSidebar } from "@/providers/sidebar-provider"

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar()

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="h-14 justify-center border-b border-border px-4">
          <SheetTitle className="text-sm font-semibold tracking-tight">
            {siteConfig.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu de navegação
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="py-3">
            <SidebarNav
              items={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
