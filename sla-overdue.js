const SLA_KEY="gohHubSLAV1";
const SLA_LIMIT=10*60*1000;

function loadSLA(){

  try{

    const saved=JSON.parse(
      localStorage.getItem(SLA_KEY)||"{}"
    );

    chats.forEach(c=>{

      if(typeof saved[c.id]==="number"){
        c.slaWaitingSince=saved[c.id];
      }

    });

  }catch(e){}

}

function saveSLA(){

  const data={};

  chats.forEach(c=>{

    if(c.slaWaitingSince){
      data[c.id]=c.slaWaitingSince;
    }

  });

  localStorage.setItem(
    SLA_KEY,
    JSON.stringify(data)
  );

}

function isOverdue(c){

  return !!(
    c.slaWaitingSince &&
    Date.now()-c.slaWaitingSince>=SLA_LIMIT
  );

}

function waitingTime(c){

  if(!c.slaWaitingSince)return "";

  const mins=Math.floor(
    (Date.now()-c.slaWaitingSince)/60000
  );

  if(mins<60)return `${mins}m`;

  const h=Math.floor(mins/60);
  const m=mins%60;

  return `${h}h ${m}m`;
}

function syncAnsweredChats(){

  let changed=false;

  chats.forEach(c=>{

    if(
      c.slaWaitingSince &&
      c.messages?.at(-1)?.from==="staff"
    ){

      delete c.slaWaitingSince;
      changed=true;

    }

  });

  if(changed)saveSLA();

}

function createSLAUI(){

  const tabs=document.querySelector(".tabs");

  if(
    tabs &&
    !tabs.querySelector('[data-filter="overdue"]')
  ){

    const btn=document.createElement("button");

    btn.dataset.filter="overdue";
    btn.innerHTML="⚠ Overdue";

    btn.onclick=()=>{

      filter="overdue";

      renderList();

    };

    tabs.appendChild(btn);

  }


  if(!document.getElementById("slaWarning")){

    const warning=document.createElement("div");

    warning.id="slaWarning";

    warning.style.cssText=`
      display:none;
      margin:0 18px 10px;
      padding:10px 12px;
      background:#fff0f0;
      border:1px solid #ffcaca;
      color:#b42318;
      border-radius:9px;
      font-size:12px;
      font-weight:bold;
      cursor:pointer;
    `;

    warning.onclick=()=>{

      filter="overdue";

      renderList();

    };

    const search=document.querySelector(".search");

    search.parentNode.insertBefore(
      warning,
      search
    );

  }

}

function updateSLAWarning(){

  const overdue=chats.filter(isOverdue);

  const warning=document.getElementById(
    "slaWarning"
  );

  if(!warning)return;

  if(!overdue.length){

    warning.style.display="none";

    return;

  }

  warning.style.display="block";

  warning.innerHTML=`
    ⚠ ${overdue.length}
    conversation${overdue.length>1?"s":""}
    overdue — waiting more than 10 minutes
  `;

}

function decorateSLA(){

  document
    .querySelectorAll(".conv")
    .forEach(row=>{

      row.style.background="";
      row.style.borderLeft="";

      row
        .querySelectorAll(".sla-badge")
        .forEach(x=>x.remove());

    });


  chats.forEach(c=>{

    const row=[
      ...document.querySelectorAll(".conv")
    ].find(el=>
      el.getAttribute("onclick")===
      `openChat(${c.id})`
    );

    if(!row)return;

    if(isOverdue(c)){

      row.style.background="#fff0f0";
      row.style.borderLeft=
        "4px solid #dc2626";

      const content=row.querySelector(
        ".conv-content"
      );

      if(content){

        content.insertAdjacentHTML(
          "beforeend",
          `
            <div
              class="sla-badge"
              style="
                display:inline-block;
                margin-top:7px;
                background:#dc2626;
                color:white;
                border-radius:12px;
                padding:4px 7px;
                font-size:10px;
                font-weight:bold;
              "
            >
              ⚠ OVERDUE · ${waitingTime(c)}
            </div>
          `
        );

      }

    }

  });


  if(filter==="overdue"){

    document
      .querySelectorAll(".conv")
      .forEach(row=>{

        const match=(
          row.getAttribute("onclick")||""
        ).match(/openChat\((\d+)\)/);

        if(!match)return;

        const c=chats.find(
          x=>x.id===Number(match[1])
        );

        if(!c || !isOverdue(c)){
          row.remove();
        }

      });

    if(
      !document.querySelector(
        "#conversationList .conv"
      )
    ){

      conversationList.innerHTML=`
        <div style="
          padding:35px 18px;
          text-align:center;
          color:#87958f;
          font-size:13px;
        ">
          No overdue conversations.
        </div>
      `;

    }

  }

}

loadSLA();

createSLAUI();


const slaRenderList=renderList;

renderList=function(){

  syncAnsweredChats();

  slaRenderList();

  decorateSLA();

  updateSLAWarning();

};


const slaReceiveCustomer=
  receiveCustomerMessage;

receiveCustomerMessage=function(text){

  const c=chats.find(
    x=>x.id===activeId
  );

  const before=c?.messages.length||0;

  slaReceiveCustomer(text);

  if(!c)return;

  if(
    c.messages.length>before &&
    c.messages.at(-1)?.from==="customer"
  ){

    if(!c.slaWaitingSince){
      c.slaWaitingSince=Date.now();
    }

    c.messages.at(-1).receivedAt=
      Date.now();

    saveSLA();

    if(
      typeof saveMessageHistory==="function"
    ){
      saveMessageHistory();
    }

    renderList();

  }

};


const slaSendMessage=sendMessage;

sendMessage=function(){

  const c=chats.find(
    x=>x.id===activeId
  );

  const before=c?.messages.length||0;

  slaSendMessage();

  if(
    c &&
    c.messages.length>before &&
    c.messages.at(-1)?.from==="staff"
  ){

    delete c.slaWaitingSince;

    saveSLA();

    renderList();

  }

};

sendBtn.onclick=sendMessage;


function createSLATestButton(){

  const simulator=document.getElementById(
    "aiSimulator"
  );

  if(
    !simulator ||
    document.getElementById("slaTestBtn")
  )return;

  const btn=document.createElement("button");

  btn.id="slaTestBtn";
  btn.textContent="Test 10m";

  btn.style.cssText=`
    border:0;
    border-radius:8px;
    padding:0 12px;
    background:#b42318;
    color:white;
    cursor:pointer;
  `;

  btn.onclick=()=>{

    receiveCustomerMessage(
      "Test customer message — waiting for reply"
    );

    if(typeof cancelAI==="function"){
      cancelAI(activeId,"SLA test");
    }

    const c=chats.find(
      x=>x.id===activeId
    );

    c.slaWaitingSince=
      Date.now()-(11*60*1000);

    saveSLA();

    renderList();

  };

  simulator.appendChild(btn);

}

createSLATestButton();

renderList();

setInterval(()=>{

  renderList();

},5000);
