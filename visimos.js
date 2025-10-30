const video = document.getElementById("cam");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");
let prevFrame = null;
let ruleGlow = true;

navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    draw();
    document.getElementById("status").textContent = "Camera OK — Running";
  };
}).catch(err=>{
  document.getElementById("status").textContent = "Camera blocked: allow camera.";
});

function draw(){
  if (overlay.width === 0) {requestAnimationFrame(draw);return;}
  ctx.clearRect(0,0,overlay.width,overlay.height);
  try{
    const w = overlay.width, h = overlay.height;
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    const tctx = tmp.getContext("2d");
    tctx.drawImage(video,0,0,w,h);
    const frame = tctx.getImageData(0,0,w,h);
    if(prevFrame){
      let changed = false;
      for(let i=0;i<frame.data.length;i+=4*20){ 
        if(Math.abs(frame.data[i]-prevFrame.data[i])>40){changed=true;break;}
      }
      if(changed && ruleGlow){
        ctx.strokeStyle="white";
        ctx.lineWidth=18;
        ctx.beginPath();
        ctx.arc(w/2,h/2, Math.min(w,h)/3, 0, Math.PI*2);
        ctx.stroke();
      }
    }
    prevFrame = frame;
  }catch(e){}
  requestAnimationFrame(draw);
}

document.getElementById("runBtn").onclick = () => {
  const text = document.getElementById("rules").value.toLowerCase();
  ruleGlow = text.includes("glow");
  document.getElementById("status").textContent = "Rules applied.";
};
