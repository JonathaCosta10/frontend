import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Investimentos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Investimentos</h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e distribuição dos seus investimentos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de investimentos carregando...</p>
        </CardContent>
      </Card>
    </div>
  );
}