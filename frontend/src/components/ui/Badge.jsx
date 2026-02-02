import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Badge variants
 */
const badgeVariants = cva(
    "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20",
                secondary: "bg-[#1A1F2E] text-[#9CA3AF] border border-[#1F2433]",
                success: "bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20",
                warning: "bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20",
                error: "bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20",
                cyan: "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

/**
 * Badge component
 */
function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
