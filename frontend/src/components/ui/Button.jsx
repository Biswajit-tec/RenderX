import * as React from "react";
import { cn } from "../../lib/utils";
import "./Button.css";

const Button = React.forwardRef(
    ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
        return (
            <button
                className={cn(
                    "gradient-btn",
                    className
                )}
                ref={ref}
                data-variant={variant}
                data-size={size}
                {...props}
            >
                <div className="gradient-btn-inner">
                    {children}
                </div>
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };

