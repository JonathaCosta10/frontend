// Este arquivo será injetado antes de qualquer código da aplicação
// para garantir que o React esteja disponível globalmente

// Importações explícitas
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Garantir que estas variáveis sejam definidas globalmente
window.React = React;
window.ReactDOM = ReactDOM;
window.ReactDOMClient = ReactDOMClient;

// Garantir que 't' seja inicializado para evitar erros
window.t = window.t || {};

// Exportar as dependências
export { React, ReactDOM, ReactDOMClient };
