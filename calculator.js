function fmtIn(v){return (Math.round(v*10)/10).toString()+" in"}
function fmtYd(inches){
  let y=inches/36;
  return (y<10?y.toFixed(2):y.toFixed(1)).replace(/0$/,"").replace(/\.$/,"")+" yd";
}
function updateCalculator(){
  const m=activeMatrix(); if(!m.length||!m[0].length)return;

  const canvasRows=m.length, canvasCols=m[0].length;
  const finished=Number($("finished").value)||0;
  const tie=Number($("tie").value)||0;
  const extra=Number($("baseExtra").value)||0;
  const ppi=Math.max(.1,Number($("ppi").value)||10);
  const waste=Math.max(0,Number($("waste").value)||0)/100;
  const sampleCols=Math.max(1,Number($("sampleCols").value)||10);
  const sampleUsed=Math.max(.01,Number($("sampleUsed").value)||36);
  const tail=Math.max(0,Number($("tail").value)||0);

  let on=0;
  let minRow=canvasRows, maxRow=-1;

  m.forEach((row,r)=>row.forEach((v,c)=>{
    if(v){
      on++;
      if(r<minRow) minRow=r;
      if(r>maxRow) maxRow=r;
    }
  }));

  // Use only the occupied pattern height for base strings.
  // Keep the full column count because left/right blank columns are usually real background.
  const activeRows = on ? (maxRow-minRow+1) : canvasRows;
  const activeCols = canvasCols;
  const totalActiveCells = activeRows * activeCols;
  const bgCells = Math.max(0, totalActiveCells - on);

  const each=finished+2*tie+extra;
  const baseTotal=each*activeRows;
  const graphLen=activeCols/ppi;

  // Calibration sample is based on full-width passes over the actual woven height.
  const inchesPerCell=sampleUsed/(sampleCols*activeRows);
  const patternIn=on ? (on*inchesPerCell*(1+waste)+tail) : 0;
  const bgIn=bgCells ? (bgCells*inchesPerCell*(1+waste)+tail) : 0;

  $("baseCount").textContent=activeRows;
  $("passCount").textContent=activeCols;
  $("eachBase").textContent=fmtIn(each);
  $("graphLen").textContent=fmtIn(graphLen);
  $("baseTotal").textContent=fmtIn(baseTotal);
  $("workingTotal").textContent=fmtIn(patternIn+bgIn);

  const target=Math.round(finished*ppi);
  const delta=target-activeCols;
  let sizeMsg=Math.abs(delta)<=1
    ? `This graph is about the right length for ${finished}" at ${ppi} passes/in.`
    : delta>0
      ? `For about ${finished}" at ${ppi} passes/in, add roughly ${delta} graph columns.`
      : `At ${ppi} passes/in, this graph is roughly ${Math.abs(delta)} columns longer than ${finished}".`;

  const boundsMsg = on
    ? `Canvas: ${canvasRows} rows × ${canvasCols} columns. Active pattern height: ${activeRows} rows.`
    : `Canvas: ${canvasRows} rows × ${canvasCols} columns.`;

  $("calcNote").innerHTML =
    `<b>${boundsMsg}</b> Pattern cells: ${on.toLocaleString()}; background cells counted: ${bgCells.toLocaleString()}. ` +
    `Calibration used: ${sampleUsed}" of thread for ${sampleCols} full-width passes over ${activeRows} active rows. ` +
    sizeMsg;
}
