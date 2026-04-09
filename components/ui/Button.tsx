"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-body font-medium transition-all duration-300 rounded-[9999px] cursor-pointer select-none",
          // sizes
          size === "sm" && "px-5 py-2 text-sm",
          size === "md" && "px-7 py-3 text-sm tracking-wide",
          size === "lg" && "px-10 py-4 text-base tracking-wider",
          // variants
          variant === "primary" &&
            "bg-[#B8944F] text-[#FEFCF7] hover:bg-[#9d7c3e] hover:shadow-[0_8px_32px_rgba(184,148,79,0.35)] active:scale-[0.98]",
          variant === "outline" &&
            "border border-[#B8944F] text-[#B8944F] hover:bg-[#B8944F]/8 active:scale-[0.98]",
          variant === "ghost" &&
            "text-[#555555] hover:text-[#0A0A0A] hover:bg-[#E8E2D8]/60",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
