const video = document.getElementById("cam");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

const orb = document.getElementById("orbLayer");
const octx = orb.getContext("2d");

let prevFrame = null;
let speakOnMotion = true;

// Voice (calm female)
function speak(text){
  const msg = new SpeechSynthesisUtterance(text);
  msg.pitch = 1.05; msg.rate = 0.96; msg.volume = 1; msg.lang = "en-US";
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google"));
  if(female) msg.voice = female;
  speechSynthesis.speak(msg);
}

navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    orb.width = video.videoWidth;
    orb.height = video.videoHeight;
    draw();
  };
});

// Orb state
let orbX = 0.5, orbY = 0.5, orbSize = 0.25;

function drawOrb(){
  octx.clearRect(0,0,orb.width,orb.height);
  const x = orbX * orb.width;
  const y = orbY * orb.height;
  const r = (Math.min(orb.width,orb.height)*orbSize)/2;

  octx.strokeStyle="rgba(255,255,255,0.9)";
  octx.lineWidth = 12;
  octx.beginPath();
  octx.arc(x,y,r,0,Math.PI*2);
  octx.stroke();
}

function draw(){
  const w = overlay.width, h = overlay.height;
  const tmp = document.createElement("canvas");
  tmp.width = w; tmp.height = h;
  const tctx = tmp.getContext("2d");
  tctx.drawImage(video,0,0,w,h);
  const frame = tctx.getImageData(0,0,w,h);

  let motion = false;
  if(prevFrame){
    for(let i=0;i<frame.data.length;i+=4*20){
      if(Math.abs(frame.data[i]-prevFrame.data[i])>40){ motion=true; break; }
    }
  }
  prevFrame = frame;

  ctx.clearRect(0,0,w,h);

  if(motion){
    ctx.strokeStyle="white"; ctx.lineWidth=14;
    ctx.beginPath(); ctx.arc(w/2,h/2,h/3,0,Math.PI*2); ctx.stroke();

    if(speakOnMotion){
      speakOnMotion=false;
      speak("Hello, I see you.");
      setTimeout(()=>speakOnMotion=true,4000);
    }

    // Orb movement (mirrored, medium speed)
    orbX += (Math.random()*0.02 - 0.01);
    orbY += (Math.random()*0.02 - 0.01);
    orbSize = 0.25;
  } else {
    orbSize *= 0.98;
  }

  orbX = Math.max(0.1, Math.min(0.9, orbX));
  orbY = Math.max(0.1, Math.min(0.9, orbY));

  drawOrb();
  requestAnimationFrame(draw);
}

document.getElementById("runBtn").onclick = () => {
  document.getElementById("status").textContent = "Rules updated.";
};
