function placeStampAt(centerRow,centerCol,stampRows){
  const height=stampRows.length;
  const width=stampRows[0].length;
  const startRow=centerRow-Math.floor(height/2);
  const startCol=centerCol-Math.floor(width/2);

  for(let r=0;r<height;r++){
    for(let c=0;c<width;c++){
      const rr=startRow+r;
      const cc=startCol+c;
      if(rr<0 || cc<0 || rr>=drawMatrix.length || cc>=drawMatrix[0].length) continue;
      if(stampRows[r][c]==="1") drawMatrix[rr][cc]=1;
    }
  }
}

function sendNameToDraw(){
  // Build a fresh name matrix using the current name settings.
  nameMatrix=makeNameMatrix();

  // Copy it into the editable custom grid.
  drawMatrix=clone(nameMatrix);

  // Update the custom grid size controls to match what was copied.
  $("drawRows").value=drawMatrix.length;
  $("drawCols").value=drawMatrix[0]?.length || 1;

  // Keep the same colors so the pattern looks identical when transferred.
  $("drawLetterColor").value=$("nameLetterColor").value;
  $("drawBgColor").value=$("nameBgColor").value;

  history=[];
  customFitToScreen=true;
  switchMode("draw");
  $("patternTitle").textContent=($("name").value.toUpperCase() || "NAME") + " — EDITABLE";
  if($("fitNote")){
    $("fitNote").textContent="Name loaded into the editor. You can now draw, erase, resize, add borders, or add picture stamps.";
  }
}

function switchMode(next){
  // V24 uses one unified editor. "Name" is now a way to populate the editable
  // custom grid rather than a separate editing mode.
  if(next==="name"){
    nameMatrix=makeNameMatrix();
    drawMatrix=clone(nameMatrix);
    $("drawRows").value=drawMatrix.length;
    $("drawCols").value=drawMatrix[0]?.length || 1;
    $("drawLetterColor").value=$("nameLetterColor").value;
    $("drawBgColor").value=$("nameBgColor").value;
  }

  mode="draw";
  $("namePanel").classList.remove("hidden");
  $("drawPanel").classList.remove("hidden");
  $("modeBadge").textContent="Editable pattern";

  if(!drawMatrix.length){
    drawMatrix=blank(Number($("drawRows").value)||9,Number($("drawCols").value)||60);
  }

  if(next==="name"){
    $("patternTitle").textContent=($("name").value.toUpperCase()||"NAME")+" — EDITABLE";
  }else if(!$("patternTitle").textContent || $("patternTitle").textContent==="NAME"){
    $("patternTitle").textContent="MY PATTERN";
  }

  renderGrid();
}

