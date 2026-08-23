function beadDiameterMM(){
  const v=$("beadSize").value;
  return v==="custom"
    ? Math.max(.5,Number($("customBeadMM").value)||2)
    : Math.max(.5,Number(v)||2);
}

function updateBeadCalculator(){
  const m=activeMatrix();
  if(!m.length || !m[0]?.length) return;

  const rows=m.length;
  const cols=m[0].length;
  let pattern=0;
  m.forEach(row=>row.forEach(v=>{if(v) pattern++;}));

  const total=rows*cols;
  const background=total-pattern;
  const mm=beadDiameterMM();
  const targetIn=Math.max(1,Number($("beadFinished").value)||6.5);
  const extra=Math.max(0,Number($("beadWaste").value)||0)/100;

  const graphLengthIn=(cols*mm)/25.4;
  const targetCols=Math.max(1,Math.round((targetIn*25.4)/mm));
  const repeats=targetCols/Math.max(1,cols);
  const needed=rows*targetCols;
  const withExtra=Math.ceil(needed*(1+extra));

  $("beadRows").textContent=rows.toLocaleString();
  $("beadCols").textContent=cols.toLocaleString();
  $("patternBeads").textContent=pattern.toLocaleString();
  $("backgroundBeads").textContent=background.toLocaleString();
  $("totalBeads").textContent=total.toLocaleString();
  $("beadGraphLength").textContent=`${Math.round(graphLengthIn*100)/100} in`;
  $("targetColumns").textContent=targetCols.toLocaleString();
  $("repeatCount").textContent=`${Math.round(repeats*100)/100}×`;
  $("beadsNeeded").textContent=needed.toLocaleString();
  $("beadsWithExtra").textContent=withExtra.toLocaleString();

  $("beadCalcNote").innerHTML=
    `<b>${rows} beads tall × ${cols} beads long.</b> `+
    `Using about ${mm} mm per bead, this graph is roughly ${Math.round(graphLengthIn*100)/100}" long. `+
    `Actual finished size depends on bead brand, stitch or loom method, spacing, and tension.`;

  const now=new Date();
  $("beadCalcStatus").textContent=`Updated at ${now.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}.`;
}

function markBeadCalculatorDirty(){
  if($("beadCalcStatus")) $("beadCalcStatus").textContent="Changes waiting — tap Update Bead Count.";
}

["beadFinished","customBeadMM","beadWaste"].forEach(id=>{
  $(id).addEventListener("input",markBeadCalculatorDirty);
});

$("beadSize").addEventListener("change",()=>{
  const custom=$("beadSize").value==="custom";
  $("customBeadMM").disabled=!custom;
  if(!custom) $("customBeadMM").value=$("beadSize").value;
  markBeadCalculatorDirty();
});

$("updateBeadsBtn").addEventListener("click",updateBeadCalculator);
