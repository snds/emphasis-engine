import type { ReactNode } from "react"
import { IconInfoCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Ghost info button with a short tooltip. Keyboard focus opens it too. */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`About ${label}`}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <IconInfoCircle />
      </TooltipTrigger>
      <TooltipContent className="max-w-60 leading-snug">{children}</TooltipContent>
    </Tooltip>
  )
}
