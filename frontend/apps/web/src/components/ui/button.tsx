import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap border-4 border-black bg-white text-black text-sm font-bold transition-transform duration-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:border-pink-500 focus:bg-yellow-200 focus:translate(-1px,-1px) aria-invalid:border-red-500 cursor-pointer hover:bg-pink-500 hover:text-white hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000]",
    {
        variants: {
            variant: {
                default:
                    "bg-orange-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-orange-600 hover:border-white hover:translate(-1px,-1px) hover:shadow-[10px_10px_0_#000000]",
                primary:
                    "bg-orange-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-orange-600 hover:border-white hover:translate(-1px,-1px)",
                destructive:
                    "bg-red-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-red-600 hover:border-white hover:translate(-1px,-1px)",
                outline:
                    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                secondary:
                    "bg-blue-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-blue-600 hover:border-white hover:translate(-1px,-1px)",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
                glass:
                    "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-lg",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
