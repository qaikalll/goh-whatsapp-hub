// GOH WhatsApp Hub — Shared database writes


async function refreshSharedInbox(){
  if(typeof window.loadSupabaseInbox==="function"){
    await window.loadSupabaseInbox();
  }
}


function currentConversation(){
  return chats.find(
    c=>c.id===activeId
  );
}


// SEND STAFF MESSAGE

sendMessage=async function(){

  const input=document.getElementById(
    "messageInput"
  );

  const text=input.value.trim();

  if(!text)return;

  const chat=currentConversation();

  if(
    !chat ||
    !window.CURRENT_STAFF_ID
  )return;


  const btn=document.getElementById(
    "sendBtn"
  );

  btn.disabled=true;
  btn.textContent="Sending...";


  const {error:messageError}=
    await window.supabaseClient
      .from("messages")
      .insert({
        conversation_id:chat.id,
        sender_type:"staff",
        sender_staff_id:
          window.CURRENT_STAFF_ID,
        sender_name:
          window.CURRENT_STAFF,
        message_text:text
      });


  if(messageError){

    console.error(
      "Message save failed",
      messageError
    );

    btn.disabled=false;
    btn.textContent="Send";

    alert(
      "Message could not be saved."
    );

    return;
  }


  const {error:conversationError}=
    await window.supabaseClient
      .from("conversations")
      .update({
        preview:text,
        status:"Open",
        sla_waiting_since:null
      })
      .eq("id",chat.id);


  if(conversationError){

    console.error(
      "Conversation update failed",
      conversationError
    );

  }


  input.value="";

  await refreshSharedInbox();


  btn.disabled=false;
  btn.textContent="Send";

};


sendBtn.onclick=sendMessage;


// STATUS

changeStatus=async function(value){

  const chat=currentConversation();

  if(!chat)return;


  const {error}=
    await window.supabaseClient
      .from("conversations")
      .update({
        status:value
      })
      .eq("id",chat.id);


  if(error){

    console.error(
      "Status update failed",
      error
    );

    alert(
      "Status could not be updated."
    );

    return;
  }


  await refreshSharedInbox();

};


// ASSIGNMENT

changeAssigned=async function(value){

  const chat=currentConversation();

  if(!chat)return;


  let assignedId=null;


  if(value==="Unassigned"){

    assignedId=null;

  }else if(
    value===window.CURRENT_STAFF
  ){

    assignedId=
      window.CURRENT_STAFF_ID;

  }else{

    alert(
      "This staff account has not been created in Supabase yet."
    );

    await refreshSharedInbox();

    return;

  }


  const {error}=
    await window.supabaseClient
      .from("conversations")
      .update({
        assigned_to:assignedId
      })
      .eq("id",chat.id);


  if(error){

    console.error(
      "Assignment update failed",
      error
    );

    alert(
      "Assignment could not be updated."
    );

    return;
  }


  await refreshSharedInbox();

};


// TAGS

toggleTag=async function(tag){

  const chat=currentConversation();

  if(!chat)return;


  let newTags=[
    ...(chat.tags||[])
  ];


  if(newTags.includes(tag)){

    newTags=newTags.filter(
      t=>t!==tag
    );

  }else{

    newTags.push(tag);

  }


  const {error}=
    await window.supabaseClient
      .from("conversations")
      .update({
        tags:newTags
      })
      .eq("id",chat.id);


  if(error){

    console.error(
      "Tag update failed",
      error
    );

    alert(
      "Tag could not be updated."
    );

    return;
  }


  await refreshSharedInbox();

};


// INTERNAL NOTE

saveInternalNote=async function(){

  const chat=currentConversation();

  const input=document.getElementById(
    "internalNoteInput"
  );

  if(
    !chat ||
    !input ||
    !window.CURRENT_STAFF_ID
  )return;


  const text=input.value.trim();

  if(!text)return;


  const {error}=
    await window.supabaseClient
      .from("internal_notes")
      .insert({
        conversation_id:chat.id,
        staff_id:
          window.CURRENT_STAFF_ID,
        note_text:text
      });


  if(error){

    console.error(
      "Internal note save failed",
      error
    );

    alert(
      "Internal note could not be saved."
    );

    return;
  }


  await refreshSharedInbox();

};


// REMOVE OLD DUMMY STAFF OPTIONS

function refreshAssignmentOptions(){

  const chat=currentConversation();

  if(!chat)return;


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


  const currentValue=
    chat.assignedId
      ?window.CURRENT_STAFF
      :"Unassigned";


  assignedSelect.innerHTML=`

    <option
      value="Unassigned"
      ${currentValue==="Unassigned"
        ?"selected"
        :""}
    >
      Unassigned
    </option>

    <option
      value="${window.CURRENT_STAFF}"
      ${currentValue===window.CURRENT_STAFF
        ?"selected"
        :""}
    >
      ${window.CURRENT_STAFF}
    </option>

  `;


  if(
    window.CURRENT_ROLE!=="admin"
  ){

    assignedSelect.disabled=true;

  }

}


const supabaseWriteOpenChat=
  openChat;


openChat=function(id){

  supabaseWriteOpenChat(id);

  refreshAssignmentOptions();

};
