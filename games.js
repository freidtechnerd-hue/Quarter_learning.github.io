/* =========================================================
   SNAKE
   ========================================================= */
function initSnake(holder, setScore, helpEl){
  helpEl.textContent = 'Arrow keys / WASD to move. Swipe on mobile.';
  const cols=20, rows=20, cell=20;
  const canvas = document.createElement('canvas');
  canvas.width = cols*cell; canvas.height = rows*cell;
  holder.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let snake, dir, nextDir, food, score, alive, timer;

  function reset(){
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = {x:1,y:0}; nextDir = {x:1,y:0};
    score = 0; alive = true;
    placeFood();
    setScore(score);
  }
  function placeFood(){
    do{ food = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows)}; }
    while(snake.some(s=>s.x===food.x && s.y===food.y));
  }
  function draw(){
    ctx.fillStyle = '#08070f'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ff4fa3';
    ctx.fillRect(food.x*cell+2, food.y*cell+2, cell-4, cell-4);
    snake.forEach((s,i)=>{
      ctx.fillStyle = i===0 ? '#4ce0d2' : '#2f9c93';
      ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
    });
    if(!alive){
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.textAlign='center';
      ctx.fillText('GAME OVER — click to restart', canvas.width/2, canvas.height/2);
    }
  }
  function step(){
    if(!alive) return;
    dir = nextDir;
    const head = {x: snake[0].x+dir.x, y: snake[0].y+dir.y};
    if(head.x<0||head.y<0||head.x>=cols||head.y>=rows||snake.some(s=>s.x===head.x&&s.y===head.y)){
      alive = false; draw(); return;
    }
    snake.unshift(head);
    if(head.x===food.x && head.y===food.y){ score+=10; setScore(score); placeFood(); }
    else snake.pop();
    draw();
  }
  function onKey(e){
    const map = {ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
    const m = map[e.key];
    if(!m) return;
    e.preventDefault();
    if(m[0]===-dir.x && m[1]===-dir.y) return;
    nextDir = {x:m[0], y:m[1]};
  }
  canvas.addEventListener('click', ()=>{ if(!alive) reset(); });
  document.addEventListener('keydown', onKey);

  let touchStart = null;
  canvas.addEventListener('touchstart', e=>{ touchStart = e.touches[0]; }, {passive:true});
  canvas.addEventListener('touchend', e=>{
    if(!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.clientX;
    const dy = e.changedTouches[0].clientY - touchStart.clientY;
    if(Math.abs(dx) > Math.abs(dy)) nextDir = dx>0 ? {x:1,y:0} : {x:-1,y:0};
    else nextDir = dy>0 ? {x:0,y:1} : {x:0,y:-1};
  }, {passive:true});

  reset(); draw();
  timer = setInterval(step, 110);
  return ()=>{ clearInterval(timer); document.removeEventListener('keydown', onKey); };
}

/* =========================================================
   BREAKOUT
   ========================================================= */
function initBreakout(holder, setScore, helpEl){
  helpEl.textContent = 'Mouse / arrow keys to move the paddle.';
  const W=440, H=460;
  const canvas = document.createElement('canvas');
  canvas.width=W; canvas.height=H;
  holder.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const paddle = {w:70, h:10, x:W/2-35, y:H-24, speed:7};
  let ball, bricks, score, lives, alive, keys={}, raf;
  const rows=5, brickCols=8, bw=48, bh=16, bgap=4, btop=40;

  function reset(){
    ball = {x:W/2, y:H-40, r:6, dx:3.4, dy:-3.4};
    bricks = [];
    for(let r=0;r<rows;r++) for(let c=0;c<brickCols;c++)
      bricks.push({x:8+c*(bw+bgap), y:btop+r*(bh+bgap), alive:true, color:['#ff4fa3','#4ce0d2','#ffc857','#8a7cff','#5ee6a0'][r%5]});
    score=0; lives=3; alive=true; setScore(score);
  }
  function draw(){
    ctx.fillStyle='#08070f'; ctx.fillRect(0,0,W,H);
    bricks.forEach(b=>{ if(b.alive){ ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,bw,bh); }});
    ctx.fillStyle='#f1eefc'; ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fillStyle='#4ce0d2'; ctx.fill();
    ctx.fillStyle='#a79bd1'; ctx.font='12px monospace'; ctx.textAlign='left';
    ctx.fillText('Lives: '+lives, 8, H-6);
    if(!alive){
      ctx.fillStyle='rgba(0,0,0,.65)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff'; ctx.font='16px monospace'; ctx.textAlign='center';
      ctx.fillText(lives<=0 ? 'GAME OVER — click to restart' : 'YOU CLEARED IT! click to restart', W/2, H/2);
    }
  }
  function step(){
    if(!alive){ draw(); return; }
    if(keys.ArrowLeft) paddle.x -= paddle.speed;
    if(keys.ArrowRight) paddle.x += paddle.speed;
    paddle.x = Math.max(0, Math.min(W-paddle.w, paddle.x));

    ball.x += ball.dx; ball.y += ball.dy;
    if(ball.x < ball.r || ball.x > W-ball.r) ball.dx *= -1;
    if(ball.y < ball.r) ball.dy *= -1;
    if(ball.y > H+30){ lives--; if(lives<=0){ alive=false; } else { ball.x=W/2; ball.y=H-40; ball.dx=3.4; ball.dy=-3.4; } }

    if(ball.y+ball.r > paddle.y && ball.y-ball.r < paddle.y+paddle.h && ball.x > paddle.x && ball.x < paddle.x+paddle.w && ball.dy>0){
      ball.dy *= -1;
      const hit = (ball.x - (paddle.x+paddle.w/2)) / (paddle.w/2);
      ball.dx = hit * 4.5;
    }
    bricks.forEach(b=>{
      if(!b.alive) return;
      if(ball.x > b.x && ball.x < b.x+bw && ball.y > b.y && ball.y < b.y+bh){
        b.alive=false; ball.dy*=-1; score+=10; setScore(score);
      }
    });
    if(bricks.every(b=>!b.alive)) alive=false;
    draw();
    raf = requestAnimationFrame(step);
  }
  function onKeyDown(e){ keys[e.key]=true; }
  function onKeyUp(e){ keys[e.key]=false; }
  function onMouse(e){
    const rect = canvas.getBoundingClientRect();
    paddle.x = (e.clientX - rect.left) * (W/rect.width) - paddle.w/2;
    paddle.x = Math.max(0, Math.min(W-paddle.w, paddle.x));
  }
  canvas.addEventListener('click', ()=>{ if(!alive){ reset(); raf=requestAnimationFrame(step); } });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouse);

  reset(); draw();
  raf = requestAnimationFrame(step);
  return ()=>{ cancelAnimationFrame(raf); document.removeEventListener('keydown',onKeyDown); document.removeEventListener('keyup',onKeyUp); };
}

