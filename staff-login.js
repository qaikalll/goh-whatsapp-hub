const STAFF_SESSION_KEY="gohHubStaffSessionV1";

const STAFF_ACCOUNTS=[
  {name:"Admin",role:"admin"},
  {name:"Staff A",role:"staff"},
  {name:"Staff B",role:"staff"},
  {name:"Staff C",role:"staff"}
];

window.CURRENT_STAFF="";
window.CURRENT_ROLE="";


function staffInitials(name){
  return name
    .split(" ")
    .map(x=>x[0])
    .join("")
    .slice(0,2)
    .toUpperCase();
}


function saveStaffSession(account){

  localStorage.setItem(
    STAFF_SESSION_KEY,
    JSON.stringify(account)
  );

}


function loadStaffSession(){

  try{

    const saved=JSON.parse(
      localStorage.getItem(STAFF_SESSION_KEY)||"null"
    );

    if(!saved)return null;

    return STAFF_ACCOUNTS.find(
      a=>a.name===saved.name
    )||null;

  }catch(e){

    return null;

  }

}


function createLoginScreen(){

  if(document.getElementById("staffLoginScreen"))
    return;

  const screen=document.createElement("div");

  screen.id="staffLoginScreen";

  screen.style.cssText=`
    position:fixed;
    inset:0;
    z-index:20000;
    background:#f3f7f5;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
  `;

  screen.innerHTML=`
    <div style="
      width:min(390px,100%);
      background:white;
      border:1px solid #dfe8e4;
      border-radius:18px;
      padding:30px;
      box-shadow:0 15px 40px rgba(0,0,0,.08);
    ">

      <div style="
        width:48px;
        height:48px;
        border-radius:13px;
        background:#10241d;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        font-weight:bold;
        margin-bottom:18px;
      ">
        G
      </div>

      <h2 style="
        margin:0 0 6px;
        color:#10241d;
      ">
        GOH WhatsApp Hub
      </h2>

      <p style="
        margin:0 0 24px;
        color:#77847f;
        font-size:13px;
      ">
        Company WhatsApp Customer Service
      </p>

      <label style="
        display:block;
        font-size:12px;
        font-weight:bold;
        margin-bottom:7px;
        color:#4d5b55;
      ">
        Staff Account
      </label>

      <select
        id="staffLoginSelect"
        style="
          width:100%;
          border:1px solid #d9e3df;
          border-radius:10px;
          padding:12px;
          font-size:14px;
          outline:none;
          background:white;
        "
      >
        ${STAFF_ACCOUNTS.map(a=>`
          <option value="${a.name}">
            ${a.name}
            ${a.role==="admin"?" — Administrator":""}
          </option>
        `).join("")}
      </select>

      <button
        id="staffLoginBtn"
        style="
          width:100%;
          margin-top:14px;
          border:0;
          border-radius:10px;
          padding:12px;
          background:#10241d;
          color:white;
          font-weight:bold;
          cursor:pointer;
        "
      >
        Login
      </button>

      <div style="
        margin-top:18px;
        padding:11px;
        background:#f4faf7;
        border-radius:9px;
        color:#62716a;
        font-size:11px;
        line-height:1.5;
      ">
        All customer replies are sent through the
        company WhatsApp number.
      </div>

    </div>
  `;

  document.body.appendChild(screen);

  document
    .getElementById("staffLoginBtn")
    .onclick=loginSelectedStaff;

}


function loginSelectedStaff(){

  const name=document
    .getElementById("staffLoginSelect")
    .value;

  const account=STAFF_ACCOUNTS.find(
    a=>a.name===name
  );

  if(!account)return;

  saveStaffSession(account);

  activateStaff(account);

}


