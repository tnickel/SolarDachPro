import type { ApiResponse, CommercialClient, SolarProject, LandRegistry } from "../types";

const API_BASE = "/api/v1";

/**
 * Generic fetch wrapper with error handling.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: "Network error" } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;

  return res.json();
}

// ---- Clients ----

export async function getClients(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchApi<ApiResponse<CommercialClient[]>>(`/clients${query}`);
}

export async function getClient(id: string) {
  return fetchApi<ApiResponse<CommercialClient>>(`/clients/${id}`);
}

// ---- Projects ----

export async function getProjects(filters?: { status?: string; clientId?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.clientId) params.set("clientId", filters.clientId);
  const query = params.toString() ? `?${params}` : "";
  return fetchApi<ApiResponse<SolarProject[]>>(`/projects${query}`);
}

export async function getProject(id: string) {
  return fetchApi<ApiResponse<SolarProject>>(`/projects/${id}`);
}

export async function updateProjectStatus(id: string, status: string) {
  return fetchApi<ApiResponse<SolarProject>>(`/projects/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---- Land Registry ----

export async function getLandRegistries(filters?: { legalStatus?: string; projectId?: string }) {
  const params = new URLSearchParams();
  if (filters?.legalStatus) params.set("legalStatus", filters.legalStatus);
  if (filters?.projectId) params.set("projectId", filters.projectId);
  const query = params.toString() ? `?${params}` : "";
  return fetchApi<ApiResponse<LandRegistry[]>>(`/land-registry${query}`);
}

export async function getLandRegistry(id: string) {
  return fetchApi<ApiResponse<LandRegistry>>(`/land-registry/${id}`);
}

export async function updateLandRegistryStatus(
  id: string,
  legalStatus: string,
  legalNotes?: string
) {
  return fetchApi<ApiResponse<LandRegistry>>(`/land-registry/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ legalStatus, legalNotes }),
  });
}
