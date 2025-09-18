// Este script adiciona uma definição global do React que será injetada no bundle final
import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Estender a interface Window para TypeScript
declare global {
  interface Window {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    ReactDOMClient: typeof ReactDOMClient;
  }
}

// Definir React globalmente
window.React = React;
window.ReactDOM = ReactDOM;
window.ReactDOMClient = ReactDOMClient;

export { React, ReactDOM, ReactDOMClient };
