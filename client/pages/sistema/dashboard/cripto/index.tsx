import React from 'react';
import AnaliseCripto from "./AnaliseCripto";
import CryptoPremiumGuard from "@/components/CryptoPremiumGuard";

export default function CryptoPage() {
  return (
    <CryptoPremiumGuard>
      <AnaliseCripto />
    </CryptoPremiumGuard>
  );
}
