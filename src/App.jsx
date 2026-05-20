import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SUPER_ADMIN_PASSWORD = "W@Huimai2";
const STORAGE_ORGS = "cg360_orgs";
const STORAGE_RESPOSTAS = "cg360_respostas";
const STORAGE_FORMS = "cg360_forms";

const DEFAULT_SCALE_LABELS = {
  1:"Nunca", 2:"Raramente", 3:"Às vezes", 4:"Frequentemente", 5:"Exemplarmente", 0:"Não sei avaliar"
};
const SC = {0:"#94a3b8",1:"#ef4444",2:"#f97316",3:"#eab308",4:"#22c55e",5:"#10b981"};
// SCALE is built dynamically from org settings — see getScale() in App
const CICLOS = ["2025 - 1º Semestre","2025 - 2º Semestre","2026 - 1º Semestre","2026 - 2º Semestre","2027 - 1º Semestre","2027 - 2º Semestre"];
const LGPD = "Suas respostas são completamente anônimas. Nenhum dado pessoal identificável é coletado. Os dados são utilizados exclusivamente para fins de desenvolvimento organizacional interno, conforme a LGPD (Lei nº 13.709/2018). Você pode interromper o preenchimento a qualquer momento.";

const DEFAULT_FORMS = [
  { id:"autoavaliacao", title:"Autoavaliação", icon:"🪞", subtitle:"Um espaço honesto e seguro para olhar para si mesmo",
    blocos:[
      { id:"espirit", title:"Vida espiritual e coerência", icon:"✝️",
        perguntas:["Tenho cultivado uma vida espiritual consistente.","Tenho agido de forma coerente com o que ensino e represento no ministério.","Tenho reagido a críticas e correções com humildade.","Tenho buscado depender de Deus nas decisões e pressões ministeriais.","Minha prática ministerial tem refletido os objetivos que defini no meu planejamento anual.","Tenho conseguido manter minha identidade mais em Cristo do que nos resultados ministeriais."],
        abertas:["Em quais áreas você percebe maior crescimento espiritual no último período?","Em quais áreas sente maior fragilidade atualmente?"]},
      { id:"saude_em", title:"Saúde emocional", icon:"💙",
        perguntas:["Tenho conseguido lidar de forma saudável com pressões e frustrações.","Tenho conseguido descansar adequadamente.","Tenho percebido equilíbrio entre ministério, vida pessoal e família.","Tenho conseguido pedir ajuda quando necessário.","Tenho chegado às minhas atividades ministeriais com disposição e motivação.","Tenho percebido sinais de desgaste emocional em mim.","Tenho conseguido estabelecer limites saudáveis."],
        abertas:["Quais são hoje suas maiores fontes de desgaste?","O que mais tem fortalecido você emocionalmente?","Existe alguma área em que você sente necessidade de maior cuidado ou apoio?"]},
      { id:"relac", title:"Relacionamentos e equipe", icon:"🤝",
        perguntas:["Tenho contribuído para um ambiente saudável.","Tenho escutado opiniões diferentes sem defensividade.","Tenho lidado bem com conflitos.","Tenho sido acessível e respeitoso nas relações.","Tenho colaborado de forma saudável com a equipe."],
        abertas:["O que você acredita que mais fortalece suas relações?","Onde você acredita que precisa amadurecer relacionalmente?"]},
      { id:"comun", title:"Comunicação", icon:"💬",
        perguntas:["Tenho me comunicado com clareza.","Tenho mantido alinhamentos importantes.","Tenho dado feedbacks respeitosos e honestos.","Tenho escutado atentamente as pessoas.","Tenho comunicado expectativas de maneira saudável."],
        abertas:["Em quais situações sua comunicação funciona melhor?","O que você deseja desenvolver na sua comunicação?"]},
      { id:"alinha", title:"Alinhamento e cultura", icon:"⛵",
        perguntas:["Tenho representado bem os valores da organização.","Tenho contribuído para a unidade da organização.","Tenho atuado de forma alinhada ao espírito de serviço.","Tenho fortalecido a cultura de cuidado e cooperação.","Tenho mantido alinhamento com a liderança e diretrizes."],
        abertas:["O que mais conecta você ao propósito da organização?","O que hoje dificulta seu alinhamento ou engajamento?"]},
      { id:"impact", title:"Impacto e resultados", icon:"🌱",
        perguntas:["Tenho servido pessoas com intencionalidade.","Tenho produzido impacto positivo nas pessoas ao meu redor.","Tenho desenvolvido ou multiplicado outras pessoas.","Tenho atuado com responsabilidade e fidelidade.","Tenho buscado crescimento contínuo."],
        abertas:["Onde você percebe maior fruto atualmente?","Onde gostaria de crescer no próximo ciclo?"]},
    ]},
  { id:"pares", title:"Avaliação de Pares", icon:"👥", subtitle:"Compartilhe com cuidado e honestidade",
    blocos:[
      { id:"conviv", title:"Relacionamentos e convivência", icon:"🤝",
        perguntas:["Essa pessoa contribui para um ambiente saudável.","Trata as pessoas com respeito.","Trabalha bem em equipe.","Demonstra humildade nos relacionamentos.","Resolve conflitos com maturidade.","Escuta opiniões diferentes.","Demonstra disponibilidade para cooperar."],
        abertas:["O que mais fortalece a convivência com essa pessoa?","O que poderia melhorar na convivência?"]},
      { id:"comun_p", title:"Comunicação", icon:"💬",
        perguntas:["Comunica-se de forma clara.","Compartilha informações importantes adequadamente.","Escuta com atenção.","Demonstra abertura ao diálogo.","Quando precisa corrigir ou orientar, faz isso de forma respeitosa e construtiva."],
        abertas:["Como você descreveria a comunicação dessa pessoa?"]},
      { id:"matur", title:"Maturidade emocional", icon:"💙",
        perguntas:["Demonstra equilíbrio emocional diante das pressões.","Reage de forma madura a frustrações.","Demonstra segurança sem arrogância.","Assume erros quando necessário.","Recebe correções sem defensividade excessiva."],
        abertas:["Existem sinais de desgaste emocional que merecem atenção?"]},
      { id:"cultur_p", title:"Cultura e missão", icon:"⛵",
        perguntas:["Representa bem os valores da organização.","Fortalece a unidade.","Demonstra compromisso com a missão.","Atua de forma coerente com a cultura."],
        abertas:["Onde essa pessoa mais fortalece a missão?","Existe algo que pode limitar seu desenvolvimento futuro?"]},
    ]},
  { id:"lideranca", title:"Avaliação pela Liderança", icon:"🧭", subtitle:"Avaliação de quem acompanha de perto",
    blocos:[
      { id:"resp", title:"Responsabilidade e confiabilidade", icon:"🛡️",
        perguntas:["Demonstra responsabilidade.","Cumpre compromissos e alinhamentos.","Demonstra maturidade nas decisões.","Atua com integridade.","Demonstra confiabilidade."],abertas:[]},
      { id:"aprend", title:"Desenvolvimento e aprendizado", icon:"🌱",
        perguntas:["Demonstra disposição para aprender.","Recebe feedbacks com maturidade.","Demonstra crescimento contínuo.","Busca desenvolvimento pessoal.","Demonstra adaptabilidade."],abertas:[]},
      { id:"sustent", title:"Saúde e sustentabilidade", icon:"💙",
        perguntas:["Demonstra equilíbrio saudável.","Administra adequadamente as pressões.","Mantém limites saudáveis.","Demonstra sinais de continuidade sustentável.","Sabe pedir ajuda quando necessário."],
        abertas:["Quais são hoje os principais potenciais dessa pessoa?","Quais áreas merecem desenvolvimento prioritário?","Existem sinais preventivos de desgaste ou risco?"]},
    ]},
  { id:"liderados", title:"Avaliação pelos Liderados", icon:"🌿", subtitle:"Sua perspectiva importa e será tratada com cuidado",
    blocos:[
      { id:"estilo", title:"Estilo de liderança", icon:"🧭",
        perguntas:["Essa liderança cria ambiente seguro para diálogo.","Demonstra espírito de serviço.","Escuta as pessoas com atenção.","Trata as pessoas com respeito.","Demonstra humildade.","Dá direção clara.","Desenvolve pessoas.","Demonstra equilíbrio nas decisões.","Assume responsabilidade pelos erros.","Demonstra coerência entre discurso e prática."],
        abertas:["Como é ser liderado por essa pessoa?","O que mais fortalece sua liderança?","O que poderia amadurecer?"]},
      { id:"saude_r", title:"Saúde relacional", icon:"💙",
        perguntas:["Essa liderança gera confiança.","Promove unidade.","Lida bem com conflitos.","Evita manipulação ou controle excessivo.","Demonstra abertura para ouvir críticas.","Demonstra cuidado genuíno pelas pessoas."],
        abertas:["Existe algo relacional que merece atenção?","Você se sente emocionalmente seguro com essa liderança?"]},
    ]},
  { id:"pastoral", title:"Acompanhamento Pastoral", icon:"🕊️", subtitle:"Avaliação de cuidado e atenção integral",
    blocos:[
      { id:"saude_i", title:"Saúde integral", icon:"💙",
        perguntas:["Essa pessoa demonstra sinais saudáveis de sustentabilidade.","Demonstra equilíbrio emocional.","Demonstra abertura e vulnerabilidade saudável.","Demonstra sinais saudáveis nas relações familiares.","Demonstra sinais de descanso adequado.","Demonstra maturidade para lidar com frustrações."],abertas:[]},
      { id:"riscos", title:"Riscos e sinais preventivos", icon:"⚠️",
        perguntas:["Percebo sinais de sobrecarga.","Percebo sinais de isolamento.","Percebo sinais de desgaste emocional.","Percebo perda de motivação.","Percebo tensões relacionais recorrentes.","Essa pessoa se beneficiaria de um acompanhamento mais próximo neste momento."],
        abertas:["Quais sinais merecem atenção?","Que tipo de apoio poderia fortalecer essa pessoa?","Existe algum risco preventivo que deveria ser acompanhado?"]},
    ]},
];