/* =========================================================
   2048
   ========================================================= */
function initTwenty48(holder, setScore, helpEl){
  helpEl.textContent = 'Arrow keys to slide tiles. Swipe on mobile.';
  const size=4;
  const wrapper = document.createElement('div');
  wrapper.style.display='grid';
  wrapper.style.gridTemplateColumns = `repeat(${size}, 70px)`;
  wrapper.style.gridTemplateRows = `repeat(${size}, 70px)`;
  wrapper.style.gap='8px';
  holder.appendChild(wrapper);

  const colors = {2:'#2f2b4a',4:'#3a3560',8:'#4ce0d2',16:'#39c2b6',32:'#ff4fa3',64:'#e0397e',128:'#ffc857',256:'#e0a93e',512:'#8a7cff',1024:'#6c5ce7',2048:'#5ee6a0'};
  let board, score, alive;
  const cells = [];
  for(let i=0;i<size*size;i++){
    const c = document.createElement('div');
    c.style.background='#161226'; c.style.borderRadius='6px';
    c.style.display='flex'; c.style.alignItems='center'; c.style.justifyContent='center';
    c.style.fontFamily='monospace'; c.style.fontWeight='bold'; c.style.fontSize='20px'; c.style.color='#f1eefc';
    wrapper.appendChild(c); cells.push(c);
  }

  function reset(){
    board = Array.from({length:size}, ()=>Array(size).fill(0));
    score=0; alive=true; setScore(score);
    addTile(); addTile(); render();
  }
  function addTile(){
    const empty=[];
    for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(board[r][c]===0) empty.push([r,c]);
    if(!empty.length) return;
    const [r,c] = empty[Math.floor(Math.random()*empty.length)];
    board[r][c] = Math.random()<0.9 ? 2 : 4;
  }
  function render(){
    for(let r=0;r<size;r++) for(let c=0;c<size;c++){
      const v = board[r][c]; const cell = cells[r*size+c];
      cell.textContent = v||''; cell.style.background = v ? (colors[v]||'#5ee6a0') : '#161226';
      cell.style.color = v>=8 ? '#0d0b16' : '#f1eefc';
    }
  }
  function slideRow(row){
    let arr = row.filter(v=>v!==0);
    let moved = false;
    for(let i=0;i<arr.length-1;i++){
      if(arr[i]===arr[i+1]){ arr[i]*=2; score+=arr[i]; arr.splice(i+1,1); moved=true; }
    }
    while(arr.length<size) arr.push(0);
    return arr;
  }
  function move(dir){
    if(!alive) return;
    let rotated = board.map(r=>r.slice());
    const rotateCW = m => m[0].map((_,c)=> m.map(r=>r[c]).reverse());
    let times = {ArrowLeft:0, ArrowUp:3, ArrowRight:2, ArrowDown:1}[dir];
    for(let i=0;i<times;i++) rotated = rotateCW(rotated);
    let changed = false;
    const newBoard = rotated.map(row=>{
      const before = row.join(',');
      const after = slideRow(row);
      if(before !== after.join(',')) changed = true;
      return after;
    });
    let result = newBoard;
    for(let i=0;i<(4-times)%4;i++) result = rotateCW(result);
    if(changed){
      board = result; addTile(); render(); setScore(score);
      if(!hasMoves()){ alive=false; helpEl.textContent = 'No more moves — press R or click to restart.'; }
    }
  }
  function hasMoves(){
    for(let r=0;r<size;r++) for(let c=0;c<size;c++){
      if(board[r][c]===0) return true;
      if(c<size-1 && board[r][c]===board[r][c+1]) return true;
      if(r<size-1 && board[r][c]===board[r+1][c]) return true;
    }
    return false;
  }
  function onKey(e){
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){ e.preventDefault(); move(e.key); }
    if(e.key==='r' || e.key==='R') reset();
  }
  document.addEventListener('keydown', onKey);

  let touchStart=null;
  wrapper.addEventListener('touchstart', e=>{ touchStart=e.touches[0]; }, {passive:true});
  wrapper.addEventListener('touchend', e=>{
    if(!touchStart) return;
    const dx=e.changedTouches[0].clientX-touchStart.clientX, dy=e.changedTouches[0].clientY-touchStart.clientY;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20) return;
    if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'ArrowRight':'ArrowLeft');
    else move(dy>0?'ArrowDown':'ArrowUp');
  }, {passive:true});

  reset();
  return ()=>{ document.removeEventListener('keydown', onKey); };
}

