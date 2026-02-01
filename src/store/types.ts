import { AuthSliceState } from './modules/auth';
import { BuildingState } from './modules/building';
import { FloorState } from './modules/floor';
import { UnitState } from './modules/unit';
import { ParkingState } from './modules/parking';
import { ResidentState } from './modules/resident';
import { FacilityState } from './modules/facility';
import { DepositState } from './modules/deposit';
import { CalendarState } from './modules/calendar';
import { EventBusState } from './modules/eventBus';
import type { FeeState } from './modules/fee';

// Import config state type directly
type ConfigSliceState = {
  configs: any[];
  colorConfigs: {
    configs: any[];
    activeConfigId: string | null;
    loading: boolean;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
  parkingStatuses: any[];
  calendarStatuses: any[];
  houseStatuses: any[];
  defaultParkingStatuses: any[];
  defaultCalendarStatuses: any[];
  defaultHouseStatuses: any[];
};

export interface RootState {
  auth: AuthSliceState;
  building: BuildingState;
  floor: FloorState;
  unit: UnitState;
  parking: ParkingState;
  resident: ResidentState;
  facility: FacilityState;
  config: ConfigSliceState;
  deposit: DepositState;
  calendar: CalendarState;
  eventBus: EventBusState;
  fee: FeeState;
}

// Re-export specific state types for convenience
export type {
  AuthSliceState,
  BuildingState,
  FloorState,
  UnitState,
  ParkingState,
  ResidentState,
  FacilityState,
  ConfigSliceState as ConfigState,
  DepositState,
  CalendarState,
  EventBusState
};