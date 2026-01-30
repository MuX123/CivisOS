import { AuthSliceState } from './modules/auth';
import { BuildingState } from './modules/building';
import { FloorState } from './modules/floor';
import { UnitState } from './modules/unit';
import { ParkingState } from './modules/parking';
import { ResidentState } from './modules/resident';
import { FacilityState } from './modules/facility';
import { ConfigState } from './modules/config';
import { DepositState } from './modules/deposit';
import { CalendarState } from './modules/calendar';
import { EventBusState } from './modules/eventBus';

export interface RootState {
  auth: AuthSliceState;
  building: BuildingState;
  floor: FloorState;
  unit: UnitState;
  parking: ParkingState;
  resident: ResidentState;
  facility: FacilityState;
  config: ConfigState;
  deposit: DepositState;
  calendar: CalendarState;
  eventBus: EventBusState;
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
  ConfigState,
  DepositState,
  CalendarState,
  EventBusState
};