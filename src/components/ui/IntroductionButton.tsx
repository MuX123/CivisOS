import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { PageIntroduction, ButtonConfig } from '../../store/modules/introduction';

interface IntroductionButtonProps {
  pageId: string;
  customConfig?: ButtonConfig;
}

const IntroductionButton: React.FC<IntroductionButtonProps> = ({ 
  pageId,
  customConfig 
}) => {
  const introductions = useAppSelector((state) => state.introduction.introductions);
  const buttonConfig = useAppSelector((state) => state.introduction.buttonConfig);
  
  const introduction = introductions.find((i: PageIntroduction) => i.pageId === pageId);
  
  if (!introduction) return null;

  // 使用自定义配置或全局配置
  const config = customConfig || buttonConfig;

  // 将内容按换行分割成列表项
  const contentLines = introduction.content.split('\n').filter(line => line.trim() !== '');

  // 根据配置构建样式
  const buttonStyle: React.CSSProperties = {
    width: config.size,
    height: config.size,
    backgroundColor: config.backgroundColor,
    opacity: config.opacity,
    border: config.showBorder ? `2px solid ${config.borderColor}` : 'none',
    color: config.textColor,
    fontSize: config.fontSize,
    fontWeight: 'bold',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.2,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  return (
    <div className="group relative flex-shrink-0">
      {/* 自定义正方形按钮 */}
      <button
        style={buttonStyle}
        className="hover:scale-105"
        title="使用介紹"
      >
        <span>{config.line1}</span>
        <span>{config.line2}</span>
      </button>

      {/* Hover 时显示的介绍内容卡片 */}
      <div className="absolute top-full right-0 z-50 hidden group-hover:block mt-2">
        <div className="bg-[#FEE75C]/10 border border-[#FEE75C]/30 rounded-lg p-4 shadow-xl backdrop-blur-sm w-80">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-[#FEE75C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-[#FEE75C]">{introduction.title}</h3>
          </div>
          <div className="text-sm text-white/80 space-y-1">
            {contentLines.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {contentLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            ) : (
              <p>{introduction.content}</p>
            )}
          </div>
          <div className="mt-2 text-xs text-[#FEE75C]/60 text-right">
            {introduction.pageName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionButton;
