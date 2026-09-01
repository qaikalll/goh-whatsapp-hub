const QUICK_REPLIES=[
  {
    label:"Checking warehouse",
    text:"Hi, saya sedang semak dengan team warehouse terlebih dahulu. Saya akan update selepas maklumat disahkan."
  },
  {
    label:"Need DO / PO",
    text:"Hi, boleh share DO Number atau PO Number untuk kami semak?"
  },
  {
    label:"Receiving completed",
    text:"Hi, receiving untuk shipment tersebut telah selesai. Thank you."
  },
  {
    label:"Booking details",
    text:"Hi, boleh share company name, tarikh penghantaran dan anggaran arrival time untuk semakan booking?"
  },
  {
    label:"Damage checking",
    text:"Hi, kami sedang semak rekod discrepancy dan gambar damage terlebih dahulu sebelum confirm."
  },
  {
    label:"Thank you",
    text:"Noted, thank you. 👍"
  }
];

function createQuickReplies(){

  const composer=document.querySelector(".composer");
  const composeBox=document.querySelector(".compose-box");

  if(
    !composer ||
    !composeBox ||
    document.getElementById("quickReplies")
  ) return;

  const box=document.createElement("div");

  box.id="quickReplies";

  box.style.cssText=`
    margin-bottom:10px;
  `;

  box.innerHTML=`
    <div style="
      font-size:11px;
      font-weight:bold;
      color:#75837d;
      margin-bottom:7px;
    ">
      Quick Replies
    </div>

    <div style="
      display:flex;
      gap:6px;
      overflow-x:auto;
      padding-bottom:3px;
    ">

      ${QUICK_REPLIES.map((r,i)=>`
        <button
          type="button"
          onclick="useQuickReply(${i})"
          style="
            flex:none;
            border:1px solid #dbe5e1;
            background:white;
            color:#41504a;
            border-radius:18px;
            padding:7px 10px;
            font-size:11px;
            cursor:pointer;
            white-space:nowrap;
          "
        >
          ${r.label}
        </button>
      `).join("")}

    </div>
  `;

  composer.insertBefore(box,composeBox);
}


function useQuickReply(index){

  const reply=QUICK_REPLIES[index];

  const input=document.getElementById("messageInput");

  if(!reply || !input)return;

  const c=chats.find(x=>x.id===activeId);

  let text=reply.text;

  if(
    c &&
    c.type!=="group" &&
    c.name
  ){
    text=text.replace(
      /^Hi,/,
      `Hi ${c.name},`
    );
  }

  if(
    c &&
    c.type==="group"
  ){
    text=text.replace(
      /^Hi,/,
      "Hi team,"
    );
  }

  input.value=text;

  input.focus();

  input.setSelectionRange(
    input.value.length,
    input.value.length
  );
}


createQuickReplies();
