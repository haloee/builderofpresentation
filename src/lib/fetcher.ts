// src/lib/fetcher.ts

export async function customFetch(input: RequestInfo, init: RequestInit = {}) {
    const userId = localStorage.getItem("userId");
  
    const headers = {
      ...(init.headers || {}),
      ...(userId ? { "X-User-Id": userId } : {})
    };
  
    return fetch(input, {
      ...init,
      headers
    });
  }
  