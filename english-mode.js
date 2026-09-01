// GOH WhatsApp Hub — English UI / Reply Mode

const ENGLISH_TEXT_MAP={
  "Hi, esok boleh hantar barang tak?":"Hi, can I send the goods tomorrow?",
  "Esok boleh hantar barang tak?":"Can I send the goods tomorrow?",
  "Hi Aina 👋 Boleh. Boleh saya tahu company dan anggaran arrival time?":"Hi Aina 👋 Sure. May I know your company name and estimated arrival time?",
  "Barang saya dah sampai warehouse?":"Has my shipment arrived at the warehouse?",
  "Ada gambar damage tak?":"Do you have photos of the damaged item?"
};

function translateExistingDemoMessages(){

  chats.forEach(chat=>{

    if(ENGLISH_TEXT_MAP[chat.preview]){
      chat.preview=ENGLISH_TEXT_MAP[chat.preview];
    }

    (chat.messages||[]).forEach(message=>{

      if(ENGLISH_TEXT_MAP[message.text]){
        message.text=ENGLISH_TEXT_MAP[message.text];
      }

    });

  });

  if(typeof saveMessageHistory==="function"){
    saveMessageHistory();
  }

}


// QUICK REPLIES — ENGLISH

if(typeof QUICK_REPLIES!=="undefined"){

  QUICK_REPLIES.splice(
    0,
    QUICK_REPLIES.length,

    {
      label:"Checking warehouse",
      text:"Hi, we are checking with our warehouse team first. We will update you once the information has been confirmed."
    },

    {
      label:"Need DO / PO",
      text:"Hi, could you please share the DO Number or PO Number for us to check?"
    },

    {
      label:"Receiving completed",
      text:"Hi, receiving for this shipment has been completed. Thank you."
    },

    {
      label:"Booking details",
      text:"Hi, could you please share the company name, delivery date and estimated arrival time for booking verification?"
    },

    {
      label:"Damage checking",
      text:"Hi, we are checking the discrepancy record and damage photos before confirming the condition of the goods."
    },

    {
      label:"Thank you",
      text:"Noted, thank you. 👍"
    }

  );

}


// AI REPLIES — ENGLISH

safeAIReply=function(chat,combined){

  const text=combined.toLowerCase();

  if(
    text.includes("dah sampai") ||
    text.includes("sampai warehouse") ||
    text.includes("receiving status") ||
    text.includes("barang sampai") ||
    text.includes("arrived") ||
    text.includes("shipment arrived")
  ){
    return `Hi ${chat.name} 👋 I will check the receiving status with our warehouse team first. I do not want to provide an unverified status.`;
  }


  if(
    text.includes("damage") ||
    text.includes("damaged") ||
    text.includes("rosak") ||
    text.includes("discrepancy")
  ){
    return `Hi ${chat.name} 👋 I will check the discrepancy record and photo evidence before confirming the condition of the goods.`;
  }


  if(
    text.includes("return") ||
    text.includes("pulangkan") ||
    text.includes("refund")
  ){
    return `Hi ${chat.name} 👋 Could you please provide the Tracking Number or Order ID so I can check the return process?`;
  }


  if(
    text.includes("booking") ||
    text.includes("hantar barang") ||
    text.includes("delivery") ||
    text.includes("esok boleh") ||
    text.includes("send tomorrow")
  ){
    return `Hi ${chat.name} 👋 Sure. Please provide the company name, delivery date and estimated arrival time so I can check the booking.`;
  }


  if(
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("morning") ||
    text.includes("assalam")
  ){
    return `Hi ${chat.name} 👋 Thank you for contacting GOH. How can I assist you today?`;
  }


  return `Hi ${chat.name} 👋 Thank you for your message. I am checking the required information before providing an accurate response.`;

};


translateExistingDemoMessages();

renderList();
openChat(activeId);
