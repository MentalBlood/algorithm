/** @jsx h */
const { h } = preact;
const { useState } = preactHooks;

const rootElement = document.getElementById('root');
preact.render(<App></App>, rootElement);