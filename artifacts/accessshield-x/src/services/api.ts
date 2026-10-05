const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface AuditResult {
  audit_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  policies_analyzed: number;
  users_analyzed: number;
  events_analyzed: number;
  findings_count: number;
  high_risk_count: number;
  least_privilege_score: number;
}

export interface Finding {
  id: string;
  severity: Severity;
  finding_type: string;
  user_id: string;
  policy_id: string;
  service: string;
  action: string;
  resource: string;
  risk_score: number;
  confidence: number;
  status: string;
  title: string;
  description: string;
  created_at: string;
}

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the backend at ${API_BASE_URL}. Is it running, and is CORS configured?`
    );
  }
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    throw new ApiError(`Request failed (${res.status}): ${detail}`, res.status);
  }
  return (await res.json()) as T;
}

export const runAudit = (): Promise<AuditResult> =>
  request<AuditResult>("/api/audit/run", { method: "POST", body: "{}" });

export const getFindings = (): Promise<Finding[]> =>
  request<Finding[]>("/api/findings");

export interface Evidence {
  finding_id: string;
  why_flagged: string;
  assigned_permission: string;
  observed_usage: string[];
  unused_actions: string[];
  observed_resources: string[];
  risk_factors: string[];
  confidence: number;
  recommendation_reasoning: string;
}

export interface Recommendation {
  id: number;
  finding_id: string;
  current_action: string;
  recommended_action: string;
  current_resource: string;
  recommended_resource: string;
  reason: string;
  risk_reduction: number;
  confidence: number;
  status: string;
}

export const getEvidence = (id: string): Promise<Evidence> =>
  request<Evidence>(`/api/findings/${encodeURIComponent(id)}/evidence`);

export const getRecommendations = (): Promise<Recommendation[]> =>
  request<Recommendation[]>("/api/recommendations");
export const apiBaseUrl: string = API_BASE_URL;

export interface Health {
  status: string;
  service: string;
  version: string;
  environment: string;
}

export const getHealth = (): Promise<Health> => request<Health>("/api/health");
export interface SimResult {
  message: string;
  user_id: string;
  action: string;
  resource: string;
}

export interface ResetResult {
  reloaded_events: number;
  audit_id: string;
  events_analyzed: number;
  least_privilege_score: number;
}

export const injectEvent = (b: {
  user_id: string;
  service: string;
  action: string;
  resource: string;
}): Promise<SimResult> =>
  request<SimResult>("/api/simulator/events", {
    method: "POST",
    body: JSON.stringify({ status: "SUCCESS", ...b }),
  });

export const resetDemo = (): Promise<ResetResult> =>
  request<ResetResult>("/api/admin/reset-demo", { method: "POST", body: "{}", headers: { "Content-Type": "application/json", "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY || "" } });
export interface LogRow { id: number; timestamp: string | null; user_id: string; service: string; action: string; resource: string; status: string | null; region: string | null; }
export interface LogPage { total: number; items: LogRow[]; }
export interface Facets { users: string[]; services: string[]; statuses: string[]; }
export interface PolicyRow { id: string; policy_name: string; user_id: string; service: string; permissions: { effect: string; action: string; resource: string }[]; }

export const getLogs = (p: { limit: number; offset: number; user_id?: string; service?: string; status?: string; q?: string }): Promise<LogPage> => {
  const qs = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => { if (v !== undefined && v !== "") qs.set(k, String(v)); });
  return request<LogPage>(`/api/data/logs?${qs.toString()}`);
};
export const getFacets = (): Promise<Facets> => request<Facets>("/api/data/facets");
export const getPolicies = (): Promise<PolicyRow[]> => request<PolicyRow[]>("/api/data/policies");
export const decideRecommendation = (id: number, what: "accept" | "reject"): Promise<unknown> =>
  request<unknown>(`/api/recommendations/${id}/${what}`, { method: "POST", body: "{}" });
export const getReport = (id: string): Promise<Record<string, unknown>> =>
  request<Record<string, unknown>>(`/api/reports/${encodeURIComponent(id)}`);

export async function uploadFile(path: string, file: File): Promise<Record<string, unknown>> {
  const fd = new FormData();
  fd.append("file", file);
  let res: Response;
  try { res = await fetch(`${API_BASE_URL}${path}`, { method: "POST", body: fd }); }
  catch { throw new ApiError(`Cannot reach the backend at ${API_BASE_URL}.`); }
  if (!res.ok) throw new ApiError(`Upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`, res.status);
  return (await res.json()) as Record<string, unknown>;
}