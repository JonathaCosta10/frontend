// Este arquivo garante que React seja injetado globalmente
import React from 'react';
import ReactDOM from 'react-dom';

// Expor React globalmente (necessário para alguns componentes que usam React diretamente)
window.React = React;
window.ReactDOM = ReactDOM;
