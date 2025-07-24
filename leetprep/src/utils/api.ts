const API_BASE = "https://interviewkitplusapi.onrender.com";

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newAccess = data.access;
    if (newAccess) {
      localStorage.setItem("access", newAccess);
      return newAccess;
    }
    return null;
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
}

export async function fetchWithTokenRefresh(url: string, init: RequestInit = {}): Promise<Response> {
  const access = localStorage.getItem("access");

  const makeRequest = async (token?: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await makeRequest(access || undefined);

  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) return res;
    res = await makeRequest(newAccess);
  }

  return res;
}

export const API_BASE_URL = API_BASE;
