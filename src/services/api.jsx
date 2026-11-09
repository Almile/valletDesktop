const API_URL = "http://localhost:8000";

const SESSION_EXPIRED_EVENT = "vallet:session-expired";
const SESSION_STARTED_EVENT = "vallet:session-started";

// Evita que várias requisições concorrentes (ex.: Promise.all) disparem
// um aviso de sessão expirada cada uma. É reativado a cada novo login.
let sessaoExpiradaNotificada = false;

function notificarSessaoExpirada() {
  if (sessaoExpiradaNotificada) return;
  sessaoExpiradaNotificada = true;

  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, {
      detail: {
        message: "Sua sessão expirou. Por favor, faça login novamente.",
      },
    }),
  );

  // HashRouter: troca a rota sem recarregar a página (o que remontaria a
  // aplicação e poderia duplicar os avisos).
  window.location.hash = "#/login";
}

export const apiService = {
  getToken() {
    return localStorage.getItem("idToken");
  },

  setSession(data) {
    if (data.idToken) {
      sessaoExpiradaNotificada = false;
      window.dispatchEvent(new CustomEvent(SESSION_STARTED_EVENT));
      localStorage.setItem("idToken", data.idToken);
    }
    if (data.refreshToken)
      localStorage.setItem("refreshToken", data.refreshToken);
    if (data.localId) localStorage.setItem("localId", data.localId);
  },

  clearSession() {
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("localId");
  },

  async request(
    endpoint,
    options = {},
    customToken = null,
    { notificarExpiracao = true } = {},
  ) {
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
      this.clearSession();
      if (token) {
        if (notificarExpiracao) notificarSessaoExpirada();
        throw new Error("Sessão expirada.");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detalhe = errorData.detail;
      const mensagem = Array.isArray(detalhe)
        ? detalhe.map((erro) => erro.msg || "Campo inválido").join("; ")
        : typeof detalhe === "string" ? detalhe : "Erro na requisição com o servidor.";
      throw new Error(mensagem);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
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

  async getChatToken() {
    return this.request("/chat/token", { method: "POST" });
  },

  async logout() {
    try {
      // Logout manual: não exibir "sessão expirada" se o token já venceu.
      await this.request("/auth/logout", { method: "POST" }, null, {
        notificarExpiracao: false,
      });
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

  async atualizarGerente(uid, dados) {
    return this.request(`/usuarios/atualizar_usuario/${encodeURIComponent(uid)}`, {
      method: "PATCH",
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
  
  async uploadImagem(formData) {
  const token = this.getToken();
  const response = await fetch(`${API_URL}/estacionamento/upload_imagem`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.trim()}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erro ao fazer upload da imagem.");
  }
  return response.json();
},
};
