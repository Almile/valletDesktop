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
      const detalhe = errorData.detail;
      const mensagem = Array.isArray(detalhe)
        ? detalhe.map((erro) => erro.msg || "Campo inválido").join("; ")
        : typeof detalhe === "string" ? detalhe : "Erro na requisição com o servidor.";
      throw new Error(mensagem);
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

      const eAdmin = perfil.tipo_user === "superadmin";

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

  async getEstacionamentos() {
    return this.request("/estacionamento/listar_estacionamentos_usuario", {
      method: "GET",
    });
  },

  async criarEstacionamento(dados) {
    return this.request("/estacionamento/criar_estacionamento", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async atualizarEstacionamento(id, dados) {
    return this.request(
      `/estacionamento/atualizar_estacionamento/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(dados),
      },
    );
  },

  async getAdmins() {
    return this.request("/usuarios?tipo=admin", { method: "GET" });
  },
  
  async getAdminsDisponiveis() {
    return this.request("/usuarios/listar_admins_disponiveis", { method: "GET" });
  },
  
  async getGerentes() {
    return this.request("/usuarios?tipo=admin", { method: "GET" });
  },

  async getGerentePorId(uid) {
    return this.request(`/usuarios/${encodeURIComponent(uid)}`, { method: "GET" });
  },

  async criarGerente(dados) {
    return this.request("/auth/criar_usuario", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async desativarGerente(uid) {
    return this.request(`/auth/desativar_conta/${uid}`, {
      method: "POST",
      body: JSON.stringify(uid),
    });
  },

  async reativarGerente(uid) {
    return this.request(`/auth/reativar_conta/${uid}`, {
      method: "POST",
      body: JSON.stringify(uid),
    });
  },

  async getEstacionamentoPorId(id) {
    return this.request(`/estacionamento/buscar_estacionamento/${id}`, {
      method: "GET",
    });
  },
  
  async excluirEstacionamento(estacionamentoId) {
    return this.request(`/estacionamento/excluir_estacionamento/${estacionamentoId}`, {
      method: "DELETE"
    });
  },

  async getVagasEstacionamento(estacionamentoId) {
    return this.request(`/vaga/estacionamento/${estacionamentoId}`, {
      method: "GET",
    });
  },

  async criarVaga(dados) {
    return this.request("/vaga/criar", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async criarVagasEmLote(dados) {
    return this.request("/vaga/criar_lote", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async atualizarVaga(vagaId, dados) {
    return this.request(`/vaga/atualizar/${vagaId}`, {
      method: "PATCH",
      body: JSON.stringify(dados),
    });
  },

  async excluirVaga(vagaId) {
    return this.request(`/vaga/excluir/${vagaId}`, { method: "DELETE" });
  },
};