/* =========================================================
   MEMORY MATCH
   ========================================================= */
function initMemory(holder, setScore, helpEl){
  helpEl.textContent = 'Click cards to flip them. Fewer moves = higher score.';
  const icons = ['🍄','⭐','👾','🎮','🍀','⚡','🎲','🔥'];
  let deck, flipped, matched, moves, locked;

  const wrapper = document.createElement('div');
  wrapper.style.display='grid';
  wrapper.style.gridTemplateColumns = 'repeat(4, 70px)';
  wrapper.style.gridGap = '10px';
  holder.appendChild(wrapper);

  function reset(){
    deck = [...icons, ...icons].sort(()=>Math.random()-0.5).map(v=>({v, open:false, done:false}));
    flipped=[]; matched=0; moves=0; locked=false;
    setScore(0);
    render();
  }
  function render(){
    wrapper.innerHTML='';
    deck.forEach((card, idx)=>{
      const el = document.createElement('div');
      el.style.width='70px'; el.style.height='70px'; el.style.borderRadius='8px';
      el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='center';
      el.style.fontSize='28px'; el.style.cursor='pointer'; el.style.userSelect='none';
      el.style.background = card.done ? '#1c1730' : (card.open ? '#2f2b4a' : '#161226');
      el.style.border = card.done ? '1px solid #4ce0d2' : '1px solid #322a4d';
      el.textContent = (card.open || card.done) ? card.v : '';
      el.addEventListener('click', ()=> flip(idx));
      wrapper.appendChild(el);
    });
  }
  function flip(idx){
    if(locked) return;
    const card = deck[idx];
    if(card.open || card.done) return;
    card.open = true; flipped.push(idx); render();
    if(flipped.length===2){
      locked=true; moves++;
      const [a,b] = flipped;
      if(deck[a].v === deck[b].v){
        deck[a].done=true; deck[b].done=true; matched++;
        flipped=[]; locked=false; render();
        if(matched===icons.length){
          const score = Math.max(10, 200 - moves*8);
          setScore(score);
          helpEl.textContent = `Cleared in ${moves} moves! Score: ${score}. Click any card to play again.`;
        }
      } else {
        setTimeout(()=>{ deck[a].open=false; deck[b].open=false; flipped=[]; locked=false; render(); }, 700);
      }
    }
  }
  const restartHandler = ()=>{ if(matched===icons.length) reset(); };
  wrapper.addEventListener('click', restartHandler);

  reset();
  return ()=>{};
}

