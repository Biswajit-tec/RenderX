import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Separator component for visual division
 */
const Separator = React.forwardRef(
    ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={orientation}
            className={cn(
                "shrink-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
);
Separator.displayName = "Separator";

export { Separator };
