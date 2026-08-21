function saveSVG(){
  const m=activeMatrix(); if(!m.length)return;
  const [letter,bg]=activeColors();
  const cs=20,pad=20,rows=m.length,cols=m[0].length;
  let rects="";
  m.forEach((row,r)=>row.forEach((v,c)=>{
    rects+=`<rect x="${pad+c*cs}" y="${pad+r*cs}" width="${cs}" height="${cs}" fill="${v?letter:bg}" stroke="#aeb4bd" stroke-width="1"/>`;
  }));
  const w=cols*cs+pad*2,h=rows*cs+pad*2;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="white"/>${rects}</svg>`;
  const blob=new Blob([svg],{type:"image/svg+xml"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=(mode==="name"?($("name").value||"name"):"custom")+"_wrapped_woven_pattern.svg";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
