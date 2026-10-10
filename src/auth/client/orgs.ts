import type { Member, Org, Role } from '../types';
import { AccountClient } from './account';

/** Organizations, their members and the project's roles. */
export class OrgClient extends AccountClient {
  // ---------------------------------------------------------------------------
  // Organizations
  // ---------------------------------------------------------------------------

  async listOrgs(): Promise<Org[]> {
    return this.transport.get<Org[]>('/auth/orgs', this.authHeaders());
  }

  async createOrg(name: string, slug: string): Promise<Org> {
    return this.transport.post<Org>('/auth/orgs', { name, slug }, this.authHeaders());
  }

  async getOrg(orgId: string): Promise<Org> {
    return this.transport.get<Org>(`/auth/orgs/${orgId}`, this.authHeaders());
  }

  async updateOrg(orgId: string, params: { name?: string; avatarUrl?: string }): Promise<Org> {
    return this.transport.patch<Org>(`/auth/orgs/${orgId}`, params, this.authHeaders());
  }

  async deleteOrg(orgId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}`, this.authHeaders());
  }

  async uploadOrgAvatar(
    orgId: string,
    imageBlob: Blob,
  ): Promise<{ avatarUrl: string; small: string; medium: string; original: string }> {
    return this.transport.uploadBinary<{
      avatarUrl: string;
      small: string;
      medium: string;
      original: string;
    }>(`/auth/orgs/${orgId}/avatar`, imageBlob, this.authHeaders());
  }

  // ---------------------------------------------------------------------------
  // Members & Invites
  // ---------------------------------------------------------------------------

  async listMembers(orgId: string): Promise<Member[]> {
    return this.transport.get<Member[]>(`/auth/orgs/${orgId}/members`, this.authHeaders());
  }

  async updateMemberRole(orgId: string, userId: string, role?: string, roleId?: string): Promise<void> {
    await this.transport.patch(`/auth/orgs/${orgId}/members/${userId}`, { role, roleId }, this.authHeaders());
  }

  async updateMemberRoles(orgId: string, userId: string, roles: string[]): Promise<void> {
    await this.transport.patch(`/auth/orgs/${orgId}/members/${userId}`, { roles }, this.authHeaders());
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}/members/${userId}`, this.authHeaders());
  }

  // ---------------------------------------------------------------------------
  // Roles
  // ---------------------------------------------------------------------------

  async listRoles(): Promise<Role[]> {
    return this.transport.get<Role[]>('/auth/roles', this.authHeaders());
  }
}
