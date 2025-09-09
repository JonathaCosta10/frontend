import React from "react";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-6 h-6" />
            <span className="font-semibold">Organizesee</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Organizesee. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
