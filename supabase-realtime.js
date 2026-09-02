// GOH WhatsApp Hub — Supabase Realtime

let realtimeRefreshTimer=null;

function scheduleRealtimeRefresh(){

  clearTimeout(realtimeRefreshTimer);

  realtimeRefreshTimer=setTimeout(async()=>{

    if(typeof window.loadSupabaseInbox==="function"){
      await window.loadSupabaseInbox();
    }

  },250);

}


async function startGOHRealtime(){

  if(
    !window.supabaseClient ||
    !window.CURRENT_STAFF_ID
  )return;


  if(window.GOH_REALTIME_CHANNEL){

    await window.supabaseClient
      .removeChannel(
        window.GOH_REALTIME_CHANNEL
      );

  }


  window.GOH_REALTIME_CHANNEL=
    window.supabaseClient
      .channel("goh-hub-realtime")

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"conversations"
        },
        scheduleRealtimeRefresh
      )

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"messages"
        },
        scheduleRealtimeRefresh
      )

      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"internal_notes"
        },
        scheduleRealtimeRefresh
      )

      .subscribe(status=>{

        console.log(
          "GOH realtime:",
          status
        );

      });

}


async function waitForRealtimeStaff(){

  for(let i=0;i<100;i++){

    if(
      window.CURRENT_STAFF_ID &&
      window.CURRENT_STAFF
    ){

      await startGOHRealtime();

      return;

    }

    await new Promise(
      resolve=>setTimeout(
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
          waitForRealtimeStaff,
          200
        );

      }

    }
  );


waitForRealtimeStaff();
