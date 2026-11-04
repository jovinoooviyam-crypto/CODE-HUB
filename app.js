const heartLayer = document.querySelector('.floating-hearts');
const hearts = ['♡','♥','✧'];
function floatHeart(){
  const el=document.createElement('span');
  el.className='float-heart';
  el.textContent=hearts[Math.floor(Math.random()*hearts.length)];
  el.style.left=Math.random()*100+'%';
  el.style.fontSize=(12+Math.random()*20)+'px';
  el.style.animationDuration=(8+Math.random()*8)+'s';
  heartLayer.appendChild(el);
  setTimeout(()=>el.remove(),17000);
}
setInterval(floatHeart,850);

document.getElementById('openLetter').addEventListener('click',()=>{
  document.getElementById('letter').scrollIntoView({behavior:'smooth'});
  burst(45);
});
function burst(count=80){
  const colors=['#ff9dbd','#ffe3a8','#ffffff','#c9a7ff','#ff719f'];
  for(let i=0;i<count;i++){
    const bit=document.createElement('i');
    bit.className='confetti';
    bit.style.left=Math.random()*100+'vw';
    bit.style.background=colors[Math.floor(Math.random()*colors.length)];
    bit.style.animationDuration=(2.2+Math.random()*2.5)+'s';
    bit.style.animationDelay=Math.random()*.5+'s';
    bit.style.transform=`rotate(${Math.random()*360}deg)`;
    document.body.appendChild(bit);
    setTimeout(()=>bit.remove(),5200);
  }
}
document.getElementById('wishBtn').addEventListener('click',()=>{
  burst(130);
  document.getElementById('wishResult').textContent='May the universe save its loveliest surprises just for you. ✨';
  document.getElementById('wishBtn').textContent='Wish sent with love ♥';
});

let audioCtx=null, playing=false, timer=null, noteIndex=0;
const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,783.99];
function playNote(){
  if(!playing||!audioCtx)return;
  const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
  osc.type='sine';osc.frequency.value=notes[noteIndex++%notes.length];
  gain.gain.setValueAtTime(.0001,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.055,audioCtx.currentTime+.04);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.34);
  osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.36);
}
document.getElementById('musicBtn').addEventListener('click',async()=>{
  const btn=document.querySelector('#musicBtn span');
  if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')await audioCtx.resume();
  playing=!playing;
  if(playing){playNote();timer=setInterval(playNote,420);btn.textContent='Sound on';}
  else{clearInterval(timer);btn.textContent='Sound off';}
});

// Quick personalisation: edit the two values below before sharing.
const birthdayName='Ragavi S';
document.getElementById('herName').textContent=birthdayName;

if ('serviceWorker' in navigator && location.protocol !== 'file:') { window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