// ─── STORAGE ─────────────────────────────────────────────────────────
const mem = {};
async function sGet(k){
  try{
    let r;
    try{ if(window.storage){ r=await window.storage.get(k); return r?JSON.parse(r.value):null; }}catch{}
    try{ const v=localStorage.getItem(k); return v?JSON.parse(v):null; }catch{}
    return mem[k]||null;
  }catch{return null;}
}
async function sSet(k,v){
  const s=JSON.stringify(v);
  try{if(window.storage){await window.storage.set(k,s);return;}}catch{}
  try{localStorage.setItem(k,s);return;}catch{}
  mem[k]=v;
}
async function loadOrgs(){return(await sGet(STORAGE_ORGS))||{};}
async function saveOrgs(o){await sSet(STORAGE_ORGS,o);}
async function loadResps(id){const a=(await sGet(STORAGE_RESPOSTAS))||{};return a[id]||[];}
async function saveResp(id,e){const a=(await sGet(STORAGE_RESPOSTAS))||{};if(!a[id])a[id]=[];a[id].push(e);await sSet(STORAGE_RESPOSTAS,a);}
async function loadForms(id){const a=(await sGet(STORAGE_FORMS))||{};return a[id]||JSON.parse(JSON.stringify(DEFAULT_FORMS));}
async function saveForms2(id,f){const a=(await sGet(STORAGE_FORMS))||{};a[id]=f;await sSet(STORAGE_FORMS,a);}
const STORAGE_LINKS="cg360_customlinks";
async function loadCustomLinks2(id){const a=(await sGet(STORAGE_LINKS))||{};return a[id]||[];}
async function saveCustomLinks2(id,links){const a=(await sGet(STORAGE_LINKS))||{};a[id]=links;await sSet(STORAGE_LINKS,a);}

// ─── UTILS ───────────────────────────────────────────────────────────
function bAvg(b,r){const v=b.perguntas.map((_,i)=>r[`${b.id}_${i}`]||0).filter(x=>x>0);return v.length?v.reduce((a,x)=>a+x,0)/v.length:0;}
function sColor(s){return s>=4?"#10b981":s>=3?"#3b82f6":s>=2?"#f59e0b":"#ef4444";}
function clone(o){return JSON.parse(JSON.stringify(o));}
function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");}
function genId(n=8){return Math.random().toString(36).slice(2,2+n);}
function san(s){return String(s).replace(/<[^>]*>/g,"").trim().slice(0,500);}
function copyText(t){
  try{if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t);return;}}catch{}
  const el=document.createElement("textarea");el.value=t;el.style.cssText="position:fixed;top:-9999px;opacity:0;";
  document.body.appendChild(el);el.focus();el.select();
  try{document.execCommand("copy");}catch{}
  document.body.removeChild(el);
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────
function PoweredBy(){
  return <div style={{textAlign:"center",padding:"14px 0 8px",fontSize:11,color:"#94a3b8"}}>Powered by <strong style={{color:"#64748b"}}>Conectando Gente</strong></div>;
}

function OrgLogo({org,size=72}){
  if(org?.logoUrl) return <img src={org.logoUrl} alt={org?.name||""} style={{width:size,height:size,objectFit:"contain",borderRadius:8}}/>;
  const c=org?.primaryColor||"#2563eb";
  return <div style={{width:size,height:size,borderRadius:14,background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:900,color:"#fff"}}>{(org?.name||"?").slice(0,2).toUpperCase()}</div>;
}

function LogoUploader({value,onChange,color="#2563eb"}){
  const [drag,setDrag]=useState(false);
  function handle(file){
    if(!file||!file.type.startsWith("image/"))return;
    if(file.size>2097152){alert("Imagem muito grande. Use até 2MB.");return;}
    const r=new FileReader();r.onload=e=>onChange(e.target.result);r.readAsDataURL(file);
  }
  const uid="lu-"+Math.random().toString(36).slice(2,8);
  return(
    <div>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0]);}}
        onClick={()=>document.getElementById(uid).click()}
        style={{border:`2px dashed ${drag?color:"#dbeafe"}`,borderRadius:12,padding:16,textAlign:"center",cursor:"pointer",background:drag?"#eff6ff":"#f8faff",transition:"all 0.2s",minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
        {value?<img src={value} alt="logo" style={{maxHeight:56,maxWidth:160,objectFit:"contain"}}/>:<div style={{fontSize:28}}>🖼️</div>}
        <p style={{fontSize:12,color:"#64748b",margin:0}}>{value?"Clique ou arraste para trocar":"Clique ou arraste o logo aqui"}</p>
        <p style={{fontSize:10,color:"#94a3b8",margin:0}}>PNG, JPG ou SVG · máx 2MB</p>
      </div>
      <input id={uid} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files[0])}/>
      {value&&<button onClick={e=>{e.stopPropagation();onChange("");}} style={{marginTop:6,padding:"3px 10px",borderRadius:6,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:11}}>Remover logo</button>}
    </div>
  );
}

