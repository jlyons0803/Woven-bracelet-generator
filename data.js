const FONT={
"A":["01110","10001","10001","11111","10001","10001","10001"],
"B":["11110","10001","10001","11110","10001","10001","11110"],
"C":["01111","10000","10000","10000","10000","10000","01111"],
"D":["11110","10001","10001","10001","10001","10001","11110"],
"E":["11111","10000","10000","11110","10000","10000","11111"],
"F":["11111","10000","10000","11110","10000","10000","10000"],
"G":["01111","10000","10000","10111","10001","10001","01111"],
"H":["10001","10001","10001","11111","10001","10001","10001"],
"I":["11111","00100","00100","00100","00100","00100","11111"],
"J":["00111","00010","00010","00010","10010","10010","01100"],
"K":["10001","10010","10100","11000","10100","10010","10001"],
"L":["10000","10000","10000","10000","10000","10000","11111"],
"M":["10001","11011","10101","10101","10001","10001","10001"],
"N":["10001","11001","11001","10101","10011","10011","10001"],
"O":["01110","10001","10001","10001","10001","10001","01110"],
"P":["11110","10001","10001","11110","10000","10000","10000"],
"Q":["01110","10001","10001","10001","10101","10010","01101"],
"R":["11110","10001","10001","11110","10100","10010","10001"],
"S":["01111","10000","10000","01110","00001","00001","11110"],
"T":["11111","00100","00100","00100","00100","00100","00100"],
"U":["10001","10001","10001","10001","10001","10001","01110"],
"V":["10001","10001","10001","10001","10001","01010","00100"],
"W":["10001","10001","10001","10101","10101","11011","10001"],
"X":["10001","10001","01010","00100","01010","10001","10001"],
"Y":["10001","10001","01010","00100","00100","00100","00100"],
"Z":["11111","00001","00010","00100","01000","10000","11111"],
" ":["00000","00000","00000","00000","00000","00000","00000"]
};

let mode="draw";
let nameMatrix=[];
let drawMatrix=[];
let history=[];
let dragging=false;
let drawValue=1;

const $=id=>document.getElementById(id);


function applyTopBottomBorder(matrix,thickness){
  const t=Math.max(0,Math.floor(Number(thickness)||0));
  if(!matrix.length || !matrix[0]?.length || t<=0) return matrix;
  const rows=matrix.length, cols=matrix[0].length;
  const limit=Math.min(t,Math.ceil(rows/2));
  for(let r=0;r<limit;r++){
    for(let c=0;c<cols;c++){
      matrix[r][c]=1;
      matrix[rows-1-r][c]=1;
    }
  }
  return matrix;
}

function makeNameMatrix(){
  const text=$("name").value.toUpperCase();
  const spacing=Math.max(0,Number($("spacing").value)||1);
  const nameHeight=Math.max(3,Math.min(40,Math.round(Number($("nameHeight").value)||7)));
  const letterWidth=Math.max(3,Math.min(30,Math.round(Number($("nameWidth").value)||5)));
  const requestedRows=Math.max(7,Math.min(60,Number($("nameRows").value)||9));
  const sidePadding=Math.max(0,Math.min(30,Number($("namePad").value)||0));
  const borderThickness=Math.max(0,Math.min(3,Number($("nameBorder").value)||0));
  const chars=[...text].filter(ch=>FONT[ch]);

  const artWidth=chars.length
    ? (chars.length*letterWidth)+((chars.length-1)*spacing)
    : 0;

  const contentRows=Math.max(requestedRows,nameHeight);
  const borderGap=borderThickness>0 ? BORDER_GAP_ROWS : 0;
  const actualRows=contentRows+(borderThickness*2)+(borderGap*2);
  const actualCols=Math.max(10,artWidth+(sidePadding*2));
  const m=Array.from({length:actualRows},()=>Array(actualCols).fill(0));

  const top=borderThickness+borderGap+Math.floor((contentRows-nameHeight)/2);
  const left=chars.length ? Math.floor((actualCols-artWidth)/2) : 0;

  // Resize the original 5×7 letter grid to any whole-number width/height.
  // Nearest-neighbor mapping keeps the block/pixel look.
  chars.forEach((ch,i)=>{
    const x0=left+i*(letterWidth+spacing);
    for(let r=0;r<nameHeight;r++){
      const sourceRow=Math.min(6,Math.floor(r*7/nameHeight));
      for(let c=0;c<letterWidth;c++){
        const sourceCol=Math.min(4,Math.floor(c*5/letterWidth));
        if(FONT[ch][sourceRow][sourceCol]==="1"){
          const rr=top+r;
          const cc=x0+c;
          if(rr>=0 && rr<actualRows && cc>=0 && cc<actualCols) m[rr][cc]=1;
        }
      }
    }
  });

  applyTopBottomBorder(m,borderThickness);

  if($("nameSizeNote")){
    let extra="";
    if(actualRows>requestedRows){
      extra=` Graph rows expanded from ${requestedRows} to ${actualRows} so the name fits.`;
    }
    $("nameSizeNote").textContent=
      `Graph: ${actualRows} rows × ${actualCols} columns. ` +
      `Each letter is ${nameHeight} rows tall × ${letterWidth} columns wide. ` +
      (borderThickness ? `Top/bottom border: ${borderThickness} row${borderThickness===1?"":"s"} with 1 blank row between the border and the name. ` : "") +
      `Use the − / + buttons to change either dimension by exactly 1.${extra}`;
  }
  return m;
}

function blank(rows,cols){return Array.from({length:rows},()=>Array(cols).fill(0))}
function clone(m){return m.map(r=>[...r])}
function activeMatrix(){return mode==="name"?nameMatrix:drawMatrix}
function activeColors(){
  return mode==="name"
    ? [$("nameLetterColor").value,$("nameBgColor").value]
    : [$("drawLetterColor").value,$("drawBgColor").value];
}



const STAMPS={
  heart:[
    "01110",
    "11111",
    "11111",
    "01110",
    "00100"
  ],
  flower:[
    "00100",
    "10101",
    "01110",
    "10101",
    "00100"
  ],
  star:[
    "00100",
    "11111",
    "01110",
    "11111",
    "00100"
  ],
  smiley:[
    "00000",
    "01010",
    "00000",
    "10001",
    "01110"
  ]
};
let activeStamp=null;
let mirrorStampEnabled=false;
let customBorderApplied=0;
let showGridNumbers=true;
const BORDER_GAP_ROWS=1;
let customFitToScreen=true;
