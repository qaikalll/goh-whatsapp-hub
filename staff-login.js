window.CURRENT_STAFF="";
window.CURRENT_ROLE="";
window.CURRENT_STAFF_ID="";


function staffInitials(name){
  return (name||"")
    .split(" ")
    .map(x=>x[0])
    .join("")
    .slice(0,2)
    .toUpperCase();
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
        Staff Login
      </p>


      <label style="
        display:block;
        font-size:12px;
        font-weight:bold;
        margin-bottom:7px;
        color:#4d5b55;
      ">
        Email
      </label>

      <input
        id="staffEmail"
        type="email"
        autocomplete="email"
        placeholder="staff@company.com"
        style="
          width:100%;
          box-sizing:border-box;
          border:1px solid #d9e3df;
          border-radius:10px;
          padding:12px;
          font-size:14px;
          outline:none;
          margin-bottom:14px;
        "
      >


      <label style="
        display:block;
        font-size:12px;
        font-weight:bold;
        margin-bottom:7px;
        color:#4d5b55;
      ">
        Password
      </label>

      <input
        id="staffPassword"
        type="password"
        autocomplete="current-password"
        placeholder="Password"
        style="
          width:100%;
          box-sizing:border-box;
          border:1px solid #d9e3df;
          border-radius:10px;
          padding:12px;
          font-size:14px;
          outline:none;
        "
      >


      <div
        id="staffLoginError"
        style="
          display:none;
          margin-top:12px;
          padding:10px;
          background:#fff0f0;
          color:#b42318;
          border-radius:8px;
          font-size:12px;
        "
      ></div>


      <button
        id="staffLoginBtn"
        type="button"
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
    .onclick=loginStaff;

  document
    .getElementById("staffPassword")
    .addEventListener("keydown",e=>{

      if(e.key==="Enter"){
        loginStaff();
      }

    });

}


function showLoginError(message){

  const box=document.getElementById(
    "staffLoginError"
  );

  if(!box)return;

  box.textContent=message;
  box.style.display="block";

}


function clearLoginError(){

  const box=document.getElementById(
    "staffLoginError"
  );

  if(!box)return;

  box.textContent="";
  box.style.display="none";

}


async function getStaffProfile(userId){

  const {data,error}=
    await window.supabaseClient
      .from("staff_profiles")
      .select("id,name,role")
      .eq("id",userId)
      .single();

  if(error){
    return {
      profile:null,
      error
    };
  }

  return {
    profile:data,
    error:null
  };

}


async function loginStaff(){

  clearLoginError();

  const email=document
    .getElementById("staffEmail")
    .value
    .trim();

  const password=document
    .getElementById("staffPassword")
    .value;

  if(!email || !password){

    showLoginError(
      "Please enter your email and password."
    );

    return;
  }


  const btn=document.getElementById(
    "staffLoginBtn"
  );

  btn.disabled=true;
  btn.textContent="Signing in...";


  const {data,error}=
    await window.supabaseClient.auth
      .signInWithPassword({
        email,
        password
      });


  if(error){

    btn.disabled=false;
    btn.textContent="Login";

    showLoginError(
      error.message||"Login failed."
    );

    return;
  }


  const activated=
    await activateSupabaseUser(
      data.user
    );


  btn.disabled=false;
  btn.textContent="Login";


  if(!activated){

    await window.supabaseClient.auth
      .signOut();

  }

}


async function activateSupabaseUser(user){

  if(!user)return false;


  const result=
    await getStaffProfile(user.id);


  if(
    result.error ||
    !result.profile
  ){

    const screen=document.getElementById(
      "staffLoginScreen"
    );

    if(screen){
      screen.style.display="flex";
    }

    showLoginError(
      "This account is not linked to a GOH staff profile."
    );

    return false;
  }


  const profile=result.profile;

  window.CURRENT_STAFF_ID=profile.id;
  window.CURRENT_STAFF=profile.name;
  window.CURRENT_ROLE=profile.role;


  const screen=document.getElementById(
    "staffLoginScreen"
  );

  if(screen){
    screen.style.display="none";
  }


  updateStaffSidebar();


  if(profile.role==="admin"){

    filter="all";

    renderList();

    const active=chats.find(
      c=>c.id===activeId
    );

    if(active){

      openChat(active.id);

    }else if(chats.length){

      activeId=chats[0].id;
      openChat(activeId);

    }

  }else{

    filter="mine";

    const first=chats.find(
      c=>c.assigned===profile.name
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


  return true;

}


async function logoutStaff(){

  await window.supabaseClient.auth
    .signOut();

  window.CURRENT_STAFF_ID="";
  window.CURRENT_STAFF="";
  window.CURRENT_ROLE="";


  const email=document.getElementById(
    "staffEmail"
  );

  const password=document.getElementById(
    "staffPassword"
  );

  if(email)email.value="";
  if(password)password.value="";


  clearLoginError();


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
      ${staffInitials(
        window.CURRENT_STAFF
      )}
    </div>


    <div style="flex:1;">

      <strong>
        ${window.CURRENT_STAFF}
      </strong>

      <small>
        ● ${
          window.CURRENT_ROLE==="admin"
            ?"Administrator"
            :"Online"
        }
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

  if(
    window.CURRENT_ROLE==="admin"
  ){
    return true;
  }


  return (
    chat.assigned===
    window.CURRENT_STAFF
  );

}


function enforceStaffConversationAccess(){

  if(
    !window.CURRENT_STAFF ||
    window.CURRENT_ROLE==="admin"
  ){
    return;
  }


  document
    .querySelectorAll(".conv")
    .forEach(row=>{

      const match=(
        row.getAttribute("onclick")||""
      ).match(
        /openChat\((\d+)\)/
      );


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

  const selects=[
    ...details.querySelectorAll(
      "select"
    )
  ];


  const assignedSelect=
    selects.find(
      s=>(
        s.getAttribute("onchange")||""
      ).includes(
        "changeAssigned"
      )
    );


  if(!assignedSelect)return;


  if(
    window.CURRENT_ROLE!=="admin"
  ){

    assignedSelect.disabled=true;

    assignedSelect.title=
      "Only an administrator can reassign conversations.";

  }else{

    assignedSelect.disabled=false;

  }

}


function updateRoleUI(){

  const unassigned=
    document.querySelector(
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


async function initializeStaffAuth(){

  createLoginScreen();

  localStorage.removeItem(
    "gohHubStaffSessionV1"
  );


  const {
    data:{
      session
    }
  }=
    await window.supabaseClient.auth
      .getSession();


  if(
    session &&
    session.user
  ){

    await activateSupabaseUser(
      session.user
    );

  }else{

    document
      .getElementById(
        "staffLoginScreen"
      )
      .style.display="flex";

  }

}


window.supabaseClient.auth
  .onAuthStateChange(
    (event)=>{

      if(event==="SIGNED_OUT"){

        window.CURRENT_STAFF_ID="";
        window.CURRENT_STAFF="";
        window.CURRENT_ROLE="";

        const screen=
          document.getElementById(
            "staffLoginScreen"
          );

        if(screen){
          screen.style.display="flex";
        }

      }

    }
  );


initializeStaffAuth();