/* =========================================================
   PONG (vs simple CPU)
   ========================================================= */
function initPong(holder, setScore, helpEl){
  helpEl.textContent = 'W/S or Up/Down to move your paddle. First to 7 wins.';
  const W=440,H=300;
  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  holder.appendChild(canvas);
  const ctx=canvas.getContext('2d');

  const player={x:10,y:H/2-25,w:8,h:50,speed:6};
  const cpu={x:W-18,y:H/2-25,w:8,h:50,speed:4.2};
  let ball, playerScore, cpuScore, keys={}, raf, alive;

  function resetBall(dir){ ball={x:W/2,y:H/2,r:6,dx:4*dir,dy:(Math.random()*4-2)}; }
  function reset(){ playerScore=0; cpuScore=0; alive=true; resetBall(1); setScore(0); }

  function draw(){
    ctx.fillStyle='#08070f'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#322a4d'; ctx.setLineDash([6,8]);
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#4ce0d2'; ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle='#ff4fa3'; ctx.fillRect(cpu.x,cpu.y,cpu.w,cpu.h);
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fillStyle='#ffc857'; ctx.fill();
    ctx.fillStyle='#f1eefc'; ctx.font='20px monospace'; ctx.textAlign='center';
    ctx.fillText(playerScore, W/2-40, 30); ctx.fillText(cpuScore, W/2+40, 30);
    if(!alive){
      ctx.fillStyle='rgba(0,0,0,.65)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff'; ctx.font='16px monospace';
      ctx.fillText(playerScore>cpuScore ? 'YOU WIN — click to restart' : 'CPU WINS — click to restart', W/2, H/2);
    }
  }
  function step(){
    if(!alive){ draw(); return; }
    if(keys.ArrowUp||keys.w) player.y -= player.speed;
    if(keys.ArrowDown||keys.s) player.y += player.speed;
    player.y = Math.max(0, Math.min(H-player.h, player.y));

    const cpuCenter = cpu.y+cpu.h/2;
    if(cpuCenter < ball.y-10) cpu.y += cpu.speed;
    else if(cpuCenter > ball.y+10) cpu.y -= cpu.speed;
    cpu.y = Math.max(0, Math.min(H-cpu.h, cpu.y));

    ball.x += ball.dx; ball.y += ball.dy;
    if(ball.y<ball.r || ball.y>H-ball.r) ball.dy*=-1;

    if(ball.x-ball.r < player.x+player.w && ball.y>player.y && ball.y<player.y+player.h && ball.dx<0){
      ball.dx*=-1.05; ball.dy += (ball.y-(player.y+player.h/2))*0.15;
    }
    if(ball.x+ball.r > cpu.x && ball.y>cpu.y && ball.y<cpu.y+cpu.h && ball.dx>0){
      ball.dx*=-1.05; ball.dy += (ball.y-(cpu.y+cpu.h/2))*0.15;
    }
    if(ball.x<0){ cpuScore++; setScore(playerScore); resetBall(1); }
    if(ball.x>W){ playerScore++; setScore(playerScore); resetBall(-1); }
    if(playerScore>=7 || cpuScore>=7) alive=false;
    draw();
    raf=requestAnimationFrame(step);
  }
  function onKeyDown(e){ keys[e.key]=true; }
  function onKeyUp(e){ keys[e.key]=false; }
  canvas.addEventListener('click', ()=>{ if(!alive){ reset(); raf=requestAnimationFrame(step); } });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  reset(); draw();
  raf=requestAnimationFrame(step);
  return ()=>{ cancelAnimationFrame(raf); document.removeEventListener('keydown',onKeyDown); document.removeEventListener('keyup',onKeyUp); };
}

