function showAppPane(target){
  const panes={
    design:$("paneDesign"),
    calculator:$("paneCalculator"),
    projects:$("paneProjects")
  };
  const nav={
    design:$("navDesign"),
    calculator:$("navCalculator"),
    projects:$("navProjects")
  };

  Object.entries(panes).forEach(([key,el])=>el.classList.toggle("hidden",key!==target));
  Object.entries(nav).forEach(([key,el])=>el.classList.toggle("active",key===target));

  if(target==="design"){
    requestAnimationFrame(()=>renderGrid());
  }
  if(target==="calculator" && typeof markCalculatorDirty==="function"){
    markCalculatorDirty();
  }
  if(target==="projects" && typeof refreshProjectList==="function"){
    refreshProjectList(currentProjectId);
  }

  window.scrollTo({top:0,behavior:"smooth"});
}

$("navDesign").addEventListener("click",()=>showAppPane("design"));
$("navCalculator").addEventListener("click",()=>showAppPane("calculator"));
$("navProjects").addEventListener("click",()=>showAppPane("projects"));
$("goCalculatorBtn").addEventListener("click",()=>showAppPane("calculator"));
$("backToDesignBtn").addEventListener("click",()=>showAppPane("design"));
$("goProjectsBtn").addEventListener("click",()=>showAppPane("projects"));
$("projectsToDesignBtn").addEventListener("click",()=>showAppPane("design"));

window.addEventListener("resize",()=>{
  clearTimeout(window.__wovenResizeTimer);
  window.__wovenResizeTimer=setTimeout(()=>renderGrid(),120);
});

// Name controls
["name","nameRows","nameHeight","nameWidth","namePad","spacing","nameBorder","nameLetterColor","nameBgColor"].forEach(id=>$(id).addEventListener("input",updateName));
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
$("mirrorStamp").addEventListener("change",()=>{
  mirrorStampEnabled=$("mirrorStamp").checked;
  if($("mirrorStampNote")){
    $("mirrorStampNote").textContent=mirrorStampEnabled
      ? "Mirror is ON — place one stamp and its matching copy will appear on the opposite side."
      : "Turn on Mirror stamp, then place a stamp on one side. A matching stamp will appear the same distance from the center on the other side.";
  }
  autosaveCurrentProject();
});
$("addBorderBtn").addEventListener("click",addCustomBorder);
$("removeBorderBtn").addEventListener("click",removeCustomBorder);
$("drawBorderThickness").addEventListener("change",autosaveCurrentProject);
["drawLetterColor","drawBgColor"].forEach(id=>$(id).addEventListener("input",()=>{if(mode==="draw")renderGrid()}));

// Calculator controls
$("threadType").addEventListener("change",applyWrappingThreadPreset);
$("baseThreadType").addEventListener("change",applyBaseThreadPreset);
["finished","tie","baseExtra","ppi","waste","sampleCols","sampleUsed","tail"].forEach(id=>{
  $(id).addEventListener("input",markCalculatorDirty);
});
$("updateCalculatorBtn").addEventListener("click",()=>{
  if(typeof runCalculatorUpdate==="function"){
    runCalculatorUpdate();
  }else{
    $("calcDirtyNote").textContent="App files are out of sync. Refresh Safari once to load the newest version.";
  }
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

// V28 blank-start behavior:
 // Reopening the app starts completely blank. Saved projects remain available
 // in Projects and are loaded only when the user explicitly opens one.
 currentProjectId=null;
 $("projectName").value="";
 $("name").value="";
 $("nameRows").value=9;
 $("nameHeight").value=7;
 $("nameWidth").value=5;
 $("namePad").value=4;
 $("spacing").value=1;
 $("nameBorder").value=0;
 $("nameLetterColor").value="#183d7a";
 $("nameBgColor").value="#d9f3e8";
 $("drawBorderThickness").value=1;
 $("mirrorStamp").checked=false;
 mirrorStampEnabled=false;
 customBorderApplied=0;

// Initial render
refreshProjectList();
renderThreadNotes();
nameMatrix=makeNameMatrix();
drawMatrix=blank(Number($("drawRows").value)||9,Number($("drawCols").value)||60);
customBorderApplied=0;
$("drawLetterColor").value=$("nameLetterColor").value;
$("drawBgColor").value=$("nameBgColor").value;
mode="draw";
$("modeBadge").textContent="Editable pattern";
$("patternTitle").textContent="MY PATTERN";
renderGrid();
if(typeof runCalculatorUpdate==="function") runCalculatorUpdate();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js').catch(function(){});
  });
}
