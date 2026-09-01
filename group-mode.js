if(!chats.some(c=>c.id===5)){
  chats.push({
    id:5,
    name:"HOKA x GOH Operations",
    phone:"WhatsApp Group",
    type:"group",
    participants:[
      "GOH Admin",
      "HOKA PIC",
      "Warehouse Team",
      "Operations PIC"
    ],
    unread:2,
    assigned:"Admin",
    status:"Open",
    tags:["Group","Receiving"],
    preview:"Can help confirm receiving slot?",
    messages:[
      {
        from:"customer",
        sender:"HOKA PIC",
        text:"Morning team, today's shipment arriving around 11 AM.",
        time:"8:55 AM"
      },
      {
        from:"customer",
        sender:"HOKA PIC",
        text:"Can help confirm receiving slot?",
        time:"8:56 AM"
      }
    ]
  });
}

const baseRenderList=renderList;

renderList=function(){

  baseRenderList();

  chats
    .filter(c=>c.type==="group")
    .forEach(c=>{

      const row=[...document.querySelectorAll(".conv")]
        .find(el=>el.getAttribute("onclick")===`openChat(${c.id})`);

      if(!row)return;

      const strong=row.querySelector(".conv-top strong");

      if(strong && !strong.querySelector(".group-pill")){
        strong.insertAdjacentHTML(
          "beforeend",
          ` <span class="group-pill" style="
            font-size:9px;
            background:#e4f5ee;
            color:#08744a;
            padding:3px 5px;
            border-radius:5px;
            margin-left:4px;
            vertical-align:2px;
          ">GROUP</span>`
        );
      }
    });

};

const baseOpenChat=openChat;

openChat=function(id){

  const c=chats.find(x=>x.id===id);

  if(!c || c.type!=="group"){
    baseOpenChat(id);
    return;
  }

  activeId=id;
  c.unread=0;

  chatHeader.innerHTML=`
    <div class="contact">
      <div class="avatar">👥</div>
      <div>
        <strong>${c.name}</strong>
        <small>
          WhatsApp Group · ${c.participants.length} participants
        </small>
      </div>
    </div>

    <span class="status">${c.status}</span>
  `;

  messages.innerHTML=c.messages.map(m=>`

    <div class="message ${m.from==="staff"?"out":"in"}">

      <div style="
        font-size:11px;
        font-weight:bold;
        color:${m.from==="staff"?"#08744a":"#68756f"};
        margin-bottom:4px;
      ">
        ${m.from==="staff"?"GOH Admin":(m.sender||"Customer PIC")}
      </div>

      ${m.text}

      <small>${m.time}</small>

    </div>

  `).join("");

  messages.scrollTop=messages.scrollHeight;

  details.innerHTML=`

    <div class="detail-head">

      <div class="avatar">👥</div>

      <h3>${c.name}</h3>

      <p>
        WhatsApp Group · ${c.participants.length} participants
      </p>

    </div>

    <div class="section">

      <h4>Conversation Type</h4>

      <div style="
        background:#e8f7f0;
        color:#08744a;
        padding:9px 10px;
        border-radius:8px;
        font-size:12px;
        margin-bottom:14px;
      ">
        👥 WhatsApp Group
      </div>

      <label>Assigned to</label>

      <select onchange="changeAssigned(this.value)">
        <option ${c.assigned==="Unassigned"?"selected":""}>Unassigned</option>
        <option ${c.assigned==="Admin"?"selected":""}>Admin</option>
        <option ${c.assigned==="Staff A"?"selected":""}>Staff A</option>
        <option ${c.assigned==="Staff B"?"selected":""}>Staff B</option>
      </select>

      <label>Status</label>

      <select onchange="changeStatus(this.value)">
        <option ${c.status==="New"?"selected":""}>New</option>
        <option ${c.status==="Open"?"selected":""}>Open</option>
        <option ${c.status==="Pending"?"selected":""}>Pending</option>
        <option ${c.status==="Resolved"?"selected":""}>Resolved</option>
      </select>

    </div>

    <div class="section">

      <h4>Participants</h4>

      ${c.participants.map(p=>`
        <div style="
          padding:8px 0;
          border-bottom:1px solid #edf1ef;
          font-size:13px;
        ">
          👤 ${p}
        </div>
      `).join("")}

    </div>

    <div class="section">

      <h4>Tags</h4>

      <div class="tags">
        ${c.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
      </div>

    </div>

    <div class="section">

      <h4>Internal Note</h4>

      <div class="note">
        Internal staff note. Customer group members cannot see this.
      </div>

    </div>
  `;

  renderList();
};


const baseSafeAIReply=safeAIReply;

safeAIReply=function(chat,combined){

  if(chat?.type==="group"){

    return baseSafeAIReply(
      {...chat,name:"team"},
      combined
    );

  }

  return baseSafeAIReply(chat,combined);

};


const baseReceiveCustomerMessage=receiveCustomerMessage;

receiveCustomerMessage=function(text){

  const c=chats.find(x=>x.id===activeId);

  const before=c?.messages.length||0;

  baseReceiveCustomerMessage(text);

  if(
    c?.type==="group" &&
    c.messages.length>before
  ){

    const last=c.messages[c.messages.length-1];

    if(last.from==="customer"&&!last.sender){
      last.sender="Customer PIC";
    }

    openChat(c.id);
  }

};

renderList();
