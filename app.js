(() => {
  const config = window.XBARBER_CONFIG || {};
  const connected = Boolean(config.supabaseUrl && config.supabaseAnonKey &&
    !config.supabaseUrl.includes("YOUR-PROJECT") && !config.supabaseAnonKey.includes("YOUR_"));
  const db = connected && window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

  const demoServices = [
    {id:"cut",name:"Standard Haircut",description:"A clean, classic cut.",price_cents:15000,duration_minutes:30},
    {id:"fade",name:"Skin Fade",description:"A detailed fade, finished sharp.",price_cents:20000,duration_minutes:45},
    {id:"beard",name:"Haircut & Beard",description:"A fresh cut with beard shaping.",price_cents:25000,duration_minutes:60},
    {id:"kids",name:"Kids Haircut",description:"A neat cut for the young ones.",price_cents:12000,duration_minutes:30}
  ];
  const demoBarbers = [
    {id:"barber1",name:"Barber 1",bio:"Your barber. Your style."},
    {id:"barber2",name:"Barber 2",bio:"Your barber. Your style."}
  ];
  const state = {services:[],barbers:[],service:null,barber:null,date:null,time:null,bookings:[]};
  const $ = id => document.getElementById(id);
  const money = cents => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
  const dateLabel = value => new Date(value+"T12:00:00").toLocaleDateString("en-ZA",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  const notify = message => { const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3000); };
  const setStep = n => document.querySelectorAll(".step").forEach(el=>{const i=Number(el.dataset.step);el.classList.toggle("active",i===n);el.classList.toggle("complete",i<n);});
  const updateSummary = () => {
    $("sum-service").textContent=state.service?.name||"Not selected";
    $("sum-barber").textContent=state.barber?.name||"Not selected";
    $("sum-date").textContent=state.date?dateLabel(state.date):"Not selected";
    $("sum-time").textContent=state.time||"Not selected";
    $("sum-price").textContent=state.service?money(state.service.price_cents):"R0.00";
  };
  const renderServices = () => {
    $("services").innerHTML=state.services.map(s=>`<button class="choice ${state.service?.id===s.id?"selected":""}" data-id="${s.id}"><strong>${s.name}<span class="price">${money(s.price_cents)}</span></strong><span>${s.description} · ${s.duration_minutes} min</span></button>`).join("");
    $("services").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{state.service=state.services.find(s=>s.id===btn.dataset.id);state.time=null;renderServices();updateSummary();setStep(2);renderSlots();}));
  };
  const renderBarbers = () => {
    $("barbers").innerHTML=state.barbers.map(b=>`<button class="barber-card ${state.barber?.id===b.id?"selected":""}" data-id="${b.id}"><span class="avatar">${b.name.trim().charAt(0).toUpperCase()}</span><span><strong>${b.name}</strong><span>${b.bio||"Available for appointments"}</span></span></button>`).join("");
    $("barbers").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{state.barber=state.barbers.find(b=>b.id===btn.dataset.id);state.time=null;renderBarbers();updateSummary();setStep(3);renderSlots();}));
  };
  const localDate = d => {const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;};
  const loadBookings = async () => {
    state.bookings=[];
    if(db && state.barber && state.date){
      const {data,error}=await db.rpc("get_busy_times",{p_barber_id:state.barber.id,p_date:state.date});
      if(error){notify("Could not load availability. Please try again.");return;}
      state.bookings=data||[];
    } else if(!db) {
      try{state.bookings=JSON.parse(localStorage.getItem("xbs-demo-bookings")||"[]").filter(b=>b.date===state.date&&b.barber_id===state.barber?.id);}catch(_){state.bookings=[];}
    }
  };
  const overlaps = (start,end,b) => new Date(start)<new Date(b.ends_at)&&new Date(end)>new Date(b.starts_at);
  const renderSlots = async () => {
    const host=$("slots");
    if(!state.service||!state.barber){host.innerHTML='<p class="muted">Choose a service and barber first.</p>';return;}
    host.innerHTML='<p class="muted">Checking availability…</p>';
    await loadBookings();
    const now=new Date(),duration=state.service.duration_minutes,slots=[];
    // Initial schedule: 09:00–17:00, last appointment must finish by 17:00.
    for(let minutes=9*60;minutes+duration<=17*60;minutes+=30){
      const h=String(Math.floor(minutes/60)).padStart(2,"0"),m=String(minutes%60).padStart(2,"0");
      const start=new Date(state.date+`T${h}:${m}:00`),end=new Date(start.getTime()+duration*60000);
      if(start<=now)continue;
      const startIso=start.toISOString(),endIso=end.toISOString();
      const taken=state.bookings.some(b=>overlaps(startIso,endIso,b));
      slots.push({label:`${h}:${m}`,start,end,disabled:taken});
    }
    host.innerHTML=slots.length?slots.map(s=>`<button class="slot ${state.time===s.label?"selected":""}" data-time="${s.label}" ${s.disabled?"disabled":""}>${s.label}</button>`).join(""):'<p class="muted">No times left on this date. Try another day.</p>';
    host.querySelectorAll("button:not(:disabled)").forEach(btn=>btn.addEventListener("click",()=>{state.time=btn.dataset.time;host.querySelectorAll(".slot").forEach(b=>b.classList.toggle("selected",b===btn));updateSummary();setStep(4);}));
  };
  const loadData = async () => {
    if(db){
      const [s,b]=await Promise.all([db.from("services").select("*").eq("active",true).order("sort_order"),db.from("barbers").select("*").eq("active",true).order("sort_order")]);
      if(s.error||b.error){notify("Could not connect to booking data. Check your Supabase setup.");return false;}
      state.services=s.data||[];state.barbers=b.data||[];
      $("connection-status").textContent="Live booking database connected";
    } else {
      state.services=demoServices;state.barbers=demoBarbers;
      $("connection-status").textContent="Demo mode — bookings stay on this device";
    }
    renderServices();renderBarbers();updateSummary();return true;
  };
  const submitBooking = async event => {
    event.preventDefault();
    if(!state.service||!state.barber||!state.date||!state.time){notify("Please select a service, barber, date and time.");return;}
    const form=new FormData(event.currentTarget),name=String(form.get("name")).trim(),phone=String(form.get("phone")).trim(),email=String(form.get("email")).trim();
    if(!name||phone.length<7||!email.includes("@")){notify("Please enter valid contact details.");return;}
    const [h,m]=state.time.split(":").map(Number),start=new Date(state.date);start.setHours(h,m,0,0);
    const end=new Date(start.getTime()+state.service.duration_minutes*60000);
    const button=event.currentTarget.querySelector("button[type=submit]");button.disabled=true;button.textContent="SAVING BOOKING…";
    try{
      if(db){
        const {data,error}=await db.rpc("create_booking",{p_service_id:state.service.id,p_barber_id:state.barber.id,p_customer_name:name,p_customer_phone:phone,p_customer_email:email,p_starts_at:start.toISOString()});
        if(error)throw error;
        $("confirmation-text").textContent=`Your request for ${state.service.name} with ${state.barber.name} on ${dateLabel(state.date)} at ${state.time} has been saved. Payment still needs to be connected, so this is not yet a confirmed appointment.`;
      }else{
        const saved=JSON.parse(localStorage.getItem("xbs-demo-bookings")||"[]");
        const candidate={barber_id:state.barber.id,date:state.date,starts_at:start.toISOString(),ends_at:end.toISOString()};
        if(saved.some(b=>b.barber_id===candidate.barber_id&&b.date===candidate.date&&overlaps(candidate.starts_at,candidate.ends_at,b)))throw new Error("That time has just been taken. Please choose another slot.");
        saved.push(candidate);localStorage.setItem("xbs-demo-bookings",JSON.stringify(saved));
        $("confirmation-text").textContent=`Demo booking: ${state.service.name} with ${state.barber.name} on ${dateLabel(state.date)} at ${state.time}. This is saved only in this browser. No payment has been taken and the appointment is not confirmed.`;
      }
      $("confirmation").showModal();
      state.time=null;updateSummary();await renderSlots();event.currentTarget.reset();
    }catch(error){notify(error.message||"Booking could not be saved. Please try again.");}
    finally{button.disabled=false;button.innerHTML='CONTINUE TO PAYMENT <span>↗</span>';}
  };

  const dateInput=$("booking-date"),today=new Date(),tomorrow=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1);
  dateInput.min=localDate(today);dateInput.value=localDate(tomorrow);state.date=dateInput.value;
  dateInput.addEventListener("change",()=>{state.date=dateInput.value;state.time=null;updateSummary();renderSlots();});
  $("customer-form").addEventListener("submit",submitBooking);
  $("close-confirmation").addEventListener("click",()=>$("confirmation").close());
  $("year").textContent=new Date().getFullYear();
  loadData();
})();