function LinkCard({label,link,color="#2563eb"}){
  const [copied,setCopied]=useState(false);
  const [showTip,setShowTip]=useState(false);

  function handleCopy(){
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(link)
        .then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);})
        .catch(()=>selectFallback());
      return;
    }
    selectFallback();
  }

  function selectFallback(){
    const id="lc-inp-"+label.replace(/\s/g,"");
    const el=document.getElementById(id);
    if(el){el.select();el.setSelectionRange(0,99999);}
    try{
      const ok=document.execCommand("copy");
      if(ok){setCopied(true);setTimeout(()=>setCopied(false),2500);return;}
    }catch{}
    setShowTip(true);setTimeout(()=>setShowTip(false),5000);
  }

  const short=link.split("#/fill/")[1]||link;
  const inputId="lc-inp-"+label.replace(/\s/g,"");
  return(
    <div style={{background:"#f8faff",borderRadius:14,padding:"12px 16px",border:"1px solid #dbeafe",marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
      <div style={{fontSize:11,color:color,fontWeight:600,marginBottom:8,background:"#eff6ff",borderRadius:6,padding:"3px 10px",display:"inline-block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🔗 {short}</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input id={inputId} readOnly value={link}
          onClick={e=>e.target.select()}
          style={{flex:1,fontSize:10,color:"#334155",fontFamily:"monospace",background:"#fff",borderRadius:8,padding:"8px 10px",border:"1px solid #e2e8f0",outline:"none",cursor:"text",minWidth:0}}/>
        <button onClick={handleCopy}
          style={{padding:"8px 14px",borderRadius:8,border:"none",background:copied?"#16a34a":color,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",minWidth:95,transition:"background 0.2s",flexShrink:0}}>
          {copied?"✓ Copiado":"📋 Copiar"}
        </button>
      </div>
      {showTip&&(
        <div style={{marginTop:8,padding:"8px 12px",background:"#fefce8",borderRadius:8,border:"1px solid #fde68a",fontSize:12,color:"#92400e"}}>
          👆 Clique no campo acima para selecionar e pressione <strong>Ctrl+C</strong> (ou Cmd+C no Mac).
        </div>
      )}
    </div>
  );
}

function ScBar({label,score}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:13,color:"#475569"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color:score>0?sColor(score):"#94a3b8"}}>{score>0?score.toFixed(1)+"/5":"—"}</span>
      </div>
      <div style={{background:"#e2e8f0",borderRadius:6,height:8}}><div style={{width:`${(score/5)*100}%`,background:sColor(score),height:8,borderRadius:6,transition:"width 0.6s"}}/></div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("loading");
  const [orgs,setOrgs]=useState({});
  const [org,setOrg]=useState(null);
  const [forms,setForms]=useState([]);
  const [resps,setResps]=useState([]);
  const [superP,setSuperP]=useState("");const [superE,setSuperE]=useState(false);
  const [orgP,setOrgP]=useState("");const [orgE,setOrgE]=useState(false);
  const [ffi,setFfi]=useState(0);const [fbi,setFbi]=useState(0);
  const [answers,setAnswers]=useState({});const [openAns,setOpenAns]=useState({});
  const [ciclo,setCiclo]=useState(CICLOS[0]);const [lgpd,setLgpd]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dfi,setDfi]=useState(0);const [dci,setDci]=useState(CICLOS[0]);const [repCopied,setRepCopied]=useState(false);
  const [efi,setEfi]=useState(0);const [ebi,setEbi]=useState(0);
  const [nOrg,setNOrg]=useState({name:"",adminPassword:"",primaryColor:"#2563eb",logoUrl:""});const [nOrgE,setNOrgE]=useState("");
  const [cfg,setCfg]=useState(null);
  const [customLinks,setCustomLinks]=useState([]);  // [{formId, label, id}]
  const [scaleLabels,setScaleLabels]=useState(DEFAULT_SCALE_LABELS);

  useEffect(()=>{
    async function init(){
      const ao=await loadOrgs();setOrgs(ao);
      const h=window.location.hash||"";
      const pts=h.replace(/^#\//,"").split("/");
      if(pts[0]==="fill"&&pts[1]&&pts[2]&&pts[3]){
        const o=ao[pts[1]];
        if(o){
          setOrg(o);const f=await loadForms(pts[1]);setForms(f);
          setScaleLabels(o.scaleLabels||DEFAULT_SCALE_LABELS);
          const cDecoded=decodeURIComponent(pts[2]).replace(/-/g," ");
          setCiclo(cDecoded);
          const idx=f.findIndex(x=>x.id===pts[3]);
          if(idx>=0){setFfi(idx);setScreen("lgpd");}else setScreen("404");}
        else setScreen("404");
      }else if(pts[0]==="report"&&pts[1]){
        try{const d=JSON.parse(decodeURIComponent(atob(pts[1])));window._rd=d;setOrg({name:d.orgName,primaryColor:"#2563eb"});setScreen("pub_report");}
        catch{setScreen("404");}
      }else setScreen("home");
    }
    init();
  },[]);

  const fForm=forms[ffi];const fBloc=fForm?.blocos[fbi];const isLast=fForm&&fbi===fForm.blocos.length-1;
  const dForm=forms[dfi];
  const dData=resps.filter(r=>r.ciclo===dci&&r.formId===dForm?.id);
  const bStats=dForm&&dData.length>0?dForm.blocos.map(b=>{const sc=dData.map(r=>bAvg(b,r.answers)).filter(v=>v>0);return{name:b.title.slice(0,16),fullName:b.title,media:sc.length?parseFloat((sc.reduce((a,x)=>a+x,0)/sc.length).toFixed(2)):0};}):[];
  const mgeral=bStats.length?(bStats.reduce((a,b)=>a+b.media,0)/bStats.length).toFixed(1):"—";
  const abList=[];dData.forEach(r=>Object.values(r.openAns||{}).forEach(v=>{if(v?.trim())abList.push(v.trim());}));
  const dist=[1,2,3,4,5].map(v=>{let c=0;dData.forEach(r=>Object.values(r.answers||{}).forEach(x=>{if(x===v)c++;}));return{name:(scaleLabels[v]||DEFAULT_SCALE_LABELS[v]).slice(0,11),count:c};});
  const pc=org?.primaryColor||"#2563eb";

  function getBaseUrl(){
    // Use configured baseUrl if set, otherwise current origin only (not full href with Claude params)
    if(org?.baseUrl) return org.baseUrl.replace(/\/$/,"");
    try{ return window.location.origin; }catch{ return ""; }
  }

  function getLinks(){
    const base=getBaseUrl();
    const cs=encodeURIComponent((org?.activeCiclo||CICLOS[0]).replace(/ /g,"-"));
    // Build from customLinks first, fill gaps with default one per form
    const result=[];
    forms.forEach(f=>{
      const custom=customLinks.filter(l=>l.formId===f.id);
      if(custom.length>0){
        custom.forEach(l=>result.push({title:l.label,icon:f.icon,formId:f.id,id:l.id,link:`${base}#/fill/${org?.id}/${cs}/${f.id}`,customLabel:l.label}));
      } else {
        result.push({title:f.title,icon:f.icon,formId:f.id,id:f.id,link:`${base}#/fill/${org?.id}/${cs}/${f.id}`});
      }
    });
    return result;
  }

  async function saveLinks(updated){
    setCustomLinks(updated);
    await saveCustomLinks2(org.id,updated);
  }

  function exportCSV(){
    if(!dData.length)return;
    const rows=[["Ciclo","Formulário","Data","Área","Média"]];
    dData.forEach(r=>r.scores?.forEach(s=>rows.push([r.ciclo,r.formTitle,new Date(r.ts).toLocaleDateString("pt-BR"),s.label,s.score.toFixed(2)])));
    const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}));
    a.download=`avaliacao-${org?.name||"org"}-${dci.replace(/ /g,"-")}.csv`;a.click();
  }

  function exportHTML(){
    if(!dData.length)return;
    const rowsH=bStats.map(b=>`<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0">${b.fullName}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${sColor(b.media)}">${b.media.toFixed(1)}/5</td><td style="padding:10px;border-bottom:1px solid #e2e8f0"><div style="background:#e2e8f0;border-radius:4px;height:10px;width:180px"><div style="width:${(b.media/5)*100}%;background:${sColor(b.media)};height:10px;border-radius:4px"></div></div></td></tr>`).join("");
    const absH=abList.map(t=>`<li style="margin-bottom:8px;color:#334155;line-height:1.6">${t}</li>`).join("");
    const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório 360°</title><style>body{font-family:system-ui,sans-serif;max-width:820px;margin:40px auto;padding:0 24px;color:#1e293b}h1{color:#1e3a8a}table{width:100%;border-collapse:collapse}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}</style></head><body><h1>📊 Relatório de Avaliação 360°</h1><p><strong>${org?.name}</strong> · ${dci} · ${dForm?.title}</p><p style="background:#f0fdf4;border-radius:8px;padding:10px 16px;font-size:12px;color:#166534">🔒 Dados 100% anônimos · LGPD conforme · ${dData.length} respondentes</p><h2 style="margin-top:32px">Pontuação por área</h2><table><tbody>${rowsH}</tbody></table><p style="margin-top:16px;font-size:14px">Média geral: <strong style="font-size:22px;color:#1e3a8a">${mgeral}/5</strong></p>${abList.length>0?`<h2 style="margin-top:32px">Reflexões abertas</h2><ul style="padding-left:20px">${absH}</ul>`:""}<div class="footer">Powered by Conectando Gente · Gerado em ${new Date().toLocaleDateString("pt-BR")}</div></body></html>`;
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8;"}));
    a.download=`relatorio-${org?.name||"org"}-${dci.replace(/ /g,"-")}.html`;a.click();
  }

  function shareReport(){
    const data={orgName:org?.name,ciclo:dci,formTitle:dForm?.title,total:dData.length,bStats,mgeral,abList,at:new Date().toISOString()};
    const enc=btoa(encodeURIComponent(JSON.stringify(data)));
    copyText(`${window.location.href.split("#")[0]}#/report/${enc}`);
    setRepCopied(true);setTimeout(()=>setRepCopied(false),3000);
  }

  async function loginSuper(){if(superP===SUPER_ADMIN_PASSWORD){setSuperE(false);setScreen("super");}else setSuperE(true);}
  async function loginOrg(o){
    if(orgP===o.adminPassword){
      setOrgE(false);setOrg(o);
      const f=await loadForms(o.id);const r=await loadResps(o.id);
      const cl=await loadCustomLinks2(o.id);
      const sl=o.scaleLabels||DEFAULT_SCALE_LABELS;
      setForms(f);setResps(r);setCfg(clone(o));setCustomLinks(cl);setScaleLabels(sl);setScreen("dash");
    }else setOrgE(true);
  }
  async function createOrg(){
    if(!nOrg.name.trim()){setNOrgE("Nome obrigatório");return;}
    if(!nOrg.adminPassword.trim()){setNOrgE("Senha obrigatória");return;}
    const id=slugify(nOrg.name)+"-"+genId(6);
    const o={id,name:san(nOrg.name),adminPassword:nOrg.adminPassword,primaryColor:nOrg.primaryColor,logoUrl:nOrg.logoUrl,createdAt:new Date().toISOString(),activeCiclo:CICLOS[0]};
    const u={...orgs,[id]:o};await saveOrgs(u);setOrgs(u);
    setNOrg({name:"",adminPassword:"",primaryColor:"#2563eb",logoUrl:""});setNOrgE("");
  }
  async function delOrg(id){if(!confirm("Remover esta organização?"))return;const u={...orgs};delete u[id];await saveOrgs(u);setOrgs(u);}
  async function saveCfg(){
    const updated={...cfg,scaleLabels:scaleLabels};
    const u={...orgs,[org.id]:updated};
    await saveOrgs(u);setOrgs(u);setOrg(updated);setCfg(updated);
    alert("Configurações salvas!");
  }
  async function saveFormsBtn(){await saveForms2(org.id,forms);alert("Formulários salvos!");}
  async function submitForm(){
    setSaving(true);
    await saveResp(org.id,{id:genId(16),ts:Date.now(),ciclo,formId:fForm.id,formTitle:fForm.title,scores:fForm.blocos.map(b=>({label:b.title,score:bAvg(b,answers)})),answers,openAns});
    setSaving(false);setScreen("result");
  }
  function updQ(fi,bi,qi,v){const f=clone(forms);f[fi].blocos[bi].perguntas[qi]=san(v);setForms(f);}
  function delQ(fi,bi,qi){const f=clone(forms);f[fi].blocos[bi].perguntas.splice(qi,1);setForms(f);}
  function addQ(fi,bi){const f=clone(forms);f[fi].blocos[bi].perguntas.push("Nova pergunta…");setForms(f);}
  function updAb(fi,bi,ai,v){const f=clone(forms);f[fi].blocos[bi].abertas[ai]=san(v);setForms(f);}
  function delAb(fi,bi,ai){const f=clone(forms);f[fi].blocos[bi].abertas.splice(ai,1);setForms(f);}
  function addAb(fi,bi){const f=clone(forms);f[fi].blocos[bi].abertas.push("Nova pergunta aberta…");setForms(f);}
  function updBT(fi,bi,v){const f=clone(forms);f[fi].blocos[bi].title=san(v);setForms(f);}

  const pg={minHeight:"100vh",background:"linear-gradient(135deg,#f0f4ff,#e8f0fe)",fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"};
  const card={background:"#fff",borderRadius:20,padding:24,boxShadow:"0 4px 24px #2563eb12",border:"1px solid #dbeafe"};
  const btn=(c=pc)=>({padding:"11px 22px",borderRadius:11,border:"none",background:c,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13});
  const btnO={padding:"11px 22px",borderRadius:11,border:"2px solid #dbeafe",background:"#fff",color:"#64748b",cursor:"pointer",fontWeight:600,fontSize:13};
  const inp={width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #dbeafe",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const hdr=(c=pc)=>({background:c,color:"#fff",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8});
  const hBtn={border:"none",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12};

  if(screen==="loading") return <div style={{...pg,alignItems:"center",justifyContent:"center"}}><div style={{fontSize:32}}>⏳</div></div>;

  if(screen==="404") return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{...card,maxWidth:360,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>🔍</div><h2 style={{color:"#1e3a8a"}}>Link não encontrado</h2><p style={{color:"#64748b",fontSize:13,marginTop:8}}>Este link não existe ou expirou.</p></div>
      <PoweredBy/>
    </div>
  );

  if(screen==="pub_report"){
    const d=window._rd||{};
    return(
      <div style={{...pg,padding:0}}>
        <div style={hdr("#1e3a8a")}><div><div style={{fontWeight:800,fontSize:15}}>📊 Relatório Público — {d.orgName}</div><div style={{fontSize:11,color:"#93c5fd"}}>Dados anônimos · LGPD conforme · {d.total} respondentes</div></div></div>
        <div style={{maxWidth:720,margin:"0 auto",padding:"24px 16px 40px",width:"100%"}}>
          <div style={{...card,marginBottom:16}}><p style={{fontSize:13,color:"#64748b",marginBottom:8}}><strong>{d.orgName}</strong> · {d.ciclo} · {d.formTitle}</p><div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#166534"}}>🔒 Este relatório não contém dados pessoais identificáveis · LGPD conforme</div></div>
          <div style={{...card,marginBottom:16}}>
            <h3 style={{color:"#1e3a8a",marginBottom:16,fontSize:15}}>Pontuação por área</h3>
            {(d.bStats||[]).map((b,i)=><ScBar key={i} label={b.fullName||b.name} score={b.media}/>)}
            <p style={{fontSize:14,color:"#64748b",marginTop:16}}>Média geral: <strong style={{fontSize:22,color:"#1e3a8a"}}>{d.mgeral}/5</strong></p>
          </div>
          {d.abList?.length>0&&<div style={{...card}}><h3 style={{color:"#1e3a8a",marginBottom:12,fontSize:15}}>💬 Reflexões ({d.abList.length})</h3>{d.abList.map((t,i)=><div key={i} style={{background:"#f8faff",borderRadius:10,padding:"10px 14px",borderLeft:"3px solid #3b82f6",fontSize:13,color:"#334155",marginBottom:8,lineHeight:1.6}}>"{t}"</div>)}</div>}
        </div>
        <PoweredBy/>
      </div>
    );
  }

  if(screen==="home") return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{marginBottom:28}}><div style={{fontSize:52,marginBottom:6}}>🔗</div><h1 style={{fontSize:26,fontWeight:900,color:"#1e3a8a",margin:"0 0 8px"}}>Avaliação 360°</h1><p style={{color:"#64748b",fontSize:14,lineHeight:1.7}}>Para responder, use o link específico que sua organização compartilhou com você.</p></div>
        <div style={{...card,marginBottom:16}}>
          <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Administradores acessem abaixo:</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>setScreen("org_list")} style={{...btn("#2563eb"),width:"100%"}}>🏢 Acesso Organizacional</button>
            <button onClick={()=>setScreen("super_login")} style={{...btnO,width:"100%",fontSize:12}}>🔒 Super Admin — Conectando Gente</button>
          </div>
        </div>
        <PoweredBy/>
      </div>
    </div>
  );

  if(screen==="super_login") return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{...card,maxWidth:360,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🔒</div><h2 style={{color:"#1e3a8a",marginBottom:4}}>Super Admin</h2><p style={{color:"#64748b",fontSize:12,marginBottom:24}}>Conectando Gente</p>
        <input type="password" placeholder="Senha master" value={superP} onChange={e=>setSuperP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loginSuper()} style={{...inp,border:`2px solid ${superE?"#ef4444":"#dbeafe"}`,marginBottom:6}}/>
        {superE&&<p style={{color:"#ef4444",fontSize:12,marginBottom:8}}>Senha incorreta</p>}
        <div style={{display:"flex",gap:10,marginTop:12}}><button onClick={()=>setScreen("home")} style={{...btnO,flex:1}}>Voltar</button><button onClick={loginSuper} style={{...btn("#1e3a8a"),flex:2}}>Entrar</button></div>
      </div>
      <PoweredBy/>
    </div>
  );

  if(screen==="super") return(
    <div style={{...pg,padding:0}}>
      <div style={hdr("#1e3a8a")}><div><div style={{fontWeight:800,fontSize:16}}>🔒 Super Admin — Conectando Gente</div><div style={{fontSize:11,color:"#93c5fd"}}>{Object.keys(orgs).length} organização(ões)</div></div><button onClick={()=>setScreen("home")} style={{...hBtn,background:"#3b82f6"}}>Sair</button></div>
      <div style={{maxWidth:860,margin:"0 auto",padding:"24px 16px 40px",width:"100%"}}>
        <div style={{...card,marginBottom:24}}>
          <h3 style={{color:"#1e3a8a",marginBottom:20,fontSize:15}}>➕ Nova Organização</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOME *</label><input value={nOrg.name} onChange={e=>setNOrg(p=>({...p,name:e.target.value}))} style={inp} placeholder="Ex: Sepal"/></div>
            <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>SENHA DO ADMIN *</label><input type="password" value={nOrg.adminPassword} onChange={e=>setNOrg(p=>({...p,adminPassword:e.target.value}))} style={inp} placeholder="Senha"/></div>
            <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>COR PRINCIPAL</label><div style={{display:"flex",gap:8,alignItems:"center"}}><input type="color" value={nOrg.primaryColor} onChange={e=>setNOrg(p=>({...p,primaryColor:e.target.value}))} style={{width:44,height:38,borderRadius:8,border:"2px solid #dbeafe",cursor:"pointer",padding:2}}/><input value={nOrg.primaryColor} onChange={e=>setNOrg(p=>({...p,primaryColor:e.target.value}))} style={{...inp,flex:1}}/></div></div>
            <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:6}}>LOGOMARCA</label><LogoUploader value={nOrg.logoUrl} onChange={url=>setNOrg(p=>({...p,logoUrl:url}))} color={nOrg.primaryColor}/></div>
          </div>
          {nOrgE&&<p style={{color:"#ef4444",fontSize:12,marginBottom:8}}>⚠️ {nOrgE}</p>}
          <button onClick={createOrg} style={{...btn("#16a34a")}}>Criar organização</button>
        </div>
        <div style={{...card}}>
          <h3 style={{color:"#1e3a8a",marginBottom:20,fontSize:15}}>🏢 Organizações cadastradas</h3>
          {Object.keys(orgs).length===0?<p style={{color:"#94a3b8",textAlign:"center",padding:"24px 0"}}>Nenhuma organização cadastrada.</p>:
            Object.values(orgs).map(o=>(
              <div key={o.id} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:"1px solid #f1f5f9"}}>
                <OrgLogo org={o} size={44}/>
                <div style={{flex:1}}><div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>{o.name}</div><div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>ID: {o.id} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}</div></div>
                <button onClick={()=>delOrg(o.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:12,fontWeight:600}}>Remover</button>
              </div>
            ))
          }
        </div>
      </div>
      <PoweredBy/>
    </div>
  );

  if(screen==="org_list") return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:440,width:"100%"}}>
        <div style={{...card,marginBottom:16}}>
          <h2 style={{color:"#1e3a8a",marginBottom:4,fontSize:18}}>🏢 Acesso Organizacional</h2>
          <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Selecione sua organização:</p>
          {Object.keys(orgs).length===0?<p style={{color:"#94a3b8",textAlign:"center",padding:"24px 0",fontSize:13}}>Nenhuma organização disponível.</p>:
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {Object.values(orgs).map(o=>(
                <button key={o.id} onClick={()=>{setOrg(o);setOrgP("");setOrgE(false);setScreen("org_login");}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"#f8faff",borderRadius:14,border:`2px solid ${o.primaryColor||"#dbeafe"}33`,cursor:"pointer",textAlign:"left"}}>
                  <OrgLogo org={o} size={40}/><div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>{o.name}</div><span style={{marginLeft:"auto",color:"#bfdbfe",fontSize:18}}>›</span>
                </button>
              ))}
            </div>}
        </div>
        <button onClick={()=>setScreen("home")} style={{...btnO,width:"100%"}}>← Voltar</button>
        <PoweredBy/>
      </div>
    </div>
  );

  if(screen==="org_login"&&org) return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{...card,maxWidth:360,width:"100%",textAlign:"center"}}>
        <OrgLogo org={org} size={64}/><h2 style={{color:"#1e3a8a",margin:"14px 0 4px",fontSize:18}}>{org.name}</h2><p style={{color:"#64748b",fontSize:12,marginBottom:24}}>Painel administrativo</p>
        <input type="password" placeholder="Senha do administrador" value={orgP} onChange={e=>setOrgP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loginOrg(org)} style={{...inp,border:`2px solid ${orgE?"#ef4444":"#dbeafe"}`,marginBottom:6}}/>
        {orgE&&<p style={{color:"#ef4444",fontSize:12,marginBottom:8}}>Senha incorreta</p>}
        <div style={{display:"flex",gap:10,marginTop:12}}><button onClick={()=>setScreen("org_list")} style={{...btnO,flex:1}}>Voltar</button><button onClick={()=>loginOrg(org)} style={{...btn(org.primaryColor||"#2563eb"),flex:2}}>Entrar</button></div>
      </div>
      <PoweredBy/>
    </div>
  );

  if(screen==="dash"&&org){
    const links=getLinks();
    return(
      <div style={{...pg,padding:0}}>
        <div style={hdr(pc)}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><OrgLogo org={org} size={34}/><div><div style={{fontWeight:800,fontSize:15}}>{org.name} · Avaliação 360°</div><div style={{fontSize:11,opacity:0.75}}>Painel administrativo</div></div></div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>setScreen("editor")} style={{...hBtn,background:"#f59e0b",fontWeight:700}}>✏️ Formulários</button>
            <button onClick={()=>setScreen("settings")} style={{...hBtn,background:"rgba(255,255,255,0.2)"}}>⚙️ Config</button>
            <button onClick={()=>{setScreen("home");setOrg(null);}} style={{...hBtn,background:"rgba(255,255,255,0.15)"}}>Sair</button>
          </div>
        </div>
        <div style={{maxWidth:900,margin:"0 auto",padding:"24px 16px 40px",width:"100%"}}>
          <div style={{...card,marginBottom:24}}>
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:10}}>
                <h3 style={{color:"#1e3a8a",fontSize:15,margin:0}}>🔗 Links para compartilhar</h3>
                <button onClick={()=>setScreen("links_editor")} style={{padding:"7px 14px",borderRadius:8,border:"2px solid "+pc,background:"#fff",color:pc,cursor:"pointer",fontSize:12,fontWeight:700}}>✏️ Personalizar títulos</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#94a3b8"}}>Ciclo ativo:</span>
                <select value={org.activeCiclo||CICLOS[0]} onChange={async e=>{const u={...orgs,[org.id]:{...org,activeCiclo:e.target.value}};await saveOrgs(u);setOrgs(u);setOrg({...org,activeCiclo:e.target.value});}} style={{padding:"6px 10px",borderRadius:8,border:"2px solid #dbeafe",fontSize:12,outline:"none",fontWeight:600,color:"#334155"}}>
                  {CICLOS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {/* URL base notice */}
            {!org.baseUrl&&(
              <div style={{background:"#fefce8",borderRadius:10,padding:"10px 14px",border:"1px solid #fde68a",marginBottom:14,fontSize:12,color:"#92400e",display:"flex",alignItems:"center",gap:8}}>
                ⚠️ <span>Configure a <strong>URL do app</strong> nas configurações para gerar links corretos. Atualmente os links podem apontar para o Claude.</span>
                <button onClick={()=>setScreen("settings")} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,border:"none",background:"#f59e0b",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Configurar</button>
              </div>
            )}
            {links.map(l=><LinkCard key={l.id} label={`${l.icon} ${l.title}`} link={l.link} color={pc}/>)}
          </div>
          <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:150}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>CICLO</label><select value={dci} onChange={e=>setDci(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #dbeafe",fontSize:13,outline:"none"}}>{CICLOS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{flex:1,minWidth:150}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>FORMULÁRIO</label><select value={dfi} onChange={e=>setDfi(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #dbeafe",fontSize:13,outline:"none"}}>{forms.map((f,i)=><option key={f.id} value={i}>{f.icon} {f.title}</option>)}</select></div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={exportCSV} style={{...btn("#475569"),padding:"10px 14px",fontSize:12}} title="Baixar dados CSV">⬇️ CSV</button>
              <button onClick={exportHTML} style={{...btn("#7c3aed"),padding:"10px 14px",fontSize:12}} title="Baixar relatório HTML">📄 Relatório</button>
              <button onClick={shareReport} style={{...btn(repCopied?"#16a34a":"#0891b2"),padding:"10px 14px",fontSize:12}} title="Copiar link público do relatório">{repCopied?"✓ Link copiado!":"🔗 Compartilhar"}</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
            {[{icon:"📋",val:dData.length,label:"Respostas"},{icon:"⭐",val:mgeral,label:"Média Geral"},{icon:"✍️",val:abList.length,label:"Reflexões"}].map((k,i)=>(
              <div key={i} style={{...card,textAlign:"center",padding:16}}><div style={{fontSize:28}}>{k.icon}</div><div style={{fontSize:26,fontWeight:800,color:pc}}>{k.val}</div><div style={{fontSize:11,color:"#94a3b8"}}>{k.label}</div></div>
            ))}
          </div>
          {dData.length===0?(
            <div style={{...card,textAlign:"center",padding:48}}><div style={{fontSize:48,marginBottom:12}}>📭</div><p style={{color:"#64748b"}}>Nenhuma resposta para este ciclo e formulário.</p><p style={{color:"#94a3b8",fontSize:12,marginTop:8}}>Compartilhe os links acima para coletar respostas.</p></div>
          ):(<>
            <div style={{...card,marginBottom:24}}><h3 style={{color:"#1e3a8a",marginBottom:20,fontSize:15}}>📊 Média por área</h3><ResponsiveContainer width="100%" height={240}><BarChart data={bStats} margin={{top:5,right:10,left:-20,bottom:55}}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="name" tick={{fontSize:10,fill:"#64748b"}} angle={-30} textAnchor="end" interval={0}/><YAxis domain={[0,5]} tick={{fontSize:11}}/><Tooltip formatter={v=>[`${v}/5`,"Média"]} labelFormatter={(_,p)=>p[0]?.payload?.fullName||""}/><Bar dataKey="media" fill={pc} radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
            <div style={{...card,marginBottom:24}}><h3 style={{color:"#1e3a8a",marginBottom:20,fontSize:15}}>📈 Distribuição das respostas</h3><ResponsiveContainer width="100%" height={190}><BarChart data={dist} margin={{top:5,right:10,left:-20,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={v=>[v,"Respostas"]}/><Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div>
            <div style={{...card,marginBottom:24}}><h3 style={{color:"#1e3a8a",marginBottom:20,fontSize:15}}>🎯 Detalhamento por área</h3>{bStats.map((b,i)=><ScBar key={i} label={b.fullName} score={b.media}/>)}</div>
            {abList.length>0&&<div style={{...card}}><h3 style={{color:"#1e3a8a",marginBottom:6,fontSize:15}}>💬 Reflexões abertas</h3><p style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>{abList.length} respostas anônimas · LGPD conforme</p><div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:400,overflowY:"auto"}}>{abList.map((t,i)=><div key={i} style={{background:"#f8faff",borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${pc}`,fontSize:13,color:"#334155",lineHeight:1.6}}>"{t}"</div>)}</div></div>}
          </>)}
        </div>
        <PoweredBy/>
      </div>
    );
  }

  if(screen==="settings"&&org&&cfg) return(
    <div style={{...pg,padding:0}}>
      <div style={hdr(pc)}><div style={{fontWeight:800,fontSize:15}}>⚙️ Configurações — {org.name}</div><button onClick={()=>setScreen("dash")} style={{...hBtn,background:"rgba(255,255,255,0.2)"}}>← Voltar</button></div>
      <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px 40px",width:"100%"}}>
        <div style={{...card,marginBottom:16}}>
          <h3 style={{color:"#1e3a8a",marginBottom:20,fontSize:15}}>Identidade da organização</h3>
          <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOME</label><input value={cfg.name} onChange={e=>setCfg(p=>({...p,name:e.target.value}))} style={inp}/></div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:6}}>LOGOMARCA</label>
            <LogoUploader value={cfg.logoUrl||""} onChange={url=>setCfg(p=>({...p,logoUrl:url}))} color={cfg.primaryColor||"#2563eb"}/>
            <div style={{marginTop:8}}><label style={{fontSize:10,fontWeight:700,color:"#94a3b8",display:"block",marginBottom:4}}>OU COLE UMA URL</label><input value={cfg.logoUrl||""} onChange={e=>setCfg(p=>({...p,logoUrl:e.target.value}))} style={inp} placeholder="https://…"/></div>
          </div>
          <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>COR PRINCIPAL</label><div style={{display:"flex",gap:8,alignItems:"center"}}><input type="color" value={cfg.primaryColor||"#2563eb"} onChange={e=>setCfg(p=>({...p,primaryColor:e.target.value}))} style={{width:48,height:40,borderRadius:8,border:"2px solid #dbeafe",cursor:"pointer",padding:2}}/><input value={cfg.primaryColor||"#2563eb"} onChange={e=>setCfg(p=>({...p,primaryColor:e.target.value}))} style={{...inp,flex:1}}/></div></div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>URL DO APP (para gerar links corretos)</label>
            <input value={cfg.baseUrl||""} onChange={e=>setCfg(p=>({...p,baseUrl:e.target.value}))} style={inp} placeholder="Ex: https://360.suaorganizacao.com.br"/>
            <p style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Cole aqui o endereço onde o app está publicado. Isso corrige os links de compartilhamento.</p>
          </div>
          <div style={{marginBottom:20}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOVA SENHA DO ADMINISTRADOR</label><input type="password" value={cfg.adminPassword||""} onChange={e=>setCfg(p=>({...p,adminPassword:e.target.value}))} style={inp} placeholder="Deixe em branco para não alterar"/></div>
          <button onClick={saveCfg} style={{...btn(cfg.primaryColor||"#2563eb")}}>💾 Salvar configurações</button>
        </div>
        <div style={{...card,marginBottom:16}}>
          <h3 style={{color:"#1e3a8a",marginBottom:4,fontSize:15}}>🔢 Escala de avaliação</h3>
          <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Personalize os rótulos dos botões de resposta (1 a 5 e "não sei").</p>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"10px 12px",alignItems:"center"}}>
            {[1,2,3,4,5,0].map(v=>(
              <>
                <div key={"n"+v} style={{width:32,height:32,borderRadius:8,background:SC[v],display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>
                  {v===0?"?":v}
                </div>
                <input key={"i"+v} value={scaleLabels[v]||""} onChange={e=>setScaleLabels(p=>({...p,[v]:e.target.value}))}
                  style={{...inp,padding:"8px 12px"}} placeholder={DEFAULT_SCALE_LABELS[v]}/>
              </>
            ))}
          </div>
          <button onClick={()=>setScaleLabels(DEFAULT_SCALE_LABELS)} style={{marginTop:12,padding:"6px 14px",borderRadius:8,border:"2px solid #dbeafe",background:"#fff",color:"#64748b",cursor:"pointer",fontSize:12}}>
            Restaurar padrão
          </button>
        </div>
        <div style={{...card,background:"#f0fdf4",border:"1px solid #bbf7d0"}}><h3 style={{color:"#166534",marginBottom:10,fontSize:14}}>🔒 LGPD — Conformidade</h3><p style={{fontSize:12,color:"#166534",lineHeight:1.7,margin:0}}>{LGPD}</p></div>
      </div>
      <PoweredBy/>
    </div>
  );

  if(screen==="editor"&&org){
    const eF=forms[efi];const eB=eF?.blocos[ebi];
    const sBtn=(active)=>({display:"block",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:10,border:"none",background:active?`${pc}18`:"transparent",color:active?pc:"#64748b",fontWeight:active?700:400,cursor:"pointer",fontSize:12,marginBottom:2});
    return(
      <div style={{minHeight:"100vh",background:"#f8faff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <div style={{...hdr(pc),position:"sticky",top:0,zIndex:20}}>
          <div><div style={{fontWeight:800,fontSize:15}}>✏️ Editor de Formulários — {org.name}</div><div style={{fontSize:11,opacity:0.75}}>Alterações afetam apenas novos preenchimentos</div></div>
          <div style={{display:"flex",gap:8}}><button onClick={saveFormsBtn} style={{...hBtn,background:"#16a34a",fontWeight:700}}>💾 Salvar</button><button onClick={()=>setScreen("dash")} style={{...hBtn,border:"2px solid rgba(255,255,255,0.3)",background:"none"}}>← Links</button></div>
        </div>
        <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px 60px",display:"flex",gap:16}}>
          <div style={{width:172,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#fff",borderRadius:16,padding:12,border:"1px solid #dbeafe"}}>
              <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Formulários</p>
              {forms.map((f,i)=><button key={f.id} onClick={()=>{setEfi(i);setEbi(0);}} style={sBtn(efi===i)}>{f.icon} {f.title}</button>)}
            </div>
            {eF&&<div style={{background:"#fff",borderRadius:16,padding:12,border:"1px solid #dbeafe"}}>
              <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Blocos</p>
              {eF.blocos.map((b,i)=><button key={b.id} onClick={()=>setEbi(i)} style={sBtn(ebi===i)}>{b.icon} {b.title.slice(0,18)}{b.title.length>18?"…":""}</button>)}
            </div>}
          </div>
          {eB&&<div style={{flex:1,display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #dbeafe"}}><p style={{fontSize:11,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Título do bloco</p><input value={eB.title} onChange={e=>updBT(efi,ebi,e.target.value)} style={inp}/></div>
            <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #dbeafe"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><p style={{fontSize:11,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:1,margin:0}}>Perguntas com escala 1–5</p><p style={{fontSize:11,color:"#94a3b8",margin:"3px 0 0"}}>{eB.perguntas.length} pergunta{eB.perguntas.length!==1?"s":""}</p></div>
                <button onClick={()=>addQ(efi,ebi)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#d1fae5",color:"#065f46",cursor:"pointer",fontWeight:700,fontSize:12}}>+ Adicionar</button>
              </div>
              {eB.perguntas.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:10}}>
                  <span style={{fontSize:12,color:"#94a3b8",fontWeight:700,minWidth:22,paddingTop:10}}>{i+1}.</span>
                  <textarea value={p} rows={2} onChange={e=>updQ(efi,ebi,i,e.target.value)} style={{...inp,resize:"vertical",flex:1}}/>
                  <button onClick={()=>delQ(efi,ebi,i)} style={{padding:"6px 10px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:13,marginTop:4}}>🗑️</button>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #fde68a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><p style={{fontSize:11,fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:1,margin:0}}>Perguntas abertas / reflexões</p><p style={{fontSize:11,color:"#94a3b8",margin:"3px 0 0"}}>{eB.abertas.length} pergunta{eB.abertas.length!==1?"s":""}</p></div>
                <button onClick={()=>addAb(efi,ebi)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#d1fae5",color:"#065f46",cursor:"pointer",fontWeight:700,fontSize:12}}>+ Adicionar</button>
              </div>
              {eB.abertas.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:10}}>
                  <span style={{fontSize:12,color:"#94a3b8",fontWeight:700,minWidth:22,paddingTop:10}}>{i+1}.</span>
                  <textarea value={a} rows={2} onChange={e=>updAb(efi,ebi,i,e.target.value)} style={{...inp,resize:"vertical",flex:1,borderColor:"#fde68a"}}/>
                  <button onClick={()=>delAb(efi,ebi,i)} style={{padding:"6px 10px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:13,marginTop:4}}>🗑️</button>
                </div>
              ))}
            </div>
          </div>}
        </div>
        <PoweredBy/>
      </div>
    );
  }

  if(screen==="lgpd"&&org&&fForm) return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:480,width:"100%"}}>
        <div style={{...card,marginBottom:16}}>
          <div style={{textAlign:"center",marginBottom:20}}><OrgLogo org={org} size={64}/><h2 style={{color:"#1e3a8a",margin:"14px 0 4px",fontSize:18}}>{fForm.title}</h2><p style={{color:"#64748b",fontSize:13}}>{org.name} · {ciclo}</p></div>
          <div style={{background:"#f0fdf4",borderRadius:12,padding:16,border:"1px solid #bbf7d0",marginBottom:20}}><p style={{fontSize:12,color:"#166534",lineHeight:1.8,margin:0}}>🔒 {LGPD}</p></div>
          <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginBottom:20}}>
            <input type="checkbox" checked={lgpd} onChange={e=>setLgpd(e.target.checked)} style={{marginTop:2,width:16,height:16,cursor:"pointer"}}/>
            <span style={{fontSize:13,color:"#334155",lineHeight:1.6}}>Compreendo que minhas respostas são anônimas e concordo com os termos acima.</span>
          </label>
          <button onClick={()=>{if(lgpd){setFbi(0);setAnswers({});setOpenAns({});setScreen("form");}}} disabled={!lgpd} style={{...btn(pc),width:"100%",opacity:lgpd?1:0.4}}>Iniciar avaliação →</button>
        </div>
        <PoweredBy/>
      </div>
    </div>
  );

  if(screen==="form"&&org&&fForm&&fBloc) return(
    <div style={{...pg}}>
      <div style={{position:"sticky",top:0,zIndex:10,background:"#fff",borderBottom:"1px solid #dbeafe",padding:"10px 16px"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><OrgLogo org={org} size={26}/><span style={{fontWeight:700,color:"#1e3a8a",fontSize:13}}>{fForm.title}</span></div>
            <span style={{fontSize:11,color:"#94a3b8"}}>{fbi+1}/{fForm.blocos.length}</span>
          </div>
          <div style={{background:"#e2e8f0",borderRadius:8,height:6}}><div style={{width:`${((fbi+1)/fForm.blocos.length)*100}%`,background:pc,height:6,borderRadius:8,transition:"width 0.4s"}}/></div>
        </div>
      </div>
      <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px 80px",flex:1}}>
        <div style={{marginBottom:24}}><span style={{fontSize:28}}>{fBloc.icon}</span><h2 style={{color:"#1e3a8a",fontSize:18,margin:"8px 0 4px"}}>{fBloc.title}</h2><div style={{height:2,background:"#dbeafe",borderRadius:2}}/></div>
        {fBloc.perguntas.map((p,i)=>(
          <div key={i} style={{marginBottom:28}}>
            <p style={{color:"#334155",fontSize:14,lineHeight:1.6,marginBottom:10}}>{p}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
              {[1,2,3,4,5,0].map(v=>{
                const sel=answers[`${fBloc.id}_${i}`]===v;
                const label=scaleLabels[v]||DEFAULT_SCALE_LABELS[v];
                return(
                  <button key={v} onClick={()=>setAnswers(r=>({...r,[`${fBloc.id}_${i}`]:v}))}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",
                      justifyContent:"center",
                      padding:"10px 4px",borderRadius:10,minHeight:56,
                      border:`2px solid ${sel?SC[v]:"#e2e8f0"}`,
                      background:sel?SC[v]:"#f8fafc",color:sel?"#fff":"#475569",
                      cursor:"pointer",fontSize:11,fontWeight:600,transition:"all 0.15s",
                      width:"100%",boxSizing:"border-box"}}>
                    {v!==0&&<span style={{fontSize:15,fontWeight:800,lineHeight:1.2}}>{v}</span>}
                    <span style={{textAlign:"center",lineHeight:1.3,wordBreak:"break-word",maxWidth:"100%"}}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {fBloc.abertas?.length>0&&(
          <div style={{background:"#eff6ff",borderRadius:14,padding:18,border:"1px solid #bfdbfe",marginTop:8}}>
            <p style={{fontSize:11,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Reflexões abertas</p>
            {fBloc.abertas.map((a,i)=>(
              <div key={i} style={{marginBottom:14}}>
                <label style={{fontSize:13,color:"#475569",fontStyle:"italic",display:"block",marginBottom:6}}>{a}</label>
                <textarea value={openAns[`${fBloc.id}_aberta_${i}`]||""} onChange={e=>setOpenAns(r=>({...r,[`${fBloc.id}_aberta_${i}`]:e.target.value}))} rows={3} placeholder="Escreva com cuidado e honestidade…" style={{width:"100%",borderRadius:10,border:"1px solid #bfdbfe",padding:"10px 12px",fontSize:13,background:"#fff",resize:"none",outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:12,marginTop:28}}>
          <button onClick={()=>fbi===0?setScreen("lgpd"):setFbi(b=>b-1)} style={{...btnO,flex:1}}>← Voltar</button>
          {isLast?<button onClick={submitForm} disabled={saving} style={{...btn(pc),flex:2,opacity:saving?0.6:1}}>{saving?"Salvando…":"Enviar ✓"}</button>:<button onClick={()=>setFbi(b=>b+1)} style={{...btn(pc),flex:2}}>Próximo →</button>}
        </div>
      </div>
      <PoweredBy/>
    </div>
  );

  if(screen==="result"&&org&&fForm) return(
    <div style={{...pg,alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:480,width:"100%"}}>
        <div style={{...card,textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:52,marginBottom:8}}>✅</div><OrgLogo org={org} size={56}/>
          <h2 style={{color:"#1e3a8a",margin:"14px 0 8px"}}>Avaliação enviada!</h2>
          <p style={{color:"#64748b",fontSize:13,lineHeight:1.7}}>Obrigado. Sua avaliação foi registrada de forma anônima e contribuirá para o desenvolvimento de {org.name}.</p>
          <div style={{background:"#f0fdf4",borderRadius:10,padding:12,marginTop:16,fontSize:12,color:"#166534"}}>🔒 Respostas anônimas · LGPD conforme</div>
          <div style={{marginTop:24,textAlign:"left"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Sua pontuação por área</p>
            {fForm.blocos.map(b=><ScBar key={b.id} label={b.title} score={bAvg(b,answers)}/>)}
          </div>
        </div>
      </div>
      <PoweredBy/>
    </div>
  );

  // ── LINKS EDITOR ──
  if(screen==="links_editor"&&org){
    function addCustomLink(formId){
      const f=forms.find(x=>x.id===formId);
      const updated=[...customLinks,{id:genId(8),formId,label:f?`${f.title} — novo link`:"Novo link"}];
      saveLinks(updated);
    }
    function updateLinkLabel(id,label){
      saveLinks(customLinks.map(l=>l.id===id?{...l,label}:l));
    }
    function removeCustomLink(id){
      saveLinks(customLinks.filter(l=>l.id!==id));
    }
    return(
      <div style={{minHeight:"100vh",background:"#f8faff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <div style={{...hdr(pc),position:"sticky",top:0,zIndex:20}}>
          <div>
            <div style={{fontWeight:800,fontSize:15}}>🔗 Editor de Links — {org.name}</div>
            <div style={{fontSize:11,opacity:0.75}}>Crie títulos personalizados para cada formulário</div>
          </div>
          <button onClick={()=>setScreen("dash")} style={{...hBtn,border:"2px solid rgba(255,255,255,0.3)",background:"none"}}>← Links</button>
        </div>
        <div style={{maxWidth:720,margin:"0 auto",padding:"24px 16px 60px"}}>

          {!org.baseUrl&&(
            <div style={{background:"#fefce8",borderRadius:12,padding:"12px 16px",border:"1px solid #fde68a",marginBottom:20,fontSize:12,color:"#92400e",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              ⚠️ Configure a <strong>URL do app</strong> nas ⚙️ Configurações para que os links funcionem corretamente após o deploy.
            </div>
          )}

          <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 16px",border:"1px solid #bfdbfe",marginBottom:24,fontSize:12,color:"#1e40af"}}>
            💡 Cada formulário pode ter <strong>vários links com títulos diferentes</strong>. Por exemplo, "Avaliação pelos Liderados" pode virar "Avalie seu Líder de Equipe" ou "Avalie a Diretoria" — cada um com seu link próprio.
          </div>

          {forms.map(f=>{
            const fLinks=customLinks.filter(l=>l.formId===f.id);
            const base=getBaseUrl();
            const cs=encodeURIComponent((org?.activeCiclo||CICLOS[0]).replace(/ /g,"-"));
            const defaultLink=`${base}#/fill/${org?.id}/${cs}/${f.id}`;
            return(
              <div key={f.id} style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #dbeafe",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>{f.icon} {f.title}</div>
                  <button onClick={()=>addCustomLink(f.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#d1fae5",color:"#065f46",cursor:"pointer",fontWeight:700,fontSize:12}}>+ Adicionar link</button>
                </div>

                {/* Default link (always shown, not editable title) */}
                <div style={{background:"#f8faff",borderRadius:10,padding:"10px 14px",border:"1px solid #e2e8f0",marginBottom:fLinks.length>0?10:0}}>
                  <div style={{fontSize:11,color:"#94a3b8",marginBottom:4}}>Link padrão (título do formulário)</div>
                  <div style={{fontSize:12,fontWeight:600,color:pc,marginBottom:6}}>{f.icon} {f.title}</div>
                  <div style={{fontSize:10,color:"#94a3b8",fontFamily:"monospace",wordBreak:"break-all"}}>{defaultLink}</div>
                </div>

                {/* Custom links */}
                {fLinks.map(l=>(
                  <div key={l.id} style={{background:"#f0fdf4",borderRadius:10,padding:"12px 14px",border:"1px solid #bbf7d0",marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Título personalizado</div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                      <input value={l.label} onChange={e=>updateLinkLabel(l.id,e.target.value)}
                        style={{...inp,flex:1,background:"#fff",borderColor:"#86efac"}}
                        placeholder="Ex: Avalie seu Líder de Equipe"/>
                      <button onClick={()=>removeCustomLink(l.id)} style={{padding:"8px 10px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:13,flexShrink:0}}>🗑️</button>
                    </div>
                    <div style={{fontSize:10,color:"#94a3b8",fontFamily:"monospace",wordBreak:"break-all"}}>{defaultLink}</div>
                    <div style={{fontSize:11,color:"#16a34a",marginTop:4}}>✓ Este link aparecerá como: <strong>"{l.label}"</strong></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div style={{...pg,alignItems:"center",justifyContent:"center"}}><div style={{fontSize:32}}>⏳</div></div>;
}
