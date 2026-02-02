import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Progress bar - RenderX style
 */
const Progress = React.forwardRef(({ className, value, variant = "indigo", ...props }, ref) => {
    const variants = {
        indigo: "bg-[#6366F1]",
        cyan: "bg-[#22D3EE]",
        success: "bg-[#10B981]",
        error: "bg-[#EF4444]",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-[#1F2433]",
                className
            )}
            {...props}
        >
            <div
                className={cn("h-full transition-all duration-500 ease-out rounded-full", variants[variant])}
                style={{ width: `${value || 0}%` }}
            />
        </div>
    );
});
Progress.displayName = "Progress";

export { Progress };
