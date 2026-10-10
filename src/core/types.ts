export interface SaaSOptions {
  /** Publishable key for auth (end-user facing, pub_live_ prefix) */
  publishableKey?: string;
  /** API key for billing/report operations */
  apiKey?: string;
  /** Override the default API base URL */
  baseUrl?: string;
}
