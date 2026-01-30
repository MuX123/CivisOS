import { supabase } from '../lib/supabase'

export interface DatabaseService<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(item: Partial<T>): Promise<T | null>
  update(id: string, updates: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
}

class BaseDatabaseService<T> implements DatabaseService<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error)
      return []
    }

    return data as T[]
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching ${this.tableName} by id:`, error)
      return null
    }

    return data as T
  }

  async create(item: Partial<T>): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single()

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error)
      return null
    }

    return data as T
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error)
      return null
    }

    return data as T
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error)
      return false
    }

    return true
  }

  async filter(filters: Record<string, any>): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*')

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query

    if (error) {
      console.error(`Error filtering ${this.tableName}:`, error)
      return []
    }

    return data as T[]
  }

  async paginate(page: number = 1, limit: number = 10): Promise<{
    data: T[]
    total: number
    page: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error(`Error paginating ${this.tableName}:`, error)
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0
      }
    }

    return {
      data: data as T[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

export default BaseDatabaseService