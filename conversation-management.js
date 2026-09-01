const MANAGEMENT_KEY="gohHubConversationManagementV1";

function loadManagement(){
  try{
    const saved=JSON.parse(localStorage.getItem(MANAGEMENT_KEY)||"{}");

    chats.forEach(c=>{
      if(saved[c.id]){
        if(saved[c.id].assigned) c.assigned=saved[c.id].assigned;
        if(saved[c.id].status) c.status=saved[c.id].status;
      }
    });
  }catch(e){}
}

function saveManagement(){
  const data={};

  chats.forEach(c=>{
    data[c.id]={
      assigned:c.assigned,
      status:c.status
    };
  });

  localStorage.setItem(MANAGEMENT_KEY,JSON.stringify(data));
}

function statusColor(status){

  const colors={
    New:["#e8f1ff","#2563eb"],
    Open:["#e5f8ef","#08744a"],
    Pending:["#fff4d8","#9a6700"],
    Resolved:["#edf0ef","#65736d"]
  };

  return colors[status]||colors.Open;
}

function createQueueFilters(){

  const tabs=document.querySelector(".tabs");

  if(!tabs)return;

  if(!tabs.querySelector('[data-filter="unassigned"]')){

    const btn=document.createElement("button");

    btn.dataset.filter="unassigned";
    btn.textContent="Unassigned";

    tabs.appendChild(btn);

    btn.onclick=()=>{
      filter="unassigned";
      renderList();
    };
  }

  if(document.getElementById("queueFilters"))return;

  const queue=document.createElement("div");

  queue.id="queueFilters";

  queue.style.cssText=`
    display:flex;
    gap:5px;
    padding:0 18px 12px;
    overflow-x:auto;
  `;

  queue.innerHTML=`
    <button data-status="New">New <b id="countNew">0</b></button>
    <button data-status="Open">Open <b id="countOpen">0</b></button>
    <button data-status="Pending">Pending <b id="countPending">0</b></button>
    <button data-status="Resolved">Resolved <b id="countResolved">0</b></button>
  `;

  queue.querySelectorAll("button").forEach(btn=>{

    btn.style.cssText=`
      border:1px solid #e1e8e5;
      background:white;
      color:#68756f;
      border-radius:8px;
      padding:6px 9px;
      cursor:pointer;
      white-space:nowrap;
      font-size:11px;
    `;

    btn.onclick=()=>{
      filter=`status:${btn.dataset.status}`;
      renderList();
    };
  });

  tabs.insertAdjacentElement("afterend",queue);
}

function updateManagementCounts(){

  const counts={
    New:0,
    Open:0,
    Pending:0,
    Resolved:0
  };

  chats.forEach(c=>{
    if(counts[c.status]!==undefined){
      counts[c.status]++;
    }
  });

  const ids={
    New:"countNew",
    Open:"countOpen",
    Pending:"countPending",
    Resolved:"countResolved"
  };

  Object.keys(ids).forEach(status=>{
    const el=document.getElementById(ids[status]);
    if(el) el.textContent=counts[status];
  });
}

function syncFilterUI(){

  document.querySelectorAll(".tabs button").forEach(btn=>{
    btn.classList.toggle(
      "active",
      btn.dataset.filter===filter
    );
  });

  document.querySelectorAll("#queueFilters button").forEach(btn=>{

    const active=filter===`status:${btn.dataset.status}`;

    btn.style.background=active?"#ddf5ea":"white";
    btn.style.color=active?"#08744a":"#68756f";
    btn.style.borderColor=active?"#bde8d5":"#e1e8e5";

  });
}


renderList=function(){

  const q=document
    .getElementById("search")
    .value
    .toLowerCase();

  let list=chats.filter(c=>{

    if(filter==="unread" && !c.unread)
      return false;

    if(filter==="mine" && c.assigned!=="Admin")
      return false;

    if(filter==="unassigned" && c.assigned!=="Unassigned")
      return false;

    if(
      typeof filter==="string" &&
      filter.startsWith("status:") &&
      c.status!==filter.replace("status:","")
    )
      return false;

    return (
      c.name+" "+
      c.phone+" "+
      c.preview+" "+
      c.status+" "+
      c.assigned
    )
    .toLowerCase()
    .includes(q);

  });

  if(!list.length){

    conversationList.innerHTML=`
      <div style="
        padding:35px 18px;
        text-align:center;
        color:#87958f;
        font-size:13px;
      ">
        No conversations in this queue.
      </div>
    `;

    updateManagementCounts();
    syncFilterUI();

    return;
  }

  conversationList.innerHTML=list.map(c=>{

    const sc=statusColor(c.status);

    return `
      <div
        class="conv ${c.id===activeId?"active":""}"
        onclick="openChat(${c.id})"
      >

        <div class="avatar">
          ${c.type==="group"?"👥":initials(c.name)}
        </div>

        <div class="conv-content">

          <div class="conv-top">

            <strong>
              ${c.name}

              ${
                c.type==="group"
                ?`
                  <span style="
                    font-size:9px;
                    background:#e4f5ee;
                    color:#08744a;
                    padding:3px 5px;
                    border-radius:5px;
                    margin-left:4px;
                  ">
                    GROUP
                  </span>
                `
                :""
              }

            </strong>

            <time>
              ${c.messages.at(-1)?.time||""}
            </time>

          </div>

          <div class="preview">
            ${c.preview}
          </div>

          <div style="
            display:flex;
            gap:5px;
            align-items:center;
            margin-top:7px;
            font-size:10px;
          ">

            <span style="
              background:${sc[0]};
              color:${sc[1]};
              padding:3px 6px;
              border-radius:10px;
            ">
              ${c.status}
            </span>

            <span style="color:#7c8984;">
              👤 ${c.assigned}
            </span>

          </div>

        </div>

        ${
          c.unread
            ?`<div class="badge">${c.unread}</div>`
            :""
        }

      </div>
    `;

  }).join("");

  updateManagementCounts();
  syncFilterUI();
};


changeAssigned=function(value){

  const c=chats.find(x=>x.id===activeId);

  if(!c)return;

  c.assigned=value;

  saveManagement();

  renderList();
};


changeStatus=function(value){

  const c=chats.find(x=>x.id===activeId);

  if(!c)return;

  c.status=value;

  saveManagement();

  openChat(activeId);
};


const managementSendMessage=sendMessage;

sendMessage=function(){

  managementSendMessage();

  saveManagement();

};

sendBtn.onclick=sendMessage;


loadManagement();

createQueueFilters();

renderList();

openChat(activeId);
