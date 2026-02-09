import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { parkingActions, ParkingSpaceType } from '../../store/modules/parking';
import { ParkingSpace, StatusConfig, ParkingZoneConfig } from '../../types/domain';
import '../../assets/styles/parking.css';

// Modal for editing Parking Space
const ParkingEditModal: React.FC<{
    space: ParkingSpace;
    onClose: () => void;
    onSave: (id: string, updates: Partial<ParkingSpace>) => void;
    statuses: StatusConfig[];
    buildings: any[];
    units: any[];
}> = ({ space, onClose, onSave, statuses, buildings, units }) => {
    const [formData, setFormData] = useState<Partial<ParkingSpace>>({
        status: space.status,
        note: space.note || '',
        occupantType: space.occupantType || 'owner',
        occupantName: space.occupantName || '',
        occupantBuildingId: space.occupantBuildingId || '',
        occupantUnitId: space.occupantUnitId || '',
        licensePlates: space.licensePlates && space.licensePlates.length > 0 ? space.licensePlates : [{ number: '', note: '' }]
    });

    // Helper to add plate
    const addPlate = () => {
        setFormData(prev => ({
            ...prev,
            licensePlates: [...(prev.licensePlates || []), { number: '', note: '' }]
        }));
    };

    // Helper to update plate
    const updatePlate = (index: number, field: 'number' | 'note', value: string) => {
        const newPlates = [...(formData.licensePlates || [])];
        newPlates[index] = { ...newPlates[index], [field]: value };
        setFormData({ ...formData, licensePlates: newPlates });
    };

    // Helper to remove plate
    const removePlate = (index: number) => {
        const newPlates = [...(formData.licensePlates || [])];
        if (newPlates.length > 1) {
            newPlates.splice(index, 1);
            setFormData({ ...formData, licensePlates: newPlates });
        } else {
            newPlates[0] = { number: '', note: '' };
            setFormData({ ...formData, licensePlates: newPlates });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] backdrop-blur-sm">
            <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--color-border)]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[var(--text-normal)]">編輯車位 {space.number}</h3>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-normal)]">✕</button>
                </div>

                <div className="space-y-4">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">狀態</label>
                        <select
                            className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="available">可租用</option>
                            <option value="occupied">已佔用</option>
                            <option value="reserved">保留</option>
                            <option value="maintenance">維護中</option>
                        </select>
                    </div>

                    {/* Note (Always visible, below status) */}
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">備註</label>
                        <textarea
                            className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            rows={2}
                            placeholder="輸入備註..."
                        />
                    </div>

                    {/* Occupant Type */}
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">承租人類型</label>
                        <div className="flex gap-2">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={formData.occupantType === 'owner'}
                                    onChange={() => setFormData({ ...formData, occupantType: 'owner' })}
                                />
                                車位主
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={formData.occupantType === 'custom_tenant'}
                                    onChange={() => setFormData({ ...formData, occupantType: 'custom_tenant' })}
                                />
                                自訂承租人
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={formData.occupantType === 'resident_tenant'}
                                    onChange={e => setFormData({ ...formData, occupantType: e.target.checked ? 'resident_tenant' : 'owner' })}
                                />
                                其他住戶承租
                            </label>
                        </div>
                    </div>

                    {/* Occupant Details based on type */}
                    {formData.occupantType === 'custom_tenant' && (
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">承租人姓名</label>
                            <input
                                className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                value={formData.occupantName}
                                onChange={e => setFormData({ ...formData, occupantName: e.target.value })}
                                placeholder="輸入姓名"
                            />
                        </div>
                    )}

                    {(formData.occupantType === 'owner' || formData.occupantType === 'resident_tenant') && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-1">棟別</label>
                                <select
                                    className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                    value={formData.occupantBuildingId}
                                    onChange={e => setFormData({ ...formData, occupantBuildingId: e.target.value })}
                                >
                                    <option value="">選擇棟別</option>
                                    {buildings.map(b => <option key={b.id} value={b.id}>{b.buildingCode}棟</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-1">戶別</label>
                                <select
                                    className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                    value={formData.occupantUnitId}
                                    onChange={e => setFormData({ ...formData, occupantUnitId: e.target.value })}
                                >
                                    <option value="">選擇戶別</option>
                                    {units
                                        .filter(u => u.buildingId === formData.occupantBuildingId)
                                        .map(u => <option key={u.id} value={u.id}>{u.unitNumber}</option>)
                                    }
                                </select>
                            </div>
                        </div>
                    )}

                    {/* License Plates */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm text-[var(--text-muted)]">車牌號碼</label>
                            <Button size="small" onClick={addPlate}>+ 新增車牌</Button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 border p-2 rounded bg-[var(--bg-secondary)]">
                            {formData.licensePlates?.map((plate, index) => (
                                <div key={index} className="flex flex-col gap-1 bg-[var(--bg-primary)] p-2 rounded border border-[var(--color-border)]">
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 border p-1 rounded uppercase bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                                            value={plate.number}
                                            onChange={e => updatePlate(index, 'number', e.target.value.toUpperCase())}
                                            placeholder="車牌號碼"
                                        />
                                        <button onClick={() => removePlate(index)} className="text-red-500 font-bold px-2">✕</button>
                                    </div>
                                    <input
                                        className="w-full border p-1 rounded text-sm bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                                        value={plate.note || ''}
                                        onChange={e => updatePlate(index, 'note', e.target.value)}
                                        placeholder="車牌備註..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t pt-4 border-[var(--color-border)]">
                    <Button variant="secondary" onClick={onClose}>取消</Button>
                    <Button variant="primary" onClick={() => onSave(space.id, formData)}>儲存</Button>
                </div>
            </div>
        </div>
    );
};

const ParkingSystem: React.FC = () => {
    const dispatch = useAppDispatch();
    
    // Selectors - 直接从 parking.spaces 读取车位数据（车位设定页面写入的位置）
    const buildings = useAppSelector(state => state.building.buildings);
    const floors = useAppSelector(state => state.building.floors);
    const units = useAppSelector(state => state.building.units);
    const parkingStatuses = useAppSelector((state: any) => state.config.parkingStatuses) as StatusConfig[];
    const spaceTypes = useAppSelector((state: any) => state.parking.spaceTypes) as ParkingSpaceType[] || [];
    const allZones = useAppSelector((state: any) => state.parking.zones) as ParkingZoneConfig[] || [];
    const { spaces } = useAppSelector(state => state.parking);

    // Local State
    const [selectedFloorId, setSelectedFloorId] = useState<string>('');
    const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
    const [searchText, setSearchText] = useState('');
    const [editingSpace, setEditingSpace] = useState<ParkingSpace | null>(null);
    const [expandedPlates, setExpandedPlates] = useState<Record<string, boolean>>({});

    // Data Preparation
    const basementFloors = useMemo(() => {
        return floors.filter(f => f.floorType === 'basement').sort((a, b) => a.sortOrder - b.sortOrder);
    }, [floors]);

    // Default select first floor
    useEffect(() => {
        if (!selectedFloorId && basementFloors.length > 0) {
            setSelectedFloorId(basementFloors[0].id);
        }
    }, [basementFloors, selectedFloorId]);

    // 根据选中的楼层获取对应的 zone IDs
    const currentFloorZones = useMemo(() => {
        if (!selectedFloorId) return [];
        return allZones.filter(z => z.floorId === selectedFloorId);
    }, [allZones, selectedFloorId]);

    const currentZoneIds = useMemo(() => {
        return currentFloorZones.map(z => z.id);
    }, [currentFloorZones]);

    // Filter Logic - Enhanced search for tenant, resident, note, and plate number
    const filteredSpaces = useMemo(() => {
        let result = spaces;

        // 1. Filter by Floor (通过 zone 关联)
        if (selectedFloorId && currentZoneIds.length > 0) {
            result = result.filter(s => currentZoneIds.includes(s.area));
        }

        // 2. Filter by Search - Targeted search for tenant, resident, note, plate number
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(s => {
                // Search by parking space number
                if (s.number.toLowerCase().includes(lowerSearch)) return true;

                // Search by note (備註)
                if (s.note?.toLowerCase().includes(lowerSearch)) return true;

                // Search by occupant name (承租人)
                if (s.occupantName?.toLowerCase().includes(lowerSearch)) return true;

                // Search by resident unit (住戶 - for owner and resident_tenant)
                if (s.occupantUnitId) {
                    const unit = units.find(u => u.id === s.occupantUnitId);
                    if (unit && unit.unitNumber.toLowerCase().includes(lowerSearch)) return true;
                }

                // Search by license plate numbers (車牌)
                if (s.licensePlates?.some(p => p.number.toLowerCase().includes(lowerSearch))) return true;

                // Search by plate notes (車牌備註)
                if (s.licensePlates?.some(p => p.note?.toLowerCase().includes(lowerSearch))) return true;

                return false;
            });
        }

        // 3. Filter by Type Tab
        if (activeTypeTab !== 'all') {
            result = result.filter(s => s.type === activeTypeTab);
        }

        return result;
    }, [spaces, selectedFloorId, currentZoneIds, searchText, activeTypeTab, units]);

    // Type Counts for Current Floor
    const typeCounts = useMemo(() => {
        const floorSpaces = selectedFloorId && currentZoneIds.length > 0
            ? spaces.filter(s => currentZoneIds.includes(s.area))
            : spaces;
        const counts: Record<string, number> = { all: floorSpaces.length };
        
        // Count built-in types
        ['resident', 'visitor', 'reserved', 'disabled'].forEach(t => counts[t] = 0);
        // Count custom types
        spaceTypes.forEach(t => counts[t.code] = 0);

        floorSpaces.forEach(s => {
            counts[s.type] = (counts[s.type] || 0) + 1;
        });
        
        return counts;
    }, [spaces, selectedFloorId, currentZoneIds, spaceTypes]);

    // Helper to get type name
    const getTypeName = (code: string) => {
        const map: Record<string, string> = {
            'resident': '住戶',
            'visitor': '訪客',
            'reserved': '保留',
            'disabled': '身障',
            'all': '全部'
        };
        const customType = spaceTypes.find(t => t.code === code);
        return customType ? customType.name : (map[code] || code);
    };

    // Helper to get status color
    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            'available': '可租用',
            'occupied': '已佔用',
            'reserved': '保留',
            'maintenance': '維護中'
        };
        const targetName = map[status];
        const config = parkingStatuses.find(s => s.name === targetName);
        return config ? config.color : '#ccc';
    };

    const handleSaveSpace = (id: string, updates: Partial<ParkingSpace>) => {
        dispatch(parkingActions.updateParkingSpace({ id, updates }));
        setEditingSpace(null);
    };

    const resolveOccupantName = (space: ParkingSpace) => {
        if (space.occupantType === 'custom_tenant') return space.occupantName;
        if (space.occupantType === 'owner' || space.occupantType === 'resident_tenant') {
            if (space.occupantUnitId) {
                const unit = units.find(u => u.id === space.occupantUnitId);
                return unit ? `${unit.unitNumber} (${space.occupantName || '住戶'})` : space.occupantName;
            }
        }
        return space.occupantName;
    };

    const getStatusName = (status: string) => {
         const map: Record<string, string> = {
            'available': '可租用',
            'occupied': '已佔用',
            'reserved': '保留',
            'maintenance': '維護中'
        };
        return map[status] || status;
    }

    const togglePlates = (id: string) => {
        setExpandedPlates(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-6 h-full flex flex-col bg-[var(--bg-primary)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border)]">
                <h2 className="text-3xl font-bold text-[var(--text-normal)]">車位系統</h2>
                <div className="flex items-center gap-4">
                    <input 
                        className="border p-2 rounded w-80 bg-[var(--bg-primary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5a7fd6]"
                        placeholder="搜尋：承租人、住戶、備註、車牌..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <IntroductionButton pageId="parking" />
                </div>
            </div>

            {/* Floor Sections (Tabs) */}
            {basementFloors.length > 0 ? (
                <div className="space-y-6">
                    {/* Floor Tabs */}
                    <div className="flex border-b border-[var(--color-border)] mb-4 overflow-x-auto">
                        {basementFloors.map(floor => (
                            <button
                                key={floor.id}
                                onClick={() => setSelectedFloorId(floor.id)}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${selectedFloorId === floor.id ? 'border-b-2 border-[#5a7fd6] text-[#5a7fd6]' : 'text-[var(--text-muted)] hover:text-[var(--text-normal)]'}`}
                            >
                                {floor.name}
                            </button>
                        ))}
                    </div>

                    {/* Type Tabs within Floor */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                            onClick={() => setActiveTypeTab('all')}
                            className={`px-3 py-1 rounded-full text-sm ${activeTypeTab === 'all' ? 'bg-[#5a7fd6] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
                        >
                            全部 ({typeCounts['all']})
                        </button>
                        {Array.from(new Set(['resident', 'visitor', 'reserved', 'disabled', ...spaceTypes.map(t => t.code)])).map(typeCode => {
                            if (typeCounts[typeCode] === 0 && typeCode !== 'resident') return null; // Hide empty except default
                            return (
                                <button
                                    key={typeCode}
                                    onClick={() => setActiveTypeTab(typeCode)}
                                    className={`px-3 py-1 rounded-full text-sm ${activeTypeTab === typeCode ? 'bg-[#5a7fd6] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
                                >
                                    {getTypeName(typeCode)} ({typeCounts[typeCode] || 0})
                                </button>
                            );
                        })}
                    </div>

                    {/* Parking List (Horizontal Cards with Scroll) */}
                    <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[60vh] pr-2">
                        {filteredSpaces.map(space => (
                            <div 
                                key={space.id} 
                                onClick={() => setEditingSpace(space)}
                                className="cursor-pointer hover:shadow-md transition-all border-l-4 relative bg-[var(--bg-card)] rounded shadow-sm border border-[var(--color-border)]"
                                style={{ borderLeftColor: getStatusColor(space.status) }}
                            >
                                <div className="p-3">
                                    {/* Top Row: Number (Left) & Status (Right) */}
                                    <div className="flex justify-between items-start">
                                        <span className="font-mono font-bold text-lg text-[var(--text-normal)]">{space.number}</span>
                                        <span 
                                            className="text-xs px-2 py-0.5 rounded text-white"
                                            style={{ backgroundColor: getStatusColor(space.status) }}
                                        >
                                            {getStatusName(space.status)}
                                        </span>
                                    </div>

                                    {/* Second Row: Occupant Info */}
                                    <div className="text-sm font-medium text-[var(--text-normal)] mt-2">
                                        👤 {resolveOccupantName(space) || <span className="text-[var(--text-muted)] italic">無使用者</span>}
                                    </div>

                                    {/* Third Row: Note (if exists) */}
                                    {space.note && (
                                        <div className="text-xs text-[var(--text-muted)] mt-1 truncate bg-[var(--bg-secondary)] p-1 rounded">
                                            📝 {space.note}
                                        </div>
                                    )}

                                    {/* Fourth Row: Plates (if exists) */}
                                    {space.licensePlates && space.licensePlates.length > 0 && (
                                        <div className="mt-1">
                                            <div className="relative group">
                                                <div 
                                                    className="flex items-center justify-between bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs text-[var(--text-normal)] border border-[var(--color-border)]"
                                                    onClick={(e) => {
                                                        if (space.licensePlates && space.licensePlates.length > 1) {
                                                            e.stopPropagation();
                                                            togglePlates(space.id);
                                                        }
                                                    }}
                                                >
                                                    <span className="font-mono font-bold">
                                                        {space.licensePlates[0].number}
                                                        {space.licensePlates.length > 1 && ` +${space.licensePlates.length - 1}`}
                                                    </span>
                                                    {space.licensePlates.length > 1 && (
                                                        <span className="text-[10px] transform transition-transform duration-200" style={{ transform: expandedPlates[space.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                                    )}
                                                </div>
                                                
                                                {/* Expanded List */}
                                                {expandedPlates[space.id] && space.licensePlates.length > 1 && (
                                                    <div className="absolute left-0 top-full mt-1 w-full bg-[var(--bg-floating)] border border-[var(--color-border)] rounded shadow-lg z-10 p-1">
                                                        {space.licensePlates.slice(1).map((p, idx) => (
                                                            <div key={idx} className="text-xs p-1 border-b border-[var(--color-border)] last:border-0 text-[var(--text-normal)]">
                                                                <div className="font-mono font-bold">{p.number}</div>
                                                                {p.note && <div className="text-[var(--text-muted)]">{p.note}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredSpaces.length === 0 && (
                            <div className="text-center text-[var(--text-muted)] py-10 italic">
                                此篩選條件下無車位資料
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-[var(--text-muted)] py-10">
                    尚無樓層資料，請先至後台設定棟數與樓層。
                </div>
            )}

            {editingSpace && (
                <ParkingEditModal 
                    space={editingSpace}
                    onClose={() => setEditingSpace(null)}
                    onSave={handleSaveSpace}
                    statuses={parkingStatuses}
                    buildings={buildings}
                    units={units}
                />
            )}
        </div>
    );
};

export default ParkingSystem;
