import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FeedbackContext = createContext(null);
let proximoId = 0;

export function useFeedback() {
  const contexto = useContext(FeedbackContext);
  if (!contexto) {
    throw new Error("useFeedback precisa estar dentro de FeedbackProvider.");
  }
  return contexto;
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    const duracao = toast.type === "error" ? 6000 : 4000;
    const timer = setTimeout(() => onClose(toast.id), duracao);
    return () => clearTimeout(timer);
  }, [onClose, toast.id, toast.type]);

  return (
    <div
      className={`vallet-toast vallet-toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        className="vallet-toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Fechar aviso"
      >
        ×
      </button>
    </div>
  );
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmacao, setConfirmacao] = useState(null);
  const resolverConfirmacao = useRef(null);
  const botaoCancelarRef = useRef(null);
  const botaoConfirmarRef = useRef(null);
  const sessaoExpiradaVisivel = useRef(false);

  const removerToast = useCallback((id) => {
    setToasts((atuais) => atuais.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "success") => {
    const id = ++proximoId;
    setToasts((atuais) => [...atuais, { id, message, type }]);
  }, []);

  const confirm = useCallback((opcoes) => {
    const config = typeof opcoes === "string" ? { mensagem: opcoes } : opcoes;
    return new Promise((resolve) => {
      resolverConfirmacao.current = resolve;
      setConfirmacao(config || {});
    });
  }, []);

  const fecharConfirmacao = useCallback((resultado) => {
    setConfirmacao(null);
    const resolver = resolverConfirmacao.current;
    resolverConfirmacao.current = null;
    if (resolver) resolver(resultado);
  }, []);

  useEffect(() => {
    function aoExpirarSessao(evento) {
      // Segunda barreira: mesmo que mais de um evento chegue (ex.: várias
      // requisições em paralelo), só exibimos um aviso por sessão.
      if (sessaoExpiradaVisivel.current) return;
      sessaoExpiradaVisivel.current = true;
      notify(
        evento?.detail?.message ||
          "Sua sessão expirou. Por favor, faça login novamente.",
        "error",
      );
    }
    function aoIniciarSessao() {
      sessaoExpiradaVisivel.current = false;
    }
    window.addEventListener("vallet:session-expired", aoExpirarSessao);
    window.addEventListener("vallet:session-started", aoIniciarSessao);
    return () => {
      window.removeEventListener("vallet:session-expired", aoExpirarSessao);
      window.removeEventListener("vallet:session-started", aoIniciarSessao);
    };
  }, [notify]);

  useEffect(() => {
    if (!confirmacao) return undefined;

    const focoAnterior = document.activeElement;
    const alvo = confirmacao.perigo
      ? botaoCancelarRef.current
      : botaoConfirmarRef.current;
    alvo?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        fecharConfirmacao(false);
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);
    return () => {
      window.removeEventListener("keydown", aoPressionarTecla);
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) {
        focoAnterior.focus();
      }
    };
  }, [confirmacao, fecharConfirmacao]);

  const contexto = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={contexto}>
      {children}

      <div
        className="vallet-toast-region"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removerToast} />
        ))}
      </div>

      {confirmacao && (
        <div
          className="vallet-modal-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              fecharConfirmacao(false);
            }
          }}
        >
          <div
            className="vallet-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vallet-confirm-title"
            aria-describedby="vallet-confirm-message"
          >
            <h2 id="vallet-confirm-title">
              {confirmacao.titulo || "Confirmar ação"}
            </h2>
            <p id="vallet-confirm-message">{confirmacao.mensagem}</p>
            <div className="vallet-confirm-actions">
              <button
                ref={botaoCancelarRef}
                type="button"
                className="vallet-btn-secondary"
                onClick={() => fecharConfirmacao(false)}
              >
                {confirmacao.textoCancelar || "Cancelar"}
              </button>
              <button
                ref={botaoConfirmarRef}
                type="button"
                className={
                  confirmacao.perigo ? "vallet-btn-danger" : "vallet-btn-primary"
                }
                onClick={() => fecharConfirmacao(true)}
              >
                {confirmacao.textoConfirmar || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
