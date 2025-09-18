// Este arquivo será o novo ponto de entrada para garantir que React seja definido globalmente
import React from 'react';
import ReactDOM from 'react-dom';

// Definir React globalmente
window.React = React;
window.ReactDOM = ReactDOM;

// Importar o arquivo principal depois que React estiver definido globalmente
import './main';
