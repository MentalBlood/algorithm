"use strict";function ModalWindow(a){return h("div",{className:a.className},h("div",{className:"modalWindowOverlay",onClick:a.closeFunction}),h("div",{className:"modalWindow"},a.children))}