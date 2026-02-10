import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { residentActions } from '../../store/modules/resident';
import { Resident, AccessCard, LicensePlate, ResidentStats } from '../../types/domain';
import '../../assets/styles/resident.css';

const ResidentSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { residents, accessCards, licensePlates, stats, loading } = useAppSelector(state => state.resident);
  const [selectedResident, setSelectedResident] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'residents' | 'cards' | 'plates'>('residents');

  useEffect(() => {
    const mockResidents: Resident[] = [
      {
        id: 'R001',
        unitId: 'U001',
        name: '張大明',
        phone: '0912-345-678',
        email: 'zhang@email.com',
        members: [
          { name: '張大明', relationship: 'owner', idNumber: 'A123456789', phone: '0912-345-678' },
          { name: '李小華', relationship: 'spouse', idNumber: 'B987654321', phone: '0987-654-321' },
          { name: '張小寶', relationship: 'child', idNumber: 'C456789123', phone: '' },
        ],
        moveInDate: new Date('2023-01-15'),
        status: 'active',
        emergencyContact: { name: '張母', phone: '0933-222-333', relationship: 'parent' },
      },
      {
        id: 'R002',
        unitId: 'U002',
        name: '王小芳',
        phone: '0922-111-222',
        email: 'wang@email.com',
        members: [
          { name: '王小芳', relationship: 'owner', idNumber: 'D111222333', phone: '0922-111-222' },
          { name: '陳先生', relationship: 'spouse', idNumber: 'E444555666', phone: '0911-999-888' },
        ],
        moveInDate: new Date('2022-08-20'),
        status: 'active',
        emergencyContact: { name: '王父', phone: '0944-777-555', relationship: 'parent' },
      },
      {
        id: 'R003',
        unitId: 'U003',
        name: '林先生',
        phone: '0955-333-444',
        email: 'lin@email.com',
        members: [
          { name: '林先生', relationship: 'owner', idNumber: 'F777888999', phone: '0955-333-444' },
        ],
        moveInDate: new Date('2023-03-10'),
        status: 'pending',
        emergencyContact: { name: '林妻', phone: '0966-111-222', relationship: 'spouse' },
      },
      {
        id: 'R004',
        unitId: 'U004',
        name: '陳小美',
        phone: '0988-777-666',
        email: 'chen@email.com',
        members: [
          { name: '陳小美', relationship: 'tenant', idNumber: 'G123456789', phone: '0988-777-666' },
        ],
        moveInDate: new Date('2024-01-01'),
        status: 'active',
        emergencyContact: { name: '陳老板', phone: '0999-888-777', relationship: 'other' },
      },
    ];

    const mockAccessCards: AccessCard[] = [
      { id: 'CARD001', residentId: 'R001', cardNumber: '1001-0001-0001', memberId: 'A123456789', status: 'active', issuedDate: new Date('2023-01-15'), expiryDate: new Date('2025-01-15'), accessLevel: 'full' },
      { id: 'CARD002', residentId: 'R001', cardNumber: '1001-0001-0002', memberId: 'B987654321', status: 'active', issuedDate: new Date('2023-01-15'), expiryDate: new Date('2025-01-15'), accessLevel: 'full' },
      { id: 'CARD003', residentId: 'R001', cardNumber: '1001-0001-0003', memberId: 'C456789123', status: 'active', issuedDate: new Date('2023-01-15'), expiryDate: new Date('2025-01-15'), accessLevel: 'limited' },
      { id: 'CARD004', residentId: 'R002', cardNumber: '1001-0002-0001', memberId: 'D111222333', status: 'active', issuedDate: new Date('2022-08-20'), expiryDate: new Date('2024-08-20'), accessLevel: 'full' },
      { id: 'CARD005', residentId: 'R002', cardNumber: '1001-0002-0002', memberId: 'E444555666', status: 'lost', issuedDate: new Date('2022-08-20'), expiryDate: new Date('2024-08-20'), accessLevel: 'full', reportedDate: new Date('2024-01-10') },
      { id: 'CARD006', residentId: 'R004', cardNumber: '1001-0004-0001', memberId: 'G123456789', status: 'active', issuedDate: new Date('2024-01-01'), expiryDate: new Date('2026-01-01'), accessLevel: 'limited' },
    ];

    const mockLicensePlates: LicensePlate[] = [
      { id: 'LP001', residentId: 'R001', plateNumber: 'ABC-1234', vehicleType: 'car', ownerName: '張大明', registrationDate: new Date('2023-01-15'), status: 'active' },
      { id: 'LP002', residentId: 'R001', plateNumber: 'XYZ-5678', vehicleType: 'motorcycle', ownerName: '李小華', registrationDate: new Date('2023-01-15'), status: 'active' },
      { id: 'LP003', residentId: 'R002', plateNumber: 'DEF-9012', vehicleType: 'car', ownerName: '王小芳', registrationDate: new Date('2022-08-20'), status: 'active' },
      { id: 'LP004', residentId: 'R003', plateNumber: 'GHI-3456', vehicleType: 'car', ownerName: '林先生', registrationDate: new Date('2023-03-10'), status: 'pending' },
      { id: 'LP005', residentId: 'R004', plateNumber: 'JKL-7890', vehicleType: 'motorcycle', ownerName: '陳小美', registrationDate: new Date('2024-01-01'), status: 'active' },
    ];

    dispatch(residentActions.initializeResidents(mockResidents));
    dispatch(residentActions.initializeAccessCards(mockAccessCards));
    dispatch(residentActions.initializeLicensePlates(mockLicensePlates));
  }, [dispatch]);

  useEffect(() => {
    const statsData: ResidentStats = {
      totalResidents: residents.length,
      activeResidents: residents.filter(r => r.status === 'active').length,
      pendingResidents: residents.filter(r => r.status === 'pending').length,
      totalMembers: residents.reduce((sum, r) => sum + r.members.length, 0),
      activeAccessCards: accessCards.filter(c => c.status === 'active').length,
      expiredAccessCards: accessCards.filter(c => {
        const expiryDate = typeof c.expiryDate === 'string' ? new Date(c.expiryDate) : c.expiryDate;
        return expiryDate < new Date();
      }).length,
      lostAccessCards: accessCards.filter(c => c.status === 'lost').length,
      registeredPlates: licensePlates.filter(p => p.status === 'active').length,
      pendingPlates: licensePlates.filter(p => p.status === 'pending').length,
    };

    dispatch(residentActions.updateStats(statsData));
  }, [residents, accessCards, licensePlates, dispatch]);

  const filteredResidents = residents.filter(resident =>
    (selectedResident === 'all' || resident.id === selectedResident) &&
    (searchQuery === '' ||
      (resident.name || resident.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.unitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resident.phone || (resident as any).ownerPhone || '').includes(searchQuery)
    )
  );

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'var(--color-status-available)',
      pending: 'var(--color-status-reserved)',
      inactive: 'var(--color-secondary)',
      lost: 'var(--color-status-maintenance)',
      expired: 'var(--color-danger)',
    };
    return colors[status as keyof typeof colors] || 'var(--color-secondary)';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      active: '有效',
      pending: '待確認',
      inactive: '無效',
      lost: '遺失',
      expired: '已過期',
      owner: '業主',
      spouse: '配偶',
      child: '子女',
      parent: '父母',
      tenant: '租客',
      other: '其他',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const handleResidentClick = (resident: Resident) => {
    console.log('点击住户:', resident);
  };

  const handleCardAction = (card: AccessCard, action: 'activate' | 'deactivate' | 'renew' | 'reportLost') => {
    console.log('门禁卡操作:', card, action);
  };

  const handlePlateAction = (plate: LicensePlate, action: 'activate' | 'deactivate' | 'update') => {
    console.log('车牌操作:', plate, action);
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="resident-system animate-fade-in">
      <div className="resident-header">
        <h1>住戶管理系統</h1>
        <div className="resident-actions">
          <Button variant="primary" onClick={() => { }}>
            新增住戶
          </Button>
        </div>
      </div>


      <div className="stats-grid">
        <Card>
          <CardHeader>
            <CardTitle>總住戶</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.totalResidents}</div>
          </CardContent>
        </Card>

        <Card className="stat-active">
          <CardHeader>
            <CardTitle>活躍住戶</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.activeResidents}</div>
          </CardContent>
        </Card>

        <Card className="stat-members">
          <CardHeader>
            <CardTitle>總成員</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card className="stat-cards">
          <CardHeader>
            <CardTitle>有效門禁卡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.activeAccessCards}</div>
          </CardContent>
        </Card>

        <Card className="stat-plates">
          <CardHeader>
            <CardTitle>已註冊車牌</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.registeredPlates}</div>
          </CardContent>
        </Card>

        <Card className="stat-lost-cards">
          <CardHeader>
            <CardTitle>遺失門禁卡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.lostAccessCards}</div>
          </CardContent>
        </Card>
      </div>


      <div className="view-controls">
        <div className="view-switcher">
          <Button
            variant={currentView === 'residents' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('residents')}
          >
            住戶列表
          </Button>
          <Button
            variant={currentView === 'cards' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('cards')}
          >
            門禁卡管理
          </Button>
          <Button
            variant={currentView === 'plates' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('plates')}
          >
            車牌管理
          </Button>
        </div>

        <div className="search-filter">
          <input
            type="text"
            placeholder="搜尋住戶姓名、戶號或電話..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>


      {currentView === 'residents' && (
        <div className="residents-grid">
          {filteredResidents.map(resident => (
            <Card key={resident.id} className="resident-card">
              <CardHeader>
                <CardTitle>{resident.name}</CardTitle>
                <span className="resident-status" style={{ color: getStatusColor(resident.status) }}>
                  {getStatusText(resident.status)}
                </span>
              </CardHeader>
              <CardContent>
                <div className="resident-info">
                  <p><strong>戶號：</strong>{resident.unitId}</p>
                  <p><strong>電話：</strong>{resident.phone || (resident as any).ownerPhone}</p>
                  <p><strong>電郵：</strong>{resident.email || (resident as any).ownerEmail || 'N/A'}</p>
                  <p><strong>入遷日期：</strong>{resident.moveInDate ? new Date(resident.moveInDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>成員數：</strong>{resident.members.length}人</p>
                  {resident.emergencyContact && (
                    <p><strong>緊急聯絡：</strong>{resident.emergencyContact.name} ({resident.emergencyContact.phone})</p>
                  )}
                </div>
                <div className="resident-members">
                  <h4>家庭成員</h4>
                  <div className="members-list">
                    {resident.members.map((member, index) => (
                      <div key={index} className="member-item">
                        <span className="member-name">{member.name}</span>
                        <span className="member-relationship">{getStatusText(member.relationship)}</span>
                        <span className="member-phone">{member.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="resident-actions-card">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleResidentClick(resident)}
                  >
                    詳情
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => { }}
                  >
                    編輯
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {currentView === 'cards' && (
        <div className="cards-grid">
          {accessCards.map(card => {
            const resident = residents.find(r => r.id === card.residentId);
            return (
              <Card key={card.id} className="card-item">
                <CardHeader>
                  <CardTitle>{card.cardNumber}</CardTitle>
                  <span className="card-status" style={{ color: getStatusColor(card.status) }}>
                    {getStatusText(card.status)}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="card-info">
                    <p><strong>持卡人：</strong>{resident?.name}</p>
                    <p><strong>身分證：</strong>{card.memberId}</p>
                    <p><strong>權限等級：</strong>{card.accessLevel === 'full' ? '完全權限' : '限制權限'}</p>
                    <p><strong>發卡日期：</strong>{new Date(card.issuedDate).toLocaleDateString()}</p>
                    <p><strong>到期日期：</strong>{new Date(card.expiryDate).toLocaleDateString()}</p>
                    {card.reportedDate && (
                      <p><strong>報失日期：</strong>{new Date(card.reportedDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="card-actions">
                    {card.status === 'active' && (
                      <>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleCardAction(card, 'deactivate')}
                        >
                          停用
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleCardAction(card, 'renew')}
                        >
                          續期
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleCardAction(card, 'reportLost')}
                        >
                          報失
                        </Button>
                      </>
                    )}
                    {card.status === 'lost' && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleCardAction(card, 'activate')}
                      >
                        重新啟用
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}


      {currentView === 'plates' && (
        <div className="plates-grid">
          {licensePlates.map(plate => {
            const resident = residents.find(r => r.id === plate.residentId);
            return (
              <Card key={plate.id} className="plate-item">
                <CardHeader>
                  <CardTitle>{plate.plateNumber}</CardTitle>
                  <span className="plate-status" style={{ color: getStatusColor(plate.status) }}>
                    {getStatusText(plate.status)}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="plate-info">
                    <p><strong>車主：</strong>{plate.ownerName}</p>
                    <p><strong>住戶：</strong>{resident?.name}</p>
                    <p><strong>戶號：</strong>{resident?.unitId}</p>
                    <p><strong>車輛類型：</strong>{plate.vehicleType === 'car' ? '汽車' : '機車'}</p>
                    <p><strong>註冊日期：</strong>{new Date(plate.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div className="plate-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handlePlateAction(plate, 'update')}
                    >
                      編輯
                    </Button>
                    {plate.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handlePlateAction(plate, 'deactivate')}
                      >
                        停用
                      </Button>
                    )}
                    {plate.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handlePlateAction(plate, 'activate')}
                      >
                        啟用
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResidentSystem;