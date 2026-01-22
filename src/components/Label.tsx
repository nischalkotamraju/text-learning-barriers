import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ children, className = "", ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-white/70 mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};