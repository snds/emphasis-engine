import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { cn } from "cn"

/**
 * Bottom sheet with detents, on Base UI's Drawer. Drag the grabber between
 * snap points, swipe down to dismiss. Content scrolls inside; the sheet's
 * own drag only starts from the header.
 */
function Drawer(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerContent({
  className,
  children,
  title,
  description,
  ...props
}: DrawerPrimitive.Popup.Props & { title: string; description?: string }) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black opacity-[calc(0.4*(1-var(--drawer-swipe-progress,0)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex touch-none items-end justify-center">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            // Top margin keeps a sliver of canvas visible at the tallest detent, so the sheet never reads as a new page.
            "relative flex max-h-[calc(100dvh-3rem)] min-h-0 w-full flex-col rounded-t-2xl border-t bg-background text-foreground shadow-2xl outline-none touch-none",
            "[padding-bottom:max(0px,calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))] [transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]",
            "transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0",
            "data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*400ms)]",
            className,
          )}
          {...props}
        >
          <div className="shrink-0 cursor-grab touch-none px-4 pt-2 pb-3 select-none">
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-muted-foreground/40" aria-hidden />
            <div className="flex items-center justify-between gap-3">
              <DrawerPrimitive.Title className="text-base font-semibold">{title}</DrawerPrimitive.Title>
              <DrawerPrimitive.Close className="-mr-2 inline-flex h-11 items-center rounded-full px-3 text-sm font-medium text-primary active:opacity-60">
                Done
              </DrawerPrimitive.Close>
            </div>
            {description && <DrawerPrimitive.Description className="text-xs text-muted-foreground">{description}</DrawerPrimitive.Description>}
          </div>
          <DrawerPrimitive.Content className="min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain border-t pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

export { Drawer, DrawerContent }
