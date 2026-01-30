import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { configActions } from '../../store/modules/config';
import { SystemConfig } from '../../types/domain';
import '../../assets/styles/color-config-panel.css';

interface ColorConfigPanelProps {
  onClose?: () => void;
}

const ColorConfigPanel: React.FC<ColorConfigPanelProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { configs } = useAppSelector(state => state.config);

  const [activeCategory, setActiveCategory] = useState<string>('colors');
  const [previewTheme, setPreviewTheme] = useState<boolean>(false);

  useEffect(() => {
    const mockConfigs: SystemConfig[] = [
      { id: 'color-status-available', key: 'color-status-available', value: '#3ba55d', category: 'colors', description: '可用狀態顏色', updatedAt: new Date() },
      { id: 'color-status-occupied', key: 'color-status-occupied', value: '#faa61a', category: 'colors', description: '佔用狀態顏色', updatedAt: new Date() },
      { id: 'color-status-reserved', key: 'color-status-reserved', value: '#00b0f4', category: 'colors', description: '預留狀態顏色', updatedAt: new Date() },
      { id: 'color-status-maintenance', key: 'color-status-maintenance', value: '#ed4245', category: 'colors', description: '維護狀態顏色', updatedAt: new Date() },
      { id: 'color-primary', key: 'color-primary', value: '#5865f2', category: 'colors', description: '主要顏色', updatedAt: new Date() },
      { id: 'color-primary-hover', key: 'color-primary-hover', value: '#4752c4', category: 'colors', description: '主要顏色懸停', updatedAt: new Date() },
      { id: 'color-secondary', key: 'color-secondary', value: '#2f3136', category: 'colors', description: '次要顏色', updatedAt: new Date() },
      { id: 'color-surface', key: 'color-surface', value: '#36393f', category: 'colors', description: '表面顏色', updatedAt: new Date() },
      { id: 'color-background', key: 'color-background', value: '#202225', category: 'colors', description: '背景顏色', updatedAt: new Date() },
      { id: 'color-text-primary', key: 'color-text-primary', value: '#dcddde', category: 'colors', description: '主要文字顏色', updatedAt: new Date() },
      { id: 'color-text-secondary', key: 'color-text-secondary', value: '#b9bbbe', category: 'colors', description: '次要文字顏色', updatedAt: new Date() },
      { id: 'color-text-muted', key: 'color-text-muted', value: '#72767d', category: 'colors', description: '靜音文字顏色', updatedAt: new Date() },
      { id: 'color-success', key: 'color-success', value: '#3ba55d', category: 'colors', description: '成功顏色', updatedAt: new Date() },
      { id: 'color-warning', key: 'color-warning', value: '#faa61a', category: 'colors', description: '警告顏色', updatedAt: new Date() },
      { id: 'color-danger', key: 'color-danger', value: '#ed4245', category: 'colors', description: '危險顏色', updatedAt: new Date() },
      { id: 'color-info', key: 'color-info', value: '#00b0f4', category: 'colors', description: '信息顏色', updatedAt: new Date() },
      { id: 'color-accent', key: 'color-accent', value: '#00aff4', category: 'colors', description: '強調顏色', updatedAt: new Date() },
    ];

    dispatch(configActions.setConfigs(mockConfigs));
  }, [dispatch]);

  const updateConfig = (configId: string, value: string) => {
    const config = configs.find(c => c.id === configId);
    if (config) {
      const updatedConfig = { ...config, value, updatedAt: new Date() };
      dispatch(configActions.updateConfig(updatedConfig));

      if (previewTheme) {
        document.documentElement.style.setProperty(config.key, value);
      }
    }
  };

  const resetToDefault = () => {
    const defaultConfigs = [
      { key: 'color-status-available', value: '#3ba55d' },
      { key: 'color-status-occupied', value: '#faa61a' },
      { key: 'color-status-reserved', value: '#00b0f4' },
      { key: 'color-status-maintenance', value: '#ed4245' },
      { key: 'color-primary', value: '#5865f2' },
      { key: 'color-primary-hover', value: '#4752c4' },
      { key: 'color-secondary', value: '#2f3136' },
      { key: 'color-surface', value: '#36393f' },
      { key: 'color-background', value: '#202225' },
      { key: 'color-text-primary', value: '#dcddde' },
      { key: 'color-text-secondary', value: '#b9bbbe' },
      { key: 'color-text-muted', value: '#72767d' },
      { key: 'color-success', value: '#3ba55d' },
      { key: 'color-warning', value: '#faa61a' },
      { key: 'color-danger', value: '#ed4245' },
      { key: 'color-info', value: '#00b0f4' },
      { key: 'color-accent', value: '#00aff4' },
    ];

    defaultConfigs.forEach(({ key, value }) => {
      const config = configs.find(c => c.key === key);
      if (config) {
        updateConfig(config.id, value);
      }
    });
  };

  const applyTheme = () => {
    configs.forEach(config => {
      if (typeof config.value === 'string') {
        document.documentElement.style.setProperty(config.key, config.value);
      }
    });
  };

  const exportTheme = () => {
    const themeData = configs.filter(c => c.category === 'colors').reduce((acc, config) => {
      acc[config.key] = String(config.value);
      return acc;
    }, {} as Record<string, string>);

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `theme-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);

        Object.entries(themeData).forEach(([key, value]) => {
          const config = configs.find(c => c.key === key);
          if (config) {
            updateConfig(config.id, value as string);
          }
        });
      } catch (error) {
        console.error('匯入主題失敗:', error);
      }
    };
    reader.readAsText(file);
  };

  const getFilteredConfigs = () => {
    return configs.filter(config => {
      if (activeCategory === 'colors') return config.category === 'colors';
      if (activeCategory === 'fees') return config.category === 'fees';
      if (activeCategory === 'access') return config.category === 'access';
      return config.category === 'general';
    });
  };

  const colorCategories = [
    { id: 'status', name: '狀態顏色', configs: ['color-status-available', 'color-status-occupied', 'color-status-reserved', 'color-status-maintenance'] },
    { id: 'theme', name: '主題顏色', configs: ['color-primary', 'color-primary-hover', 'color-secondary', 'color-surface', 'color-background'] },
    { id: 'text', name: '文字顏色', configs: ['color-text-primary', 'color-text-secondary', 'color-text-muted'] },
    { id: 'functional', name: '功能顏色', configs: ['color-success', 'color-warning', 'color-danger', 'color-info', 'color-accent'] },
  ];

  const ColorPicker: React.FC<{ config: SystemConfig; onColorChange: (value: string) => void }> = ({ config, onColorChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    const currentValue = typeof config.value === 'string' ? config.value : '#000000';

    return (
      <div className="color-picker-wrapper">
        <div className="color-preview">
          <div
            className="color-box"
            style={{ backgroundColor: currentValue }}
            onClick={() => setShowPicker(!showPicker)}
          ></div>
          <span className="color-value">{currentValue}</span>
        </div>

        {showPicker && (
          <div className="color-picker-popup">
            <input
              type="color"
              value={currentValue}
              onChange={(e) => onColorChange(e.target.value)}
              className="color-input"
            />
            <div className="preset-colors">
              {['#3ba55d', '#faa61a', '#00b0f4', '#ed4245', '#5865f2', '#2f3136', '#36393f', '#202225', '#dcddde', '#b9bbbe', '#72767d'].map(color => (
                <div
                  key={color}
                  className="preset-color"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onColorChange(color);
                    setShowPicker(false);
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="color-config-panel">
      <div className="panel-header">
        <h1>顏色配置面板</h1>
        <div className="panel-actions">
          <div className="preview-toggle">
            <label>
              <input
                type="checkbox"
                checked={previewTheme}
                onChange={(e) => setPreviewTheme(e.target.checked)}
              />
              即時預覽
            </label>
          </div>
          <div className="theme-actions">
            <Button variant="secondary" onClick={resetToDefault}>
              恢復預設
            </Button>
            <Button variant="secondary" onClick={exportTheme}>
              匯出主題
            </Button>
            <label className="import-btn">
              <Button variant="secondary">
                匯入主題
              </Button>
              <input type="file" accept=".json" onChange={importTheme} style={{ display: 'none' }} />
            </label>
            <Button variant="primary" onClick={applyTheme}>
              套用主題
            </Button>
          </div>
        </div>
      </div>

      <div className="panel-content">
        <div className="category-tabs">
          {colorCategories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="config-sections">
          {activeCategory === 'status' && (
            <Card className="config-section">
              <CardHeader>
                <CardTitle>狀態顏色設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="config-grid">
                  {configs.filter(c => c.category === 'colors' && c.key.includes('status')).map(config => (
                    <div key={config.id} className="config-item">
                      <label className="config-label">{config.description}</label>
                      <ColorPicker
                        config={config}
                        onColorChange={(value) => updateConfig(config.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeCategory === 'theme' && (
            <Card className="config-section">
              <CardHeader>
                <CardTitle>主題顏色設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="config-grid">
                  {configs.filter(c => c.category === 'colors' && ['primary', 'secondary', 'surface', 'background'].some(term => c.key.includes(term))).map(config => (
                    <div key={config.id} className="config-item">
                      <label className="config-label">{config.description}</label>
                      <ColorPicker
                        config={config}
                        onColorChange={(value) => updateConfig(config.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeCategory === 'text' && (
            <Card className="config-section">
              <CardHeader>
                <CardTitle>文字顏色設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="config-grid">
                  {configs.filter(c => c.category === 'colors' && c.key.includes('text')).map(config => (
                    <div key={config.id} className="config-item">
                      <label className="config-label">{config.description}</label>
                      <ColorPicker
                        config={config}
                        onColorChange={(value) => updateConfig(config.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeCategory === 'functional' && (
            <Card className="config-section">
              <CardHeader>
                <CardTitle>功能顏色設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="config-grid">
                  {configs.filter(c => c.category === 'colors' && ['success', 'warning', 'danger', 'info', 'accent'].some(term => c.key.includes(term))).map(config => (
                    <div key={config.id} className="config-item">
                      <label className="config-label">{config.description}</label>
                      <ColorPicker
                        config={config}
                        onColorChange={(value) => updateConfig(config.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="preview-section">
            <CardHeader>
              <CardTitle>主題預覽</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="preview-container">
                <div className="preview-components">
                  <div className="preview-status-cards">
                    <div className="preview-card available">
                      <span>可用</span>
                    </div>
                    <div className="preview-card occupied">
                      <span>佔用</span>
                    </div>
                    <div className="preview-card reserved">
                      <span>預留</span>
                    </div>
                    <div className="preview-card maintenance">
                      <span>維護</span>
                    </div>
                  </div>

                  <div className="preview-buttons">
                    <Button variant="primary">主要按鈕</Button>
                    <Button variant="success">成功按鈕</Button>
                    <Button variant="warning">警告按鈕</Button>
                    <Button variant="danger">危險按鈕</Button>
                  </div>

                  <div className="preview-text">
                    <h3>預覽文字</h3>
                    <p className="primary-text">主要文字顏色</p>
                    <p className="secondary-text">次要文字顏色</p>
                    <p className="muted-text">靜音文字顏色</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColorConfigPanel;