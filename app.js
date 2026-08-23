let craftMode="woven";

function setCraftMode(next){
  craftMode=next==="beaded" ? "beaded" : "woven";

  $("craftWoven").classList.toggle("active",craftMode==="woven");
  $("craftBeaded").classList.toggle("active",craftMode==="beaded");

  $("wovenCalculatorWrap").classList.toggle("hidden",craftMode!=="woven");
  $("beadCalculatorWrap").classList.toggle("hidden",craftMode!=="beaded");

  $("navCalcLabel").textContent=craftMode==="woven" ? "Calculator" : "Beads";
  $("designHeading").textContent=craftMode==="woven" ? "Design your bracelet" : "Design your beaded bracelet";
  $("designHint").textContent=craftMode==="woven"
    ? "Name generator + custom editor together"
    : "Use the same grid as a bead pattern";
  $("patternEyebrow").textContent=craftMode==="woven" ? "LIVE PATTERN" : "BEAD PATTERN";
  $("goCalculatorBtn").textContent=craftMode==="woven" ? "Calculate String" : "Calculate Beads";
  if($("printBtn")) $("printBtn").textContent=craftMode==="woven" ? "Print Pattern" : "Print Bead Pattern";

  if(craftMode==="beaded" && typeof updateBeadCalculator==="function"){
    updateBeadCalculator();
  }else if(craftMode==="woven" && typeof runCalculatorUpdate==="function"){
    runCalculatorUpdate();
  }

  // Keep the current pattern when switching modes.
  renderGrid();
}

$("craftWoven").addEventListener("click",()=>setCraftMode("woven"));
$("craftBeaded").addEventListener("click",()=>setCraftMode("beaded"));

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
$("goCalculatorBtn").addEventListener("click",()=>{showAppPane("calculator"); if(craftMode==="beaded") updateBeadCalculator();});
$("backToDesignBtn").addEventListener("click",()=>showAppPane("design"));
$("goProjectsBtn").addEventListener("click",()=>showAppPane("projects"));
$("projectsToDesignBtn").addEventListener("click",()=>showAppPane("design"));
$("beadBackToDesignBtn").addEventListener("click",()=>showAppPane("design"));
$("beadGoProjectsBtn").addEventListener("click",()=>showAppPane("projects"));


function setGraphFullscreen(on){
  const card=document.querySelector(".previewCard");
  if(!card) return;

  const enabled=!!on;
  card.classList.toggle("graphFullscreen",enabled);
  document.body.classList.toggle("graphFullscreenOpen",enabled);

  const btn=$("fullscreenGraphBtn");
  if(btn){
    btn.setAttribute("aria-pressed",enabled?"true":"false");
  }

  requestAnimationFrame(()=>{
    renderGrid();
    if(enabled && $("gridScroll")){
      $("gridScroll").scrollLeft=0;
      $("gridScroll").scrollTop=0;
    }
  });
}

$("fullscreenGraphBtn").addEventListener("click",()=>setGraphFullscreen(true));
$("exitFullscreenGraphBtn").addEventListener("click",()=>setGraphFullscreen(false));

document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && document.querySelector(".previewCard.graphFullscreen")){
    setGraphFullscreen(false);
  }
});

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
$("rowsMinus").addEventListener("click",()=>stepGraphSize("rows",-1));
$("rowsPlus").addEventListener("click",()=>stepGraphSize("rows",1));
$("colsMinus10").addEventListener("click",()=>stepGraphSize("cols",-10));
$("colsMinus").addEventListener("click",()=>stepGraphSize("cols",-1));
$("colsPlus").addEventListener("click",()=>stepGraphSize("cols",1));
$("colsPlus10").addEventListener("click",()=>stepGraphSize("cols",10));

document.querySelectorAll(".sizePreset").forEach(btn=>{
  btn.addEventListener("click",()=>{
    applyGraphSize(Number(btn.dataset.rows),Number(btn.dataset.cols));
  });
});

["drawRows","drawCols"].forEach(id=>{
  $(id).addEventListener("input",updateGraphSizeReadout);
  $(id).addEventListener("change",updateGraphSizeReadout);
});

$("fitCustomBtn").addEventListener("click",()=>{customFitToScreen=true; renderGrid();});
$("largeSquaresBtn").addEventListener("click",()=>{customFitToScreen=false; renderGrid();});
$("showGridNumbers").addEventListener("change",()=>{
  showGridNumbers=$("showGridNumbers").checked;
  renderGrid();
  autosaveCurrentProject();
});
$("clearBtn").addEventListener("click",()=>mutate("clear"));
$("fillBtn").addEventListener("click",()=>mutate("fill"));
$("invertBtn").addEventListener("click",()=>mutate("invert"));
$("insertRowBtn").addEventListener("click",()=>insertBlankRowAt($("insertRowAt").value));
$("insertColBtn").addEventListener("click",()=>insertBlankColumnAt($("insertColAt").value));
$("deleteRowBtn").addEventListener("click",()=>deleteRowAt($("insertRowAt").value));
$("deleteColBtn").addEventListener("click",()=>deleteColumnAt($("insertColAt").value));
$("randomPatternBtn").addEventListener("click",()=>{
  generateRandomPattern($("randomPatternStyle").value);
  autosaveCurrentProject();
});
$("undoBtn").addEventListener("click",undo);
function setStampCategory(category){
  document.querySelectorAll(".stampCategory").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.category===category);
  });
  document.querySelectorAll("[data-stamp]").forEach(btn=>{
    const show=category==="all" || btn.dataset.category===category;
    btn.classList.toggle("stampHidden",!show);
  });
}

