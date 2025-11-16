import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, fullWidth = true, className = "", id, ...props }, ref) => {
    const baseStyles = "px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/20 transition-colors";
    const widthStyles = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${widthStyles} ${className}`.trim();

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <input ref={ref} id={id} className={combinedClassName} {...props} />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
