import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement>{
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className , ...props }) => {
  return (
    <div
      className={twMerge(
        'bg-white rounded-lg shadow-md overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h3
      className={twMerge(
        'text-lg font-medium leading-6 text-gray-900',
        className
      )}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={twMerge('mt-1 text-sm text-gray-500', className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={twMerge('px-4 py-5 sm:p-6', className)}>{children}</div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
};