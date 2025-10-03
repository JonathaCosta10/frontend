import React from "react";
import { Outlet } from "react-router-dom";
import MarketLayout from "@/components/MarketLayout";

export default function Market() {
  return (
    <MarketLayout>
      <Outlet />
    </MarketLayout>
  );
}