function activateStaff(account){

  window.CURRENT_STAFF=account.name;
  window.CURRENT_ROLE=account.role;

  const screen=document.getElementById(
    "staffLoginScreen"
  );

  if(screen){
    screen.style.display="none";
  }

  updateStaffSidebar();

  if(account.role==="admin"){

    filter="all";

    renderList();

    if(chats.length){
      openChat(activeId||chats[0].id);
    }

  }else{

    filter="mine";

    const first=chats.find(
      c=>c.assigned===account.name
    );

    if(first){

      activeId=first.id;

      openChat(first.id);

    }else{

      renderList();

      chatHeader.innerHTML=`
        <div style="padding:8px 0;">
          <strong>No assigned conversations</strong>
        </div>
      `;

      messages.innerHTML=`
        <div class="empty">
          No conversations are currently assigned to you.
        </div>
      `;

      details.innerHTML="";

    }

  }

}


function logoutStaff(){

  localStorage.removeItem(
    STAFF_SESSION_KEY
  );

  window.CURRENT_STAFF="";
  window.CURRENT_ROLE="";

  const screen=document.getElementById(
    "staffLoginScreen"
  );

  if(screen){
    screen.style.display="flex";
  }

}


function updateStaffSidebar(){

  const user=document.querySelector(".user");

  if(!user)return;

  user.innerHTML=`
    <div class="avatar">
      ${staffInitials(window.CURRENT_STAFF)}
    </div>

    <div style="flex:1;">
      <strong>
        ${window.CURRENT_STAFF}
      </strong>

      <small>
        ● ${window.CURRENT_ROLE==="admin"
          ?"Administrator"
          :"Online"}
      </small>
    </div>

    <button
      onclick="logoutStaff()"
      title="Logout"
      style="
        border:0;
        background:transparent;
        cursor:pointer;
        font-size:16px;
      "
    >
      ↪
    </button>
  `;

}


function staffCanAccess(chat){

  if(window.CURRENT_ROLE==="admin")
    return true;

  return (
    chat.assigned===
    window.CURRENT_STAFF
  );

}


function enforceStaffConversationAccess(){

  if(
    !window.CURRENT_STAFF ||
    window.CURRENT_ROLE==="admin"
  )return;

  document
    .querySelectorAll(".conv")
    .forEach(row=>{

      const match=(
        row.getAttribute("onclick")||""
      ).match(/openChat\((\d+)\)/);

      if(!match)return;

      const chat=chats.find(
        c=>c.id===Number(match[1])
      );

      if(
        chat &&
        !staffCanAccess(chat)
      ){
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
        No conversations assigned to you.
      </div>
    `;

  }

}


function updateAssignmentControl(){

  const chat=chats.find(
    c=>c.id===activeId
  );

  if(!chat)return;

  const selects=[
    ...details.querySelectorAll("select")
  ];

  const assignedSelect=selects.find(
    s=>(
      s.getAttribute("onchange")||""
    ).includes("changeAssigned")
  );

  if(!assignedSelect)return;

  const names=[
    "Unassigned",
    ...STAFF_ACCOUNTS.map(a=>a.name)
  ];

  assignedSelect.innerHTML=
    names.map(name=>`
      <option
        ${chat.assigned===name
          ?"selected"
          :""}
      >
        ${name}
      </option>
    `).join("");

  if(window.CURRENT_ROLE!=="admin"){

    assignedSelect.disabled=true;

    assignedSelect.title=
      "Only an administrator can reassign conversations.";

  }

}


function updateRoleUI(){

  const unassigned=document.querySelector(
    '[data-filter="unassigned"]'
  );

  if(unassigned){

    unassigned.style.display=
      window.CURRENT_ROLE==="admin"
        ?""
        :"none";

  }

}


const staffRenderList=renderList;

renderList=function(){

  staffRenderList();

  enforceStaffConversationAccess();

  updateRoleUI();

};


const staffOpenChat=openChat;

openChat=function(id){

  const chat=chats.find(
    c=>c.id===id
  );

  if(!chat)return;

  if(
    window.CURRENT_STAFF &&
    !staffCanAccess(chat)
  ){
    return;
  }

  staffOpenChat(id);

  updateAssignmentControl();

};


createLoginScreen();

const savedStaff=loadStaffSession();

if(savedStaff){

  activateStaff(savedStaff);

}else{

  document
    .getElementById("staffLoginScreen")
    .style.display="flex";

}
