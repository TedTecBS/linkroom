import type { ButtonHTMLAttributes } from 'react'

export const Button = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 ${className}`}
    {...props}
  />
)

export default Button
