const video = document.getElementById("cam");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");
let prevFrame = null;
let speakOnMotion = true;

// Calm female AI voice
function speak(text){
  const msg = new SpeechSynthesisUtterance(text);
  msg.pitch = 1.05;
  msg.rate = 0.96;
  msg.volume = 1;
  msg.lang = "en-US";

  // pick a female voice if available
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google us"));
  if(female) msg.voice = female;

  speechSynthesis.speak(msg);
}

navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    draw();
    document.getElementById("status").textContent = "Camera OK — Vision Active";
  };
}).catch(err=>{
  document.getElementById("status").textContent = "Camera blocked: allow camera.";
});

function draw(){
  if (overlay.width === 0) return requestAnimationFrame(draw);

  ctx.clearRect(0,0,overlay.width,overlay.height);

  const w = overlay.width, h = overlay.height;
  const tmp = document.createElement("canvas");
  tmp.width = w; tmp.height = h;
  const tctx = tmp.getContext("2d");
  tctx.drawImage(video,0,0,w,h);
  const frame = tctx.getImageData(0,0,w,h);
  
  if(prevFrame){
    let changed = false;
    for(let i=0;i<frame.data.length;i+=4*20){
      if(Math.abs(frame.data[i]-prevFrame.data[i])>40){
        changed = true;
        break;
      }
    }
    if(changed){
      // Glow
      ctx.strokeStyle="white";
      ctx.lineWidth=18;
      ctx.beginPath();
      ctx.arc(w/2,h/2, Math.min(w,h)/3, 0, Math.PI*2);
      ctx.stroke();

      // Voice
      if(speakOnMotion){
        speakOnMotion = false;
        speak("Hello, I see you.");
        setTimeout(()=>speakOnMotion=true, 3000);
      }
    }
  }
  prevFrame = frame;
  requestAnimationFrame(draw);
}

document.getElementById("runBtn").onclick = () => {
  const text = document.getElementById("rules").value.toLowerCase();
  speakOnMotion = text.includes("see motion");
  document.getElementById("status").textContent = "Rules updated.";
};
