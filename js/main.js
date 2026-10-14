(function(){
  var d=document; d.documentElement.classList.add('js');

  // Header shadow + mobile call bar
  var hdr=d.querySelector('.hdr'), bar=d.querySelector('.callbar');
  function onScroll(){
    var y=window.scrollY||0;
    if(hdr) hdr.classList.toggle('is-scrolled', y>8);
    if(bar) bar.classList.toggle('is-on', y>420);
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Mobile menu
  var burger=d.querySelector('.burger'), nav=d.querySelector('.nav');
  if(burger&&nav){
    burger.addEventListener('click', function(){
      var open=burger.getAttribute('aria-expanded')==='true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      d.body.style.overflow=!open?'hidden':'';
    });
    nav.addEventListener('click', function(e){
      if(e.target.closest('a')){burger.setAttribute('aria-expanded','false');nav.classList.remove('is-open');d.body.style.overflow='';}
    });
    window.addEventListener('resize', function(){ if(window.innerWidth>980){burger.setAttribute('aria-expanded','false');nav.classList.remove('is-open');d.body.style.overflow='';} });
  }

  // Scroll reveal
  var els=d.querySelectorAll('[data-r],[data-door]');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(el){io.observe(el)});
  } else { els.forEach(function(el){el.classList.add('in')}); }

  // Opening hours (Sydney time)
  var H={1:[8.5,16.5],2:[8.5,16.5],3:[8.5,16.5],4:[8.5,16.5],5:[8.5,16.5],6:[8.5,13],0:null};
  function sydNow(){
    try{
      var p=new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
      var o={}; p.forEach(function(x){o[x.type]=x.value});
      var map={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
      return {day:map[o.weekday], h:(parseInt(o.hour,10)%24)+parseInt(o.minute,10)/60};
    }catch(e){var n=new Date();return {day:n.getDay(),h:n.getHours()+n.getMinutes()/60}}
  }
  function fmt(h){var hh=Math.floor(h),mm=Math.round((h-hh)*60);var ap=hh>=12?'pm':'am';var h12=hh%12||12;return h12+(mm?':'+String(mm).padStart(2,'0'):'')+' '+ap}
  var now=sydNow(), names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  d.querySelectorAll('[data-status]').forEach(function(s){
    var t=H[now.day], txt;
    if(t&&now.h>=t[0]&&now.h<t[1]){ s.classList.add('is-open'); txt='Open now, until '+fmt(t[1]); }
    else{
      s.classList.add('is-closed');
      var k=now.day, add=0;
      if(t&&now.h<t[0]){ txt='Closed, opens today at '+fmt(t[0]); }
      else{ do{k=(k+1)%7;add++}while(!H[k]&&add<7); txt='Closed, opens '+(add===1?'tomorrow':names[k])+' at '+fmt(H[k][0]); }
    }
    var span=s.querySelector('span'); if(span) span.textContent=txt;
  });
  d.querySelectorAll('.hours tr[data-day]').forEach(function(tr){ if(+tr.getAttribute('data-day')===now.day) tr.classList.add('is-today'); });

  // Drag-to-scroll photo strip
  d.querySelectorAll('.strip').forEach(function(s){
    var down=false,sx=0,sl=0,moved=false;
    s.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse')return; down=true;moved=false;sx=e.clientX;sl=s.scrollLeft;s.classList.add('is-drag'); });
    window.addEventListener('pointermove',function(e){ if(!down)return; var dx=e.clientX-sx; if(Math.abs(dx)>3)moved=true; s.scrollLeft=sl-dx; });
    window.addEventListener('pointerup',function(){ if(!down)return; down=false; s.classList.remove('is-drag'); });
    s.addEventListener('click',function(e){ if(moved){e.preventDefault();e.stopPropagation();} },true);
  });

  // Lightbox
  var lb=d.querySelector('.lb');
  if(lb){
    var items=[].slice.call(d.querySelectorAll('.gal button')), i=0, img=lb.querySelector('img'), cap=lb.querySelector('figcaption'), last=null;
    function show(n){ i=(n+items.length)%items.length; var b=items[i]; img.src=b.getAttribute('data-full'); img.alt=b.querySelector('img').alt; cap.textContent=b.querySelector('span').textContent; }
    function open(n){ last=d.activeElement; show(n); lb.classList.add('is-open'); lb.setAttribute('aria-hidden','false'); d.body.style.overflow='hidden'; lb.querySelector('.x').focus(); }
    function close(){ lb.classList.remove('is-open'); lb.setAttribute('aria-hidden','true'); d.body.style.overflow=''; if(last) last.focus(); }
    items.forEach(function(b,n){ b.addEventListener('click',function(){open(n)}); });
    lb.querySelector('.x').addEventListener('click',close);
    lb.querySelector('.prev').addEventListener('click',function(){show(i-1)});
    lb.querySelector('.next').addEventListener('click',function(){show(i+1)});
    lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
    d.addEventListener('keydown',function(e){ if(!lb.classList.contains('is-open'))return; if(e.key==='Escape')close(); if(e.key==='ArrowLeft')show(i-1); if(e.key==='ArrowRight')show(i+1); });
    var tx=null; lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){ if(tx===null)return; var dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50) show(i+(dx<0?1:-1)); tx=null; });
  }

  var y=d.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
})();
