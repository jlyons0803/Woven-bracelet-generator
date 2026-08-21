const THREAD_PRESETS={
  floss6:{label:"6-strand embroidery floss",ppi:9,note:"A medium-thick starting estimate when all 6 strands are used together."},
  floss3:{label:"3-strand embroidery floss",ppi:12,note:"Thinner than full floss, so more wrap passes usually fit into each inch."},
  pearl5:{label:"Pearl cotton #5",ppi:8,note:"A thicker pearl cotton starting estimate."},
  pearl8:{label:"Pearl cotton #8",ppi:11,note:"A medium pearl cotton starting estimate."},
  pearl10:{label:"Pearl cotton #10",ppi:13,note:"A finer pearl cotton starting estimate."},
  crochet10:{label:"Crochet / craft thread #10",ppi:10,note:"A general starting estimate for size-10 craft/crochet thread."},
  fineCord:{label:"Fine nylon / beading cord",ppi:14,note:"A fine-cord starting estimate; actual packing can vary quite a bit by material."},
  custom:{label:"Custom / measured thread",ppi:null,note:"Enter your own wrap passes per inch. This is best when you have measured your actual thread and tension."}
};

const BASE_THREAD_PRESETS={
  floss6:{label:"6-strand embroidery floss",wrapFactor:1.18,note:"Quite thick for a base thread, so wrapping thread usually travels farther around each pass."},
  floss3:{label:"3-strand embroidery floss",wrapFactor:1.10,note:"A medium-thick floss base."},
  pearl5:{label:"Pearl cotton #5",wrapFactor:1.15,note:"A thicker pearl-cotton base thread."},
  pearl8:{label:"Pearl cotton #8",wrapFactor:1.08,note:"A medium pearl-cotton base thread."},
  pearl10:{label:"Pearl cotton #10",wrapFactor:1.04,note:"A finer pearl-cotton base thread."},
  crochet10:{label:"Crochet / craft thread #10",wrapFactor:1.06,note:"A medium craft-thread base."},
  fineCord:{label:"Fine nylon / beading cord",wrapFactor:1.00,note:"A slim base-thread starting estimate."},
  custom:{label:"Custom / measured base thread",wrapFactor:1.00,note:"If your base thread is thicker or thinner than usual, fine-tune the estimate with a real sample."}
};

function renderThreadNotes(){
  const wrapKey=$("threadType").value;
  const wrapPreset=THREAD_PRESETS[wrapKey]||THREAD_PRESETS.custom;
  const baseKey=$("baseThreadType").value;
  const basePreset=BASE_THREAD_PRESETS[baseKey]||BASE_THREAD_PRESETS.custom;

  if(wrapPreset.ppi!=null) $("ppi").value=wrapPreset.ppi;

  const ppiText=wrapPreset.ppi!=null ? ` Starting estimate: ${wrapPreset.ppi} wrap passes per inch.` : "";
  $("threadTypeNote").innerHTML=
    `<b>${wrapPreset.label}:</b> ${wrapPreset.note}${ppiText} ` +
    `Your own woven sample remains the most accurate way to estimate total wrapping-string length because tension affects the result.`;

  const factorPct=Math.round((basePreset.wrapFactor-1)*100);
  const factorText=factorPct===0 ? `This uses the standard base-thread estimate.` :
    (factorPct>0 ? `This increases the wrapping-string estimate by about ${factorPct}% compared with the standard slim-base estimate.` :
                    `This decreases the wrapping-string estimate by about ${Math.abs(factorPct)}%.`);
  $("baseThreadTypeNote").innerHTML=
    `<b>${basePreset.label}:</b> ${basePreset.note} ${factorText}`;
}

function markCalculatorDirty(){
  if($("calcDirtyNote")){
    $("calcDirtyNote").innerHTML='Settings changed — tap <b>Update Calculations</b> to refresh the totals.';
  }
  if($("updateCalculatorBtn")) $("updateCalculatorBtn").classList.add("primary");
  autosaveCurrentProject();
}

function applyThreadPreset(){
  renderThreadNotes();
  markCalculatorDirty();
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
  const baseThreadKey=$("baseThreadType")?.value||"fineCord";
  const basePreset=BASE_THREAD_PRESETS[baseThreadKey]||BASE_THREAD_PRESETS.custom;

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
  const inchesPerCell=(sampleUsed/(sampleCols*activeRows))*basePreset.wrapFactor;
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

  const threadKey=$("threadType")?.value||"custom";
  const threadLabel=(THREAD_PRESETS[threadKey]||THREAD_PRESETS.custom).label;
  const baseLabel=basePreset.label;
  $("calcNote").innerHTML =
    `<b>${boundsMsg}</b> Wrapping thread: ${threadLabel}. Base thread: ${baseLabel}. Pattern cells: ${on.toLocaleString()}; background cells counted: ${bgCells.toLocaleString()}. ` +
    `Calibration used: ${sampleUsed}" of thread for ${sampleCols} full-width passes over ${activeRows} active rows, adjusted for the selected base-thread thickness. ` +
    sizeMsg;

  if($("calcDirtyNote")){
    $("calcDirtyNote").textContent="Calculations are up to date.";
  }
}
