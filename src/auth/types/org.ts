export interface Org {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  metadata?: string;
  planName?: string;
  role?: string;
  roleId?: string;
}

export interface RoleInfo {
  id: string;
  key: string;
  name: string;
}

export interface Member {
  userId: string;
  email: string;
  /** Set for accounts registered with a phone number. */
  phone?: string;
  role: string;
  roleId?: string;
  roleName?: string;
  roles?: RoleInfo[];
}

export interface Role {
  id: string;
  name: string;
  key: string;
  description?: string;
  isSystem: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  roles: RoleInfo[];
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface CreatedApiKey extends ApiKey {
  /** Plaintext API key. Returned only at creation time and never again. */
  key: string;
}

export interface CreateApiKeyInput {
  name: string;
  roleIds: string[];
  /** ISO timestamp. Omit or pass null for a non-expiring key. */
  expiresAt?: string | null;
}
