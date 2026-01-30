import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>{children}</h3>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

(Card as any).Header = CardHeader;
(Card as any).Title = CardTitle;
(Card as any).Content = CardContent;

export { Card, CardHeader, CardTitle, CardContent };
export default Card;