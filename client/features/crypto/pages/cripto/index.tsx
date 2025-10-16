import React from 'react';
import AnaliseCripto from "./AnaliseCripto";
import CryptoPremiumGuard from "@/core/security/guards/CryptoPremiumGuard";

export default function CryptoPage() {
  return (
    <CryptoPremiumGuard>
      <AnaliseCripto />
    </CryptoPremiumGuard>
  );
}
