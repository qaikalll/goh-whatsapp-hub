const STAFF_TOOLS_KEY="gohHubStaffToolsV1";

function loadStaffTools(){

  try{

    const saved=JSON.parse(
      localStorage.getItem(STAFF_TOOLS_KEY)||"{}"
    );

    chats.forEach(c=>{

      const data=saved[c.id];

      if(!data)return;

      if(Array.isArray(data.tags)){
        c.tags=data.tags;
      }

      c.internalNote=data.internalNote||"";

    });

  }catch(e){}

}

function saveStaffTools(){

  const data={};

  chats.forEach(c=>{

    data[c.id]={
      tags:c.tags||[],
      internalNote:c.internalNote||""
    };

  });

  localStorage.setItem(
    STAFF_TOOLS_KEY,
    JSON.stringify(data)
  );

}

const AVAILABLE_TAGS=[
  "Booking",
  "Receiving",
  "Billing",
  "Return",
  "Discrepancy",
  "Urgent"
];

function renderStaffTools(){

  const c=chats.find(x=>x.id===activeId);

  if(!c)return;

  const sections=[
    ...details.querySelectorAll(".section")
  ];

  const tagSection=sections.find(s=>{
    const h=s.querySelector("h4");
    return h && h.textContent.trim()==="Tags";
  });

  if(tagSection){

    tagSection.innerHTML=`
      <h4>Tags</h4>

      <div class="tags" style="margin-bottom:12px;">
        ${(c.tags||[]).map(t=>`
          <span class="tag">
            ${t}
          </span>
        `).join("")}
      </div>

      <div style="
        display:flex;
        flex-wrap:wrap;
        gap:6px;
      ">

        ${AVAILABLE_TAGS.map(tag=>`

          <button
            onclick="toggleTag('${tag}')"
            style="
              border:1px solid #dfe7e3;
              background:${c.tags.includes(tag)?"#ddf5ea":"white"};
              color:${c.tags.includes(tag)?"#08744a":"#65736d"};
              border-radius:15px;
              padding:6px 9px;
              font-size:11px;
              cursor:pointer;
            "
          >
            ${c.tags.includes(tag)?"✓ ":"+ "}
            ${tag}
          </button>

        `).join("")}

      </div>
    `;

  }

  const noteSection=sections.find(s=>{
    const h=s.querySelector("h4");
    return h && h.textContent.trim()==="Internal Note";
  });

  if(noteSection){

    noteSection.innerHTML=`
      <h4>Internal Note</h4>

      <textarea
        id="internalNoteInput"
        rows="4"
        placeholder="Write internal staff note..."
        style="
          width:100%;
          resize:vertical;
          border:1px solid #e3dfc8;
          background:#fff9e5;
          border-radius:8px;
          padding:10px;
        "
      >${c.internalNote||""}</textarea>

      <button
        onclick="saveInternalNote()"
        style="
          width:100%;
          border:0;
          background:#10241d;
          color:white;
          border-radius:8px;
          padding:9px;
          margin-top:8px;
          cursor:pointer;
        "
      >
        Save Internal Note
      </button>

      <div style="
        font-size:10px;
        color:#8a9792;
        margin-top:6px;
      ">
        Customers cannot see this note.
      </div>
    `;

  }

}

function toggleTag(tag){

  const c=chats.find(x=>x.id===activeId);

  if(!c)return;

  if(c.tags.includes(tag)){

    c.tags=c.tags.filter(t=>t!==tag);

  }else{

    c.tags.push(tag);

  }

  saveStaffTools();

  openChat(activeId);

}

function saveInternalNote(){

  const c=chats.find(x=>x.id===activeId);

  const input=document.getElementById(
    "internalNoteInput"
  );

  if(!c || !input)return;

  c.internalNote=input.value.trim();

  saveStaffTools();

  const btn=event.target;

  btn.textContent="Saved ✓";

  setTimeout(()=>{
    btn.textContent="Save Internal Note";
  },1200);

}

loadStaffTools();

const staffToolsOpenChat=openChat;

openChat=function(id){

  staffToolsOpenChat(id);

  renderStaffTools();

};

openChat(activeId);