/* =========================================================
   BLOCKS (tetromino faller)
   ========================================================= */
function initBlocks(holder, setScore, helpEl){
  helpEl.textContent = 'Arrows to move/rotate, Down to drop faster.';
  const cols=10, rows=18, cell=20;
  const canvas=document.createElement('canvas'); canvas.width=cols*cell; canvas.height=rows*cell;
  holder.appendChild(canvas);
  const ctx=canvas.getContext('2d');

  const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]],
  };
  const COLORS = {I:'#4ce0d2',O:'#ffc857',T:'#ff4fa3',S:'#5ee6a0',Z:'#e0397e',J:'#8a7cff',L:'#e0a93e'};
  let grid_, cur, score, alive, timer, dropCounter, dropInterval;

  function rotate(m){
    const h=m.length, w=m[0].length;
    const res = Array.from({length:w}, ()=>Array(h).fill(0));
    for(let r=0;r<h;r++) for(let c=0;c<w;c++) res[c][h-1-r]=m[r][c];
    return res;
  }
  function newPiece(){
    const keys = Object.keys(SHAPES);
    const k = keys[Math.floor(Math.random()*keys.length)];
    return { shape: SHAPES[k].map(r=>r.slice()), color: COLORS[k], x: Math.floor(cols/2)-1, y: 0 };
  }
  function collide(shape, x, y){
    for(let r=0;r<shape.length;r++) for(let c=0;c<shape[r].length;c++){
      if(!shape[r][c]) continue;
      const nx=x+c, ny=y+r;
      if(nx<0||nx>=cols||ny>=rows) return true;
      if(ny>=0 && grid_[ny][nx]) return true;
    }
    return false;
  }
  function merge(){
    cur.shape.forEach((row,r)=> row.forEach((v,c)=>{
      if(v){ const ny=cur.y+r, nx=cur.x+c; if(ny>=0) grid_[ny][nx]=cur.color; }
    }));
  }
  function clearLines(){
    let cleared=0;
    for(let r=rows-1;r>=0;r--){
      if(grid_[r].every(v=>v)){
        grid_.splice(r,1); grid_.unshift(Array(cols).fill(0)); cleared++; r++;
      }
    }
    if(cleared){ score += [0,10,30,50,80][cleared]; setScore(score); }
  }
  function reset(){
    grid_ = Array.from({length:rows}, ()=>Array(cols).fill(0));
    score=0; alive=true; dropCounter=0; dropInterval=500;
    cur = newPiece(); setScore(score);
  }
  function draw(){
    ctx.fillStyle='#08070f'; ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      if(grid_[r][c]){ ctx.fillStyle=grid_[r][c]; ctx.fillRect(c*cell+1,r*cell+1,cell-2,cell-2); }
    }
    ctx.fillStyle=cur.color;
    cur.shape.forEach((row,r)=> row.forEach((v,c)=>{
      if(v) ctx.fillRect((cur.x+c)*cell+1,(cur.y+r)*cell+1,cell-2,cell-2);
    }));
    if(!alive){
      ctx.fillStyle='rgba(0,0,0,.65)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#fff'; ctx.font='14px monospace'; ctx.textAlign='center';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2-8);
      ctx.fillText('click to restart', canvas.width/2, canvas.height/2+14);
    }
  }
  function drop(){
    if(!alive) return;
    if(!collide(cur.shape, cur.x, cur.y+1)){ cur.y++; }
    else {
      merge(); clearLines();
      cur = newPiece();
      if(collide(cur.shape, cur.x, cur.y)) alive=false;
    }
    draw();
  }
  function hardMove(dx){
    if(!collide(cur.shape, cur.x+dx, cur.y)) cur.x+=dx;
    draw();
  }
  function doRotate(){
    const r = rotate(cur.shape);
    if(!collide(r, cur.x, cur.y)) cur.shape = r;
    draw();
  }
  function onKey(e){
    if(!alive) return;
    if(e.key==='ArrowLeft'){ e.preventDefault(); hardMove(-1); }
    else if(e.key==='ArrowRight'){ e.preventDefault(); hardMove(1); }
    else if(e.key==='ArrowDown'){ e.preventDefault(); drop(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); doRotate(); }
  }
  document.addEventListener('keydown', onKey);
  canvas.addEventListener('click', ()=>{ if(!alive) reset(); });

  reset(); draw();
  timer = setInterval(drop, 500);
  return ()=>{ clearInterval(timer); document.removeEventListener('keydown', onKey); };
}

