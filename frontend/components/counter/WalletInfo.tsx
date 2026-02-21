"use client";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useContext, useEffect, useState } from "react";
import { NetworkContext } from "./provider/Solana";
import { useProgram } from "./hooks/useProgram";

const NETWORK_LABELS: Record<string, string> = {
  devnet: "Devnet",
  testnet: "Testnet",
  "mainnet-beta": "Mainnet Beta",
};

export function WalletInfo() {
  const { connection, publicKey, connected } = useProgram();
  const network = useContext(NetworkContext);
  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalanceLamports(null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey);
        if (!cancelled) setBalanceLamports(balance);
      } catch {
        if (!cancelled) setBalanceLamports(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [connected, publicKey, connection]);

  if (!connected) return null;

  const solBalance =
    balanceLamports != null ? balanceLamports / LAMPORTS_PER_SOL : null;
  const networkLabel =
    network != null ? NETWORK_LABELS[network] ?? network : "—";

  return (
    <div className="flex flex-col items-center gap-1 text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Баланс:</span>
        <span className="font-medium text-white">
          {solBalance != null ? solBalance.toFixed(4) : "…"} SOL
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Сеть:</span>
        <span className="font-medium text-white">{networkLabel}</span>
      </div>
    </div>
  );
}
