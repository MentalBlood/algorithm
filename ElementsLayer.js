"use strict";function directionFromAngle(e){let t;return t=0===e?"right":.5===e?"up":1===e?"left":1.5===e?"down":null,t}function ElementsLayer(e){const t=e.elements,n=e.angle;return h("table",{className:"Layer ElementsLayer",style:{width:e.mapWidth,height:e.mapHeight}},h("tbody",null,t.map(((e,t)=>h("tr",{key:t},e.map(((e,t)=>h("td",{key:t,className:"a"===e?e+" "+directionFromAngle(n):e}))))))))}