/* =========================================================
   THE VOID — a black rectangle. It does nothing.
   ========================================================= */
function initVoid(holder, setScore, helpEl){
  helpEl.textContent = 'There is nothing to do here. That\'s the whole thing.';
  setScore(0);
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 300;
  holder.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  return ()=>{};
}

/* =========================================================
   IDLE DOT — a dot sits there. Nothing happens.
   ========================================================= */
function initIdleDot(holder, setScore, helpEl){
  helpEl.textContent = 'A dot. It is not going anywhere. Neither are you.';
  setScore(0);
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 300;
  holder.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#08070f';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, 6, 0, Math.PI*2);
  ctx.fillStyle = '#4ce0d2';
  ctx.fill();
  return ()=>{};
}

/* =========================================================
   STATIC — gentle screen noise. Purely visual, no gameplay.
   ========================================================= */
function initStatic(holder, setScore, helpEl){
  helpEl.textContent = 'Just noise. Nothing to win, nothing to lose.';
  setScore(0);
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 300;
  holder.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let raf;
  function draw(){
    const img = ctx.createImageData(canvas.width, canvas.height);
    for(let i=0; i<img.data.length; i+=4){
      const v = Math.random()*40;
      img.data[i] = v + 10; img.data[i+1] = v + 8; img.data[i+2] = v + 20; img.data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    raf = requestAnimationFrame(draw);
  }
  draw();
  return ()=>{ cancelAnimationFrame(raf); };
}

/* =========================================================
   EMBED SLOTS — the url comes straight from the GAMES array
   above (edit the `url` field in the code). No in-site form.
   ========================================================= */
function initEmbedSlot(holder, setScore, helpEl, id){
  setScore(0);
  const g = GAMES.find(item => item.id === id);
  const url = g && g.url;

  if(!url){
    helpEl.textContent = 'No url set for this slot yet.';
    const msg = document.createElement('div');
    msg.style.color = 'var(--ink-dim)';
    msg.style.fontFamily = 'var(--body)';
    msg.style.fontSize = '15px';
    msg.style.textAlign = 'center';
    msg.style.maxWidth = '380px';
    msg.style.lineHeight = '1.6';
    msg.textContent = `This slot is empty. Set the "url" field for id "${id}" in the GAMES array in the code to fill it in.`;
    holder.appendChild(msg);
    return ()=>{};
  }

  helpEl.textContent = 'Embedded from: ' + url;
  const frameHolder = document.createElement('div');
  frameHolder.style.width = '100%';
  frameHolder.style.maxWidth = '900px';
  frameHolder.style.height = '520px';
  frameHolder.style.background = '#000';
  frameHolder.style.borderRadius = '8px';
  frameHolder.style.overflow = 'hidden';
  holder.appendChild(frameHolder);

  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = 'none';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups');
  iframe.setAttribute('allowfullscreen', 'true');
  frameHolder.appendChild(iframe);

  return ()=>{};
}
