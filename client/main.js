// Versão simplificada do main.tsx que não depende de compilação TypeScript

// Configurar React como global
window.React = React;
window.ReactDOM = ReactDOM;

// Obter o elemento raiz
const container = document.getElementById("root");

if (!container) {
  console.error("Elemento raiz não encontrado!");
}

// Renderizar mensagem básica
const App = () => {
  return React.createElement('div', { className: 'app-container' }, [
    React.createElement('h1', {}, 'Organizesee'),
    React.createElement('p', {}, 'Carregando aplicação...'),
    React.createElement('div', { className: 'loader' })
  ]);
};

// Criar root e renderizar
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App));
