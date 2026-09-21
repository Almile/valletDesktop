const API_URL = "http://localhost:8000";

export const apiService = {
  getToken() {
    return localStorage.getItem("idToken");
  },

  setSession(data) {
    if (data.idToken) localStorage.setItem("idToken", data.idToken);
    if (data.refreshToken)
      localStorage.setItem("refreshToken", data.refreshToken);
    if (data.localId) localStorage.setItem("localId", data.localId);
  },

  clearSession() {
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("localId");
  },

  async request(endpoint, options = {}, customToken = null) {
    const token = customToken || this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Sessão não autorizada.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro na requisição com o servidor.");
    }

    return response.json();
  },

  async login(email, senha) {
    const data = await this.request(
      `/auth/login?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`,
      { method: "POST" },
    );

    this.setSession(data);

    try {
      const perfil = await this.getPerfil(data.idToken);

      const eAdmin = perfil.tipo_user === "superadmin"

      if (!eAdmin) {
        this.clearSession();
        throw new Error(
          "Acesso negado: Sua conta não tem permissão para acessar esta aplicação.",
        );
      }

      return { data, perfil };
    } catch (err) {
      this.clearSession();
      throw err;
    }
  },

  async getPerfil(customToken = null) {
    return this.request("/auth/me", { method: "GET" }, customToken);
  },

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Erro ao deslogar no backend:", err);
    } finally {
      this.clearSession();
    }
  },
};