function renderGrid(){
  const m=activeMatrix();
  if(!m.length||!m[0].length)return;

  const [letter,bg]=activeColors();
  document.documentElement.style.setProperty("--letter",letter);
  document.documentElement.style.setProperty("--bg",bg);

  const g=$("grid");
  const holder=$("gridScroll");
  g.innerHTML="";
  g.classList.toggle("draw",mode==="draw");

  const cols=m[0].length;

  // Name patterns always fit the screen.
  // Custom patterns can either fit the screen or use larger squares for easier editing.
  let cellSize=20;
  if(holder && (mode==="name" || customFitToScreen)){
    const available=Math.max(240,holder.clientWidth-26);
    cellSize=Math.floor(available/cols);
    cellSize=Math.max(6,Math.min(20,cellSize));
  }

  g.style.setProperty("--cell-size",cellSize+"px");
  g.style.gridTemplateColumns=`repeat(${cols},${cellSize}px)`;

  m.forEach((row,r)=>row.forEach((v,c)=>{
    const cell=document.createElement("div");
    cell.className="cell"+(v?" on":"");
    if(mode==="draw"){
      cell.addEventListener("pointerdown",e=>{
        e.preventDefault();

        if(activeStamp){
          history.push(clone(drawMatrix));
          if(history.length>40)history.shift();
          placeStampAt(r,c,STAMPS[activeStamp]);
          const placed=activeStamp;
          activeStamp=null;
          renderGrid();
          if($("fitNote")){
            $("fitNote").textContent=`Added a ${placed}. You can tap a stamp button again to place another one, or keep drawing normally.`;
          }
          return;
        }

        history.push(clone(drawMatrix));
        if(history.length>40)history.shift();
        dragging=true;
        drawValue=drawMatrix[r][c]?0:1;
        drawMatrix[r][c]=drawValue;
        cell.classList.toggle("on",!!drawValue);
      });
      cell.addEventListener("pointerenter",()=>{
        if(!dragging)return;
        drawMatrix[r][c]=drawValue;
        cell.classList.toggle("on",!!drawValue);
      });
    }
    g.appendChild(cell);
  }));

  if($("fitNote")){
    if(mode==="name"){
      $("fitNote").textContent = cellSize<20
        ? `Graph automatically scaled to ${cellSize}px squares so all ${cols} columns fit on screen.`
        : `Graph fits at full-size squares.`;
    }else if(customFitToScreen){
      $("fitNote").textContent = cellSize<20
        ? `Custom graph scaled to ${cellSize}px squares so all ${cols} columns fit on screen. Tap Large Squares if you want easier editing.`
        : `Custom graph fits on screen at full-size squares.`;
    }else{
      $("fitNote").textContent = `Custom graph is using large squares for easier editing. Scroll sideways if needed, or tap Fit Graph to Screen.`;
    }
  }

  // Any graph/name/drawing change can affect the totals.
  // Mark the calculator as waiting so one button applies ALL current values together.
  markCalculatorDirty();
}
window.addEventListener("pointerup",()=>dragging=false);

function updateName(){
  // Keep the generator preview settings current without overwriting the editable pattern.
  // The user explicitly applies the name with "Generate Name in Editor".
  nameMatrix=makeNameMatrix();
  autosaveCurrentProject();
}


function addCustomBorder(){
  if(mode!=="draw" || !drawMatrix.length) return;
  history.push(clone(drawMatrix));
  if(history.length>40) history.shift();
  applyTopBottomBorder(drawMatrix,$("drawBorderThickness").value);
  renderGrid();
}

function removeCustomBorder(){
  if(mode!=="draw" || !drawMatrix.length) return;
  history.push(clone(drawMatrix));
  if(history.length>40) history.shift();

  const t=Math.max(1,Math.floor(Number($("drawBorderThickness").value)||1));
  const rows=drawMatrix.length, cols=drawMatrix[0].length;
  const limit=Math.min(t,Math.ceil(rows/2));
  for(let r=0;r<limit;r++){
    for(let c=0;c<cols;c++){
      drawMatrix[r][c]=0;
      drawMatrix[rows-1-r][c]=0;
    }
  }
  renderGrid();
}

function resizeCustomGraph(){
  const rows=Math.max(3,Math.min(60,Number($("drawRows").value)||9));
  const cols=Math.max(5,Math.min(200,Number($("drawCols").value)||60));
  history.push(clone(drawMatrix));
  if(history.length>40)history.shift();

  const old=drawMatrix;
  const next=blank(rows,cols);
  const copyRows=Math.min(rows,old.length);
  const copyCols=old.length ? Math.min(cols,old[0].length) : 0;
  for(let r=0;r<copyRows;r++){
    for(let c=0;c<copyCols;c++) next[r][c]=old[r][c];
  }
  drawMatrix=next;
  renderGrid();
}
function mutate(kind){
  if(mode!=="draw")return;
  history.push(clone(drawMatrix));
  if(kind==="clear")drawMatrix=drawMatrix.map(r=>r.map(()=>0));
  if(kind==="fill")drawMatrix=drawMatrix.map(r=>r.map(()=>1));
  if(kind==="invert")drawMatrix=drawMatrix.map(r=>r.map(v=>v?0:1));
  renderGrid();
}
function undo(){
  if(mode!=="draw"||!history.length)return;
  drawMatrix=history.pop();
  renderGrid();
}
