!function(t){var e={};function n(i){if(e[i])return e[i].exports;var o=e[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(i,o,function(e){return t[e]}.bind(null,o));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){t.exports=n(2)},function(t,e,n){},function(t,e,n){"use strict";n.r(e);n(1);class i{constructor({name:t,root:e,background:n="white",showCaptureBtn:i=!1}){this.name=t,this.root=e,this.canvas=null,this.ctx=null,this.background=n,this.init(),i&&this.initCaptureButton()}init(){this.canvas=document.createElement("canvas"),this.canvas.style.background=this.background,this.canvas.width=2*this.root.clientWidth,this.canvas.height=2*this.root.clientHeight,this.canvas.style.height="100%",this.canvas.style.width="100%",this.root.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d")}initCaptureButton(){this.captureButton=document.createElement("a"),this.captureButton.setAttribute("download",this.name+".png"),this.captureButton.setAttribute("href",this.imageData),this.captureButton.innerText="Capture",this.captureButton.className="capture-btn",this.root.appendChild(this.captureButton)}get height(){return this.canvas.height}get width(){return this.canvas.width}get imageData(){return this.canvas.toDataURL("image/png",1)}clear(){this.ctx.clearRect(0,0,this.width,this.height)}stop(){cancelAnimationFrame(this.animation)}animate(t){this.clear(),t.bind(this)(),this.animation=requestAnimationFrame(()=>this.animate.bind(this)(t))}}function o(t,e){return Math.random()<.5?t:e}window.addEventListener("load",(function(){const t=document.body;!function({root:t,segmentSize:e,spaceBetween:n,drawCurves:a=!0}){const r=new i({root:t,name:"division2d",background:"black",showCaptureBtn:!1}),s=r.ctx,c=[];for(let t=0;t<r.height;t+=n){const n=[];for(let i=0;i<r.width;i+=e){const e=u(i),o={x:i,y:t+Math.random()*e/3*-1,color:`hsl(${360*Math.random()}, 100%, 50%)`};n.push(o)}c.push(n)}function u(t){const e=Math.abs(t-r.width/2);return Math.max(r.width/2-600-e,0)}r.animate(()=>{for(let t=4;t<c.length-1;t++){const e=c[t];s.beginPath(),s.moveTo(e[0].x,e[0].y);for(let n=0;n<e.length-2;n++){const i=e[n],r=u(i.x),h=Math.random()*r/200;if(i.y=i.y+o(-h,h),s.lineWidth=5,s.strokeStyle=i.color,a){const e=(c[t][n].x+c[t][n+1].x)/2,i=(c[t][n].y+c[t][n+1].y)/2;s.quadraticCurveTo(c[t][n].x,c[t][n].y,e,i)}else s.lineTo(i.x,i.y)}s.save(),s.globalCompositeOperation="destination-out",s.fill(),s.restore(),s.stroke()}})}({root:t,segmentSize:20,spaceBetween:100})}))}]);
//# sourceMappingURL=bundle.js.map