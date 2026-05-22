import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SUPER_ADMIN_PASSWORD = "W@Huimai2";
const STORAGE_ORGS = "cg360_orgs";
const STORAGE_RESPOSTAS = "cg360_respostas";
const STORAGE_FORMS = "cg360_forms";

const DEFAULT_SCALE_LABELS = {
  1:"Nunca", 2:"Raramente", 3:"Às vezes", 4:"Frequente", 5:"Exemplar", 0:"Não sei"
};
const SC = {0:"#94a3b8",1:"#ef4444",2:"#f97316",3:"#eab308",4:"#22c55e",5:"#10b981"};
const DEFAULT_YESNO_LABELS = {1:"Sim", 2:"Atenção", 0:"Não"};
const YESNO_COLORS = {1:"#ef4444", 2:"#f59e0b", 0:"#10b981"};
// SCALE is built dynamically from org settings — see getScale() in App
function gerarCiclos(){const ano=new Date().getFullYear();const r=[];for(let a=ano-2;a<=ano+2;a++){r.push(`${a} - 1º Semestre`);r.push(`${a} - 2º Semestre`);}return r;}
const CICLOS=gerarCiclos();
const LGPD = "Suas respostas são completamente anônimas. Nenhum dado pessoal identificável é coletado. Os administradores do sistema visualizam apenas resultados agregados, sem identificação de quem respondeu. Os dados são utilizados exclusivamente para fins de desenvolvimento organizacional interno, conforme a LGPD (Lei nº 13.709/2018). Você pode interromper o preenchimento a qualquer momento.";

