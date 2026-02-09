import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { PageIntroduction, introductionActions, ButtonConfig } from '../../store/modules/introduction';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import IntroductionButton from '../../components/ui/IntroductionButton';

// ==================== 後台介紹設定頁面 ====================

const IntroductionSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const introductions = useAppSelector((state) => state.introduction.introductions);
  const buttonConfig = useAppSelector((state) => state.introduction.buttonConfig);
  
  // 分頁狀態
  const [activeTab, setActiveTab] = useState<'pages' | 'display'>('pages');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editingIntroduction, setEditingIntroduction] = useState<PageIntroduction | null>(null);

  
  // 按鈕配置編輯狀態
  const [editingButtonConfig, setEditingButtonConfig] = useState<ButtonConfig>({ ...buttonConfig });

  // 預設選中第一個
  useEffect(() => {
    if (introductions.length > 0 && !selectedPageId) {
      setSelectedPageId(introductions[0].pageId);
    }
  }, [introductions, selectedPageId]);

  // 取得當前選中的介紹
  const currentIntroduction = introductions.find((i: PageIntroduction) => i.pageId === selectedPageId);

  // 處理更新介紹
  const handleUpdateIntroduction = () => {
    if (!editingIntroduction) return;
    
    dispatch(
      introductionActions.updateIntroduction({
        id: editingIntroduction.id,
        title: editingIntroduction.title,
        content: editingIntroduction.content,
        pageName: editingIntroduction.pageName,
      })
    );
    
    setEditingIntroduction(null);
  };

  // 重設為預設值
  const handleResetToDefault = () => {
    if (!confirm('確定要重設所有介紹為預設值嗎？此操作無法復原。')) return;
    dispatch(introductionActions.resetToDefault());
    setSelectedPageId(null);
  };

  // 頁面選項（已存在的頁面 ID）
  const existingPageIds = introductions.map((i: PageIntroduction) => i.pageId);

  // 處理更新按鈕配置
  const handleUpdateButtonConfig = () => {
    dispatch(introductionActions.updateButtonConfig(editingButtonConfig));
  };

  // 處理重設按鈕配置
  const handleResetButtonConfig = () => {
    if (!confirm('確定要重設按鈕配置為預設值嗎？')) return;
    dispatch(introductionActions.resetButtonConfig());
    setEditingButtonConfig(buttonConfig);
  };

  return (
    <div className="introduction-settings p-6 max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">介紹設定</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="introduction" />
        </div>
      </div>

      {/* 分頁標籤 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'pages'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
          }`}
        >
          頁面介紹 ({introductions.length})
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'display'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
          }`}
        >
          顯示設定
        </button>
      </div>

      {/* 頁面介紹設定 */}
      {activeTab === 'pages' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：頁面列表 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>頁面列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {introductions.map((intro: PageIntroduction) => (
                      <button
                        key={intro.id}
                        onClick={() => setSelectedPageId(intro.pageId)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedPageId === intro.pageId
                            ? 'bg-[#5865F2] text-white'
                            : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        <div className="font-medium">{intro.pageName}</div>
                      </button>
                    ))}
                  </div>
                  
                  {introductions.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                      <p>尚無介紹設定</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleResetToDefault}
                      className="w-full"
                    >
                      重設為預設值
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右側：編輯區域 */}
            <div className="lg:col-span-2">
              {currentIntroduction ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>編輯介紹 - {currentIntroduction.pageName}</CardTitle>
                      <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setEditingIntroduction(currentIntroduction)}
                    >
                      編輯
                    </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          頁面 ID
                        </label>
                        <input
                          type="text"
                          value={currentIntroduction.pageId}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          頁面名稱
                        </label>
                        <input
                          type="text"
                          value={currentIntroduction.pageName}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          介紹標題
                        </label>
                        <input
                          type="text"
                          value={currentIntroduction.title}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          介紹內容
                        </label>
                        <textarea
                          value={currentIntroduction.content}
                          disabled
                          rows={8}
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] resize-none"
                        />
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        最後更新：{new Date(currentIntroduction.updatedAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-[var(--text-muted)]">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>請選擇左側頁面進行編輯</p>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 編輯對話框 */}
          {editingIntroduction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-lg shadow-2xl border border-[var(--color-border)]">
                <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">
                  編輯介紹 - {editingIntroduction.pageName}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      頁面名稱
                    </label>
                    <input
                      type="text"
                      value={editingIntroduction.pageName}
                      onChange={(e) =>
                        setEditingIntroduction({
                          ...editingIntroduction,
                          pageName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      介紹標題
                    </label>
                    <input
                      type="text"
                      value={editingIntroduction.title}
                      onChange={(e) =>
                        setEditingIntroduction({
                          ...editingIntroduction,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      介紹內容
                    </label>
                    <textarea
                      value={editingIntroduction.content}
                      onChange={(e) =>
                        setEditingIntroduction({
                          ...editingIntroduction,
                          content: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] resize-none"
                      placeholder="輸入介紹內容..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="primary" onClick={handleUpdateIntroduction} className="flex-1">
                    儲存變更
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingIntroduction(null)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </div>
            </div>
          )}

        </>
      )}

      {/* 顯示設定 */}
      {activeTab === 'display' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：按鈕配置編輯 */}
          <Card>
            <CardHeader>
              <CardTitle>按鈕樣式設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      尺寸 (px)
                    </label>
                    <input
                      type="number"
                      value={editingButtonConfig.size}
                      onChange={(e) =>
                        setEditingButtonConfig({
                          ...editingButtonConfig,
                          size: parseInt(e.target.value) || 40,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      透明度 (0-1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editingButtonConfig.opacity}
                      onChange={(e) =>
                        setEditingButtonConfig({
                          ...editingButtonConfig,
                          opacity: parseFloat(e.target.value) || 0.7,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      背景顏色
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative h-10 w-20">
                        <input
                          type="color"
                          value={editingButtonConfig.backgroundColor}
                          onChange={(e) =>
                            setEditingButtonConfig({
                              ...editingButtonConfig,
                              backgroundColor: e.target.value,
                            })
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="h-10 w-20 rounded border border-[var(--color-border)]"
                          style={{ backgroundColor: editingButtonConfig.backgroundColor }}
                        />
                      </div>
                      <input
                        type="text"
                        value={editingButtonConfig.backgroundColor}
                        onChange={(e) =>
                          setEditingButtonConfig({
                            ...editingButtonConfig,
                            backgroundColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      文字顏色
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative h-10 w-20">
                        <input
                          type="color"
                          value={editingButtonConfig.textColor}
                          onChange={(e) =>
                            setEditingButtonConfig({
                              ...editingButtonConfig,
                              textColor: e.target.value,
                            })
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="h-10 w-20 rounded border border-[var(--color-border)]"
                          style={{ backgroundColor: editingButtonConfig.textColor }}
                        />
                      </div>
                      <input
                        type="text"
                        value={editingButtonConfig.textColor}
                        onChange={(e) =>
                          setEditingButtonConfig({
                            ...editingButtonConfig,
                            textColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      第一行文字
                    </label>
                    <input
                      type="text"
                      value={editingButtonConfig.line1}
                      onChange={(e) =>
                        setEditingButtonConfig({
                          ...editingButtonConfig,
                          line1: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      第二行文字
                    </label>
                    <input
                      type="text"
                      value={editingButtonConfig.line2}
                      onChange={(e) =>
                        setEditingButtonConfig({
                          ...editingButtonConfig,
                          line2: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      字體大小
                    </label>
                    <input
                      type="text"
                      value={editingButtonConfig.fontSize}
                      onChange={(e) =>
                        setEditingButtonConfig({
                          ...editingButtonConfig,
                          fontSize: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                      placeholder="例如：10px"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={editingButtonConfig.showBorder}
                      onChange={(e) =>
                        setEditingButtonConfig({
                          ...editingButtonConfig,
                          showBorder: e.target.checked,
                        })
                      }
                      className="rounded border-[var(--color-border)]"
                    />
                    <span className="text-sm text-white/70">顯示外框</span>
                  </div>
                </div>

                {editingButtonConfig.showBorder && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      外框顏色
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative h-10 w-20">
                        <input
                          type="color"
                          value={editingButtonConfig.borderColor}
                          onChange={(e) =>
                            setEditingButtonConfig({
                              ...editingButtonConfig,
                              borderColor: e.target.value,
                            })
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="h-10 w-20 rounded border border-[var(--color-border)]"
                          style={{ backgroundColor: editingButtonConfig.borderColor }}
                        />
                      </div>
                      <input
                        type="text"
                        value={editingButtonConfig.borderColor}
                        onChange={(e) =>
                          setEditingButtonConfig({
                            ...editingButtonConfig,
                            borderColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--color-border)]">
                  <Button variant="primary" onClick={handleUpdateButtonConfig} className="flex-1">
                    儲存設定
                  </Button>
                  <Button variant="secondary" onClick={handleResetButtonConfig} className="flex-1">
                    重設預設值
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 右側：預覽 */}
          <Card>
            <CardHeader>
              <CardTitle>即時預覽</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <div className="p-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-border)]">
                  <IntroductionButton 
                    pageId="introduction" 
                    customConfig={editingButtonConfig}
                  />
                </div>
                <p className="text-sm text-[var(--text-muted)] text-center">
                  上方為按鈕實際顯示效果<br />
                  滑鼠移動到按鈕上可查看介紹內容卡片
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IntroductionSettings;
