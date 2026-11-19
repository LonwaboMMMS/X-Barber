// Add each new haircut photo to this list after uploading it to the Images folder.
// Use the exact filename, including capitalisation and file extension.
(()=>{
  const grid=document.getElementById("gallery-grid");
  const photos=[
    // Example:
    // {src:"Images/skin-fade-01.jpg",caption:"Skin fade",alt:"Fresh skin fade at X Barbershop"}
  ];
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  if(!photos.length){
    grid.innerHTML='<div class="gallery-empty"><h2>FRESH CUTS COMING SOON</h2><p>Our best looks will appear here. Check back soon.</p><a class="primary-btn" href="booking.html">BOOK YOUR CUT <span>↗</span></a></div>';
    return;
  }
  grid.innerHTML=photos.map(p=>'<figure class="gallery-card"><img src="'+esc(p.src)+'" alt="'+esc(p.alt||p.caption||"Haircut at X Barbershop")+'" loading="lazy"><figcaption>'+esc(p.caption||"X Barbershop")+'</figcaption></figure>').join("");
})();