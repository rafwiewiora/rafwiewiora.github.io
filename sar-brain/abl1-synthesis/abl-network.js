(() => {
  const el = id => document.getElementById(id);
  const data = JSON.parse(el('network-data').textContent);
  const groups = new Map(data.groups.map(g => [g.id, g]));
  const compounds = Object.values(data.compounds);
  const colors = {'Stage 174.1':'#7c3aed','Stage 169.2':'#2563eb','Stage 185.2':'#0891b2','Stage 189.1':'#ca8a04',Benzamides:'#b45309',Nicotinamides:'#4f65a5'};
  const families = [...new Set(compounds.map(c => c.family))].sort();
  const lanes = data.groups.map(g => g.family).filter((f,i,a) => a.indexOf(f) === i);
  for (const name of families) el('family').add(new Option(name,name));
  const x = new Map();
  for (const depth of new Set(compounds.map(c => c.depth))) {
    const cohort = compounds.filter(c => c.depth === depth);
    cohort.forEach((c,i) => x.set(c.id, depth + (cohort.length > 1 ? .60*(i/(cohort.length-1)-.5) : 0)));
  }
  const ys = compounds.map(c => c.pIC50);
  const ymin = Math.min(...ys)-.22, ymax = Math.max(...ys)+.22;
  const yGroup = g => lanes.length-1-lanes.indexOf(g.family);
  const paperGroup = g => .30*(yGroup(g)+.5)/lanes.length;
  const paperCompound = c => .41+.59*(c.pIC50-ymin)/(ymax-ymin);
  const plot = el('plot');
  let selection = null, visibleGroups = [];
  function inspect(id) {
    const box = el('selected');
    box.replaceChildren();
    const group = groups.get(id), c = data.compounds[id];
    if ((!c && !group) || (group && !el('details').checked)) {
      box.classList.add('hide');
      return;
    }
    const close = document.createElement('button');
    close.textContent = 'Clear selection';
    close.onclick = () => select(null);
    const title = document.createElement('h3');
    title.textContent = group ? group.family+' · depth '+group.depth : c.name+' · '+c.nM+' nM';
    box.append(close,title);
    for (const n of group ? group.nodes : [c.node]) {
      const img = document.createElement('img');
      img.src = 'structures/'+n+'.svg';
      img.alt = group ? data.names[n] : c.name;
      if (group) {
        const caption = document.createElement('strong');
        caption.textContent = data.names[n];
        box.append(caption);
      }
      box.append(img);
    }
    box.scrollTop = 0;
    box.classList.remove('hide');
  }
  function select(id) {
    selection = id;
    draw();
    inspect(id);
  }
  function buttons() {
    const layer = el('platform-buttons'), axes = plot._fullLayout;
    if (!axes) return;
    layer.replaceChildren();
    for (const g of visibleGroups) {
      const b = document.createElement('button');
      b.className = 'platform-button';
      b.textContent = g.nodes.length;
      b.dataset.platform = g.id;
      b.setAttribute('aria-label',g.family+', depth '+g.depth+', '+g.nodes.length+' intermediates');
      b.setAttribute('aria-pressed',String(selection === g.id));
      b.style.left = axes.xaxis._offset+axes.xaxis.l2p(g.depth)+'px';
      b.style.top = axes.yaxis2._offset+axes.yaxis2.l2p(yGroup(g))+'px';
      b.style.setProperty('--platform-color',colors[g.family]);
      b.onclick = () => select(selection === g.id ? null : g.id);
      layer.append(b);
    }
  }
  function draw() {
    const filter = el('family').value;
    const cs = compounds.filter(c => filter === 'All families' || c.family === filter);
    const ids = new Set(cs.map(c => c.id));
    visibleGroups = data.groups.filter(g => g.descendants.some(id => ids.has(id)));
    const shapes = [{type:'rect',xref:'paper',yref:'paper',x0:0,x1:1,y0:0,y1:.30,line:{width:0},fillcolor:'#f8fafc',layer:'below'}];
    const linked = groups.get(selection);
    function edge(x0,y0,x1,y1) {
      shapes.push({type:'line',xref:'x',yref:'paper',x0,y0,x1,y1,layer:'below',line:{color:'#8054cd',width:2,dash:'dot'}});
    }
    for (const g of visibleGroups) {
      for (const cid of g.descendants) {
        if (ids.has(cid) && (g.id === selection || cid === selection)) edge(g.depth,paperGroup(g),x.get(cid),paperCompound(data.compounds[cid]));
      }
    }
    for (const [a,b] of data.edges) {
      if ((a===selection || b===selection) && visibleGroups.includes(groups.get(a)) && visibleGroups.includes(groups.get(b))) {
        edge(groups.get(a).depth,paperGroup(groups.get(a)),groups.get(b).depth,paperGroup(groups.get(b)));
      }
    }
    const traces = [{type:'scatter',mode:'markers',customdata:cs.map(c=>c.id),x:cs.map(c=>x.get(c.id)),y:cs.map(c=>c.pIC50),text:cs.map(c=>c.name+' · '+c.nM+' nM'),hovertemplate:'%{text}<extra></extra>',marker:{size:10,line:{width:.7,color:'#475569'},color:cs.map(c=>el('color').selectedIndex?colors[c.family]:c.pIC50>=8?'#16a34a':c.pIC50>=7?'#f59e0b':'#dc2626'),opacity:cs.map(c=>!selection||c.id===selection||linked?.descendants.includes(c.id)?1:.14)}},
      {type:'scatter',mode:'markers',x:visibleGroups.map(g=>g.depth),y:visibleGroups.map(yGroup),yaxis:'y2',marker:{opacity:0},hoverinfo:'skip'}];
    const layout = {margin:{t:22,b:58,l:125,r:28},font:{family:'system-ui',color:'#475569'},shapes,showlegend:false,xaxis:{anchor:'y2',title:'Synthetic dependency depth (operations)',range:[Math.min(...data.groups.map(g=>g.depth))-.5, Math.max(...compounds.map(c=>c.depth))+.5],dtick:1},yaxis:{title:'ABL1 affinity (pIC50)',domain:[.41,1],range:[ymin,ymax]},yaxis2:{domain:[0,.30],range:[-.5,lanes.length-.5],tickvals:lanes.map((_,i)=>lanes.length-1-i),ticktext:lanes,zeroline:false}};
    return Plotly.react(plot,traces,layout,{responsive:true,displaylogo:false}).then(buttons);
  }
  el('family').onchange = () => select(null);
  el('color').onchange = draw;
  el('details').onchange = () => inspect(selection);
  let picked = false;
  draw().then(() => {
    plot.on('plotly_afterplot',buttons);
    plot.on('plotly_click',evt => {
      const id = evt.points[0]?.customdata;
      if (id) { picked=true;setTimeout(()=>{picked=false},0);select(id); }
    });
    plot.addEventListener('click',evt => {
      if (!evt.target.closest('.modebar') && !picked && selection) select(null);
    });
  });
  document.addEventListener('keydown',evt => {if (evt.key==='Escape') select(null)});
})();
