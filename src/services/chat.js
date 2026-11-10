import { getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, inMemoryPersistence, signInWithCustomToken, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { apiService } from "./api";

const APP_NAME = "vallet-desktop-chat";

const configuracao = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAmbUqB1PQPPsXHd_CwiVoDR_emoCEfLUw",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "valletprojeto-ce6f6.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "valletprojeto-ce6f6",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "valletprojeto-ce6f6.firebasestorage.app",
};

let conexao = null;

function obterAuth(app) {
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence });
  } catch (_) {
    return getAuth(app);
  }
}

async function criarConexao() {
  const tokenChat = await apiService.getChatToken();

  if (!tokenChat?.token) {
    throw new Error("A API não retornou um token válido para o chat.");
  }

  const app =
    getApps().find((instancia) => instancia.name === APP_NAME) ||
    initializeApp(configuracao, APP_NAME);

  const auth = obterAuth(app);
  const credencial = await signInWithCustomToken(auth, tokenChat.token);
  const token = await credencial.user.getIdTokenResult();
  const claims = token.claims || {};

  return {
    app,
    auth,
    db: getFirestore(app),
    perfil: {
      uid: credencial.user.uid,
      tipo: claims.tipo_user || tokenChat.tipo || "superadmin",
      nome: claims.nome || tokenChat.nome || "Administrador",
      estacionamentoId:
        claims.estacionamentoId || tokenChat.estacionamentoId || "",
      estacionamentoNome: tokenChat.estacionamentoNome || "",
    },
  };
}

/** Conecta uma única vez por sessão do aplicativo. */
export function conectarChat() {
  if (!conexao) {
    conexao = criarConexao().catch((erro) => {
      conexao = null;
      throw erro;
    });
  }
  return conexao;
}

export async function desconectarChat() {
  const atual = conexao;
  conexao = null;

  if (!atual) return;

  try {
    const { auth } = await atual;
    await signOut(auth);
  } catch (_) {
  }
}