const DEFAULT_FORMS = [
  { id:"autoavaliacao", title:"Autoavaliação", icon:"🪞", subtitle:"Um espaço honesto e seguro para olhar para si mesmo",
    blocos:[
      { id:"espiritualidade", title:"Vida espiritual e coerência", icon:"✝️",
        perguntas:[
          "Tenho sido fiel nas minhas práticas devocionais.",
          "Tenho sido coerente com minhas palavras e ações.",
          "Tenho reagido a críticas e correções com humildade.",
          "Tenho buscado a vontade de Deus para minhas decisões.",
          "Minha prática ministerial tem refletido os objetivos que defini no meu planejamento anual.",
          "Tenho conseguido me manter humilde diante dos sucessos pessoais e ministeriais.",
        ],
        abertas:["Em quais áreas você percebe maior crescimento espiritual no último período?","Em quais áreas sente maior fragilidade atualmente?"]},
      { id:"saude_emocional", title:"Saúde emocional", icon:"💙",
        perguntas:[
          "Tenho conseguido lidar de forma saudável com pressões e frustrações.",
          "Tenho conseguido descansar adequadamente.",
          "Tenho percebido equilíbrio entre ministério, vida pessoal e familiar.",
          "Tenho conseguido pedir ajuda quando necessário.",
          "Tenho chegado às minhas atividades ministeriais com disposição e motivação.",
          "Tenho percebido sinais de desgaste emocional em mim.",
          "Tenho conseguido estabelecer limites saudáveis.",
        ],
        abertas:["Quais são hoje suas maiores fontes de desgaste?","O que mais tem fortalecido você emocionalmente?","Existe alguma área em que você sente necessidade de maior cuidado ou apoio?"]},
      { id:"relacionamentos", title:"Relacionamentos e equipe", icon:"🤝",
        perguntas:[
          "Tenho contribuído para que meus ambientes sejam saudáveis.",
          "Tenho escutado opiniões diferentes sem defensividade.",
          "Tenho lidado bem com conflitos.",
          "Tenho sido acessível e respeitoso nas relações.",
          "Tenho colaborado com minha(s) equipe(s) de trabalho.",
        ],
        abertas:["O que você acredita que mais fortalece suas relações?","Onde você acredita que precisa amadurecer relacionalmente?"]},
      { id:"comunicacao", title:"Comunicação", icon:"💬",
        perguntas:[
          "Tenho me comunicado com clareza.",
          "Tenho dado feedbacks respeitosos e honestos.",
          "Tenho escutado atentamente as pessoas.",
          "Tenho comunicado expectativas de maneira saudável.",
        ],
        abertas:["Em quais situações sua comunicação funciona melhor?","O que você deseja desenvolver na sua comunicação?"]},
      { id:"alinhamento", title:"Alinhamento e cultura", icon:"⛵",
        perguntas:[
          "Tenho representado bem os valores da organização.",
          "Tenho contribuído para a unidade da organização.",
          "Tenho fortalecido a cultura de cuidado e cooperação.",
          "Tenho mantido alinhamento com a liderança e suas diretrizes.",
          "Tenho colaborado para o desenvolvimento da organização.",
        ],
        abertas:["O que mais conecta você ao propósito da organização?","O que hoje dificulta seu alinhamento ou engajamento?"]},
      { id:"impacto", title:"Impacto e resultados", icon:"🌱",
        perguntas:[
          "Tenho produzido impacto positivo nas pessoas ao meu redor.",
          "Tenho desenvolvido outras pessoas e multiplicado meu ministério.",
          "Tenho alcançado as metas estabelecidas no meu planejamento ministerial.",
          "Tenho desenvolvido novas habilidades.",
        ],
        abertas:["Onde você percebe maior fruto atualmente?","Onde gostaria de crescer no próximo ciclo?"]},
      { id:"saude_integral_auto", title:"Saúde integral", icon:"💚",
        perguntas:[
          "Minhas relações familiares estão saudáveis.",
          "Tenho descansado adequadamente.",
          "Tenho lidado bem com minhas frustrações.",
        ],
        abertas:[]},
    ]},
  { id:"pares", title:"Avaliação de Pares", icon:"👥", subtitle:"Compartilhe com cuidado e honestidade",
    blocos:[
      { id:"convivencia", title:"Relacionamentos e convivência", icon:"🤝",
        perguntas:[
          "Essa pessoa contribui para um ambiente saudável.",
          "Trata as pessoas com respeito.",
          "Trabalha bem em equipe.",
          "Demonstra humildade nos relacionamentos.",
          "Resolve conflitos com maturidade.",
          "Escuta opiniões diferentes.",
          "Demonstra disposição para cooperar.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"comunicacao_par", title:"Comunicação", icon:"💬",
        perguntas:[
          "Comunica-se de forma clara.",
          "Compartilha informações importantes adequadamente.",
          "Escuta com atenção.",
          "Demonstra abertura ao diálogo.",
          "Quando precisa corrigir ou orientar, faz isso de forma respeitosa e construtiva.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"maturidade", title:"Maturidade emocional", icon:"💙",
        perguntas:[
          "Demonstra equilíbrio emocional diante das pressões.",
          "Reage de forma madura a frustrações.",
          "Assume erros quando necessário.",
          "Ouve críticas sem defensividade excessiva.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"cultura_par", title:"Cultura e missão", icon:"⛵",
        perguntas:[
          "Representa bem os valores da organização.",
          "Fortalece a unidade.",
          "Demonstra compromisso com a organização.",
          "Atua de forma coerente com a cultura onde está inserida.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"saude_integral_par", title:"Saúde integral", icon:"💚",
        perguntas:[
          "Demonstra abertura e vulnerabilidade saudável.",
          "Demonstra sinais saudáveis nas relações familiares.",
          "Demonstra sinais de descanso adequado.",
          "Demonstra maturidade para lidar com frustrações.",
        ],
        abertas:[]},
      { id:"riscos_par", title:"Riscos e sinais preventivos", icon:"⚠️", scaleType:"yesno",
        perguntas:[
          "Percebo sinais de sobrecarga.",
          "Percebo sinais de isolamento.",
          "Percebo sinais de desgaste emocional.",
          "Percebo perda de motivação.",
          "Percebo tensões relacionais recorrentes.",
          "Essa pessoa se beneficiaria de um acompanhamento mais próximo neste momento.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
    ]},
  { id:"lideranca_direta", title:"Avaliação pela Liderança", icon:"🧭", subtitle:"Avaliação de quem acompanha de perto",
    blocos:[
      { id:"responsabilidade", title:"Responsabilidade e confiabilidade", icon:"🛡️",
        perguntas:[
          "Demonstra responsabilidade.",
          "Cumpre compromissos e acordos.",
          "Demonstra maturidade nas decisões.",
          "Demonstra confiabilidade.",
          "Demonstra coerência entre discurso e prática.",
        ], abertas:[]},
      { id:"aprendizado", title:"Desenvolvimento e aprendizado", icon:"🌱",
        perguntas:[
          "Demonstra disposição para aprender.",
          "Recebe orientações e críticas com maturidade.",
          "Busca desenvolvimento pessoal.",
          "Demonstra adaptabilidade.",
        ], abertas:[]},
      { id:"sustentabilidade", title:"Saúde e sustentabilidade", icon:"💙",
        perguntas:[
          "Administra adequadamente as pressões.",
          "Mantém limites saudáveis.",
          "Demonstra equilíbrio em sua vida econômica e material.",
          "Demonstra boa disposição física.",
          "Sabe pedir ajuda quando necessário.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"maturidade_lid", title:"Maturidade emocional", icon:"💜",
        perguntas:[
          "Demonstra equilíbrio emocional diante das pressões.",
          "Reage de forma madura a frustrações.",
          "Demonstra segurança sem arrogância.",
          "Assume erros quando necessário.",
          "Recebe correções sem defensividade excessiva.",
        ], abertas:[]},
      { id:"riscos_lid", title:"Riscos e sinais preventivos", icon:"⚠️", scaleType:"yesno",
        perguntas:[
          "Percebo sinais de sobrecarga.",
          "Percebo sinais de isolamento.",
          "Percebo sinais de desgaste emocional.",
          "Percebo perda de motivação.",
          "Percebo tensões relacionais recorrentes.",
          "Essa pessoa se beneficiaria de um acompanhamento mais próximo neste momento.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
    ]},
  { id:"liderados", title:"Avaliação pelos Liderados", icon:"🌿", subtitle:"Sua perspectiva importa e será tratada com cuidado",
    blocos:[
      { id:"estilo", title:"Estilo de liderança", icon:"🧭",
        perguntas:[
          "Desenvolve ambiente seguro para diálogo.",
          "Demonstra disposição e engajamento.",
          "Escuta as pessoas com atenção.",
          "Trata as pessoas com respeito.",
          "Dá direcionamentos claros quando necessário.",
          "Demonstra equilíbrio nas decisões.",
          "Assume responsabilidade pelos erros.",
          "Demonstra coerência entre discurso e prática.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"saude_relacional", title:"Saúde relacional", icon:"💙",
        perguntas:[
          "Gera e transmite confiança ao seu redor.",
          "Promove unidade.",
          "Lida bem com conflitos.",
          "Evita manipulação ou controle excessivo.",
          "Demonstra abertura para ouvir críticas.",
          "Demonstra cuidado genuíno pelas pessoas.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
      { id:"maturidade_lid2", title:"Maturidade emocional", icon:"💜",
        perguntas:[
          "Demonstra equilíbrio emocional diante das pressões.",
          "Reage de forma madura a frustrações.",
          "Demonstra segurança sem arrogância.",
          "Assume erros quando necessário.",
        ], abertas:[]},
      { id:"riscos_lid2", title:"Riscos e sinais preventivos", icon:"⚠️", scaleType:"yesno",
        perguntas:[
          "Percebo sinais de sobrecarga.",
          "Percebo sinais de isolamento.",
          "Percebo sinais de desgaste emocional.",
          "Percebo perda de motivação.",
          "Percebo tensões relacionais recorrentes.",
          "Essa pessoa se beneficiaria de um acompanhamento mais próximo neste momento.",
        ],
        abertas:["Algo que você deseja comentar acerca dessa pessoa, em relação a esse tema."]},
    ]},
];

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────
const SB_URL = "https://tegktsjlpjvsbdrrugpp.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ2t0c2pscGp2c2JkcnJ1Z3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzI5NzAsImV4cCI6MjA5NDgwODk3MH0.Vh58dC61bYKkQJrsDFJBLrt9q3LGER50N0cb4iLzz5c";

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": opts.prefer !== undefined ? opts.prefer : "return=representation",
    },
    method: opts.method || "GET",
    body: opts.body || undefined,
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`SB ${res.status}: ${t}`); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function loadOrgs() {
  try {
    const rows = await sbFetch("organizations?select=*");
    const orgs = {};
    (rows || []).forEach(r => {
      orgs[r.id] = {
        id: r.id, name: r.name,
        adminPassword: r.admin_password,
        primaryColor: r.primary_color,
        logoUrl: r.logo_url,
        baseUrl: r.base_url,
        activeCiclo: r.active_ciclo,
        scaleLabels: r.scale_labels,
        createdAt: r.created_at,
      };
    });
    return orgs;
  } catch(e) { console.error("loadOrgs:", e); return {}; }
}

async function saveOrgs(orgs) {
  // no-op: individual ops use upsertOrg/deleteOrgFromDB
}

async function upsertOrg(org) {
  try {
    await sbFetch("organizations", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify({
        id: org.id, name: org.name,
        admin_password: org.adminPassword,
        primary_color: org.primaryColor || "#2563eb",
        logo_url: org.logoUrl || "",
        base_url: org.baseUrl || "",
        active_ciclo: org.activeCiclo || "2025 - 1º Semestre",
        scale_labels: org.scaleLabels || {},
        slug: org.slug || "",
        yesno_labels: org.yesnoLabels || DEFAULT_YESNO_LABELS,
        created_at: org.createdAt || new Date().toISOString(),
      }),
    });
    return true;
  } catch(e) { console.error("upsertOrg:", e); return false; }
}

async function deleteOrgFromDB(orgId) {
  try {
    await sbFetch(`organizations?id=eq.${orgId}`, { method: "DELETE", prefer: "" });
    return true;
  } catch(e) { console.error("deleteOrg:", e); return false; }
}

async function loadResps(orgId) {
  try {
    const rows = await sbFetch(`responses?org_id=eq.${orgId}&select=*&order=submitted_at.desc`);
    return (rows || []).map(r => ({
      id: r.id, ciclo: r.ciclo,
      formId: r.form_id, formTitle: r.form_title,
      scores: r.scores, answers: r.answers,
      openAns: r.open_answers, ts: new Date(r.submitted_at).getTime(),
      avaliadoId: r.avaliado_id || "",
      avaliadoNome: r.avaliado_nome || "",
    }));
  } catch(e) { console.error("loadResps:", e); return []; }
}

async function saveResp(orgId, entry) {
  try {
    await sbFetch("responses", {
      method: "POST", prefer: "return=minimal",
      body: JSON.stringify({
        id: entry.id, org_id: orgId,
        ciclo: entry.ciclo, form_id: entry.formId,
        form_title: entry.formTitle, scores: entry.scores,
        answers: entry.answers, open_answers: entry.openAns || {},
        avaliado_id: entry.avaliadoId || "",
        avaliado_nome: entry.avaliadoNome || "",
      }),
    });
    return true;
  } catch(e) { console.error("saveResp:", e); return false; }
}

async function loadForms(orgId) {
  try {
    const rows = await sbFetch(`org_forms?org_id=eq.${orgId}&select=forms_data&limit=1`);
    if (rows && rows.length > 0) return rows[0].forms_data;
    return JSON.parse(JSON.stringify(DEFAULT_FORMS));
  } catch(e) { return JSON.parse(JSON.stringify(DEFAULT_FORMS)); }
}

async function saveForms2(orgId, forms) {
  try {
    const existing = await sbFetch(`org_forms?org_id=eq.${orgId}&select=id&limit=1`);
    if (existing && existing.length > 0) {
      await sbFetch(`org_forms?org_id=eq.${orgId}`, {
        method: "PATCH", prefer: "return=minimal",
        body: JSON.stringify({ forms_data: forms, updated_at: new Date().toISOString() }),
      });
    } else {
      await sbFetch("org_forms", {
        method: "POST", prefer: "return=minimal",
        body: JSON.stringify({ org_id: orgId, forms_data: forms }),
      });
    }
    return true;
  } catch(e) { console.error("saveForms2:", e); return false; }
}

async function loadCustomLinks2(orgId) {
  try {
    const rows = await sbFetch(`org_custom_links?org_id=eq.${orgId}&select=links_data&limit=1`);
    if (rows && rows.length > 0) return rows[0].links_data;
    return [];
  } catch(e) { return []; }
}

async function saveSharedReport(orgId, data) {
  try {
    const id = Math.random().toString(36).slice(2,10);
    await sbFetch("shared_reports", {
      method: "POST", prefer: "return=minimal",
      body: JSON.stringify({ id, org_id: orgId, data }),
    });
    return id;
  } catch(e) { console.error("saveSharedReport:", e); return null; }
}

async function loadSharedReport(id) {
  try {
    const rows = await sbFetch(`shared_reports?id=eq.${id}&select=data&limit=1`);
    if (rows && rows.length > 0) return rows[0].data;
    return null;
  } catch(e) { return null; }
}

async function loadAvaliados(orgId) {
  try {
    const rows = await sbFetch(`avaliados?org_id=eq.${orgId}&ativo=eq.true&select=*&order=nome.asc`);
    return rows || [];
  } catch(e) { console.error("loadAvaliados:", e); return []; }
}

async function saveAvaliado(avaliado) {
  try {
    await sbFetch("avaliados", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify(avaliado),
    });
    return true;
  } catch(e) { console.error("saveAvaliado:", e); return false; }
}

async function deleteAvaliado(id) {
  try {
    await sbFetch(`avaliados?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: JSON.stringify({ ativo: false }),
    });
    return true;
  } catch(e) { return false; }
}

// ─── USUARIOS & ATRIBUICOES ──────────────────────────────────────────
async function loadUsuarios(orgId) {
  try {
    const rows = await sbFetch(`usuarios?org_id=eq.${orgId}&ativo=eq.true&select=*&order=nome.asc`);
    return rows || [];
  } catch(e) { return []; }
}

async function saveUsuario(u) {
  try {
    await sbFetch("usuarios", {
      method: "POST", prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify(u),
    });
    return true;
  } catch(e) { return false; }
}

async function deleteUsuario(id) {
  try {
    await sbFetch(`usuarios?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: JSON.stringify({ ativo: false }),
    });
    return true;
  } catch(e) { return false; }
}

async function loginUsuario(orgId, email, senha) {
  try {
    const hash = simpleHash(senha);
    const rows = await sbFetch(`usuarios?org_id=eq.${orgId}&email=eq.${encodeURIComponent(email)}&ativo=eq.true&select=*&limit=1`);
    if (!rows || rows.length === 0) return null;
    if (rows[0].senha_hash !== hash) return null;
    return rows[0];
  } catch(e) { return null; }
}

async function loadAtribuicoes(usuarioId, ciclo) {
  try {
    const rows = await sbFetch(`atribuicoes?usuario_id=eq.${usuarioId}&ciclo=eq.${encodeURIComponent(ciclo)}&select=*`);
    return (rows || []).map(r => ({
      id: r.id,
      ciclo: r.ciclo,
      form_id: r.form_id,
      usuario_id: r.usuario_id,
      avaliado_id: r.avaliado_id || "",
      avaliado_nome: r.avaliado_nome || "",
      avaliado_funcao: r.avaliado_funcao || "",
      concluida: r.concluida || false,
    }));
  } catch(e) { return []; }
}

async function saveAtribuicao(a) {
  try {
    await sbFetch("atribuicoes", {
      method: "POST", prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify(a),
    });
    return true;
  } catch(e) { return false; }
}

async function deleteAtribuicoesByUsuario(usuarioId, ciclo) {
  try {
    await sbFetch(`atribuicoes?usuario_id=eq.${usuarioId}&ciclo=eq.${encodeURIComponent(ciclo)}`, {
      method: "DELETE", prefer: "",
    });
    return true;
  } catch(e) { return false; }
}

async function marcarAtribuicaoConcluida(atribId) {
  try {
    await sbFetch(`atribuicoes?id=eq.${atribId}`, {
      method: "PATCH", prefer: "return=minimal",
      body: JSON.stringify({ concluida: true }),
    });
    return true;
  } catch(e) { return false; }
}

async function resetAtribuicao(atribId) {
  try {
    await sbFetch(`atribuicoes?id=eq.${atribId}`, {
      method: "PATCH", prefer: "return=minimal",
      body: JSON.stringify({ concluida: false }),
    });
    return true;
  } catch(e) { return false; }
}

async function loadOrgBySlug(slug) {
  try {
    // Try exact slug match first
    let rows = await sbFetch(`organizations?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
    // Fallback: try matching by ID prefix (for orgs without slug set yet)
    if(!rows || rows.length === 0) {
      rows = await sbFetch(`organizations?id=like.${encodeURIComponent(slug)}*&select=*&limit=1`);
    }
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id, name: r.name,
        adminPassword: r.admin_password,
        primaryColor: r.primary_color,
        logoUrl: r.logo_url,
        baseUrl: r.base_url,
        activeCiclo: r.active_ciclo,
        scaleLabels: r.scale_labels,
        yesnoLabels: r.yesno_labels || DEFAULT_YESNO_LABELS,
        slug: r.slug,
        createdAt: r.created_at,
      };
    }
    return null;
  } catch(e) { console.error("loadOrgBySlug:", e); return null; }
}

function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16);
}

async function saveCustomLinks2(orgId, links) {
  try {
    const existing = await sbFetch(`org_custom_links?org_id=eq.${orgId}&select=id&limit=1`);
    if (existing && existing.length > 0) {
      await sbFetch(`org_custom_links?org_id=eq.${orgId}`, {
        method: "PATCH", prefer: "return=minimal",
        body: JSON.stringify({ links_data: links, updated_at: new Date().toISOString() }),
      });
    } else {
      await sbFetch("org_custom_links", {
        method: "POST", prefer: "return=minimal",
        body: JSON.stringify({ org_id: orgId, links_data: links }),
      });
    }
    return true;
  } catch(e) { return false; }
}

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
function AtribuicoesEditor({usuario, org, forms, avaliados, ciclo, inp, btn, pc}){
  const [ats, setAts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    loadAtribuicoes(usuario.id, ciclo).then(r=>{ setAts(r); setLoading(false); });
  },[usuario.id, ciclo]);

  async function toggle(formId, avaliadoId, avaliadoNome){
    const exists = ats.find(a=>a.form_id===formId&&a.avaliado_id===avaliadoId);
    if(exists){
      await sbFetch(`atribuicoes?id=eq.${exists.id}`,{method:"DELETE",prefer:""});
      setAts(p=>p.filter(a=>a.id!==exists.id));
    } else {
      const avObj = avaliados.find(a=>a.id===avaliadoId);
      const na={id:genId(10),org_id:org.id,usuario_id:usuario.id,ciclo,form_id:formId,avaliado_id:avaliadoId||"",avaliado_nome:avaliadoNome||"",avaliado_funcao:avObj?.funcao||"",concluida:false,created_at:new Date().toISOString()};
      await saveAtribuicao(na);
      setAts(p=>[...p,na]);
    }
  }

  if(loading) return <div style={{padding:16,color:"#94a3b8",fontSize:12}}>Carregando...</div>;

  return(
    <div style={{background:"#f8faff",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #dbeafe"}}>
      <p style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Avaliações de {usuario.nome}</p>
      {forms.map(f=>{
        const needsAvaliado = ["liderados","lideranca_direta","pares","pastoral"].includes(f.id);
        if(needsAvaliado && avaliados.length>0){
          return(
            <div key={f.id} style={{marginBottom:12}}>
              <p style={{fontSize:12,fontWeight:700,color:"#334155",marginBottom:6}}>{f.icon} {f.title}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {avaliados.map(av=>{
                  const checked = !!ats.find(a=>a.form_id===f.id&&a.avaliado_id===av.id);
                  return(
                    <div key={av.id} style={{display:"flex",alignItems:"center",gap:4}}>
                      <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",background:checked?"#eff6ff":"#fff",border:`2px solid ${checked?pc:"#e2e8f0"}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:checked?700:400,color:checked?pc:"#64748b",flex:1}}>
                        <input type="checkbox" checked={checked} onChange={()=>toggle(f.id,av.id,av.nome)} style={{cursor:"pointer"}}/>
                        {av.nome}
                        {checked&&ats.find(a=>a.form_id===f.id&&a.avaliado_id===av.id)?.concluida&&<span style={{fontSize:10,color:"#10b981",marginLeft:4}}>✓</span>}
                      </label>
                      {checked&&ats.find(a=>a.form_id===f.id&&a.avaliado_id===av.id)?.concluida&&(
                        <button onClick={async()=>{
                          const at=ats.find(a=>a.form_id===f.id&&a.avaliado_id===av.id);
                          if(at){await resetAtribuicao(at.id);setAts(p=>p.map(x=>x.id===at.id?{...x,concluida:false}:x));}
                        }} title="Reiniciar avaliação" style={{padding:"6px 8px",borderRadius:8,border:"none",background:"#fef3c7",color:"#d97706",cursor:"pointer",fontSize:11,fontWeight:700,flexShrink:0}}>↺</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else {
          const checked = !!ats.find(a=>a.form_id===f.id&&a.avaliado_id==="");
          return(
            <label key={f.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:8,background:checked?"#eff6ff":"#fff",border:`2px solid ${checked?pc:"#e2e8f0"}`,borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:checked?700:400,color:checked?pc:"#64748b"}}>
              <input type="checkbox" checked={checked} onChange={()=>toggle(f.id,"","")} style={{cursor:"pointer"}}/>
              {f.icon} {f.title}
            </label>
          );
        }
      })}
    </div>
  );
}

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
  const [showLinks,setShowLinks]=useState(false);
  const [efi,setEfi]=useState(0);const [ebi,setEbi]=useState(0);
  const [nOrg,setNOrg]=useState({name:"",adminPassword:"",primaryColor:"#2563eb",logoUrl:""});const [nOrgE,setNOrgE]=useState("");
  const [editingOrg,setEditingOrg]=useState(null); // org being edited in super admin
  const [cfg,setCfg]=useState(null);
  const [customLinks,setCustomLinks]=useState([]);  // [{formId, label, id}]
  const [urlCustomLabel,setUrlCustomLabel]=useState(null); // custom title from URL link
  const [urlAvaliadoNome,setUrlAvaliadoNome]=useState(null); // avaliado name from URL
  const [urlAvaliadoId,setUrlAvaliadoId]=useState(null); // avaliado id from URL
  const [avaliados,setAvaliados]=useState([]); // list of avaliados for current org
  const [showAvaliados,setShowAvaliados]=useState(false); // show avaliados management
  const [newAvaliado,setNewAvaliado]=useState({nome:"",funcao:""});
  // Login por pessoa
  const [usuarioLogado,setUsuarioLogado]=useState(null);
  const [atribuicoes,setAtribuicoes]=useState([]);
  const [atribucaoAtual,setAtribucaoAtual]=useState(null);
  const [usuarios,setUsuarios]=useState([]);
  const [newUsuario,setNewUsuario]=useState({nome:"",email:"",senha:""});
  const [loginEmail,setLoginEmail]=useState("");
  const [loginSenha,setLoginSenha]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [showPwd,setShowPwd]=useState(false);
  const [forgotMode,setForgotMode]=useState(false);
  const [showAtribuicoes,setShowAtribuicoes]=useState(null); // usuarioId being configured
  const [scaleLabels,setScaleLabels]=useState(DEFAULT_SCALE_LABELS);
  const [yesnoLabels,setYesnoLabels]=useState(DEFAULT_YESNO_LABELS);
  const [importTab,setImportTab]=useState(null);
  const [importResult,setImportResult]=useState(null);
  const [notifSending,setNotifSending]=useState(false);
  const [progressSaving,setProgressSaving]=useState(false);

  useEffect(()=>{
    async function init(){
      const ao=await loadOrgs();setOrgs(ao);
      // Clean URL routing: /orgSlug/ciclo/formId/avaliadoId
      const pathParts = window.location.pathname.replace(/^\//, "").split("/").filter(Boolean);

      // Handle login URL: /sepal/login
      if(pathParts.length >= 2 && pathParts[1] === "login") {
        const orgData = await loadOrgBySlug(pathParts[0]);
        if(orgData) { setOrg(orgData); setScreen("user_login"); return; }
      }

      // Handle clean URL: /sepal/2025-s1/pares/cassiano-luz
      if(pathParts.length >= 3 && ![""].includes(pathParts[0])) {
        const orgData = await loadOrgBySlug(pathParts[0]);
        if(orgData) {
          setOrg(orgData);
          const f = await loadForms(orgData.id);
          setForms(f);
          setScaleLabels(orgData.scaleLabels || DEFAULT_SCALE_LABELS);
          setYesnoLabels((orgData.yesnoLabels)||DEFAULT_YESNO_LABELS);
          const cicloRaw = pathParts[1] || "";
          const shortMatch = cicloRaw.match(/^(\d{4})-s([12])$/);
          let cDecoded;
          if(shortMatch){ const sem=shortMatch[2]==="1"?"1º":"2º"; cDecoded=`${shortMatch[1]} - ${sem} Semestre`; }
          else { cDecoded = decodeURIComponent(cicloRaw).replace(/-/g," "); }
          setCiclo(cDecoded);
          const idx2 = f.findIndex(x=>x.id===pathParts[2]);
          if(pathParts[3]) {
            const avs = await loadAvaliados(orgData.id);
            const found = avs.find(a=>a.id===pathParts[3]);
            if(found){ setUrlAvaliadoNome(found.nome); setUrlAvaliadoId(found.id); }
          }
          if(idx2>=0){ setFfi(idx2); setScreen("lgpd"); return; }
        }
      }

      const h=window.location.hash||"";
      const pts=h.replace(/^#\//, "").split("/");
      if(pts[0]==="fill"&&pts[1]&&pts[2]&&pts[3]){
        const o=ao[pts[1]];
        if(o){
          setOrg(o);const f=await loadForms(pts[1]);setForms(f);
          setScaleLabels(o.scaleLabels||DEFAULT_SCALE_LABELS);
          // Decode ciclo from URL slug
          // Handles: "2025-s1" -> "2025 - 1º Semestre"
          // Also handles encoded versions like "2025---1%C2%BA-Semestre"
          let rawCiclo = decodeURIComponent(pts[2]);
          let cDecoded;
          const shortMatch = rawCiclo.match(/^(\d{4})-s([12])$/);
          if(shortMatch){
            const sem = shortMatch[2]==="1"?"1º":"2º";
            cDecoded = `${shortMatch[1]} - ${sem} Semestre`;
          } else {
            // Try to match against known CICLOS values
            const cleaned = rawCiclo.replace(/-+/g," ").replace(/\s+/g," ").trim();
            const found = CICLOS.find(ci=>ci.replace(/[^\w]/g,"").toLowerCase()===cleaned.replace(/[^\w]/g,"").toLowerCase());
            cDecoded = found || cleaned;
          }
          setCiclo(cDecoded);
          const idx=f.findIndex(x=>x.id===pts[3]);
          // pts[4] = optional linkId for custom label
          // pts[5] = optional avaliadoId
          if(pts[4]){
            const orgLinks = await loadCustomLinks2(pts[1]);
            const found = orgLinks.find(l=>l.id===pts[4]);
            if(found) setUrlCustomLabel(found.label);
          }
          if(pts[5]){
            const avs = await loadAvaliados(pts[1]);
            const found = avs.find(a=>a.id===pts[5]);
            if(found){ setUrlAvaliadoNome(found.nome); setUrlAvaliadoId(found.id); }
          }
          if(idx>=0){setFfi(idx);setScreen("lgpd");}else setScreen("404");}
        else setScreen("404");
      }else if(pts[0]==="report"&&pts[1]){
        try{
          // Try loading from Supabase first (short ID)
          const d = await loadSharedReport(pts[1]);
          if(d){ window._rd=d; setOrg({name:d.orgName,primaryColor:"#2563eb"}); setScreen("pub_report"); }
          else {
            // Fallback: try base64 decode (legacy links)
            try{
              const d2=JSON.parse(decodeURIComponent(atob(pts[1])));
              window._rd=d2; setOrg({name:d2.orgName,primaryColor:"#2563eb"}); setScreen("pub_report");
            }catch{ setScreen("404"); }
          }
        }catch{ setScreen("404"); }
      }else setScreen("home");
    }
    init();
  },[]);

  const fForm=forms[ffi];const fBloc=fForm?.blocos[fbi];const isLast=fForm&&fbi===fForm.blocos.length-1;
  const dForm=forms[dfi];
  const [dAvaliado,setDAvaliado]=useState(""); // "" = todos
  const dData=resps.filter(r=>r.ciclo===dci&&r.formId===dForm?.id&&(dAvaliado===""||r.avaliadoId===dAvaliado));
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
    const activeCiclo=org?.activeCiclo||CICLOS[0];
    const cicloSlug=activeCiclo
      .replace("1º Semestre","s1").replace("2º Semestre","s2")
      .replace(/[^a-zA-Z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").toLowerCase();
    const result=[];
    forms.forEach(f=>{
      const custom=customLinks.filter(l=>l.formId===f.id);
      const linkLabels = custom.length>0 ? custom : [{id:null, label:f.title}];
      linkLabels.forEach(l=>{
        // If avaliados exist for this form type, generate one link per avaliado
        const needsAvaliado = ["liderados","lideranca_direta","pares","pastoral"].includes(f.id);
        if(needsAvaliado && avaliados.length>0){
          avaliados.forEach(av=>{
            const linkId = l.id ? `/${l.id}` : "";
            const link=`${base}#/fill/${org?.id}/${cicloSlug}/${f.id}${linkId}/${av.id}`;
            result.push({
              title:`${l.label} — ${av.nome}`,
              icon:f.icon, formId:f.id,
              id:`${l.id||f.id}-${av.id}`,
              link,
              avaliado:av,
            });
          });
        } else {
          const linkId = l.id ? `/${l.id}` : "";
          const link=`${base}#/fill/${org?.id}/${cicloSlug}/${f.id}${linkId}`;
          result.push({title:l.label,icon:f.icon,formId:f.id,id:l.id||f.id,link});
        }
      });
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
    const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório 360°</title><style>body{font-family:system-ui,sans-serif;max-width:820px;margin:40px auto;padding:0 24px;color:#1e293b}h1{color:#1e3a8a}table{width:100%;border-collapse:collapse}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}</style></head><body><h1>📊 Relatório de Avaliação 360°</h1><p><strong>${org?.name}</strong> · ${dci} · ${dForm?.title}</p><p style="background:#f0fdf4;border-radius:8px;padding:10px 16px;font-size:12px;color:#166534">🔒 Em conformidade com a LGPD · ${dData.length} respondentes</p><h2 style="margin-top:32px">Pontuação por área</h2><table><tbody>${rowsH}</tbody></table><p style="margin-top:16px;font-size:14px">Média geral: <strong style="font-size:22px;color:#1e3a8a">${mgeral}/5</strong></p>${abList.length>0?`<h2 style="margin-top:32px">Reflexões abertas</h2><ul style="padding-left:20px">${absH}</ul>`:""}<div class="footer">Powered by Conectando Gente · Gerado em ${new Date().toLocaleDateString("pt-BR")}</div></body></html>`;
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8;"}));
    a.download=`relatorio-${org?.name||"org"}-${dci.replace(/ /g,"-")}.html`;a.click();
  }

  async function shareReport(){
    setRepCopied("saving");
    const data={orgName:org?.name,ciclo:dci,formTitle:dForm?.title,total:dData.length,bStats,mgeral,abList,at:new Date().toISOString()};
    const id = await saveSharedReport(org?.id, data);
    if(!id){ alert("Erro ao gerar link. Tente novamente."); setRepCopied(false); return; }
    const base=getBaseUrl();
    const link=`${base}#/report/${id}`;
    copyText(link);
    setRepCopied(true);setTimeout(()=>setRepCopied(false),3000);
  }

  async function loginSuper(){if(superP===SUPER_ADMIN_PASSWORD){setSuperE(false);setScreen("super");}else setSuperE(true);}
  async function loginOrg(o){
    if(orgP===o.adminPassword){
      setOrgE(false);setOrg(o);
      const f=await loadForms(o.id);const r=await loadResps(o.id);
      const cl=await loadCustomLinks2(o.id);
      const sl=o.scaleLabels||DEFAULT_SCALE_LABELS;
      const yl=o.yesnoLabels||DEFAULT_YESNO_LABELS;
      setYesnoLabels(yl);
      const av=await loadAvaliados(o.id);
      setForms(f);setResps(r);setCfg(clone(o));setCustomLinks(cl);setScaleLabels(sl);setAvaliados(av);setScreen("dash");
    }else setOrgE(true);
  }
  async function createOrg(){
    if(!nOrg.name.trim()){setNOrgE("Nome obrigatório");return;}
    if(!nOrg.adminPassword.trim()){setNOrgE("Senha obrigatória");return;}
    // Use custom slug if provided, else derive from name (max 12 chars)
    const baseSlug = nOrg.slug ? slugify(nOrg.slug) : slugify(nOrg.name).slice(0,12);
    const id=baseSlug+"-"+genId(4);
    const o={id,name:san(nOrg.name),adminPassword:nOrg.adminPassword,primaryColor:nOrg.primaryColor,logoUrl:nOrg.logoUrl,createdAt:new Date().toISOString(),activeCiclo:CICLOS[0]};
    const ok = await upsertOrg(o);
    if(!ok){setNOrgE("Erro ao salvar. Verifique a conexão.");return;}
    const u={...orgs,[id]:o};setOrgs(u);
    setNOrg({name:"",adminPassword:"",primaryColor:"#2563eb",logoUrl:"",slug:""});setNOrgE("");
  }
  async function delOrg(id){
    if(!confirm("Remover esta organização? Todos os dados serão perdidos."))return;
    await deleteOrgFromDB(id);
    const u={...orgs};delete u[id];setOrgs(u);
  }
  async function saveCfg(){
    const updated={...cfg,scaleLabels:scaleLabels,yesnoLabels:yesnoLabels,slug:cfg.slug||""};
    const ok = await upsertOrg(updated);
    if(!ok){alert("Erro ao salvar configurações.");return;}
    const u={...orgs,[org.id]:updated};setOrgs(u);setOrg(updated);setCfg(updated);
    alert("Configurações salvas!");
  }
  async function saveFormsBtn(){await saveForms2(org.id,forms);alert("Formulários salvos!");}
  async function handleUserLogin(){
    setLoginErr("");
    if(!loginEmail.trim()||!loginSenha.trim()){setLoginErr("Preencha email e senha.");return;}
    const u = await loginUsuario(org.id, loginEmail.trim(), loginSenha);
    if(!u){setLoginErr("Email ou senha incorretos.");return;}
    setUsuarioLogado(u);
    const f = await loadForms(org.id);
    setForms(f);
    setScaleLabels(org.scaleLabels||DEFAULT_SCALE_LABELS);
    const ats = await loadAtribuicoes(u.id, org.activeCiclo||CICLOS[0]);
    setAtribuicoes(ats);
    setScreen("user_dash");
  }

  async function submitForm(){
    setSaving(true);
    await saveResp(org.id,{
      id:genId(16),ts:Date.now(),ciclo,
      formId:fForm.id,formTitle:fForm.title,
      scores:fForm.blocos.map(b=>({label:b.title,score:bAvg(b,answers)})),
      answers,openAns,
      avaliadoId:urlAvaliadoId||"",
      avaliadoNome:urlAvaliadoNome||"",
    });
    // Mark atribuição as done if came from user dashboard
    if(atribucaoAtual){
      await marcarAtribuicaoConcluida(atribucaoAtual.id);
      setAtribuicoes(p=>p.map(a=>a.id===atribucaoAtual.id?{...a,concluida:true}:a));
      setAtribucaoAtual(null);
      if(usuarioLogado&&org) notifyUser(usuarioLogado,org,"conclusao");
    }
    setSaving(false);setScreen(usuarioLogado?"user_dash":"result");
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
            <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOME *</label><input value={nOrg.name} onChange={e=>setNOrg(p=>({...p,name:e.target.value}))} style={inp} placeholder="Ex: Sepal — Servindo aos que Servem"/></div>
            <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>SENHA DO ADMIN *</label><input type="password" value={nOrg.adminPassword} onChange={e=>setNOrg(p=>({...p,adminPassword:e.target.value}))} style={inp} placeholder="Senha"/></div>
            <div style={{gridColumn:"1 / -1"}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>SLUG DO LINK <span style={{fontWeight:400,color:"#94a3b8"}}>(opcional — define a parte amigável da URL, ex: "sepal")</span></label><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,color:"#94a3b8",whiteSpace:"nowrap"}}>sepal360.vercel.app/#/fill/</span><input value={nOrg.slug||""} onChange={e=>setNOrg(p=>({...p,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")}))} style={{...inp,flex:1}} placeholder="sepal"/></div></div>
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
              <div key={o.id}>
                {/* Row */}
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:editingOrg?.id===o.id?"none":"1px solid #f1f5f9",flexWrap:"wrap"}}>
                  <OrgLogo org={o} size={44}/>
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>{o.name}</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>ID: {o.id} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setEditingOrg(editingOrg?.id===o.id?null:clone(o))}
                      style={{padding:"6px 12px",borderRadius:8,border:"2px solid #dbeafe",background:editingOrg?.id===o.id?"#eff6ff":"#fff",color:"#2563eb",cursor:"pointer",fontSize:12,fontWeight:600}}>
                      {editingOrg?.id===o.id?"✕ Fechar":"✏️ Editar"}
                    </button>
                    <button onClick={()=>delOrg(o.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:12,fontWeight:600}}>Remover</button>
                  </div>
                </div>
                {/* Inline editor */}
                {editingOrg?.id===o.id&&(
                  <div style={{background:"#f8faff",borderRadius:14,padding:20,border:"1px solid #dbeafe",marginBottom:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOME</label>
                        <input value={editingOrg.name} onChange={e=>setEditingOrg(p=>({...p,name:e.target.value}))} style={inp}/>
                      </div>
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOVA SENHA DO ADMIN</label>
                        <input type="password" value={editingOrg.adminPassword||""} onChange={e=>setEditingOrg(p=>({...p,adminPassword:e.target.value}))} style={inp} placeholder="Deixe em branco para manter"/>
                      </div>
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>COR PRINCIPAL</label>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <input type="color" value={editingOrg.primaryColor||"#2563eb"} onChange={e=>setEditingOrg(p=>({...p,primaryColor:e.target.value}))} style={{width:44,height:38,borderRadius:8,border:"2px solid #dbeafe",cursor:"pointer",padding:2}}/>
                          <input value={editingOrg.primaryColor||"#2563eb"} onChange={e=>setEditingOrg(p=>({...p,primaryColor:e.target.value}))} style={{...inp,flex:1}}/>
                        </div>
                      </div>
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:6}}>LOGOMARCA</label>
                        <LogoUploader value={editingOrg.logoUrl||""} onChange={url=>setEditingOrg(p=>({...p,logoUrl:url}))} color={editingOrg.primaryColor||"#2563eb"}/>
                        <input value={editingOrg.logoUrl||""} onChange={e=>setEditingOrg(p=>({...p,logoUrl:e.target.value}))} style={{...inp,marginTop:6,fontSize:11}} placeholder="Ou cole uma URL…"/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={async()=>{
                        await upsertOrg(editingOrg);
                        const updated={...orgs,[editingOrg.id]:editingOrg};
                        setOrgs(updated);setEditingOrg(null);
                      }} style={{...btn("#16a34a")}}>💾 Salvar alterações</button>
                      <button onClick={()=>setEditingOrg(null)} style={{...btnO}}>Cancelar</button>
                    </div>
                  </div>
                )}
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
        <div style={{position:"relative",marginBottom:6}}>
          <input type={showPwd?"text":"password"} placeholder="Senha do administrador" value={orgP}
            onChange={e=>setOrgP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loginOrg(org)}
            style={{...inp,border:`2px solid ${orgE?"#ef4444":"#dbeafe"}`,paddingRight:48}}/>
          <button onClick={()=>setShowPwd(p=>!p)}
            style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#94a3b8",padding:4}}>
            {showPwd?"🙈":"👁️"}
          </button>
        </div>
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
            <button onClick={()=>setScreen("avaliados")} style={{...hBtn,background:"#8b5cf6",fontWeight:700}}>👥 Avaliados</button>
            <button onClick={async()=>{const u=await loadUsuarios(org.id);setUsuarios(u);setScreen("usuarios");}} style={{...hBtn,background:"#0891b2",fontWeight:700}}>🔑 Usuários</button>
            <button onClick={()=>setScreen("settings")} style={{...hBtn,background:"rgba(255,255,255,0.2)"}}>⚙️ Config</button>
            <button onClick={()=>{setScreen("home");setOrg(null);}} style={{...hBtn,background:"rgba(255,255,255,0.15)"}}>Sair</button>
          </div>
        </div>
        <div style={{maxWidth:900,margin:"0 auto",padding:"24px 16px 40px",width:"100%"}}>
          {/* Links diretos - colapsável */}
          <div style={{...card,marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <h3 style={{color:"#1e3a8a",fontSize:15,margin:0}}>🔗 Links diretos</h3>
                <p style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Acesso sem login — opcional</p>
              </div>
              <button onClick={()=>setShowLinks(p=>!p)}
                style={{padding:"7px 14px",borderRadius:8,border:"2px solid #dbeafe",background:"#fff",color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>
                {showLinks?"▲ Ocultar":"▼ Mostrar"}
              </button>
            </div>
            {showLinks&&<>
            <div style={{marginTop:16,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <select value={org.activeCiclo||CICLOS[0]} onChange={async e=>{const updated={...org,activeCiclo:e.target.value};await upsertOrg(updated);const u={...orgs,[org.id]:updated};setOrgs(u);setOrg(updated);}} style={{padding:"6px 10px",borderRadius:8,border:"2px solid #dbeafe",fontSize:12,outline:"none",fontWeight:600,color:"#334155"}}>
                {CICLOS.map(c=><option key={c}>{c}</option>)}
              </select>
              <button onClick={()=>setScreen("links_editor")} style={{padding:"7px 14px",borderRadius:8,border:"2px solid "+pc,background:"#fff",color:pc,cursor:"pointer",fontSize:12,fontWeight:700}}>✏️ Editar</button>
            </div>
                    {/* Warning about URL base */}
            {/* URL base notice */}
            {!org.baseUrl&&(
              <div style={{background:"#fefce8",borderRadius:10,padding:"10px 14px",border:"1px solid #fde68a",marginBottom:14,fontSize:12,color:"#92400e",display:"flex",alignItems:"center",gap:8}}>
                ⚠️ <span>Configure a <strong>URL do app</strong> nas configurações para gerar links corretos. Atualmente os links podem apontar para o Claude.</span>
                <button onClick={()=>setScreen("settings")} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,border:"none",background:"#f59e0b",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Configurar</button>
              </div>
            )}
            {links.map(l=><LinkCard key={l.id} label={`${l.icon} ${l.title}`} link={l.link} color={pc}/>)}
            </>
            }
          </div>

          <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:150}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>CICLO</label><select value={dci} onChange={e=>setDci(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #dbeafe",fontSize:13,outline:"none"}}>{CICLOS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{flex:1,minWidth:150}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>FORMULÁRIO</label><select value={dfi} onChange={e=>setDfi(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #dbeafe",fontSize:13,outline:"none"}}>{forms.map((f,i)=><option key={f.id} value={i}>{f.icon} {f.title}</option>)}</select></div>
            <div style={{flex:1,minWidth:150}}><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>AVALIADO</label><select value={dAvaliado} onChange={e=>setDAvaliado(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #dbeafe",fontSize:13,outline:"none"}}><option value="">Todos</option>{avaliados.map(a=><option key={a.id} value={a.id}>{a.nome}{a.funcao?` — ${a.funcao}`:""}</option>)}</select></div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={exportCSV} style={{...btn("#475569"),padding:"10px 14px",fontSize:12}} title="Baixar dados CSV">⬇️ CSV</button>
              <button onClick={exportHTML} style={{...btn("#7c3aed"),padding:"10px 14px",fontSize:12}} title="Baixar relatório HTML">📄 Relatório</button>
              <button onClick={shareReport} style={{...btn(repCopied?"#16a34a":"#0891b2"),padding:"10px 14px",fontSize:12}} title="Copiar link público do relatório">{repCopied==="saving"?"⏳ Gerando...":repCopied?"✓ Link copiado!":"🔗 Compartilhar"}</button>
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
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>SLUG <span style={{fontWeight:400,color:"#94a3b8"}}>(parte amigável da URL, ex: "sepal")</span></label>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"#94a3b8",whiteSpace:"nowrap"}}>avalie360.vercel.app/</span>
              <input value={cfg.slug||""} onChange={e=>setCfg(p=>({...p,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")}))} style={{...inp,flex:1}} placeholder="sepal"/>
            </div>
            <p style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Link de login: <strong>{cfg.baseUrl||"avalie360.vercel.app"}/{cfg.slug||"slug"}/login</strong></p>
          </div>
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
        <div style={{...card,marginBottom:16}}>
          <h3 style={{color:"#1e3a8a",marginBottom:4,fontSize:15}}>⚠️ Escala Sim/Não/Atenção</h3>
          <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Usada nos blocos de "Riscos e sinais preventivos".</p>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"10px 12px",alignItems:"center"}}>
            {[1,2,0].map(v=>(
              <>
                <div key={"n"+v} style={{width:32,height:32,borderRadius:8,background:YESNO_COLORS[v],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>
                  {v===1?"S":v===2?"!":"N"}
                </div>
                <input key={"i"+v} value={yesnoLabels[v]||""} onChange={e=>setYesnoLabels(p=>({...p,[v]:e.target.value}))}
                  style={{...inp,padding:"8px 12px"}} placeholder={DEFAULT_YESNO_LABELS[v]}/>
              </>
            ))}
          </div>
          <button onClick={()=>setYesnoLabels(DEFAULT_YESNO_LABELS)} style={{marginTop:12,padding:"6px 14px",borderRadius:8,border:"2px solid #dbeafe",background:"#fff",color:"#64748b",cursor:"pointer",fontSize:12}}>
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
    <div style={{minHeight:"100vh",background:"#f0f0f0",fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{height:6,background:pc,flexShrink:0}}/>
      <div style={{flex:1,padding:"32px 24px 24px",maxWidth:500,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:32}}>
          <OrgLogo org={org} size={56}/>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#1a1a1a",lineHeight:1.2}}>{urlCustomLabel||fForm.title}</div>
            {urlAvaliadoNome&&<div style={{fontSize:13,color:pc,fontWeight:700,marginTop:4}}>👤 Avaliando: {urlAvaliadoNome}</div>}
            <div style={{fontSize:12,color:"#888",marginTop:2}}>{org.name} · {ciclo}</div>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:20,boxShadow:"0 2px 8px #0001"}}>
          <p style={{fontSize:12,color:"#444",lineHeight:1.8,margin:0}}>🔒 {LGPD}</p>
        </div>
        <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:28,background:"#fff",borderRadius:14,padding:16,boxShadow:"0 2px 8px #0001"}}>
          <input type="checkbox" checked={lgpd} onChange={e=>setLgpd(e.target.checked)} style={{marginTop:2,width:18,height:18,cursor:"pointer",accentColor:pc}}/>
          <span style={{fontSize:13,color:"#334155",lineHeight:1.6}}>Compreendo que minhas respostas são anônimas e concordo com os termos acima.</span>
        </label>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={()=>{if(lgpd){setFbi(0);setAnswers({});setOpenAns({});setScreen("form");}}} disabled={!lgpd}
            style={{padding:"15px 48px",borderRadius:12,border:"none",background:pc,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",opacity:lgpd?1:0.4,boxShadow:`0 4px 12px ${pc}33`}}>
            Iniciar →
          </button>
        </div>
      </div>
      <PoweredBy/>
    </div>
  );

  if(screen==="form"&&org&&fForm&&fBloc) return(
    <div style={{minHeight:"100vh",background:"#f0f0f0",fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{position:"sticky",top:0,zIndex:10,background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"10px 16px",boxShadow:"0 2px 8px #0001"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <OrgLogo org={org} size={32}/>
              <div>
                <div style={{fontWeight:700,color:"#1e3a8a",fontSize:13,lineHeight:1.2}}>{urlAvaliadoNome?`Avaliando: ${urlAvaliadoNome}`:fForm.title}</div>
                {urlAvaliadoNome&&<div style={{fontSize:10,color:"#64748b"}}>{fForm.title}</div>}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:700,color:pc}}>{fbi+1}/{fForm.blocos.length}</div>
              <div style={{fontSize:10,color:"#94a3b8"}}>blocos</div>
            </div>
          </div>
          <div style={{background:"#e2e8f0",borderRadius:8,height:4}}><div style={{width:`${((fbi+1)/fForm.blocos.length)*100}%`,background:pc,height:4,borderRadius:8,transition:"width 0.4s"}}/></div>
        </div>
      </div>
      <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px 80px",flex:1,width:"100%",boxSizing:"border-box"}}>
        <div style={{marginBottom:20,paddingBottom:16,borderBottom:"2px solid #eff6ff"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24}}>{fBloc.icon}</span>
            <h2 style={{color:"#1e3a8a",fontSize:17,margin:0,fontWeight:700}}>{fBloc.title}</h2>
          </div>
        </div>
        {fBloc.perguntas.map((p,i)=>(
          <div key={i} style={{marginBottom:16,background:"#fff",borderRadius:14,padding:"16px",boxShadow:"0 1px 4px #0001"}}>
            <p style={{color:"#1e293b",fontSize:14,lineHeight:1.6,marginBottom:12,fontWeight:500}}>{p}</p>
            {fBloc.scaleType==="yesno" ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[1,2,0].map(v=>{
                  const sel=answers[`${fBloc.id}_${i}`]===v;
                  const label=yesnoLabels[v]||DEFAULT_YESNO_LABELS[v];
                  const col=YESNO_COLORS[v];
                  return(
                    <button key={v} onClick={()=>setAnswers(r=>({...r,[`${fBloc.id}_${i}`]:v}))}
                      style={{padding:"14px 8px",borderRadius:12,border:`2px solid ${sel?col:"#e2e8f0"}`,
                        background:sel?col:"#fff",color:sel?"#fff":"#475569",
                        cursor:"pointer",fontSize:13,fontWeight:700,transition:"all 0.15s",
                        boxShadow:sel?`0 2px 8px ${col}44`:"none"}}>
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {[1,2,3,4,5,0].map(v=>{
                  const sel=answers[`${fBloc.id}_${i}`]===v;
                  const label=scaleLabels[v]||DEFAULT_SCALE_LABELS[v];
                  return(
                    <button key={v} onClick={()=>setAnswers(r=>({...r,[`${fBloc.id}_${i}`]:v}))}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",
                        justifyContent:"center",
                        padding:"8px 2px",borderRadius:10,minHeight:58,
                        border:`2px solid ${sel?SC[v]:"#e2e8f0"}`,
                        background:sel?SC[v]:"#f8fafc",color:sel?"#fff":"#475569",
                        cursor:"pointer",fontSize:10,fontWeight:600,transition:"all 0.15s",
                        width:"100%",boxSizing:"border-box",lineHeight:1.2}}>
                      {v!==0&&<span style={{fontSize:15,fontWeight:800,lineHeight:1.2}}>{v}</span>}
                      <span style={{textAlign:"center",lineHeight:1.3,wordBreak:"break-word",maxWidth:"100%"}}>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
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
        <div style={{display:"flex",gap:12,marginTop:28,paddingTop:16}}>
          <button onClick={()=>fbi===0?setScreen("lgpd"):setFbi(b=>b-1)} style={{...btnO,flex:1,borderRadius:12,padding:"13px 0"}}>← Voltar</button>
          {isLast
            ?<button onClick={submitForm} disabled={saving} style={{...btn(pc),flex:2,borderRadius:12,padding:"13px 0",opacity:saving?0.6:1,fontSize:14}}>{saving?"Salvando…":"Enviar avaliação ✓"}</button>
            :<button onClick={async()=>{
                if(usuarioLogado&&atribucaoAtual){
                  saveProgress(usuarioLogado.id,atribucaoAtual.id,org.id,fbi+1,answers,openAns).catch(()=>{});
                }
                setFbi(b=>b+1);
              }} style={{...btn(pc),flex:2,borderRadius:12,padding:"13px 0",fontSize:14}}>Próximo →</button>
          }
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
          <div style={{background:"#f0fdf4",borderRadius:10,padding:12,marginTop:16,fontSize:12,color:"#166534"}}>Em conformidade com a LGPD</div>
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

            )}          )}

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

  // ── AVALIADOS SCREEN ──
  if(screen==="avaliados"&&org){
    async function addAvaliado(){
      if(!newAvaliado.nome.trim()) return;
      const avSlug=slugify(newAvaliado.nome).slice(0,30)||genId(8);
      const av={id:avSlug,org_id:org.id,nome:san(newAvaliado.nome),funcao:san(newAvaliado.funcao),ativo:true,created_at:new Date().toISOString()};
      await saveAvaliado(av);
      setAvaliados(p=>[...p,av]);
      setNewAvaliado({nome:"",funcao:""});
    }
    async function removeAvaliado(id){
      if(!confirm("Remover este avaliado?")) return;
      await deleteAvaliado(id);
      setAvaliados(p=>p.filter(a=>a.id!==id));
    }
    return(
      <div style={{minHeight:"100vh",background:"#f8faff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <div style={{...hdr(pc),position:"sticky",top:0,zIndex:20}}>
          <div><div style={{fontWeight:800,fontSize:15}}>👥 Avaliados — {org.name}</div><div style={{fontSize:11,opacity:0.75}}>Cadastre as pessoas que serão avaliadas</div></div>
          <button onClick={()=>setScreen("dash")} style={{...hBtn,border:"2px solid rgba(255,255,255,0.3)",background:"none"}}>← Voltar</button>
        </div>
        <div style={{maxWidth:700,margin:"0 auto",padding:"24px 16px 60px"}}>
          <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 16px",border:"1px solid #bfdbfe",marginBottom:20,fontSize:12,color:"#1e40af"}}>
            💡 Cadastre aqui as pessoas que serão avaliadas. O sistema vai gerar um link individual para cada uma delas em cada formulário.
          </div>
          {/* Add new */}
          <div style={{...card,marginBottom:20}}>
            <h3 style={{color:"#1e3a8a",fontSize:15,marginBottom:16}}>➕ Adicionar avaliado</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOME *</label>
                <input value={newAvaliado.nome} onChange={e=>setNewAvaliado(p=>({...p,nome:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&addAvaliado()}
                  style={inp} placeholder="Ex: Cassiano Luz"/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>FUNÇÃO</label>
                <input value={newAvaliado.funcao} onChange={e=>setNewAvaliado(p=>({...p,funcao:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&addAvaliado()}
                  style={inp} placeholder="Ex: Diretor Executivo"/>
              </div>
            </div>
            <button onClick={addAvaliado} style={{...btn("#8b5cf6")}}>➕ Adicionar</button>
          </div>
          {/* List */}
          <div style={{...card}}>
            <h3 style={{color:"#1e3a8a",fontSize:15,marginBottom:16}}>📋 Avaliados cadastrados ({avaliados.length})</h3>
            {avaliados.length===0?(
              <p style={{color:"#94a3b8",textAlign:"center",padding:"24px 0",fontSize:13}}>Nenhum avaliado cadastrado ainda.</p>
            ):(
              avaliados.map(av=>(
                <div key={av.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <div style={{width:40,height:40,borderRadius:10,background:pc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>
                    {av.nome.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>{av.nome}</div>
                    {av.funcao&&<div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{av.funcao}</div>}
                  </div>
                  <button onClick={()=>removeAvaliado(av.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:12,fontWeight:600}}>Remover</button>
                </div>
              ))
            )}
          </div>
        </div>
        <PoweredBy/>
      </div>
    );
  }

  // ── USER LOGIN ──
  if(screen==="user_login"&&org) return(
    <div style={{minHeight:"100vh",background:"#f0f0f0",fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Top color bar */}
      <div style={{height:80,background:org.primaryColor||"#2563eb",flexShrink:0}}/>
      {/* Main content */}
      <div style={{flex:1,padding:"32px 24px 24px",display:"flex",flexDirection:"column",maxWidth:440,margin:"0 auto",width:"100%"}}>
        {/* Logo + title */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:48}}>
          <OrgLogo org={org} size={72}/>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#1a1a1a",lineHeight:1.2}}>Login</div>
            <div style={{fontSize:13,color:"#666",marginTop:4}}>{org.name}</div>
          </div>
        </div>
        {/* Fields */}
        <input type="email" placeholder="Seu email" value={loginEmail}
          onChange={e=>setLoginEmail(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleUserLogin()}
          style={{width:"100%",padding:"18px 20px",borderRadius:14,border:"none",background:"#fff",fontSize:15,outline:"none",marginBottom:16,boxSizing:"border-box",boxShadow:"0 2px 8px #0001",color:"#333"}}/>
        <div style={{position:"relative",marginBottom:6}}>
          <input type={showPwd?"text":"password"} placeholder="Senha" value={loginSenha}
            onChange={e=>setLoginSenha(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleUserLogin()}
            style={{width:"100%",padding:"18px 56px 18px 20px",borderRadius:14,border:`2px solid ${loginErr?"#ef4444":"transparent"}`,background:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",boxShadow:"0 2px 8px #0001",color:"#333"}}/>
          <button onClick={()=>setShowPwd(p=>!p)}
            style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#94a3b8",padding:4}}>
            {showPwd?"🙈":"👁️"}
          </button>
        </div>
        {loginErr&&<p style={{color:"#ef4444",fontSize:12,marginBottom:8,paddingLeft:4}}>{loginErr}</p>}
        {forgotMode?(
          <div style={{background:"#eff6ff",borderRadius:14,padding:16,marginTop:8}}>
            <p style={{fontSize:13,color:"#1e3a8a",fontWeight:700,marginBottom:8}}>Esqueci minha senha</p>
            <p style={{fontSize:12,color:"#475569",lineHeight:1.7,marginBottom:12}}>
              Entre em contato com o administrador da sua organização para redefinir sua senha. 
              O administrador pode alterar sua senha na tela de <strong>🔑 Usuários</strong> do painel administrativo.
            </p>
            <button onClick={()=>setForgotMode(false)} style={{fontSize:12,color:"#2563eb",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>← Voltar ao login</button>
          </div>
        ):(
          <>
            <button onClick={()=>setForgotMode(true)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:12,cursor:"pointer",padding:"4px 0",textAlign:"left",marginTop:4}}>
              Esqueci minha senha
            </button>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
              <button onClick={handleUserLogin}
                style={{padding:"15px 48px",borderRadius:12,border:"none",background:org.primaryColor||"#2563eb",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px #2563eb33"}}>
                Entrar
              </button>
            </div>
          </>
        )}
        <p style={{fontSize:11,color:"#94a3b8",marginTop:32,lineHeight:1.7,textAlign:"center"}}>
          🔒 Suas respostas são anônimas. Os administradores veem apenas resultados agregados, sem identificação pessoal.
        </p>
      </div>
      <PoweredBy/>
    </div>
  );

  // ── USER DASHBOARD (painel do avaliador) ──
  if(screen==="user_dash"&&org&&usuarioLogado) return(
    <div style={{...pg,padding:0}}>
      <div style={{background:org.primaryColor||"#2563eb",color:"#fff",padding:"16px 20px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <OrgLogo org={org} size={40}/>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>Olá, {usuarioLogado.nome.split(" ")[0]}!</div>
            <div style={{fontSize:12,opacity:0.8,marginTop:2}}>{org.name}</div>
          </div>
        </div>
        <button onClick={()=>{setUsuarioLogado(null);setAtribuicoes([]);setScreen("user_login");}}
          style={{background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:600}}>Sair</button>
      </div>
      <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px 40px",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h2 style={{color:"#1e3a8a",fontSize:16,margin:0}}>Suas avaliações</h2>
            <p style={{fontSize:12,color:"#64748b",marginTop:4}}>Ciclo: <strong>{org.activeCiclo||CICLOS[0]}</strong></p>
          </div>
          <div style={{background:"#eff6ff",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,color:org.primaryColor||"#2563eb"}}>
            {atribuicoes.filter(a=>a.concluida).length}/{atribuicoes.length} concluídas
          </div>
        </div>
        {atribuicoes.length===0?(
          <div style={{...card,textAlign:"center",padding:40}}>
            <div style={{fontSize:40,marginBottom:12}}>📋</div>
            <p style={{color:"#64748b"}}>Nenhuma avaliação atribuída ainda.</p>
            <p style={{color:"#94a3b8",fontSize:12,marginTop:8}}>Aguarde seu administrador configurar as avaliações.</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {atribuicoes.map(at=>{
              const formDef=forms.find(f=>f.id===at.form_id);
              if(!formDef) return null;
              return(
                <div key={at.id} style={{background:"#fff",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,
                  opacity:at.concluida?0.65:1,
                  boxShadow:"0 2px 8px #0001",
                  borderLeft:`4px solid ${at.concluida?"#10b981":org.primaryColor||"#2563eb"}`}}>
                  <span style={{fontSize:24}}>{formDef.icon}</span>
                  <div style={{flex:1}}>
                    {at.avaliado_nome ? (
                      <>
                        <div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>
                          Avalie {at.avaliado_nome}{at.avaliado_funcao ? ` como ${at.avaliado_funcao}` : ""}
                        </div>

                      </>
                    ) : (
                      <div style={{fontWeight:700,color:"#1e3a8a",fontSize:14}}>{formDef.title}</div>
                    )}
                    {at.concluida&&<div style={{fontSize:11,color:"#10b981",marginTop:2}}>✓ Concluída</div>}
                  </div>
                  {!at.concluida&&(
                    <button onClick={()=>{
                      const idx=forms.findIndex(f=>f.id===at.form_id);
                      setFfi(idx);setFbi(0);setAnswers({});setOpenAns({});
                      setUrlAvaliadoNome(at.avaliado_nome||"");
                      setUrlAvaliadoId(at.avaliado_id||"");
                      setAtribucaoAtual(at);
                      setLgpd(false);
                      setScreen("lgpd");
                    }} style={{...btn(org.primaryColor||"#2563eb"),padding:"8px 16px",fontSize:12}}>
                      Responder →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div style={{marginTop:24,padding:"12px 16px",background:"#f0fdf4",borderRadius:12,border:"1px solid #bbf7d0",fontSize:11,color:"#166534"}}>
          🔒 Suas respostas são anônimas. Os administradores veem apenas resultados agregados, sem identificação pessoal. Em conformidade com a LGPD.
        </div>
      </div>
      <PoweredBy/>
    </div>
  );

  // ── USUARIOS MANAGEMENT ──
  if(screen==="usuarios"&&org){
    const pc2=org.primaryColor||"#2563eb";
    return(
      <div style={{minHeight:"100vh",background:"#f8faff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <div style={{...hdr(pc2),position:"sticky",top:0,zIndex:20}}>
          <div><div style={{fontWeight:800,fontSize:15}}>🔑 Usuários — {org.name}</div><div style={{fontSize:11,opacity:0.75}}>Cadastre os avaliadores e configure suas avaliações</div></div>
          <button onClick={()=>setScreen("dash")} style={{...hBtn,border:"2px solid rgba(255,255,255,0.3)",background:"none"}}>← Voltar</button>
        </div>
        <div style={{maxWidth:800,margin:"0 auto",padding:"24px 16px 60px"}}>
          <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 16px",border:"1px solid #bfdbfe",marginBottom:20,fontSize:12,color:"#1e40af"}}>
            💡 Cadastre os avaliadores, defina as avaliações de cada um. O link de login da organização é: <strong>{(org.baseUrl||"avalie360.vercel.app")}/{org.slug||"(configure o slug em ⚙️ Config)"}/login</strong>
          </div>

          {/* Add user */}
          <div style={{...card,marginBottom:20}}>
            <h3 style={{color:"#1e3a8a",fontSize:15,marginBottom:16}}>➕ Novo usuário</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>NOME *</label>
                <input value={newUsuario.nome} onChange={e=>setNewUsuario(p=>({...p,nome:e.target.value}))} style={inp} placeholder="Nome completo"/></div>
              <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>EMAIL *</label>
                <input type="email" value={newUsuario.email} onChange={e=>setNewUsuario(p=>({...p,email:e.target.value}))} style={inp} placeholder="email@org.com"/></div>
              <div><label style={{fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4}}>SENHA *</label>
                <div style={{position:"relative"}}>
                  <input type={showPwd?"text":"password"} value={newUsuario.senha} onChange={e=>setNewUsuario(p=>({...p,senha:e.target.value}))} style={{...inp,paddingRight:44}} placeholder="Senha inicial"/>
                  <button onClick={()=>setShowPwd(p=>!p)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8"}}>{showPwd?"🙈":"👁️"}</button>
                </div></div>
            </div>
            <button onClick={async()=>{
              if(!newUsuario.nome.trim()||!newUsuario.email.trim()||!newUsuario.senha.trim()) return;
              const u={id:genId(10),org_id:org.id,nome:san(newUsuario.nome),email:newUsuario.email.toLowerCase().trim(),senha_hash:simpleHash(newUsuario.senha),ativo:true,created_at:new Date().toISOString()};
              await saveUsuario(u);
              setUsuarios(p=>[...p,u]);
              setNewUsuario({nome:"",email:"",senha:""});
            }} style={{...btn("#0891b2")}}>➕ Adicionar usuário</button>
          </div>

          {/* Users list */}
          <div style={{...card}}>
            <h3 style={{color:"#1e3a8a",fontSize:15,marginBottom:16}}>👥 Usuários cadastrados ({usuarios.length})</h3>
            {usuarios.length===0?<p style={{color:"#94a3b8",textAlign:"center",padding:"24px 0",fontSize:13}}>Nenhum usuário cadastrado.</p>:
              usuarios.map(u=>(
                <div key={u.id}>
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f1f5f9",flexWrap:"wrap"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:pc2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>
                      {u.nome.slice(0,2).toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontWeight:700,color:"#1e3a8a",fontSize:13}}>{u.nome}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{u.email}</div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setShowAtribuicoes(showAtribuicoes===u.id?null:u.id)}
                        style={{padding:"5px 10px",borderRadius:8,border:`2px solid ${pc2}`,background:showAtribuicoes===u.id?"#eff6ff":"#fff",color:pc2,cursor:"pointer",fontSize:11,fontWeight:700}}>
                        📋 Avaliações
                      </button>
                      <button onClick={async()=>{
                          const nova=prompt("Nova senha para "+u.nome+":");
                          if(!nova||nova.length<4){alert("Senha muito curta.");return;}
                          await sbFetch(`usuarios?id=eq.${u.id}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify({senha_hash:simpleHash(nova)})});
                          alert("Senha alterada com sucesso!");
                        }} style={{padding:"5px 10px",borderRadius:8,border:"2px solid #f59e0b",background:"#fefce8",color:"#d97706",cursor:"pointer",fontSize:11,fontWeight:600}}>🔑 Senha</button>
                      <button onClick={async()=>{if(!confirm("Remover usuário?"))return;await deleteUsuario(u.id);setUsuarios(p=>p.filter(x=>x.id!==u.id));}}
                        style={{padding:"5px 10px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",cursor:"pointer",fontSize:11,fontWeight:600}}>Remover</button>
                    </div>
                  </div>
                  {/* Atribuições inline */}
                  {showAtribuicoes===u.id&&(
                    <AtribuicoesEditor
                      usuario={u} org={org} forms={forms} avaliados={avaliados}
                      ciclo={org.activeCiclo||CICLOS[0]}
                      inp={inp} btn={btn} pc={pc2}
                    />
                  )}
                </div>
              ))
            }
          </div>
        </div>
        <PoweredBy/>
      </div>
    );
  }

  return <div style={{...pg,alignItems:"center",justifyContent:"center"}}><div style={{fontSize:32}}>⏳</div></div>;
}
