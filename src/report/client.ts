import type { Transport } from '../core/transport'
import type {
  QueryParams, QueryResult, SavedQuery, Dashboard,
  EmbedToken, EmbedTokenResult, ListParams, OffsetPage, FilterRule,
} from './types'

export class ReportClient {
  private transport: Transport

  constructor(transport: Transport) {
    this.transport = transport
  }

  // --- Query ---

  async executeQuery(params: QueryParams): Promise<QueryResult> {
    return this.transport.post<QueryResult>('/report/query', params)
  }

  // --- Saved Queries ---

  async listQueries(params?: ListParams): Promise<OffsetPage<SavedQuery>> {
    const qs = params ? this.toQueryString(params) : ''
    return this.transport.get<OffsetPage<SavedQuery>>(`/report/queries${qs}`)
  }

  async saveQuery(params: { name: string; naturalLanguage?: string; generatedSql?: string; chartType?: string }): Promise<SavedQuery> {
    return this.transport.post<SavedQuery>('/report/queries', params)
  }

  async updateQuery(queryId: string, params: { name?: string; chartType?: string }): Promise<SavedQuery> {
    return this.transport.patch<SavedQuery>(`/report/queries/${queryId}`, params)
  }

  async deleteQuery(queryId: string): Promise<void> {
    await this.transport.del(`/report/queries/${queryId}`)
  }

  // --- Dashboards ---

  async listDashboards(params?: ListParams): Promise<OffsetPage<Dashboard>> {
    const qs = params ? this.toQueryString(params) : ''
    return this.transport.get<OffsetPage<Dashboard>>(`/report/dashboards${qs}`)
  }

  async createDashboard(params: { name: string; layoutJson?: string; isPublic?: boolean; refreshIntervalSeconds?: number }): Promise<Dashboard> {
    return this.transport.post<Dashboard>('/report/dashboards', params)
  }

  async getDashboard(dashboardId: string): Promise<Dashboard> {
    return this.transport.get<Dashboard>(`/report/dashboards/${dashboardId}`)
  }

  async updateDashboard(dashboardId: string, params: { name?: string; layoutJson?: string; isPublic?: boolean; refreshIntervalSeconds?: number }): Promise<Dashboard> {
    return this.transport.patch<Dashboard>(`/report/dashboards/${dashboardId}`, params)
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    await this.transport.del(`/report/dashboards/${dashboardId}`)
  }

  // --- Embed Tokens ---

  async createEmbedToken(params: { dashboardId?: string; customerId?: string; expiresIn?: number; filterRules?: FilterRule[] }): Promise<EmbedTokenResult> {
    return this.transport.post<EmbedTokenResult>('/report/embed-tokens', params)
  }

  async listEmbedTokens(): Promise<EmbedToken[]> {
    return this.transport.get<EmbedToken[]>('/report/embed-tokens')
  }

  async revokeEmbedToken(tokenId: string): Promise<void> {
    await this.transport.del(`/report/embed-tokens/${tokenId}`)
  }

  private toQueryString(params: ListParams): string {
    const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
    if (entries.length === 0) return ''
    return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
  }
}
