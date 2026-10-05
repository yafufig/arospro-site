import * as THREE from './assets/vendor/three.min.js';

// An original, procedural product concept. It does not depict production hardware.
const stage = document.querySelector('#scene-stage');
const canvas = document.querySelector('#product-scene');
const scanButton = document.querySelector('#scan-demo');
const title = document.querySelector('#scan-title');
const detail = document.querySelector('#scan-detail');
const readout = document.querySelector('.scan-readout');
const steps = [...document.querySelectorAll('#product .process li')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
catch { document.querySelector('#scene-hint').textContent = 'Иллюстрация концепции'; }

let scanTimeout, scanning = false, scanEverPlayed = false;
function setStep(n) { steps.forEach((step, i) => step.classList.toggle('is-current', i === n)); }
function finishScan() {
  scanning = false; scanButton.disabled = false;
  scanButton.innerHTML = 'Повторить сканирование <span aria-hidden="true">↗</span>';
  readout.classList.remove('is-reading'); readout.classList.add('is-done');
  title.textContent = 'Маркировка распознана'; detail.textContent = 'Пример: SKU 04821 · Зона А-12'; setStep(2);
}
scanButton.addEventListener('click', () => {
  clearTimeout(scanTimeout); scanning = true; scanEverPlayed = true; scanButton.disabled = true;
  scanButton.textContent = 'Считываем маркировку…';
  readout.classList.remove('is-done'); readout.classList.add('is-reading');
  title.textContent = 'Код в поле зрения'; detail.textContent = 'Иллюстрация работы распознавания'; setStep(1);
  if (motion.matches) { finishScan(); if (renderer) draw(); }
  else { scanStarted = performance.now(); scanTimeout = setTimeout(finishScan, 1800); if (renderer) wake(); }
});

let scanStarted = 0, draw = () => {}, wake = () => {};
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  camera.position.set(5.4, 3.2, 8.6); camera.lookAt(0, .25, 0);
  scene.add(new THREE.HemisphereLight(0xf6f9ff, 0x667b9b, 3));
  const key = new THREE.DirectionalLight(0xffffff, 4.5); key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x769fff, 3); rim.position.set(4, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 1.5); fill.position.set(0, -1, 4); scene.add(fill);
  const model = new THREE.Group(); scene.add(model);
  const black = new THREE.MeshStandardMaterial({ color: 0x1b2534, roughness: .27, metalness: .6 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x263344, roughness: .67, metalness: .1 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x214fc7, roughness: .3, metalness: .5 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xadbacc, roughness: .23, metalness: .9 });
  const lens = new THREE.MeshPhysicalMaterial({ color: 0x96bed3, metalness: .05, roughness: .08, transparent: true, opacity: .4, side: THREE.DoubleSide, clearcoat: 1 });
  function block(w, h, d, material, x, y, z, parent) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function tube(points, radius, material, parent, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 8, closed), material); parent.add(mesh); return mesh;
  }
  function roundShape(w, h, r) {
    const s = new THREE.Shape(), x = -w/2, y = -h/2;
    s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); return s;
  }
  const glasses = new THREE.Group(); glasses.position.set(-.38, .95, .18); glasses.rotation.set(-.1, -.16, -.08); model.add(glasses);
  for (const side of [-1, 1]) {
    const c = side * .7;
    const points = roundShape(1.18, .76, .22).getPoints(10).map(p => [p.x+c,p.y,.18]);
    tube(points, .056, black, glasses, true);
    const glass = new THREE.Mesh(new THREE.ShapeGeometry(roundShape(1.06,.65,.19)), lens);
    glass.position.set(c,0,.18); glasses.add(glass);
    tube([[c-.35,.23,.2],[c-.1,.27,.2],[c+.2,.27,.2]],.012,silver,glasses);
    tube([[side*1.27,.19,.1],[side*1.4,.17,-.3],[side*1.45,.09,-1.22],[side*1.31,-.1,-1.55]],.065,rubber,glasses);
    block(.13,.12,.23,silver,side*1.25,.15,.03,glasses);
    block(.12,.2,.72,black,side*1.4,.13,-.5,glasses);
    block(.135,.035,.4,blue,side*1.4,.25,-.5,glasses);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(.1,12,8),rubber);
    pad.scale.set(.5,1,.65); pad.position.set(side*.17,-.18,.12); glasses.add(pad);
  }
  tube([[-.15,.1,.18],[0,.17,.22],[.15,.1,.18]],.048,black,glasses);
  const sensor = block(.26,.23,.12,black,1.27,.04,.24,glasses);
  const aperture = new THREE.Mesh(new THREE.CylinderGeometry(.068,.068,.026,24),silver);
  aperture.rotation.x = Math.PI/2; aperture.position.set(1.27,.04,.316); glasses.add(aperture);
  const cameraGlass = new THREE.Mesh(new THREE.CircleGeometry(.043,24),new THREE.MeshStandardMaterial({color:0x183964,metalness:.8,roughness:.07}));
  cameraGlass.position.set(1.27,.04,.332); glasses.add(cameraGlass);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.018,8,8),new THREE.MeshBasicMaterial({color:0x6fc9ff})); led.position.set(1.16,.08,.32); glasses.add(led);
  const lensHud = new THREE.Group(); lensHud.position.set(-.7,0,.195); glasses.add(lensHud);
  const hudMat = new THREE.MeshBasicMaterial({color:0x66aaff,transparent:true,opacity:.65});
  for (const [x,y] of [[-.3,-.16],[.3,-.16],[-.3,.16],[.3,.16]]) {
    block(.12,.012,.005,hudMat,x+(x<0?.06:-.06),y,0,lensHud);
    block(.012,.08,.005,hudMat,x,y+(y<0?.04:-.04),0,lensHud);
  }
  const box = new THREE.Group(); box.position.set(.7,-.78,.25); box.rotation.y=-.15; model.add(box);
  const cardboard = new THREE.MeshStandardMaterial({color:0xc5a777,roughness:.95});
  block(1.65,1.08,1.3,cardboard,0,0,0,box);
  block(.2,.012,1.32,new THREE.MeshStandardMaterial({color:0xdac497,roughness:.9}),0,.546,0,box);
  block(.2,1.08,.008,new THREE.MeshStandardMaterial({color:0xdac497,roughness:.9}),0,0,.657,box);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.65,1.08,1.3)),new THREE.LineBasicMaterial({color:0x99794e,transparent:true,opacity:.35})); box.add(edges);
  const labelCanvas = document.createElement('canvas'); labelCanvas.width=512; labelCanvas.height=256;
  const ctx = labelCanvas.getContext('2d'); ctx.fillStyle='#fafbf8'; ctx.fillRect(0,0,512,256);
  ctx.fillStyle='#182a40'; ctx.font='bold 24px Arial'; ctx.fillText('АросПро',190,48); ctx.font='20px Arial'; ctx.fillText('SKU 04821',190,102); ctx.fillText('Зона А-12',190,137);
  ctx.fillStyle='#778596'; ctx.font='14px Arial'; ctx.fillText('Пример маркировки',190,199);
  const qrSize=21, unit=7, ox=21, oy=40;
  function finder(x,y) { ctx.fillStyle='#182a40';ctx.fillRect(ox+x*unit,oy+y*unit,7*unit,7*unit);ctx.fillStyle='#fafbf8';ctx.fillRect(ox+(x+1)*unit,oy+(y+1)*unit,5*unit,5*unit);ctx.fillStyle='#182a40';ctx.fillRect(ox+(x+2)*unit,oy+(y+2)*unit,3*unit,3*unit); }
  for(let y=0;y<qrSize;y++)for(let x=0;x<qrSize;x++){if((x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12))continue;if((x*7+y*11+x*y)%5<2){ctx.fillStyle='#182a40';ctx.fillRect(ox+x*unit,oy+y*unit,unit,unit);}}
  finder(0,0);finder(14,0);finder(0,14);
  const texture = new THREE.CanvasTexture(labelCanvas); texture.colorSpace=THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.2,.6),new THREE.MeshBasicMaterial({map:texture})); label.position.set(0,.04,.665); box.add(label);
  const scanFrame = new THREE.Group(); scanFrame.position.set(-.35,.05,.68); box.add(scanFrame);
  const scanMaterial = new THREE.MeshBasicMaterial({color:0x214fc7,transparent:true,opacity:.9});
  for(const [x,y] of [[-.2,-.21],[.2,-.21],[-.2,.21],[.2,.21]]){
    block(.11,.015,.012,scanMaterial,x+(x<0?.055:-.055),y,0,scanFrame);
    block(.015,.1,.012,scanMaterial,x,y+(y<0?.05:-.05),0,scanFrame);
  }
  const scanLine = block(.38,.009,.015,scanMaterial,0,0,.01,scanFrame);
  scanFrame.visible=false;
  const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.82,1.02,.53),new THREE.Vector3(.35,-.7,.9)]),new THREE.LineDashedMaterial({color:0x214fc7,dashSize:.07,gapSize:.04,transparent:true,opacity:.65}));
  beam.computeLineDistances(); beam.visible=false; model.add(beam);
  const floor = new THREE.GridHelper(12,24,0xc3d0e2,0xdce4ef); floor.position.y=-1.35; scene.add(floor);
  floor.material.transparent=true;floor.material.opacity=.5;
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const sctx=shadowCanvas.getContext('2d'), gradient=sctx.createRadialGradient(64,64,1,64,64,64);
  gradient.addColorStop(0,'rgba(27,52,91,.25)');gradient.addColorStop(1,'rgba(27,52,91,0)');sctx.fillStyle=gradient;sctx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5,3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-1.34,0);scene.add(shadow);
  let targetY=-.22, targetX=.06, visible=true, dragging=false, startX=0, startY=0, startRotY=0, startRotX=0, frame=0;
  const started=performance.now(); let introDone=motion.matches, last=started, introElapsed=0, autoQueued=false;
  draw=()=>renderer.render(scene,camera);
  function resize(){const rect=stage.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();draw();}
  new ResizeObserver(resize).observe(stage);
  function animate(now){frame=0;if(!visible||document.hidden)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    model.rotation.y+= (targetY-model.rotation.y)*Math.min(1,dt*9);
    model.rotation.x+= (targetX-model.rotation.x)*Math.min(1,dt*9);
    if(!introDone&&!motion.matches){
      introElapsed+=dt;glasses.position.y=.95+Math.sin(introElapsed*1.5)*.055;
      if(introElapsed>.65&&!scanEverPlayed&&!autoQueued){autoQueued=true;setTimeout(()=>{if(visible&&!document.hidden&&!scanEverPlayed)scanButton.click();},0);}
      if(introElapsed>6)introDone=true;
    }
    scanFrame.visible=scanning||readout.classList.contains('is-done');beam.visible=scanning;
    if(scanning)scanLine.position.y=Math.sin((now-scanStarted)*.006)*.18;
    else scanLine.position.y=0;
    draw();
    if(scanning||!introDone||Math.abs(targetY-model.rotation.y)>.001||Math.abs(targetX-model.rotation.x)>.001)frame=requestAnimationFrame(animate);
  }
  wake=()=>{if(!frame&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(animate);}};
  function rotate(amount){targetY=Math.max(-1.15,Math.min(1.15,targetY+amount));introDone=true;if(motion.matches){model.rotation.y=targetY;draw();}else wake();}
  document.querySelector('#rotate-left').addEventListener('click',()=>rotate(-.28));
  document.querySelector('#rotate-right').addEventListener('click',()=>rotate(.28));
  canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(e.key==='ArrowLeft'?-.28:.28);}if(e.key==='Home'){e.preventDefault();targetY=-.22;targetX=.06;wake();}});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;startX=e.clientX;startY=e.clientY;startRotY=targetY;startRotX=targetX;introDone=true;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetY=Math.max(-1.15,Math.min(1.15,startRotY+(e.clientX-startX)*.008));targetX=Math.max(-.25,Math.min(.4,startRotX+(e.clientY-startY)*.004));if(motion.matches){model.rotation.set(targetX,targetY,0);draw();}else wake();});
  canvas.addEventListener('pointerup',()=>{dragging=false;});canvas.addEventListener('pointercancel',()=>{dragging=false;});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;cancelAnimationFrame(frame);stage.classList.remove('scene-ready');document.querySelector('#scene-hint').textContent='Иллюстрация концепции';});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  motion.addEventListener('change',()=>{introDone=true;glasses.position.y=.95;draw();});
  scanButton.addEventListener('click',()=>{scanFrame.visible=true;wake();});
  model.rotation.set(targetX,targetY,0);resize();stage.classList.add('scene-ready');wake();
} else {
  canvas.hidden=true;document.querySelector('.rotate-controls').hidden=true;
}
