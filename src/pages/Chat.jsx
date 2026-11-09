import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import Layout from "../components/Layout";
import { apiService } from "../services/api";
import { conectarChat } from "../services/chat";

function iniciais(nome) {
  const partes = String(nome || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function formatarHorario(mensagem) {
  let data = null;

  if (mensagem?.criadoEm?.toDate) {
    data = mensagem.criadoEm.toDate();
  } else if (typeof mensagem?.criadoEmCliente === "number") {
    data = new Date(mensagem.criadoEmCliente);
  }

  if (!data || Number.isNaN(data.getTime())) return "Enviando…";

  const agora = new Date();
  const mesmoDia =
    data.getDate() === agora.getDate() &&
    data.getMonth() === agora.getMonth() &&
    data.getFullYear() === agora.getFullYear();

  if (mesmoDia) {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarResumo(conversa) {
  const texto = conversa?.ultimaMensagem;
  if (!texto) return "Conversa iniciada. Envie a primeira mensagem.";
  return texto.length > 64 ? `${texto.slice(0, 64)}…` : texto;
}

function horarioConversa(conversa) {
  const valor = conversa?.ultimaMensagemEm;
  if (!valor?.toDate) return "";
  const data = valor.toDate();
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConversaItem({ conversa, ativa, onSelecionar }) {
  const naoLidas = Number(conversa.naoLidasSuperadmin) || 0;
  const titulo =
    conversa.estacionamentoNome ||
    conversa.gestorNome ||
    "Estacionamento sem nome";

  return (
    <button
      type="button"
      className={`chat-conversation-item${ativa ? " is-active" : ""}`}
      onClick={onSelecionar}
      aria-current={ativa ? "true" : undefined}
    >
      <span className="chat-conversation-avatar" aria-hidden="true">
        {iniciais(conversa.gestorNome || titulo)}
      </span>

      <span className="chat-conversation-body">
        <span className="chat-conversation-top">
          <strong>{titulo}</strong>
          <small>{horarioConversa(conversa)}</small>
        </span>
        <span className="chat-conversation-gestor">
          {conversa.gestorNome || "Gerente não identificado"}
        </span>
        <span className="chat-conversation-preview">
          {formatarResumo(conversa)}
        </span>
      </span>

      {naoLidas > 0 && (
        <span className="chat-conversation-unread" aria-label={`${naoLidas} não lidas`}>
          {naoLidas > 99 ? "99+" : naoLidas}
        </span>
      )}
    </button>
  );
}

function Mensagem({ mensagem, uid }) {
  const propria = mensagem.autorUid === uid;
  const pendente =
    mensagem.criadoEm === null || mensagem.criadoEm === undefined;

  return (
    <article
      className={`chat-message${propria ? " chat-message--own" : ""}${
        pendente ? " chat-message--pending" : ""
      }`}
    >
      <span className="chat-message-avatar" aria-hidden="true">
        {iniciais(mensagem.autorNome || (propria ? "Administrador" : "Gestor"))}
      </span>

      <div className="chat-message-content">
        <div className="chat-message-meta">
          <strong>{propria ? "Você" : mensagem.autorNome || "Gestor"}</strong>
          <span>{formatarHorario(mensagem)}</span>
        </div>
        <div className="chat-message-bubble">{mensagem.texto}</div>
      </div>
    </article>
  );
}

export default function Chat() {
  const [conexao, setConexao] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [selecionadaId, setSelecionadaId] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [novoGerenteUid, setNovoGerenteUid] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [avisoGerentes, setAvisoGerentes] = useState("");

  const listaMensagensRef = useRef(null);
  const marcandoLeitura = useRef(false);
  const conversaAnterior = useRef("");

  useEffect(() => {
    let ativo = true;
    let pararConversas = null;

    async function iniciar() {
      try {
        const dadosConexao = await conectarChat();
        if (!ativo) return;

        setConexao(dadosConexao);
        setCarregando(false);

        pararConversas = onSnapshot(
          collection(dadosConexao.db, "chat"),
          (snapshot) => {
            if (!ativo) return;

            const lista = snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }));

            lista.sort((a, b) => {
              const momentoA =
                a.ultimaMensagemEm?.toMillis?.() ||
                a.criadoEm?.toMillis?.() ||
                0;
              const momentoB =
                b.ultimaMensagemEm?.toMillis?.() ||
                b.criadoEm?.toMillis?.() ||
                0;
              return momentoB - momentoA;
            });

            setConversas(lista);
          },
          (falha) => {
            console.error("[chat] Conversas:", falha);
            if (ativo) {
              setErro(
                "Não foi possível ouvir as conversas em tempo real. Confira as regras do Firestore para a coleção chat.",
              );
            }
          },
        );

        try {
          const lista = await apiService.getGerentes();
          if (ativo) setGerentes(Array.isArray(lista) ? lista : []);
        } catch (falha) {
          if (ativo) {
            setAvisoGerentes(
              falha.message ||
                "Não foi possível carregar os gerentes para iniciar novas conversas.",
            );
          }
        }
      } catch (falha) {
        console.error("[chat] Início:", falha);
        if (ativo) {
          setErro(falha.message || "Não foi possível iniciar o chat.");
          setCarregando(false);
        }
      }
    }

    iniciar();

    return () => {
      ativo = false;
      pararConversas?.();
    };
  }, []);

  useEffect(() => {
    if (!selecionadaId && conversas.length > 0) {
      setSelecionadaId(conversas[0].id);
    }
  }, [conversas, selecionadaId]);

  useEffect(() => {
    if (!conexao || !selecionadaId) {
      setMensagens([]);
      return undefined;
    }

    conversaAnterior.current = "";
    const consulta = query(
      collection(conexao.db, "chat", selecionadaId, "mensagens"),
      orderBy("criadoEmCliente", "asc"),
      limitToLast(500),
    );

    const parar = onSnapshot(
      consulta,
      (snapshot) => {
        setMensagens(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          })),
        );
      },
      (falha) => {
        console.error("[chat] Mensagens:", falha);
        setErro(
          "Não foi possível ouvir as mensagens em tempo real. Confira as regras do Firestore para a coleção chat.",
        );
      },
    );

    return parar;
  }, [conexao, selecionadaId]);

  const conversaSelecionada = useMemo(
    () => conversas.find((item) => item.id === selecionadaId) || null,
    [conversas, selecionadaId],
  );

  useEffect(() => {
    if (
      !conexao ||
      !selecionadaId ||
      !conversaSelecionada ||
      !Number(conversaSelecionada.naoLidasSuperadmin) ||
      marcandoLeitura.current
    ) {
      return;
    }

    marcandoLeitura.current = true;
    updateDoc(doc(conexao.db, "chat", selecionadaId), {
      naoLidasSuperadmin: 0,
    })
      .catch((falha) => {
        console.warn("[chat] Não foi possível marcar como lida:", falha);
      })
      .finally(() => {
        window.setTimeout(() => {
          marcandoLeitura.current = false;
        }, 1000);
      });
  }, [conexao, selecionadaId, conversaSelecionada]);

  useEffect(() => {
    const lista = listaMensagensRef.current;
    if (!lista) return;

    const trocouConversa = conversaAnterior.current !== selecionadaId;
    conversaAnterior.current = selecionadaId;

    const pertoDoFim =
      lista.scrollHeight - lista.scrollTop - lista.clientHeight < 160;

    if (trocouConversa || pertoDoFim) {
      lista.scrollTop = lista.scrollHeight;
    }
  }, [mensagens, selecionadaId]);

  const gerentesDisponiveis = useMemo(() => {
    const vistos = new Set();
    return gerentes.filter((gerente) => {
      if (!gerente?.estacionamentoId) return false;
      if (vistos.has(gerente.estacionamentoId)) return false;
      if (conversas.some((conversa) => conversa.id === gerente.estacionamentoId)) {
        return false;
      }
      vistos.add(gerente.estacionamentoId);
      return true;
    });
  }, [gerentes, conversas]);

  const gerenteSelecionado = useMemo(
    () => gerentes.find((item) => item.uid === novoGerenteUid) || null,
    [gerentes, novoGerenteUid],
  );

  async function abrirNovaConversa(evento) {
    evento.preventDefault();
    setErro("");

    if (!conexao || !gerenteSelecionado?.estacionamentoId) {
      setErro("Selecione um gerente vinculado a um estacionamento.");
      return;
    }

    try {
      const estacionamentoId = gerenteSelecionado.estacionamentoId;
      await setDoc(
        doc(conexao.db, "chat", estacionamentoId),
        {
          estacionamentoId,
          estacionamentoNome: gerenteSelecionado.estacionamentoNome || "",
          gestorUid: gerenteSelecionado.uid,
          gestorNome: gerenteSelecionado.nome || "",
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
          naoLidasGestor: 0,
          naoLidasSuperadmin: 0,
        },
        { merge: true },
      );

      setSelecionadaId(estacionamentoId);
      setNovoGerenteUid("");
    } catch (falha) {
      setErro(falha.message || "Não foi possível iniciar a conversa.");
    }
  }

  async function enviar(evento) {
    evento.preventDefault();
    const conteudo = texto.trim();

    if (!conteudo || enviando || !conexao || !selecionadaId) return;

    setEnviando(true);
    setErro("");

    try {
      const conversaRef = doc(conexao.db, "chat", selecionadaId);
      const mensagemRef = doc(
        collection(conexao.db, "chat", selecionadaId, "mensagens"),
      );

      await runTransaction(conexao.db, async (transacao) => {
        const atual = await transacao.get(conversaRef);
        const dadosAtuais = atual.exists() ? atual.data() : {};
        const agora = serverTimestamp();

        const dadosConversa = {
          estacionamentoId: selecionadaId,
          superadminUid: conexao.perfil.uid,
          superadminNome: conexao.perfil.nome,
          ultimaMensagem: conteudo.slice(0, 180),
          ultimaMensagemEm: agora,
          ultimaMensagemAutor: conexao.perfil.uid,
          ultimaMensagemAutorNome: conexao.perfil.nome,
          atualizadoEm: agora,
          naoLidasGestor: (Number(dadosAtuais.naoLidasGestor) || 0) + 1,
        };

        if (conversaSelecionada?.estacionamentoNome) {
          dadosConversa.estacionamentoNome =
            conversaSelecionada.estacionamentoNome;
        }
        if (conversaSelecionada?.gestorUid) {
          dadosConversa.gestorUid = conversaSelecionada.gestorUid;
          dadosConversa.gestorNome = conversaSelecionada.gestorNome || "";
        }

        transacao.set(conversaRef, dadosConversa, { merge: true });
        transacao.set(mensagemRef, {
          texto: conteudo,
          autorUid: conexao.perfil.uid,
          autorNome: conexao.perfil.nome || "Administrador",
          autorTipo: "superadmin",
          criadoEm: serverTimestamp(),
          criadoEmCliente: Date.now(),
        });
      });

      setTexto("");
    } catch (falha) {
      console.error("[chat] Envio:", falha);
      setErro(
        `Não foi possível enviar a mensagem. ${falha.message || "Tente novamente."}`,
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout title="Chat">
      {erro && (
        <div
          role="alert"
          style={{
            color: "#8b2525",
            backgroundColor: "#fff0f0",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="vallet-loading-text" role="status">
          Conectando ao chat...
        </p>
      ) : (
        <section className="chat-admin-layout">
          <aside className="chat-conversations" aria-label="Conversas">
            <header className="chat-conversations-header">
              <div>
                <h2>Conversas</h2>
              </div>
            </header>

            <form className="chat-new-conversation" onSubmit={abrirNovaConversa}>
              <label htmlFor="novo-gerente-chat">Nova conversa</label>
              <div>
                <select
                  id="novo-gerente-chat"
                  value={novoGerenteUid}
                  onChange={(evento) => setNovoGerenteUid(evento.target.value)}
                  disabled={!gerentesDisponiveis.length}
                >
                  <option value="">
                    {gerentesDisponiveis.length
                      ? "Selecione um gerente"
                      : "Todos os gerentes já têm conversa"}
                  </option>
                  {gerentesDisponiveis.map((gerente) => (
                    <option key={gerente.uid} value={gerente.uid}>
                      {gerente.nome} · {gerente.estacionamentoNome || "Sem nome"}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!novoGerenteUid}
                  title="Abrir conversa"
                  aria-label="Abrir conversa"
                >
                  🗨️
                </button>
              </div>
              {avisoGerentes && (
                <small className="chat-new-warning">{avisoGerentes}</small>
              )}
            </form>

            <div className="chat-conversations-list">
              {conversas.length === 0 ? (
                <div className="chat-conversations-empty">
                  <span aria-hidden="true">💬</span>
                  <strong>Nenhuma conversa ainda</strong>
                  <p>
                    Quando um gestor enviar uma mensagem, a conversa aparecerá
                    aqui.
                  </p>
                </div>
              ) : (
                conversas.map((conversa) => (
                  <ConversaItem
                    key={conversa.id}
                    conversa={conversa}
                    ativa={conversa.id === selecionadaId}
                    onSelecionar={() => setSelecionadaId(conversa.id)}
                  />
                ))
              )}
            </div>
          </aside>

          <div className="chat-panel">
            {!selecionadaId ? (
              <div className="chat-panel-empty">
                <span aria-hidden="true">💬</span>
                <strong>Selecione uma conversa</strong>
                <p>
                  Escolha um estacionamento à esquerda ou inicie uma nova
                  conversa com um gerente.
                </p>
              </div>
            ) : (
              <>
                <header className="chat-panel-header">
                  <div className="chat-panel-avatar" aria-hidden="true">
                    {iniciais(
                      conversaSelecionada?.gestorNome ||
                        conversaSelecionada?.estacionamentoNome ||
                        "Estacionamento",
                    )}
                  </div>
                  <div>
                    <strong>
                      {conversaSelecionada?.estacionamentoNome ||
                        "Estacionamento"}
                    </strong>
                    <small>
                      {conversaSelecionada?.gestorNome
                        ? `Gerente: ${conversaSelecionada.gestorNome}`
                        : "Gerente do estacionamento"}
                    </small>
                  </div>
                </header>

                <div
                  className="chat-panel-messages"
                  ref={listaMensagensRef}
                  aria-live="polite"
                >
                  {mensagens.length === 0 ? (
                    <p className="chat-panel-empty-text">
                      Nenhuma mensagem nesta conversa. Envie a primeira para o
                      gestor.
                    </p>
                  ) : (
                    mensagens.map((mensagem) => (
                      <Mensagem
                        key={mensagem.id}
                        mensagem={mensagem}
                        uid={conexao?.perfil?.uid}
                      />
                    ))
                  )}
                </div>

                <form className="chat-panel-composer" onSubmit={enviar}>
                  <textarea
                    rows="1"
                    maxLength="4000"
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" && !evento.shiftKey) {
                        evento.preventDefault();
                        enviar(evento);
                      }
                    }}
                    placeholder="Verifique funcionamento, responda chamados..."
                    aria-label="Mensagem para o gerente"
                  />
                  <button type="submit" disabled={enviando || !texto.trim()}>
                    {enviando ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}
