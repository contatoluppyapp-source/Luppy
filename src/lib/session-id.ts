const KEY = "luppy_session_id";

function generate(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = generate();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function getDeviceInfo(): string {
  if (typeof window === "undefined") return "server";
  return window.navigator.userAgent.slice(0, 200);
}
