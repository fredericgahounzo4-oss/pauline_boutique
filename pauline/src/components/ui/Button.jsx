import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
    children,
    variant = 'primary',
    className,
    ...props
}) => {
    const baseStyles = 'px-6 py-2 rounded-md font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'text-text hover:text-primary hover:bg-background-alt'
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};
