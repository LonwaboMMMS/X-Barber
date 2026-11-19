(()=> {
  const $ = id => document.getElementById(id);
  const money = cents => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
  const fmt = value => new Date(value+"T12:00:00").toLocaleDateString("en-ZA",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  const dateval = d => [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  const services = [
    {id:"fade",name:"Fade",description:"A clean, sharp fade.",price_cents:5000,duration_minutes:45},
    {id:"fade-dye",name:"Fade with Dye",description:"A fresh fade finished with hair dye.",price_cents:7000,duration_minutes:45}
  ];
  const barbers = [
    {id:"barber1",name:"Barber 1",bio:"Your barber. Your style."},
    {id:"barber2",name:"Barber 2",bio:"Your barber. Your style."}
  ];
  const state={service:null,barber:null,date:"",time:""};
  const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(_){return []}};
  const toast=message=>{const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3000)};
  const cart=()=>read("xbs-cart");
  const summary=()=>{
    $("sum-service").textContent=state.service?.name||"Not selected";
    $("sum-barber").textContent=state.barber?.name||"Not selected";
    $("sum-date").textContent=state.date?fmt(state.date):"Not selected";
    $("sum-time").textContent=state.time||"Not selected";
    $("sum-price").textContent=state.service?money(state.service.price_cents):"R0.00";
    $("add-to-cart").disabled=!(state.service&&state.barber&&state.date&&state.time);
  };
  const drawServices=()=>{
    $("services").innerHTML=services.map(x=>'<button class="choice '+(state.service?.id===x.id?'selected':'')+'" data-id="'+x.id+'"><strong>'+x.name+'<span class="price">'+money(x.price_cents)+'</span></strong><span>'+x.description+' · 45 min</span></button>').join("");
    $("services").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.service=services.find(x=>x.id===b.dataset.id);state.time="";drawServices();summary();drawSlots()});
  };
  const drawBarbers=()=>{
    $("barbers").innerHTML=barbers.map(x=>'<button class="barber-card '+(state.barber?.id===x.id?'selected':'')+'" data-id="'+x.id+'"><span class="avatar">'+x.name[0]+'</span><span><strong>'+x.name+'</strong><span>'+x.bio+'</span></span></button>').join("");
    $("barbers").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.barber=barbers.find(x=>x.id===b.dataset.id);state.time="";drawBarbers();summary();drawSlots()});
  };
  const overlaps=(a,z,b)=>new Date(a)<new Date(b.ends_at)&&new Date(z)>new Date(b.starts_at);
  const drawSlots=async()=>{
    const host=$("slots");state.time="";summary();
    if(!state.service||!state.barber){host.innerHTML='<p class="muted">Choose a service and barber first.</p>';return}
    host.innerHTML='<p class="muted">Checking availability…</p>';
    let bookedTimes=null;
    const apiBase=(window.XBARBER_CONFIG?.apiBaseUrl||"").replace(/\\/$/,"");
    if(apiBase){
      try{
        const response=await fetch(apiBase+"/api/availability?date="+encodeURIComponent(state.date)+"&barber_id="+encodeURIComponent(state.barber.id));
        if(!response.ok)throw new Error("Availability request failed");
        const data=await response.json();
        bookedTimes=new Set(data.booked||[]);
      }catch(error){
        host.innerHTML='<p class="muted">Could not load shared availability. Please refresh or try again.</p>';
        toast("Shared booking calendar is temporarily unavailable.");
        return;
      }
    }
    const localBusy=read("xbs-demo-bookings").filter(x=>x.date===state.date&&x.barber_id===state.barber.id);
    const now=new Date(),slots=[];
    for(let mins=720;mins<=990;mins+=45){
      const h=String(Math.floor(mins/60)).padStart(2,"0"),m=String(mins%60).padStart(2,"0");
      const start=new Date(state.date+"T"+h+":"+m+":00"),end=new Date(start.getTime()+45*60000);
      if(start<=now)continue;
      const a=start.toISOString(),z=end.toISOString(),time=h+":"+m;
      const busy=bookedTimes?bookedTimes.has(time):localBusy.some(x=>overlaps(a,z,x));
      slots.push({time,busy});
    }
    host.innerHTML=slots.length?slots.map(x=>'<button class="slot" data-time="'+x.time+'" '+(x.busy?'disabled':'')+'>'+new Date("2000-01-01T"+x.time+":00").toLocaleTimeString("en-ZA",{hour:"numeric",minute:"2-digit",hour12:true})+'</button>').join(""):'<p class="muted">No slots remain for this date. Try another day.</p>';
    host.querySelectorAll("button:not(:disabled)").forEach(b=>b.onclick=()=>{state.time=b.dataset.time;host.querySelectorAll(".slot").forEach(x=>x.classList.toggle("selected",x===b));summary()});
  };
  const today=new Date(),tomorrow=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1);
  const dateInput=$("booking-date");dateInput.min=dateval(today);dateInput.value=dateval(tomorrow);state.date=dateval(tomorrow);
  dateInput.onchange=e=>{state.date=e.target.value;drawSlots()};
  $("add-to-cart").onclick=()=>{
    if(!state.service||!state.barber||!state.time)return;
    const items=cart();
    items.push({service_id:state.service.id,service_name:state.service.name,price_cents:state.service.price_cents,barber_id:state.barber.id,barber_name:state.barber.name,date:state.date,time:state.time,duration_minutes:45});
    localStorage.setItem("xbs-cart",JSON.stringify(items));
    location.href="cart.html";
  };
  $("cart-count").textContent=cart().length;
  document.querySelectorAll(".bottom-cart-count").forEach(x=>x.textContent=cart().length);
  drawServices();drawBarbers();drawSlots();summary();
})();