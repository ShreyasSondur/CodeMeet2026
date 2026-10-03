const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch backend status: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
