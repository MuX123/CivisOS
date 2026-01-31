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
  <div 
    className={`px-4 py-3 border-b border-[#202225] bg-[#2f3136] flex items-center justify-between ${className}`} 
    style={style}
  >
    {children}
  </div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', style }) => (
  <h3 
    className={`text-base font-semibold text-white uppercase tracking-wide ${className}`} 
    style={style}
  >
    {children}
  </h3>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '', style }) => (
  <div className={`p-4 ${className}`} style={style}>{children}</div>
);

const Card: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div 
    className={`bg-[#2f3136] rounded-lg shadow-sm border border-[#202225] overflow-hidden ${className}`} 
    style={style}
  >
    {children}
  </div>
);

(Card as any).Header = CardHeader;
(Card as any).Title = CardTitle;
(Card as any).Content = CardContent;

export { Card, CardHeader, CardTitle, CardContent };
export default Card;
