window.addEventListener("resize",()=>{
  clearTimeout(window.__wovenResizeTimer);
  window.__wovenResizeTimer=setTimeout(()=>renderGrid(),120);
});

// Tabs
$("tabName").addEventListener("click",()=>switchMode("name"));
$("tabDraw").addEventListener("click",()=>switchMode("draw"));

// Name controls
["name","nameRows","nameHeight","nameWidth","namePad","spacing","nameLetterColor","nameBgColor"].forEach(id=>$(id).addEventListener("input",updateName));
$("sendToDraw").addEventListener("click",sendNameToDraw);

function stepNumber(id,amount){
  const el=$(id);
  const min=Number(el.min);
  const max=Number(el.max);
  let value=Math.round(Number(el.value)||0)+amount;
  if(Number.isFinite(min)) value=Math.max(min,value);
  if(Number.isFinite(max)) value=Math.min(max,value);
  el.value=value;
  updateName();
}
$("nameHeightMinus").addEventListener("click",()=>stepNumber("nameHeight",-1));
$("nameHeightPlus").addEventListener("click",()=>stepNumber("nameHeight",1));
$("nameWidthMinus").addEventListener("click",()=>stepNumber("nameWidth",-1));
$("nameWidthPlus").addEventListener("click",()=>stepNumber("nameWidth",1));

// Draw controls/actions
$("resizeGraph").addEventListener("click",resizeCustomGraph);
$("fitCustomBtn").addEventListener("click",()=>{customFitToScreen=true; renderGrid();});
$("largeSquaresBtn").addEventListener("click",()=>{customFitToScreen=false; renderGrid();});
$("clearBtn").addEventListener("click",()=>mutate("clear"));
$("fillBtn").addEventListener("click",()=>mutate("fill"));
$("invertBtn").addEventListener("click",()=>mutate("invert"));
$("undoBtn").addEventListener("click",undo);
$("stampHeart").addEventListener("click",()=>{activeStamp="heart"; if($("fitNote")) $("fitNote").textContent="Heart selected — now tap the grid where you want to place it.";});
$("stampFlower").addEventListener("click",()=>{activeStamp="flower"; if($("fitNote")) $("fitNote").textContent="Flower selected — now tap the grid where you want to place it.";});
$("stampStar").addEventListener("click",()=>{activeStamp="star"; if($("fitNote")) $("fitNote").textContent="Star selected — now tap the grid where you want to place it.";});
$("stampSmiley").addEventListener("click",()=>{activeStamp="smiley"; if($("fitNote")) $("fitNote").textContent="Smiley selected — now tap the grid where you want to place it.";});
["drawLetterColor","drawBgColor"].forEach(id=>$(id).addEventListener("input",()=>{if(mode==="draw")renderGrid()}));

// Calculator controls
$("threadType").addEventListener("change",applyThreadPreset);
$("baseThreadType").addEventListener("change",applyThreadPreset);
["finished","tie","baseExtra","ppi","waste","sampleCols","sampleUsed","tail"].forEach(id=>{
  $(id).addEventListener("input",markCalculatorDirty);
});
$("updateCalculatorBtn").addEventListener("click",()=>{
  updateCalculator();
  autosaveCurrentProject();
});

$("saveProject").addEventListener("click",()=>saveProjectNow(false));
$("openProject").addEventListener("click",openSelectedProject);
$("newProject").addEventListener("click",newProjectNow);
$("deleteProject").addEventListener("click",deleteSelectedProject);
$("exportProject").addEventListener("click",exportCurrentProject);
$("importProject").addEventListener("click",()=>$("importProjectFile").click());
$("importProjectFile").addEventListener("change",e=>{
  const file=e.target.files && e.target.files[0];
  if(file) importProjectFile(file);
});
$("projectSelect").addEventListener("change",()=>{
  const projects=readProjects();
  const id=$("projectSelect").value;
  if(id && projects[id]) $("projectName").value=projects[id].name||"Untitled Project";
  refreshProjectGallery(id||null);
});
$("projectName").addEventListener("input",autosaveCurrentProject);

$("printBtn").addEventListener("click",()=>window.print());
$("saveBtn").addEventListener("click",saveSVG);

// Initial render
refreshProjectList();
renderThreadNotes();
nameMatrix=makeNameMatrix();
renderGrid();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js').catch(function(){});
  });
}