document.querySelectorAll(".stampCategory").forEach(btn=>{
  btn.addEventListener("click",()=>setStampCategory(btn.dataset.category));
});

setStampCategory("all");

function renderToolSelection(){
  document.querySelectorAll(".graphTool").forEach(btn=>{
    const active=btn.dataset.tool===currentTool;
    btn.classList.toggle("active",active);
    if(btn.id==="toolStamp"){
      btn.classList.toggle("stampWaiting",active && !activeStamp);
    }
  });
}

function setGraphTool(tool){
  currentTool=tool;
  renderToolSelection();
  if($("fitNote")){
    if(tool==="draw") $("fitNote").textContent="Draw tool selected — tap or drag to add squares.";
    else if(tool==="erase") $("fitNote").textContent="Erase tool selected — tap or drag to remove squares.";
    else if(tool==="stamp") $("fitNote").textContent=activeStamp
      ? `${activeStamp} selected — tap the grid to place it.`
      : "Stamp tool selected — choose a stamp below, then tap the grid.";
    else if(tool==="fill") $("fitNote").textContent="Fill tool selected — tap a connected area to fill it.";
  }
}

function renderStampButtonPreviews(){
  document.querySelectorAll("#stampLibrary [data-stamp]").forEach(btn=>{
    const key=btn.dataset.stamp;
    const pattern=STAMPS[key];
    if(!pattern) return;
    const label=(btn.querySelector(".stampName")?.textContent || btn.title || key).trim();
    btn.innerHTML="";
    const preview=document.createElement("span");
    preview.className="stampPreview";
    preview.style.setProperty("--sp-rows",pattern.length);
    preview.style.setProperty("--sp-cols",pattern[0].length);
    pattern.forEach(row=>{
      row.split("").forEach(bit=>{
        const px=document.createElement("span");
        px.className="stampPixel"+(bit==="1"?" on":"");
        preview.appendChild(px);
      });
    });
    const name=document.createElement("span");
    name.className="stampName";
    name.textContent=label;
    btn.append(preview,name);
  });
}

renderStampButtonPreviews();
renderToolSelection();


document.querySelectorAll("[data-stamp]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    activeStamp=btn.dataset.stamp;
    document.querySelectorAll("[data-stamp]").forEach(b=>b.classList.toggle("active",b===btn));
    setGraphTool("stamp");
  });
});
document.querySelectorAll(".graphTool").forEach(btn=>{
  btn.addEventListener("click",()=>setGraphTool(btn.dataset.tool));
});

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
["drawLetterColor","drawBgColor"].forEach(id=>$(id).addEventListener("input",()=>{
  if(id==="drawLetterColor" && $("sidePatternColor")) $("sidePatternColor").value=$("drawLetterColor").value;
  if(id==="drawBgColor" && $("sideBackgroundColor")) $("sideBackgroundColor").value=$("drawBgColor").value;
  if(mode==="draw")renderGrid();
}));
document.querySelectorAll(".paletteSwatch").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const target=$(btn.dataset.target);
    if(!target)return;
    target.value=btn.dataset.color;
    if(target.id==="drawLetterColor") $("sidePatternColor").value=btn.dataset.color;
    if(target.id==="drawBgColor") $("sideBackgroundColor").value=btn.dataset.color;
    renderGrid();
    autosaveCurrentProject();
  });
});
$("sidePatternColor").addEventListener("input",()=>{$("drawLetterColor").value=$("sidePatternColor").value;renderGrid();});
$("sideBackgroundColor").addEventListener("input",()=>{$("drawBgColor").value=$("sideBackgroundColor").value;renderGrid();});
$("sidePatternColor").addEventListener("change",autosaveCurrentProject);
$("sideBackgroundColor").addEventListener("change",autosaveCurrentProject);

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

if($("printBtn")) $("printBtn").addEventListener("click",()=>window.print());
if($("saveBtn")) $("saveBtn").addEventListener("click",saveSVG);

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
$("showGridNumbers").checked=true;
showGridNumbers=true;

setCraftMode("woven");

updateGraphSizeReadout();

// Initial render
refreshProjectList();
renderThreadNotes();
nameMatrix=makeNameMatrix();
drawMatrix=blank(Number($("drawRows").value)||9,Number($("drawCols").value)||60);
customBorderApplied=0;
$("drawLetterColor").value=$("nameLetterColor").value;
$("drawBgColor").value=$("nameBgColor").value;
if($("sidePatternColor")) $("sidePatternColor").value=$("drawLetterColor").value;
if($("sideBackgroundColor")) $("sideBackgroundColor").value=$("drawBgColor").value;
mode="draw";
currentTool="draw";
renderToolSelection();
$("modeBadge").textContent="Editable pattern";
$("patternTitle").textContent="MY PATTERN";
renderGrid();
if(typeof runCalculatorUpdate==="function") runCalculatorUpdate();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js').catch(function(){});
  });
}
