import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', style }) => (
  <div className={`card-header ${className}`} style={style}>{children}</div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', style }) => (
  <h3 className={`card-title ${className}`} style={style}>{children}</h3>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '', style }) => (
  <div className={`card-content ${className}`} style={style}>{children}</div>
);

const Card: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div className={`card ${className}`} style={style}>
    {children}
  </div>
);

(Card as any).Header = CardHeader;
(Card as any).Title = CardTitle;
(Card as any).Content = CardContent;

export { Card, CardHeader, CardTitle, CardContent };
export default Card;