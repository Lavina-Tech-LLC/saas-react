export interface QueryParams {
  naturalLanguage?: string
  sql?: string
  filterRules?: FilterRule[]
}

export interface FilterRule {
  table?: string
  column: string
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between'
  value: string
}

export interface QueryResult {
  sql: string
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionMs: number
  chartType: string
  cached: boolean
}

export interface SavedQuery {
  id: string
  projectId: string
  name: string
  naturalLanguage?: string
  generatedSql?: string
  chartType: string
  createdAt: string
  updatedAt: string
}

export interface Dashboard {
  id: string
  projectId: string
  name: string
  layoutJson: string
  isPublic: boolean
  refreshIntervalSeconds: number
  createdAt: string
  updatedAt: string
}

export interface EmbedToken {
  id: string
  projectId: string
  dashboardId?: string
  customerId?: string
  filterRules?: FilterRule[]
  expiresAt: string
  createdAt: string
  revokedAt?: string
}

export interface EmbedTokenResult {
  embedToken: string
  expiresAt: string
}

export interface ListParams {
  page?: number
  perPage?: number
  sort?: string
  order?: string
  search?: string
}

export interface OffsetPage<T> {
  data: T[]
  meta: { page: number; perPage: number; total: number; totalPages: number }
}
