// GOH WhatsApp Hub — Load shared inbox from Supabase

function formatDBTime(value){

  if(!value)return "";

  const d=new Date(value);

  if(Number.isNaN(d.getTime()))return "";

  const today=new Date();

  if(d.toDateString()===today.toDateString()){

    return d.toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
    });

  }

  return d.toLocaleDateString([],{
    month:"short",
    day:"numeric"
  });

}


function assignedNameFromDB(assignedId){

  if(!assignedId)return "Unassigned";

  if(assignedId===window.CURRENT_STAFF_ID){
    return window.CURRENT_STAFF;
  }

  return "Assigned";

}


async function loadSupabaseInbox(){

  if(
    !window.supabaseClient ||
    !window.CURRENT_STAFF_ID
  )return;


  const {data:conversationRows,error:conversationError}=
    await window.supabaseClient
      .from("conversations")
      .select("*")
      .order("updated_at",{ascending:false});


  if(conversationError){

    console.error(
      "Conversation load failed",
      conversationError
    );

    return;

  }


  const ids=(conversationRows||[])
    .map(row=>row.id);


  let messageRows=[];
  let noteRows=[];


  if(ids.length){

    const {data:m,error:mError}=
      await window.supabaseClient
        .from("messages")
        .select("*")
        .in("conversation_id",ids)
        .order("sent_at",{ascending:true});

    if(mError){

      console.error(
        "Message load failed",
        mError
      );

    }else{

      messageRows=m||[];

    }


    const {data:n,error:nError}=
      await window.supabaseClient
        .from("internal_notes")
        .select("*")
        .in("conversation_id",ids)
        .order("created_at",{ascending:true});

    if(nError){

      console.error(
        "Note load failed",
        nError
      );

    }else{

      noteRows=n||[];

    }

  }


  const messagesByConversation={};


  messageRows.forEach(row=>{

    if(
      !messagesByConversation[
        row.conversation_id
      ]
    ){

      messagesByConversation[
        row.conversation_id
      ]=[];

    }


    messagesByConversation[
      row.conversation_id
    ].push({

      from:
        row.sender_type==="customer"
          ?"customer"
          :"staff",

      sender:row.sender_name||"",

      text:row.message_text||"",

      time:formatDBTime(
        row.sent_at
      )

    });

  });


  const latestNote={};


  noteRows.forEach(row=>{

    latestNote[
      row.conversation_id
    ]=row.note_text||"";

  });


  const sharedChats=
    (conversationRows||[])
      .map(row=>{

        const isGroup=
          row.conversation_type==="group";


        return {

          id:row.id,

          name:row.name,

          phone:row.phone||"",

          type:
            isGroup
              ?"group"
              :"individual",


          participants:
            isGroup
              ?[
                  "GOH Admin",
                  "Customer PIC",
                  "Warehouse Team",
                  "Operations PIC"
                ]
              :[],


          unread:
            row.unread_count||0,


          assigned:
            assignedNameFromDB(
              row.assigned_to
            ),


          assignedId:
            row.assigned_to||null,


          status:
            row.status||"New",


          tags:
            Array.isArray(row.tags)
              ?row.tags
              :[],


          preview:
            row.preview||"",


          messages:
            messagesByConversation[
              row.id
            ]||[],


          internalNote:
            latestNote[
              row.id
            ]||"",


          slaWaitingSince:
            row.sla_waiting_since
              ?new Date(
                  row.sla_waiting_since
                ).getTime()
              :null

        };

      });


  chats.splice(
    0,
    chats.length,
    ...sharedChats
  );


  if(!chats.length){

    renderList();

    messages.innerHTML=`
      <div class="empty">
        No conversations found.
      </div>
    `;

    details.innerHTML="";

    return;

  }


  if(
    !chats.some(
      c=>c.id===activeId
    )
  ){

    activeId=chats[0].id;

  }


  renderList();

  openChat(activeId);

}


window.loadSupabaseInbox=
  loadSupabaseInbox;


async function waitForStaffThenLoad(){

  for(let i=0;i<100;i++){

    if(
      window.CURRENT_STAFF_ID &&
      window.CURRENT_STAFF
    ){

      await loadSupabaseInbox();

      return;

    }


    await new Promise(
      resolve=>
        setTimeout(
          resolve,
          50
        )
    );

  }

}


window.supabaseClient.auth
  .onAuthStateChange(
    (event,session)=>{

      if(
        event==="SIGNED_IN" &&
        session?.user
      ){

        setTimeout(
          waitForStaffThenLoad,
          100
        );

      }

    }
  );


waitForStaffThenLoad();
