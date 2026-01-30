import BaseDatabaseService from './baseDatabaseService'
import { supabase } from '../lib/supabase'
import { ParkingSpace, ParkingArea } from '../types/domain'

export interface ParkingSpaceWithRelations extends Omit<ParkingSpace, 'area'> {
  area?: ParkingArea
}

class ParkingService extends BaseDatabaseService<ParkingSpace> {
  constructor() {
    super('parking_spaces')
  }

  async getAllWithAreas(): Promise<ParkingSpaceWithRelations[]> {
    const { data, error } = await supabase
      .from('parking_spaces')
      .select(`
        *,
        parking_areas (*)
      `)

    if (error) {
      console.error('Error fetching parking spaces with areas:', error)
      return []
    }

    return data.map(space => ({
      ...space,
      area: space.parking_areas
    })) as ParkingSpaceWithRelations[]
  }

  async getByArea(areaId: string): Promise<ParkingSpace[]> {
    return await this.filter({ area_id: areaId })
  }

  async updateStatus(id: string, status: 'available' | 'occupied' | 'reserved' | 'maintenance', reason?: string): Promise<ParkingSpace | null> {
    const updates: Partial<ParkingSpace> = { status }
    
    if (status === 'available') {
      updates.residentId = undefined
      updates.plateNumber = undefined
      updates.startTime = undefined
      updates.reason = undefined
      updates.reservedUntil = undefined
      updates.maintenanceUntil = undefined
    } else if (reason) {
      updates.reason = reason
    }

    return await this.update(id, updates)
  }

  async assignToResident(id: string, residentId: string, plateNumber?: string, startTime?: Date, monthlyFee?: number): Promise<ParkingSpace | null> {
    return await this.update(id, {
      status: 'occupied',
      residentId,
      plateNumber,
      startTime,
      monthlyFee
    })
  }

  async releaseSpace(id: string): Promise<ParkingSpace | null> {
    return await this.updateStatus(id, 'available')
  }

  async getStatistics(): Promise<{
    total: number
    occupied: number
    available: number
    reserved: number
    maintenance: number
    monthlyRevenue: number
    dailyRevenue: number
  }> {
    const { data, error } = await supabase
      .from('parking_spaces')
      .select('status, monthly_fee')

    if (error) {
      console.error('Error fetching parking statistics:', error)
      return {
        total: 0,
        occupied: 0,
        available: 0,
        reserved: 0,
        maintenance: 0,
        monthlyRevenue: 0,
        dailyRevenue: 0
      }
    }

    const stats = {
      total: data.length,
      occupied: data.filter(s => s.status === 'occupied').length,
      available: data.filter(s => s.status === 'available').length,
      reserved: data.filter(s => s.status === 'reserved').length,
      maintenance: data.filter(s => s.status === 'maintenance').length,
      monthlyRevenue: data
        .filter(s => s.status === 'occupied')
        .reduce((sum, s) => sum + (s.monthly_fee || 0), 0),
      dailyRevenue: 0
    }

    return stats
  }
}

export class ParkingAreaService extends BaseDatabaseService<ParkingArea> {
  constructor() {
    super('parking_areas')
  }

  async getAllWithSpaces(): Promise<ParkingArea[]> {
    const { data, error } = await supabase
      .from('parking_areas')
      .select(`
        *,
        parking_spaces (count)
      `)

    if (error) {
      console.error('Error fetching parking areas with spaces:', error)
      return []
    }

    return data as ParkingArea[]
  }
}

export const parkingService = new ParkingService()
export const parkingAreaService = new ParkingAreaService()