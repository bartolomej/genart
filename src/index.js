import "./style.css"
import division2d from "./artworks/division2d";

window.addEventListener('load', onLoad)

function onLoad () {
  const root = document.body;
  division2d({ root, segmentSize: 20, spaceBetween: 100 });
}
