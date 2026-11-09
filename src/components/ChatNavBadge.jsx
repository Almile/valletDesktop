import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { conectarChat } from "../services/chat";

export default function ChatNavBadge() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let ativo = true;
    let parar = null;

    conectarChat()
      .then(({ db }) => {
        if (!ativo) return;

        parar = onSnapshot(
          collection(db, "chat"),
          (snapshot) => {
            if (!ativo) return;

            let naoLidas = 0;
            snapshot.forEach((documento) => {
              naoLidas += Number(documento.data()?.naoLidasSuperadmin) || 0;
            });
            setTotal(naoLidas);
          },
          (falha) => {
            console.warn("[chat] Contador indisponível:", falha.message);
          },
        );
      })
      .catch((falha) => {
        console.warn("[chat] Contador indisponível:", falha.message);
      });

    return () => {
      ativo = false;
      parar?.();
    };
  }, []);

  if (!total) return null;

  return (
    <span className="nav-badge" aria-label={`${total} mensagens não lidas`}>
      {total > 99 ? "99+" : total}
    </span>
  );
}
