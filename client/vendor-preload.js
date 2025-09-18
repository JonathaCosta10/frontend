// Este arquivo será injetado antes de qualquer código da aplicação
// para garantir que o React esteja disponível globalmente

// Importações explícitas
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Garantir que estas variáveis sejam definidas globalmente
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.ReactDOMClient = ReactDOMClient;

  // Garantir que 't' seja inicializado para evitar erros
  window.t = window.t || {};
  
  // Outras variáveis que podem causar problemas
  window.e = window.e || {};
  window.r = window.r || {};
  window.n = window.n || {};
  window.o = window.o || {};
  window.i = window.i || {};
  window.a = window.a || {};
  window.u = window.u || {};
  window.s = window.s || {};
  window.c = window.c || {};
  window.l = window.l || {};
  window.d = window.d || {};
  window.f = window.f || {};
  window.p = window.p || {};
  window.h = window.h || {};
  window.m = window.m || {};
  window.g = window.g || {};
  window.v = window.v || {};
  window.y = window.y || {};
  window.b = window.b || {};
  window.w = window.w || {};
  window.x = window.x || {};
  window.k = window.k || {};
}

// Exportar as dependências
export { React, ReactDOM, ReactDOMClient };
