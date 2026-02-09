import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { residentActions } from '../../store/modules/resident';
import { ResidentV2, ResidentStatus } from '../../types/domain';
import Button from '@/components/ui/Button';

// ==================== 後台住戶系統（重構版）====================

// 資料卡預覽模態框
const ResidentCardModal: React.FC<{
    unitId: string;
    unitName: string;
    floorName: string;
    existingData?: ResidentV2;
    onClose: () => void;
    onEdit: () => void;
    statuses: ResidentStatus[];
    parkingSpaces: any[];
}> = ({ unitName, floorName, existingData, onClose, onEdit, statuses, parkingSpaces }) => {
    if (!existingData) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-lg shadow-2xl border border-[var(--color-border)]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[var(--text-normal)]">住戶資料卡 - {unitName}</h3>
                        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-normal)]">✕</button>
                    </div>
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        <p>此戶別尚未登記住戶資料</p>
                        <Button className="mt-4" onClick={onEdit}>立即新增</Button>
                    </div>
                </div>
            </div>
        );
    }

    const status = statuses.find(s => s.id === existingData.statusId);
    
    // 查找車位資料
    const unitParkingSpaces = parkingSpaces.filter(p => p.occupantUnitId === existingData.unitId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--color-border)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-border)]">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-normal)]">住戶資料卡</h3>
                        <p className="text-sm text-[var(--text-muted)]">{unitName} · {floorName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="small" onClick={onEdit}>編輯資料</Button>
                        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-normal)] text-xl">✕</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 房屋狀態 */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-[var(--text-muted)]">房屋狀態:</span>
                        <span 
                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: status?.color || '#ccc' }}
                        >
                            {status?.name || '未設定'}
                        </span>
                    </div>

                    {/* 區權人資訊 */}
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                        <h4 className="font-bold text-[var(--text-normal)] mb-2">區權人資訊</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-[var(--text-muted)]">姓名</span>
                                <p className="font-medium text-[var(--text-normal)]">{existingData.ownerName || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-[var(--text-muted)]">電話</span>
                                <p className="font-medium text-[var(--text-normal)]">{existingData.ownerPhone || '-'}</p>
                            </div>
                        </div>
                        {existingData.ownerNotes && (
                            <div className="mt-2">
                                <span className="text-sm text-[var(--text-muted)]">備註</span>
                                <p className="text-sm text-[var(--text-normal)]">{existingData.ownerNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* 成員名單 */}
                    {existingData.members.length > 0 && (
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                            <h4 className="font-bold text-[var(--text-normal)] mb-2">成員名單 ({existingData.members.length}人)</h4>
                            <div className="space-y-2">
                                {existingData.members.map((member, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-1 border-b border-[var(--color-border)] last:border-0">
                                        <span className="text-[var(--text-normal)]">{member.name}</span>
                                        <span className="text-sm text-[var(--text-muted)]">{member.phone || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 承租名單 */}
                    {existingData.tenants.length > 0 && (
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                            <h4 className="font-bold text-[var(--text-normal)] mb-2">承租名單 ({existingData.tenants.length}人)</h4>
                            <div className="space-y-2">
                                {existingData.tenants.map((tenant, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-1 border-b border-[var(--color-border)] last:border-0">
                                        <span className="text-[var(--text-normal)]">{tenant.name}</span>
                                        <span className="text-sm text-[var(--text-muted)]">{tenant.phone || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 車牌與車位 */}
                    {(existingData.licensePlates.length > 0 || unitParkingSpaces.length > 0) && (
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                            <h4 className="font-bold text-[var(--text-normal)] mb-2">車輛資訊</h4>
                            {existingData.licensePlates.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-sm text-[var(--text-muted)]">車牌:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {existingData.licensePlates.map((plate, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-sm text-[var(--text-normal)]">
                                                {plate}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {unitParkingSpaces.length > 0 && (
                                <div>
                                    <span className="text-sm text-[var(--text-muted)]">車位:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {unitParkingSpaces.map((space, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                {space.number}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 磁扣設定 */}
                    {(existingData.generalCards.length > 0 || existingData.etcCards.length > 0 || existingData.otherEtcCards.length > 0) && (
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                            <h4 className="font-bold text-[var(--text-normal)] mb-2">磁扣設定</h4>
                            <div className="space-y-1">
                                {existingData.generalCards.map((card, idx) => (
                                    <div key={idx} className="text-sm text-[var(--text-normal)]">
                                        <span className="text-[var(--text-muted)]">一般磁扣:</span> {card.cardNumber} ({card.member})
                                    </div>
                                ))}
                                {existingData.etcCards.map((card, idx) => (
                                    <div key={idx} className="text-sm text-[var(--text-normal)]">
                                        <span className="text-[var(--text-muted)]">汽車ETC:</span> {card.cardNumber} ({card.plate})
                                    </div>
                                ))}
                                {existingData.otherEtcCards.map((card, idx) => (
                                    <div key={idx} className="text-sm text-[var(--text-normal)]">
                                        <span className="text-[var(--text-muted)]">其他ETC:</span> {card.cardNumber} ({card.type})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 編輯模態框（原有的編輯功能）
const ResidentEditModal: React.FC<{
    unitId: string;
    unitName: string;
    existingData?: ResidentV2;
    onClose: () => void;
    onSave: (data: ResidentV2) => void;
    statuses: ResidentStatus[];
    parkingPlates: string[];
}> = ({ unitId, unitName, existingData, onClose, onSave, statuses, parkingPlates }) => {
    const [formData, setFormData] = useState<ResidentV2>(existingData || {
        id: `${Date.now()}`,
        unitId,
        statusId: statuses[0]?.id || '',
        ownerName: '',
        ownerPhone: '',
        ownerNotes: '',
        members: [],
        tenants: [],
        licensePlates: [],
        generalCards: [],
        etcCards: [],
        otherEtcCards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'members' | 'tenants' | 'plates' | 'cards'>('basic');
    const [cardTab, setCardTab] = useState<'general' | 'car' | 'other'>('general');

    const handleSave = () => {
        onSave({
            ...formData,
            updatedAt: new Date().toISOString()
        });
    };

    const addItem = <T,>(field: keyof ResidentV2, item: T) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] as any[]), item]
        }));
    };

    const removeItem = (field: keyof ResidentV2, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index)
        }));
    };

    const updateItem = <T,>(field: keyof ResidentV2, index: number, updates: Partial<T>) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] as any[]).map((item, i) => i === index ? { ...item, ...updates } : item)
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[var(--color-border)]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-border)]">
                    <h3 className="text-xl font-bold text-[var(--text-normal)]">編輯住戶資料 - {unitName}</h3>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-normal)]">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-[var(--color-border)]">
                    {[
                        { id: 'basic', label: '基本資料' },
                        { id: 'members', label: '成員名單' },
                        { id: 'tenants', label: '承租名單' },
                        { id: 'plates', label: '車牌名單' },
                        { id: 'cards', label: '磁扣設定' },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 ${activeTab === tab.id ? 'border-b-2 border-[#5a7fd6] text-[#5a7fd6] font-bold' : 'text-[var(--text-muted)]'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[var(--text-muted)]">房屋狀態</label>
                                <select 
                                    className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                    value={formData.statusId}
                                    onChange={e => setFormData({...formData, statusId: e.target.value})}
                                >
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[var(--text-muted)]">區權人姓名</label>
                                    <input 
                                        className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                        value={formData.ownerName} 
                                        onChange={e => setFormData({...formData, ownerName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--text-muted)]">電話</label>
                                    <input 
                                        className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                        value={formData.ownerPhone} 
                                        onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--text-muted)]">備註</label>
                                <textarea 
                                    className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                    value={formData.ownerNotes || ''}
                                    onChange={e => setFormData({...formData, ownerNotes: e.target.value})}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {(activeTab === 'members' || activeTab === 'tenants') && (
                        <div>
                            <div className="flex justify-between mb-2">
                                <h4 className="font-bold text-[var(--text-normal)]">{activeTab === 'members' ? '成員列表' : '承租人列表'}</h4>
                                <Button 
                                    size="small" 
                                    onClick={() => addItem(activeTab, { id: `${Date.now()}`, name: '', phone: '', notes: '' })}
                                >
                                    + 新增
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(formData[activeTab] as any[]).map((item: any, index: number) => (
                                    <div key={item.id || index} className="flex gap-2 items-center bg-[var(--bg-tertiary)] p-2 rounded">
                                        <input 
                                            placeholder="姓名"
                                            className="border p-1 rounded w-1/4 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                            value={item.name}
                                            onChange={e => updateItem(activeTab, index, { name: e.target.value })}
                                        />
                                        <input 
                                            placeholder="電話"
                                            className="border p-1 rounded w-1/4 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                            value={item.phone}
                                            onChange={e => updateItem(activeTab, index, { phone: e.target.value })}
                                        />
                                        <input 
                                            placeholder="備註"
                                            className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                            value={item.notes || ''}
                                            onChange={e => updateItem(activeTab, index, { notes: e.target.value })}
                                        />
                                        <button onClick={() => removeItem(activeTab, index)} className="text-red-500">✕</button>
                                    </div>
                                ))}
                                {(formData[activeTab] as any[]).length === 0 && <p className="text-center text-[var(--text-muted)]">尚無資料</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'plates' && (
                        <div>
                            <div className="mb-4 bg-[#5865F2] p-3 rounded text-sm text-white font-medium">
                                說明：可從車位系統已登記的車牌中選擇，或直接輸入新車牌（將同步更新至車位）。
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {parkingPlates.map(plate => (
                                    <button 
                                        key={plate}
                                        onClick={() => {
                                            if (!formData.licensePlates.includes(plate)) {
                                                setFormData(prev => ({...prev, licensePlates: [...prev.licensePlates, plate]}));
                                            }
                                        }}
                                        className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 text-black"
                                    >
                                        + {plate}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="space-y-2">
                                {formData.licensePlates.map((plate, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input 
                                            className="border p-2 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)] uppercase"
                                            value={plate}
                                            onChange={e => {
                                                const newPlates = [...formData.licensePlates];
                                                newPlates[index] = e.target.value.toUpperCase();
                                                setFormData({...formData, licensePlates: newPlates});
                                            }}
                                        />
                                        <button onClick={() => {
                                             const newPlates = formData.licensePlates.filter((_, i) => i !== index);
                                             setFormData({...formData, licensePlates: newPlates});
                                        }} className="text-red-500">✕</button>
                                    </div>
                                ))}
                                <Button 
                                    size="small" 
                                    onClick={() => setFormData(prev => ({...prev, licensePlates: [...prev.licensePlates, '']}))}
                                >
                                    + 新增車牌欄位
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <div>
                            <div className="flex gap-2 mb-2 bg-[var(--bg-secondary)] p-1 rounded">
                                <button onClick={() => setCardTab('general')} className={`flex-1 py-1 rounded ${cardTab === 'general' ? 'bg-white shadow' : ''} text-[var(--text-normal)]`}>一般磁扣</button>
                                <button onClick={() => setCardTab('car')} className={`flex-1 py-1 rounded ${cardTab === 'car' ? 'bg-white shadow' : ''} text-[var(--text-normal)]`}>汽車ETC</button>
                                <button onClick={() => setCardTab('other')} className={`flex-1 py-1 rounded ${cardTab === 'other' ? 'bg-white shadow' : ''} text-[var(--text-normal)]`}>其他ETC</button>
                            </div>

                            <div className="space-y-2">
                                {cardTab === 'general' && (
                                    <>
                                        {formData.generalCards.map((card, index) => (
                                            <div key={index} className="flex gap-2 items-center bg-[var(--bg-tertiary)] p-2 rounded">
                                                <input 
                                                    list={`members-${index}`}
                                                    placeholder="選擇成員或輸入"
                                                    className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                                    value={card.member}
                                                    onChange={e => {
                                                        const newCards = [...formData.generalCards];
                                                        newCards[index] = { ...card, member: e.target.value };
                                                        setFormData({...formData, generalCards: newCards});
                                                    }}
                                                />
                                                <datalist id={`members-${index}`}>
                                                    {[...formData.members, ...formData.tenants].map((m: any) => <option key={m.id} value={m.name} />)}
                                                </datalist>
                                                <input 
                                                    placeholder="磁扣號碼"
                                                    className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                                    value={card.cardNumber}
                                                    onChange={e => {
                                                        const newCards = [...formData.generalCards];
                                                        newCards[index] = { ...card, cardNumber: e.target.value };
                                                        setFormData({...formData, generalCards: newCards});
                                                    }}
                                                />
                                                <button onClick={() => {
                                                    const newCards = formData.generalCards.filter((_, i) => i !== index);
                                                    setFormData({...formData, generalCards: newCards});
                                                }} className="text-red-500">✕</button>
                                            </div>
                                        ))}
                                        <Button size="small" onClick={() => addItem('generalCards', { member: '', cardNumber: '' })}>+ 新增</Button>
                                    </>
                                )}
                                
                                {cardTab === 'car' && (
                                    <>
                                        {formData.etcCards.map((card, index) => (
                                            <div key={index} className="flex gap-2 items-center bg-[var(--bg-tertiary)] p-2 rounded">
                                                <select 
                                                    className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                                    value={card.plate}
                                                    onChange={e => {
                                                        const newCards = [...formData.etcCards];
                                                        newCards[index] = { ...card, plate: e.target.value };
                                                        setFormData({...formData, etcCards: newCards});
                                                    }}
                                                >
                                                    <option value="">選擇車牌</option>
                                                    {formData.licensePlates.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                                <input 
                                                    placeholder="磁扣號碼"
                                                    className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                                    value={card.cardNumber}
                                                    onChange={e => {
                                                        const newCards = [...formData.etcCards];
                                                        newCards[index] = { ...card, cardNumber: e.target.value };
                                                        setFormData({...formData, etcCards: newCards});
                                                    }}
                                                />
                                                <button onClick={() => {
                                                    const newCards = formData.etcCards.filter((_, i) => i !== index);
                                                    setFormData({...formData, etcCards: newCards});
                                                }} className="text-red-500">✕</button>
                                            </div>
                                        ))}
                                        <Button size="small" onClick={() => addItem('etcCards', { plate: '', cardNumber: '' })}>+ 新增</Button>
                                    </>
                                )}

                                {cardTab === 'other' && (
                                     <>
                                        {formData.otherEtcCards.map((card, index) => (
                                            <div key={index} className="flex gap-2 items-center bg-[var(--bg-tertiary)] p-2 rounded">
                                                 <input 
                                                    placeholder="類型"
                                                    className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                                    value={card.type}
                                                    onChange={e => {
                                                        const newCards = [...formData.otherEtcCards];
                                                        newCards[index] = { ...card, type: e.target.value };
                                                        setFormData({...formData, otherEtcCards: newCards});
                                                    }}
                                                />
                                                <input 
                                                    placeholder="磁扣號碼"
                                                    className="border p-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                                    value={card.cardNumber}
                                                    onChange={e => {
                                                        const newCards = [...formData.otherEtcCards];
                                                        newCards[index] = { ...card, cardNumber: e.target.value };
                                                        setFormData({...formData, otherEtcCards: newCards});
                                                    }}
                                                />
                                                <button onClick={() => {
                                                    const newCards = formData.otherEtcCards.filter((_, i) => i !== index);
                                                    setFormData({...formData, otherEtcCards: newCards});
                                                }} className="text-red-500">✕</button>
                                            </div>
                                        ))}
                                        <Button size="small" onClick={() => addItem('otherEtcCards', { type: '', cardNumber: '' })}>+ 新增</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-[var(--color-border)]">
                    <Button variant="secondary" onClick={onClose}>取消</Button>
                    <Button variant="primary" onClick={handleSave}>儲存</Button>
                </div>
            </div>
        </div>
    );
};

// 主元件
const ResidentSystem: React.FC = () => {
    const dispatch = useAppDispatch();
    
    // Selectors
    const buildings = useAppSelector(state => state.building.buildings);
    const floors = useAppSelector(state => state.building.floors);
    const units = useAppSelector(state => state.building.units);
    const residents = useAppSelector(state => state.resident.residents);
    const statuses = useAppSelector(state => state.resident.statuses);
    const parkingSpaces = useAppSelector(state => state.parking.spaces);
    
    // State
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
    const [viewingUnitId, setViewingUnitId] = useState<string | null>(null);
    const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
    const [activeView, setActiveView] = useState<'list' | 'grid'>('list');
    
    // 篩選搜尋狀態
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterUnitNumber, setFilterUnitNumber] = useState<string>('all');
    
    // 車牌資料
    const parkingPlates = useMemo(() => {
        const plates = new Set<string>();
        parkingSpaces.forEach(p => {
            if (p.licensePlates && Array.isArray(p.licensePlates)) {
                p.licensePlates.forEach((lp: any) => {
                    if (lp.number) plates.add(lp.number);
                });
            } else if (p.plateNumber) {
                plates.add(p.plateNumber);
            }
        });
        return Array.from(plates);
    }, [parkingSpaces]);

    // 取得該棟的所有戶別（依戶別編號分組，由高樓層向低樓層排列）
    const buildingUnits = useMemo(() => {
        const filteredUnits = units.filter(u => u.buildingId === selectedBuildingId);
        
        // 依樓層排序（由高到低）
        const floorsForBuilding = floors
            .filter(f => f.buildingId === selectedBuildingId && f.floorType === 'residential')
            .sort((a, b) => b.sortOrder - a.sortOrder); // 由高到低
        
        // 建立樓層ID到樓層資訊的映射
        const floorMap = new Map(floorsForBuilding.map(f => [f.id, f]));
        
        // 依戶別編號分組
        const unitGroups = new Map<string, typeof filteredUnits>();
        filteredUnits.forEach(unit => {
            const unitNum = unit.unitNumber;
            if (!unitGroups.has(unitNum)) {
                unitGroups.set(unitNum, []);
            }
            unitGroups.get(unitNum)!.push(unit);
        });
        
        // 對每個戶別組內的單位依樓層排序（由高到低）
        unitGroups.forEach(group => {
            group.sort((a, b) => {
                const floorA = floorMap.get(a.floorId);
                const floorB = floorMap.get(b.floorId);
                return (floorB?.sortOrder || 0) - (floorA?.sortOrder || 0);
            });
        });
        
        return { unitGroups, floorMap };
    }, [units, floors, selectedBuildingId]);

    // 篩選後的戶別列表
    const filteredUnitGroups = useMemo(() => {
        const groups: [string, typeof units][] = [];
        
        buildingUnits.unitGroups.forEach((unitsList, unitNumber) => {
            // 依戶別編號篩選
            if (filterUnitNumber !== 'all' && unitNumber !== filterUnitNumber) {
                return;
            }
            
            // 檢查此戶別下是否有符合條件的單位
            const filteredUnits = unitsList.filter(unit => {
                const resident = residents.find(r => r.unitId === unit.id);
                const status = resident ? statuses.find(s => s.id === resident.statusId) : null;
                
                // 依狀態篩選
                if (filterStatus !== 'all') {
                    if (filterStatus === 'empty') {
                        if (resident) return false;
                    } else if (status?.id !== filterStatus) {
                        return false;
                    }
                }
                
                // 依關鍵字篩選
                if (searchKeyword) {
                    const keyword = searchKeyword.toLowerCase();
                    const matchUnit = unit.unitNumber.toLowerCase().includes(keyword);
                    const matchOwner = resident?.ownerName?.toLowerCase().includes(keyword);
                    const matchPhone = resident?.ownerPhone?.toLowerCase().includes(keyword);
                    const matchTenant = resident?.tenants.some(t => t.name.toLowerCase().includes(keyword));
                    
                    if (!matchUnit && !matchOwner && !matchPhone && !matchTenant) {
                        return false;
                    }
                }
                
                return true;
            });
            
            if (filteredUnits.length > 0) {
                groups.push([unitNumber, filteredUnits]);
            }
        });
        
        // 依戶別編號排序
        groups.sort((a, b) => a[0].localeCompare(b[0]));
        
        return groups;
    }, [buildingUnits, residents, statuses, searchKeyword, filterStatus, filterUnitNumber]);

    // 統計資料
    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        statuses.forEach(s => counts[s.id || 'unknown'] = 0);
        
        const buildingUnitIds = units.filter(u => u.buildingId === selectedBuildingId).map(u => u.id);
        
        residents.forEach(r => {
            if (buildingUnitIds.includes(r.unitId) && r.statusId) {
                counts[r.statusId] = (counts[r.statusId] || 0) + 1;
            }
        });
        
        return counts;
    }, [residents, statuses, units, selectedBuildingId]);

    // 處理單擊（顯示資料卡）
    const handleClick = (unitId: string) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
            // 雙擊 - 顯示編輯介面
            setEditingUnitId(unitId);
        } else {
            // 單擊 - 延遲後顯示資料卡
            const timeout = setTimeout(() => {
                setViewingUnitId(unitId);
                setClickTimeout(null);
            }, 250);
            setClickTimeout(timeout);
        }
    };

    const handleSaveResident = (data: ResidentV2) => {
        dispatch(residentActions.upsertResident(data));
        setEditingUnitId(null);
    };

    // 取得所有戶別編號選項
    const unitNumberOptions = useMemo(() => {
        const numbers = new Set<string>();
        units.filter(u => u.buildingId === selectedBuildingId).forEach(u => {
            numbers.add(u.unitNumber);
        });
        return Array.from(numbers).sort();
    }, [units, selectedBuildingId]);

    // 網格視圖資料準備
    const gridData = useMemo(() => {
        const filteredUnits = units.filter(u => u.buildingId === selectedBuildingId);
        
        // 取得所有戶別編號並排序（X軸）
        const unitNumbers = Array.from(new Set(filteredUnits.map(u => u.unitNumber))).sort();
        
        // 取得所有樓層並由高到低排序（Y軸）
        const floorsForBuilding = floors
            .filter(f => f.buildingId === selectedBuildingId && f.floorType === 'residential')
            .sort((a, b) => b.sortOrder - a.sortOrder);
        
        // 建立資料映射
        interface GridUnitData {
            unit: typeof filteredUnits[0];
            resident?: typeof residents[0];
            status?: typeof statuses[0];
            parkingSpaces: typeof parkingSpaces;
        }
        
        const dataMap = new Map<string, GridUnitData>();
        
        filteredUnits.forEach(unit => {
            const resident = residents.find(r => r.unitId === unit.id);
            const status = resident ? statuses.find(s => s.id === resident.statusId) : undefined;
            const unitParkingSpaces = parkingSpaces.filter(p => p.occupantUnitId === unit.id);
            
            // 套用篩選
            if (filterUnitNumber !== 'all' && unit.unitNumber !== filterUnitNumber) return;
            if (filterStatus !== 'all') {
                if (filterStatus === 'empty' && resident) return;
                if (filterStatus !== 'empty' && status?.id !== filterStatus) return;
            }
            if (searchKeyword) {
                const keyword = searchKeyword.toLowerCase();
                const matchOwner = resident?.ownerName?.toLowerCase().includes(keyword);
                const matchPhone = resident?.ownerPhone?.toLowerCase().includes(keyword);
                if (!matchOwner && !matchPhone) return;
            }
            
            dataMap.set(unit.id, {
                unit,
                resident,
                status,
                parkingSpaces: unitParkingSpaces
            });
        });
        
        return { unitNumbers, floors: floorsForBuilding, dataMap };
    }, [units, floors, residents, statuses, parkingSpaces, selectedBuildingId, filterUnitNumber, filterStatus, searchKeyword]);

    return (
        <div className="p-6 flex gap-6">
            {/* 左側主內容 */}
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-6">住戶系統</h2>

                {/* 棟別分頁 */}
                <div className="flex gap-2 mb-4 border-b border-[var(--color-border)] overflow-x-auto">
                    {buildings.map(b => (
                        <button
                            key={b.id}
                            onClick={() => setSelectedBuildingId(b.id)}
                            className={`px-4 py-2 whitespace-nowrap ${selectedBuildingId === b.id ? 'border-b-2 border-[#5a7fd6] text-[#5a7fd6] font-bold' : 'text-[var(--text-muted)]'}`}
                        >
                            {b.buildingCode}棟
                        </button>
                    ))}
                </div>

                {/* 視圖切換書籤 */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveView('list')}
                        className={`px-4 py-2 rounded-t-lg ${activeView === 'list' ? 'bg-[var(--bg-floating)] border-t border-l border-r border-[var(--color-border)] text-[var(--text-normal)] font-bold' : 'text-[var(--text-muted)]'}`}
                    >
                        列表檢視
                    </button>
                    <button
                        onClick={() => setActiveView('grid')}
                        className={`px-4 py-2 rounded-t-lg ${activeView === 'grid' ? 'bg-[var(--bg-floating)] border-t border-l border-r border-[var(--color-border)] text-[var(--text-normal)] font-bold' : 'text-[var(--text-muted)]'}`}
                    >
                        棟別總覽
                    </button>
                </div>

                {/* 統計 Header */}
                <div className="flex gap-4 mb-6 bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto">
                    {statuses.map(status => (
                        <div key={status.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                            <span className="text-[var(--text-normal)]">{status.name}:</span>
                            <span className="font-bold text-[var(--text-normal)]">{stats[status.id || 'unknown'] || 0}</span>
                        </div>
                    ))}
                </div>

                {/* 列表視圖 */}
                {activeView === 'list' && (
                <div className="space-y-2">
                    {filteredUnitGroups.map(([unitNumber, unitList]) => (
                        <div key={unitNumber} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                            {/* 戶別標題 */}
                            <div className="bg-[var(--bg-secondary)] px-4 py-2 font-bold text-[var(--text-normal)]">
                                {unitNumber}
                            </div>
                            {/* 該戶別的所有單位（不同樓層） */}
                            <div className="divide-y divide-[var(--color-border)]">
                                {unitList.map(unit => {
                                    const resident = residents.find(r => r.unitId === unit.id);
                                    const status = resident ? statuses.find(s => s.id === resident.statusId) : null;
                                    const floor = buildingUnits.floorMap.get(unit.floorId);
                                    const unitParkingSpaces = parkingSpaces.filter(p => p.occupantUnitId === unit.id);
                                    
                                    return (
                                        <div 
                                            key={unit.id}
                                            onClick={() => handleClick(unit.id)}
                                            className="p-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* 狀態標籤 */}
                                                <div 
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: status?.color || '#ccc' }}
                                                />
                                                
                                                {/* 戶別資訊 */}
                                                <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                                                    <div className="font-bold text-[var(--text-normal)]">{unit.unitNumber}</div>
                                                    <div className="text-sm text-[var(--text-muted)]">{floor?.name || '-'}</div>
                                                    
                                                    {/* 車位資訊 */}
                                                    <div className="text-sm">
                                                        {unitParkingSpaces.length > 0 ? (
                                                            <span className="text-blue-600">
                                                                車位 {unitParkingSpaces.map(p => p.number).join(', ')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[var(--text-muted)]">無車位</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* 狀態 */}
                                                    <div>
                                                        <span 
                                                            className="px-2 py-0.5 rounded text-xs text-white"
                                                            style={{ backgroundColor: status?.color || '#999' }}
                                                        >
                                                            {status?.name || '空屋'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* 區權人 */}
                                                    <div>
                                                        <span className="text-sm text-[var(--text-muted)]">區權人: </span>
                                                        <span className="text-sm text-[var(--text-normal)]">{resident?.ownerName || '-'}</span>
                                                        {resident?.ownerPhone && (
                                                            <span className="text-xs text-[var(--text-muted)] ml-1">({resident.ownerPhone})</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* 承租人 */}
                                                    <div>
                                                        {resident && resident.tenants && resident.tenants.length > 0 ? (
                                                            <>
                                                                <span className="text-sm text-[var(--text-muted)]">承租人: </span>
                                                                <span className="text-sm text-[var(--text-normal)]">{resident.tenants[0].name}</span>
                                                                {resident.tenants[0].phone && (
                                                                    <span className="text-xs text-[var(--text-muted)] ml-1">({resident.tenants[0].phone})</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-[var(--text-muted)]">無承租人</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {filteredUnitGroups.length === 0 && (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            沒有符合篩選條件的戶別資料
                        </div>
                    )}
                </div>
                )}

                {/* 網格視圖 - 棟別總覽 */}
                {activeView === 'grid' && (
                <div className="overflow-auto">
                    {gridData.unitNumbers.length === 0 || gridData.floors.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            沒有符合篩選條件的戶別資料
                        </div>
                    ) : (
                    <div className="inline-block">
                        {/* 表頭 - 戶別名稱（X軸） */}
                        <div className="flex">
                            <div className="w-20 flex-shrink-0"></div>
                            {gridData.unitNumbers.map(unitNum => (
                                <div key={unitNum} className="w-32 text-center py-2 font-bold text-[var(--text-normal)] border-b border-[var(--color-border)]">
                                    {unitNum}
                                </div>
                            ))}
                        </div>
                        
                        {/* 網格內容 */}
                        {gridData.floors.map(floor => (
                            <div key={floor.id} className="flex">
                                {/* 樓層名稱（Y軸） */}
                                <div className="w-20 flex-shrink-0 flex items-center justify-center font-bold text-[var(--text-normal)] border-r border-[var(--color-border)] py-2">
                                    {floor.name}
                                </div>
                                
                                {/* 該樓層的所有戶別 */}
                                <div className="flex">
                                    {gridData.unitNumbers.map(unitNum => {
                                        // 找到該戶別在該樓層的單位
                                        const unit = units.find(u => 
                                            u.buildingId === selectedBuildingId && 
                                            u.floorId === floor.id && 
                                            u.unitNumber === unitNum
                                        );
                                        
                                        if (!unit) {
                                            return (
                                                <div key={`${floor.id}-${unitNum}`} className="w-32 h-32 border border-[var(--color-border)] bg-[var(--bg-secondary)] opacity-50">
                                                <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                                                    -
                                                </div>
                                                </div>
                                            );
                                        }
                                        
                                        const data = gridData.dataMap.get(unit.id);
                                        
                                        if (!data) {
                                            return (
                                                <div key={unit.id} className="w-32 h-32 border border-[var(--color-border)] bg-[var(--bg-secondary)]">
                                                    <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                                                        -
                                                    </div>
                                                </div>
                                            );
                                        }
                                        
                                        const { resident, status, parkingSpaces: unitParkingSpaces } = data;
                                        
                                        return (
                                            <div 
                                                key={unit.id}
                                                onClick={() => handleClick(unit.id)}
                                                className="w-32 h-32 border border-[var(--color-border)] cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                                                style={{ backgroundColor: status?.color + '20' || 'var(--bg-card)' }}
                                            >
                                                <div className="h-full p-2 flex flex-col text-xs">
                                                    {/* 狀態標籤 */}
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span 
                                                            className="px-1.5 py-0.5 rounded text-white text-[10px]"
                                                            style={{ backgroundColor: status?.color || '#999' }}
                                                        >
                                                            {status?.name || '空'}
                                                        </span>
                                                        <span className="text-[10px] text-[var(--text-muted)]">{unit.unitNumber}</span>
                                                    </div>
                                                    
                                                    {/* 區權人 */}
                                                    <div className="flex-1">
                                                        <div className="text-[var(--text-normal)] font-medium truncate">
                                                            {resident?.ownerName || '未登記'}
                                                        </div>
                                                        {resident?.ownerPhone && (
                                                            <div className="text-[10px] text-[var(--text-muted)] truncate">
                                                                {resident.ownerPhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* 承租人 */}
                                                    {resident && resident.tenants && resident.tenants.length > 0 && (
                                                        <div className="mt-1">
                                                            <div className="text-[10px] text-[var(--text-muted)]">承租人:</div>
                                                            <div className="text-[var(--text-normal)] truncate">
                                                                {resident.tenants[0].name}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* 車位 */}
                                                    {unitParkingSpaces.length > 0 && (
                                                        <div className="mt-auto pt-1 border-t border-[var(--color-border)]">
                                                            <div className="text-[10px] text-blue-600 truncate">
                                                                車位: {unitParkingSpaces.map(p => p.number).join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* 右側篩選面板 */}
            <div className="w-64 flex-shrink-0">
                <div className="bg-[var(--bg-floating)] p-4 rounded-lg border border-[var(--color-border)] sticky top-6">
                    <h3 className="font-bold text-[var(--text-normal)] mb-4">篩選搜尋</h3>
                    
                    {/* 關鍵字搜尋 */}
                    <div className="mb-4">
                        <label className="block text-sm text-[var(--text-muted)] mb-1">關鍵字搜尋</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                            placeholder="姓名、電話..."
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                        />
                    </div>
                    
                    {/* 戶別篩選 */}
                    <div className="mb-4">
                        <label className="block text-sm text-[var(--text-muted)] mb-1">戶別</label>
                        <select
                            className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                            value={filterUnitNumber}
                            onChange={e => setFilterUnitNumber(e.target.value)}
                        >
                            <option value="all">全部戶別</option>
                            {unitNumberOptions.map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* 狀態篩選 */}
                    <div className="mb-4">
                        <label className="block text-sm text-[var(--text-muted)] mb-1">狀態</label>
                        <select
                            className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="all">全部狀態</option>
                            <option value="empty">空屋</option>
                            {statuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* 清除篩選 */}
                    <Button 
                        variant="secondary" 
                        size="small" 
                        className="w-full"
                        onClick={() => {
                            setSearchKeyword('');
                            setFilterStatus('all');
                            setFilterUnitNumber('all');
                        }}
                    >
                        清除篩選
                    </Button>
                </div>
            </div>

            {/* 資料卡模態框 */}
            {viewingUnitId && (
                <ResidentCardModal
                    unitId={viewingUnitId}
                    unitName={units.find(u => u.id === viewingUnitId)?.unitNumber || ''}
                    floorName={buildingUnits.floorMap.get(units.find(u => u.id === viewingUnitId)?.floorId || '')?.name || ''}
                    existingData={residents.find(r => r.unitId === viewingUnitId)}
                    onClose={() => setViewingUnitId(null)}
                    onEdit={() => {
                        setViewingUnitId(null);
                        setEditingUnitId(viewingUnitId);
                    }}
                    statuses={statuses}
                    parkingSpaces={parkingSpaces}
                />
            )}

            {/* 編輯模態框 */}
            {editingUnitId && (
                <ResidentEditModal
                    unitId={editingUnitId}
                    unitName={units.find(u => u.id === editingUnitId)?.unitNumber || ''}
                    existingData={residents.find(r => r.unitId === editingUnitId)}
                    onClose={() => setEditingUnitId(null)}
                    onSave={handleSaveResident}
                    statuses={statuses}
                    parkingPlates={parkingPlates}
                />
            )}
        </div>
    );
};

export default ResidentSystem;
