const aiTimers = {};
const aiBuffers = {};

function hubTime(){
  return new Date().toLocaleTimeString([],{
    hour:"2-digit",
    minute:"2-digit"
  });
}

function activeChat(){
  return chats.find(c=>c.id===activeId);
}

function aiStatus(text){
  const el=document.querySelector(".compose-info .ai");
  if(el) el.textContent=text;
}

function cancelAI(chatId,reason="Staff replied"){
  if(aiTimers[chatId]){
    clearTimeout(aiTimers[chatId]);
    delete aiTimers[chatId];
    aiBuffers[chatId]=[];
    aiStatus("● AI cancelled — "+reason);

    setTimeout(()=>{
      aiStatus("● AI standby");
    },2500);
  }
}

function safeAIReply(chat,combined){

  const text=combined.toLowerCase();

  if(
    text.includes("dah sampai") ||
    text.includes("sampai warehouse") ||
    text.includes("receiving status") ||
    text.includes("barang sampai")
  ){
    return `Hi ${chat.name} 👋 Saya akan semak status receiving dengan team warehouse terlebih dahulu. Saya tak mahu beri status yang belum disahkan.`;
  }

  if(
    text.includes("damage") ||
    text.includes("damaged") ||
    text.includes("rosak") ||
    text.includes("discrepancy")
  ){
    return `Hi ${chat.name} 👋 Saya akan semak rekod discrepancy dan bukti gambar terlebih dahulu sebelum confirm keadaan barang.`;
  }

  if(
    text.includes("return") ||
    text.includes("pulangkan") ||
    text.includes("refund")
  ){
    return `Hi ${chat.name} 👋 Boleh beri Tracking Number atau Order ID untuk saya semak proses return tersebut?`;
  }

  if(
    text.includes("booking") ||
    text.includes("hantar barang") ||
    text.includes("delivery") ||
    text.includes("esok boleh")
  ){
    return `Hi ${chat.name} 👋 Boleh. Untuk saya bantu semak booking, boleh beri company, tarikh penghantaran dan anggaran waktu arrival?`;
  }

  if(
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("morning") ||
    text.includes("assalam")
  ){
    return `Hi ${chat.name} 👋 Terima kasih hubungi GOH. Ada apa yang saya boleh bantu?`;
  }

  return `Hi ${chat.name} 👋 Terima kasih untuk mesej tersebut. Saya sedang semak maklumat yang diperlukan sebelum beri jawapan yang tepat.`;
}

function scheduleAI(chat){

  const chatId=chat.id;

  if(aiTimers[chatId]){
    clearTimeout(aiTimers[chatId]);
  }

  const delay=Math.floor(Math.random()*3001)+5000;

  aiStatus(`● AI waiting ${Math.ceil(delay/1000)}s...`);

  aiTimers[chatId]=setTimeout(()=>{

    const buffer=aiBuffers[chatId]||[];

    if(!buffer.length){
      aiStatus("● AI standby");
      return;
    }

    const combined=buffer.join("\n");

    aiBuffers[chatId]=[];
    delete aiTimers[chatId];

    const reply=safeAIReply(chat,combined);

    chat.messages.push({
      from:"staff",
      text:"🤖 "+reply,
      time:hubTime()
    });

    chat.preview=reply;
    chat.status="Open";

    if(activeId===chatId){
      openChat(chatId);
    }else{
      renderList();
    }

    aiStatus("● AI replied");

    setTimeout(()=>{
      aiStatus("● AI standby");
    },2000);

  },delay);
}

function receiveCustomerMessage(text){

  const chat=activeChat();

  if(!chat || !text.trim()) return;

  const clean=text.trim();

  chat.messages.push({
    from:"customer",
    text:clean,
    time:hubTime()
  });

  chat.preview=clean;
  chat.status="Open";

  if(!aiBuffers[chat.id]){
    aiBuffers[chat.id]=[];
  }

  aiBuffers[chat.id].push(clean);

  openChat(chat.id);

  scheduleAI(chat);
}

function createSimulator(){

  const composer=document.querySelector(".composer");

  if(!composer || document.getElementById("aiSimulator")) return;

  const box=document.createElement("div");

  box.id="aiSimulator";

  box.style.cssText=`
    display:flex;
    gap:8px;
    margin-bottom:10px;
    padding:10px;
    border:1px dashed #b6ccc3;
    border-radius:10px;
    background:#f7fbf9;
  `;

  box.innerHTML=`
    <input
      id="simIncoming"
      placeholder="Simulate customer WhatsApp message..."
      style="
        flex:1;
        border:1px solid #dbe3df;
        border-radius:8px;
        padding:10px;
        outline:none;
      "
    >

    <button
      id="simReceive"
      style="
        border:0;
        border-radius:8px;
        padding:0 14px;
        background:#10241d;
        color:white;
        cursor:pointer;
      "
    >
      Receive Test
    </button>
  `;

  composer.insertBefore(box,composer.firstChild);

  const input=document.getElementById("simIncoming");
  const btn=document.getElementById("simReceive");

  function receive(){
    const text=input.value.trim();
    if(!text) return;

    receiveCustomerMessage(text);

    input.value="";
    input.focus();
  }

  btn.onclick=receive;

  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      e.preventDefault();
      receive();
    }
  });
}

document.addEventListener("click",e=>{
  if(e.target.closest("#sendBtn")){
    cancelAI(activeId,"staff replied");
  }
},true);

document.addEventListener("keydown",e=>{
  if(
    e.target?.id==="messageInput" &&
    e.key==="Enter" &&
    !e.shiftKey
  ){
    cancelAI(activeId,"staff replied");
  }
},true);

createSimulator();
