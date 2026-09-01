let detailsDrawerOpen=false;

function createDetailsDrawer(){

  if(document.getElementById("detailsDrawerBtn"))return;

  const btn=document.createElement("button");

  btn.id="detailsDrawerBtn";
  btn.innerHTML="⚙ Details";

  btn.style.cssText=`
    position:fixed;
    right:18px;
    bottom:18px;
    z-index:9000;
    border:0;
    border-radius:22px;
    padding:11px 16px;
    background:#10241d;
    color:white;
    font-weight:bold;
    cursor:pointer;
    box-shadow:0 5px 18px rgba(0,0,0,.18);
    display:none;
  `;

  document.body.appendChild(btn);


  const backdrop=document.createElement("div");

  backdrop.id="detailsDrawerBackdrop";

  backdrop.style.cssText=`
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.28);
    z-index:8998;
    display:none;
  `;

  document.body.appendChild(backdrop);


  const close=document.createElement("button");

  close.id="detailsDrawerClose";
  close.innerHTML="✕";

  close.style.cssText=`
    position:fixed;
    top:14px;
    right:14px;
    z-index:9002;
    width:36px;
    height:36px;
    border:0;
    border-radius:50%;
    background:#10241d;
    color:white;
    font-size:16px;
    cursor:pointer;
    display:none;
  `;

  document.body.appendChild(close);


  btn.onclick=openDetailsDrawer;

  close.onclick=closeDetailsDrawer;

  backdrop.onclick=closeDetailsDrawer;

  updateDetailsDrawerMode();
}


function openDetailsDrawer(){

  if(window.innerWidth>1100)return;

  detailsDrawerOpen=true;

  const panel=document.querySelector(".details");

  panel.style.cssText=`
    display:block;
    position:fixed;
    top:0;
    right:0;
    width:min(360px,92vw);
    height:100vh;
    z-index:9001;
    background:white;
    overflow:auto;
    box-shadow:-8px 0 25px rgba(0,0,0,.15);
  `;

  document.getElementById(
    "detailsDrawerBackdrop"
  ).style.display="block";

  document.getElementById(
    "detailsDrawerClose"
  ).style.display="block";

  document.getElementById(
    "detailsDrawerBtn"
  ).style.display="none";
}


function closeDetailsDrawer(){

  detailsDrawerOpen=false;

  const panel=document.querySelector(".details");

  panel.removeAttribute("style");

  document.getElementById(
    "detailsDrawerBackdrop"
  ).style.display="none";

  document.getElementById(
    "detailsDrawerClose"
  ).style.display="none";

  updateDetailsDrawerMode();
}


function updateDetailsDrawerMode(){

  const btn=document.getElementById(
    "detailsDrawerBtn"
  );

  if(!btn)return;

  if(window.innerWidth<=1100){

    if(!detailsDrawerOpen){
      btn.style.display="block";
    }

  }else{

    detailsDrawerOpen=false;

    btn.style.display="none";

    document
      .querySelector(".details")
      .removeAttribute("style");

    document.getElementById(
      "detailsDrawerBackdrop"
    ).style.display="none";

    document.getElementById(
      "detailsDrawerClose"
    ).style.display="none";
  }
}


window.addEventListener(
  "resize",
  updateDetailsDrawerMode
);

createDetailsDrawer();
