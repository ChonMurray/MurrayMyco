import { ButtonHTMLAttributes, forwardRef, AnchorHTMLAttributes } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  href?: never;
}

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  href: string;
}

type CombinedProps = ButtonProps | LinkButtonProps;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, CombinedProps>(
  ({ variant = "primary", fullWidth = false, className = "", children, ...props }, ref) => {
    const variantStyles = {
      primary: "btn", // Uses global .btn class from globals.css
      secondary: "bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-foreground",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    const combinedClassName = `${variantStyles[variant]} ${widthStyles} ${className}`.trim();

    if ('href' in props && props.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={props.href}
          className={combinedClassName}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={combinedClassName} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
