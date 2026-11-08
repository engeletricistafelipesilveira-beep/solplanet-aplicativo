import React, { useState, useEffect, useRef } from 'react';
import { 
  Mountain, 
  Key, 
  User, 
  LogOut, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  PenSquare, 
  Trash2, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeft, 
  RotateCcw, 
  Flag, 
  Layers, 
  UserPlus, 
  Clock, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  LayoutGrid, 
  ShieldAlert, 
  ShieldCheck, 
  FileDown,
  Eye,
  EyeOff 
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE COMPATÍVEL COM ES2015 / VITE / NETLIFY / ENVIRONMENT VARIABLES ---
const getEnvVar = (name) => {
  try {
    // Acessa variáveis de ambiente via process.env ou substituição segura em tempo de build
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {}

  try {
    // Safely retrieve Vite/ESM environment variables using globalThis/window check
    const meta = (new Function('return typeof import.meta !== "undefined" ? import.meta : null'))();
    if (meta && meta.env && meta.env[name]) {
      return meta.env[name];
    }
  } catch (e) {}

  return null;
};

// --- CONFIGURAÇÃO SUPABASE DIRETA PARA VITE / NETLIFY ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vzdspycdxealiemdqvfc.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sua_chave_anon_aqui";

// Lightweight REST/Supabase client implementation para Netlify / Vite sem dependências NPM pesadas
const supabaseClient = {
  from: (table) => ({
    select: (cols) => ({
      eq: async (column, val) => {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(val)}&select=${cols}`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
          });
          if (!res.ok) return { data: null, error: res.statusText };
          const data = await res.json();
          return { data, error: null };
        } catch (e) {
          return { data: null, error: e };
        }
      }
    }),
    upsert: async (values, options = {}) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=app_id,key`, {
          method: 'POST',
          headers: { 
            'apikey': SUPABASE_ANON_KEY, 
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(values)
        });
        if (!res.ok) {
          const errText = await res.text();
          return { data: null, error: errText };
        }
        return { data: values, error: null };
      } catch (e) {
        return { data: null, error: e };
      }
    }
  })
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'solplanet-process-app';

// MOCK DATA INICIAL (Caso o Supabase esteja desconectado ou em modo fallback)
const INITIAL_USERS = [
  { id: '1', username: 'Admin', password: 'Admin', name: 'Admin', role: 'Master' },
  { id: '2', username: 'admin_user', password: '123456', name: 'Carlos Andrade', role: 'Admin' },
  { id: '3', username: 'user_int', password: '123456', name: 'Juliana Costa', role: 'Usuário Interno' },
  { id: '4', username: 'user_ext', password: '123456', name: 'Técnico Externo', role: 'Usuário Externo' }
];

const INITIAL_AREAS = [
  { id: 'a1', name: 'Diagnóstico Técnico', subareas: ['Inversores Monofásicos', 'Inversores Trifásicos', 'Baterias HV'] },
  { id: 'a2', name: 'Garantia & Suporte', subareas: ['Substituição', 'Análise de Peças', 'Laudo Técnico'] },
  { id: 'a3', name: 'Vendas & Processos', subareas: ['Cadastramento', 'Orçamentos'] }
];

const INITIAL_TOOLTIPS = {
  procName: 'Insira um título claro e descritivo para o procedimento de trabalho ou tratativa técnica.',
  procArea: 'Selecione a área operacional responsável por este fluxo.',
  procSubarea: 'Especifique a subárea correspondente para organizar o catálogo.',
  procVisibility: 'Processos Internos só são visíveis por usuários cadastrados. Públicos podem ser lidos por externos.',
  procDesc: 'Forneça um breve resumo contextualizando o objetivo deste fluxograma.',
  stepTitle: 'Nome descritivo da etapa atual do processo.',
  stepContent: 'Descreva a instrução para o operador ou técnico neste ponto específico.'
};

const INITIAL_PROCESSES = [
  {
    id: 'PROC-E03',
    code: 'E03-PV',
    title: 'Tratativa do Erro E03 (Falha de Isolamento PV)',
    area: 'Diagnóstico Técnico',
    subarea: 'Inversores Trifásicos',
    visibility: 'Público',
    description: 'Guia passo a passo para diagnóstico e solução da falha de isolamento CC em inversores Solplanet.',
    updatedAt: '2026-11-06 14:20',
    steps: [
      {
        id: 'step-1',
        title: 'Verificação Inicial do Status',
        elements: [
          { type: 'text', content: 'O alarme E03 indica baixa resistência de isolamento dos módulos FV em relação à terra.' },
          { type: 'text', content: 'Certifique-se de utilizar os EPIs adequados (luvas isolantes, óculos e calçado de segurança) antes de mexer nas conexões elétricas.' }
        ],
        decisions: [
          { text: 'Inversor em horário diurno com sol e apresentando E03', nextStepId: 'step-2', nextProcessId: '' },
          { text: 'Erro ocorre apenas durante/após dias de chuva', nextStepId: 'step-3', nextProcessId: '' }
        ]
      },
      {
        id: 'step-2',
        title: 'Medição de Tensão e Isolamento CC',
        elements: [
          { type: 'text', content: 'Desconecte as strings e meça a resistência de isolamento com Megômetro entre o polo positivo/negativo e o aterramento.' },
          { type: 'image', url: 'https://placehold.co/700x350/1e293b/ffffff?text=Diagrama+de+Medicao+com+Megometro' }
        ],
        decisions: [
          { text: 'Isolamento menor que 1MΩ encontrado', nextStepId: 'step-3', nextProcessId: '' },
          { text: 'Isolamento normal (>2MΩ)', nextStepId: 'step-end', nextProcessId: '' }
        ]
      },
      {
        id: 'step-3',
        title: 'Identificação de Cabo Danificado / Conector',
        elements: [
          { type: 'text', content: 'Inspecione visualmente as conexões MC4 e a prensa-cabos da caixa de junção procurando por umidade ou prensagem excessiva.' }
        ],
        decisions: [
          { text: 'Problema solucionado', nextStepId: 'step-end', nextProcessId: '' },
          { text: 'Falha permanece interna ao inversor', nextStepId: '', nextProcessId: 'PROC-RMA' }
        ]
      },
      {
        id: 'step-end',
        title: 'Conclusão e Reinício',
        elements: [
          { type: 'text', content: 'Reconecte o inversor e verifique o painel LED. O status deve retornar para normal verde piscar em 60 segundos.' }
        ],
        decisions: []
      }
    ]
  },
  {
    id: 'PROC-RMA',
    code: 'RMA-01',
    title: 'Abertura e Trâmite de Garantia (RMA Solplanet)',
    area: 'Garantia & Suporte',
    subarea: 'Substituição',
    visibility: 'Interno',
    description: 'Procedimento para solicitação de troca de equipamento em garantia após diagnóstico confirmado.',
    updatedAt: '2026-11-05 09:15',
    steps: [
      {
        id: 'rma-step-1',
        title: 'Coleta de Dados do Equipamento',
        elements: [
          { type: 'text', content: 'Tenha em mãos o número de série (S/N) da etiqueta lateral do inversor e a Nota Fiscal de compra.' },
          { type: 'image', url: 'https://placehold.co/700x250/a31d5b/ffffff?text=Localizacao+do+Numero+de+Serie+Solplanet' }
        ],
        decisions: [
          { text: 'Prosseguir com preenchimento do formulário', nextStepId: 'rma-step-2', nextProcessId: '' }
        ]
      },
      {
        id: 'rma-step-2',
        title: 'Formulário de Protocolo de Troca',
        elements: [
          { type: 'text', content: 'Anexe os registros fotográficos dos testes efetuados e envie o arquivo para o portal de suporte.' }
        ],
        decisions: []
      }
    ]
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Supabase Synced States
  const [logo, setLogo] = useState('https://placehold.co/140x35/a31d5b/ffffff?text=Solplanet');
  const [usersList, setUsersList] = useState([]);
  const [areasList, setAreasList] = useState([]);
  const [infoTooltips, setInfoTooltips] = useState(INITIAL_TOOLTIPS);
  const [processes, setProcesses] = useState([]);
  const [errorReports, setErrorReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // App Navigation & Filters
  const [currentView, setCurrentView] = useState('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('');
  const [selectedSubareaFilter, setSelectedSubareaFilter] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active Process & Modals
  const [activeProcess, setActiveProcess] = useState(null);
  const [activeStepId, setActiveStepId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [editingTooltipKey, setEditingTooltipKey] = useState(null);
  const [reportingContext, setReportingContext] = useState(null);

  // Notifications Toast
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // --- 1. SUPABASE DATA FETCH & REALTIME LISTENERS ---
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('system_config')
          .select('*')
          .eq('app_id', appId);

        if (error || !data || data.length === 0) {
          await initializeDefaultSupabaseData();
        } else {
          data.forEach(item => {
            if (item.key === 'general') {
              if (item.payload?.logo) setLogo(item.payload.logo);
              if (item.payload?.infoTooltips) setInfoTooltips(item.payload.infoTooltips);
            } else if (item.key === 'users') {
              setUsersList(item.payload?.items || INITIAL_USERS);
            } else if (item.key === 'areas') {
              setAreasList(item.payload?.items || INITIAL_AREAS);
            } else if (item.key === 'processes') {
              setProcesses(item.payload?.items || INITIAL_PROCESSES);
            } else if (item.key === 'reports') {
              setErrorReports(item.payload?.items || []);
            } else if (item.key === 'logs') {
              setAuditLogs(item.payload?.items || []);
            }
          });
        }
      } catch (err) {
        console.warn("Usando fallback de dados iniciais:", err);
        setUsersList(INITIAL_USERS);
        setAreasList(INITIAL_AREAS);
        setProcesses(INITIAL_PROCESSES);
      }
    };

    fetchSupabaseData();
  }, []);

  const initializeDefaultSupabaseData = async () => {
    try {
      await supabaseClient.from('system_config').upsert([
        { app_id: appId, key: 'general', payload: { logo: 'https://placehold.co/140x35/a31d5b/ffffff?text=Solplanet', infoTooltips: INITIAL_TOOLTIPS } },
        { app_id: appId, key: 'users', payload: { items: INITIAL_USERS } },
        { app_id: appId, key: 'areas', payload: { items: INITIAL_AREAS } },
        { app_id: appId, key: 'processes', payload: { items: INITIAL_PROCESSES } },
        { app_id: appId, key: 'reports', payload: { items: [] } },
        { app_id: appId, key: 'logs', payload: { items: [] } }
      ]);
      setUsersList(INITIAL_USERS);
      setAreasList(INITIAL_AREAS);
      setProcesses(INITIAL_PROCESSES);
    } catch (e) {
      console.error("Erro ao popular dados iniciais:", e);
    }
  };

  const saveCollection = async (collectionKey, itemsData) => {
    try {
      const payload = collectionKey === 'general' ? itemsData : { items: itemsData };
      const { error } = await supabaseClient
        .from('system_config')
        .upsert([{ app_id: appId, key: collectionKey, payload }], { onConflict: 'app_id,key' });

      if (error) throw error;
    } catch (e) {
      console.warn(`Salvamento local fallback para ${collectionKey}:`, e);
    }
  };

  const addLog = (action) => {
    if (!currentUser) return;
    const newLog = {
      id: 'log-' + Date.now(),
      action: action,
      user: currentUser.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveCollection('logs', updatedLogs);
  };

  // --- 3. LOGIN & USER HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    const foundUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (foundUser) {
      setCurrentUser(foundUser);
      setCurrentView('list');
      addLog(`Usuário efetuou login (${foundUser.role})`);
      addToast(`Bem-vindo, ${foundUser.name}!`, 'success');
    } else {
      addToast('Usuário ou senha incorretos.', 'error');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      addLog('Usuário efetuou logout');
    }
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleChangeMyPassword = (e) => {
    e.preventDefault();
    const newPass = e.target.newPass.value;
    const confirmPass = e.target.confirmPass.value;

    if (!newPass) {
      addToast('Digite uma nova senha.', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }

    const updatedUsers = usersList.map(u => u.id === currentUser.id ? { ...u, password: newPass } : u);
    setUsersList(updatedUsers);
    setCurrentUser(prev => ({ ...prev, password: newPass }));
    saveCollection('users', updatedUsers);
    addLog('Alterou a própria senha');
    addToast('Sua senha foi alterada com sucesso!', 'success');
    setActiveModal(null);
  };

  // --- 4. FILTROS E PROCESSOS ---
  const getFilteredProcesses = () => {
    let list = processes;
    if (currentUser && currentUser.role === 'Usuário Externo') {
      list = list.filter(p => p.visibility === 'Público');
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q)) || p.description.toLowerCase().includes(q));
    }
    if (selectedAreaFilter) {
      list = list.filter(p => p.area === selectedAreaFilter);
    }
    if (selectedSubareaFilter) {
      list = list.filter(p => p.subarea === selectedSubareaFilter);
    }
    return list;
  };

  const availableSubareas = selectedAreaFilter 
    ? (areasList.find(a => a.name === selectedAreaFilter)?.subareas || [])
    : Array.from(new Set(areasList.flatMap(a => a.subareas)));

  // --- 5. AÇÕES DO PLAYER & EDITOR ---
  const startProcess = (procId) => {
    const proc = processes.find(p => p.id === procId);
    if (proc) {
      setActiveProcess(proc);
      setActiveStepId(proc.steps[0]?.id || null);
      setCurrentView('player');
      addLog(`Iniciou o processo: "${proc.title}"`);
    }
  };

  const createNewProcess = () => {
    const newProc = {
      id: 'PROC-' + Date.now(),
      code: 'NEW-' + Math.floor(Math.random() * 100),
      title: 'Novo Processo Técnico',
      area: areasList[0]?.name || 'Geral',
      subarea: areasList[0]?.subareas[0] || '',
      visibility: 'Interno',
      description: 'Descrição do procedimento...',
      updatedAt: new Date().toISOString().substring(0, 16),
      isNew: true,
      steps: [
        {
          id: 'step-1',
          title: 'Início do Procedimento',
          elements: [{ type: 'text', content: 'Instruções iniciais...' }],
          decisions: []
        }
      ]
    };
    setActiveProcess(newProc);
    setCurrentView('editor');
  };

  const editProcess = (procId) => {
    const proc = processes.find(p => p.id === procId);
    if (proc) {
      setActiveProcess(JSON.parse(JSON.stringify(proc)));
      setCurrentView('editor');
    }
  };

  const saveProcessEditor = () => {
    if (!activeProcess) return;

    const isNew = !!activeProcess.isNew;
    const cleanProc = { ...activeProcess };
    delete cleanProc.isNew;
    cleanProc.updatedAt = new Date().toISOString().substring(0, 16);

    let updated;
    const idx = processes.findIndex(p => p.id === cleanProc.id);
    if (idx >= 0) {
      updated = [...processes];
      updated[idx] = cleanProc;
    } else {
      updated = [...processes, cleanProc];
    }

    setProcesses(updated);
    saveCollection('processes', updated);
    addLog(isNew ? `Criou o novo processo: "${cleanProc.title}"` : `Salvou edições no processo: "${cleanProc.title}"`);
    addToast('Processo salvo com sucesso!', 'success');
    setCurrentView('list');
  };

  const deleteProcess = (procId) => {
    const proc = processes.find(p => p.id === procId);
    const updated = processes.filter(p => p.id !== procId);
    setProcesses(updated);
    saveCollection('processes', updated);
    addLog(`Excluiu o processo: "${proc ? proc.title : procId}"`);
    addToast('Processo excluído.');
  };

  // --- 6. IMPORT / EXPORT & BACKUP ---
  const exportSingleProcess = (procId) => {
    const proc = processes.find(p => p.id === procId);
    if (!proc) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proc, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `processo_${proc.code || proc.id}.json`;
    a.click();
    addLog(`Exportou o processo: "${proc.title}"`);
  };

  const exportBackup = () => {
    const backupData = { logo, infoTooltips, usersList, areasList, processes, errorReports, auditLogs };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `solplanet_backup_${new Date().toISOString().substring(0,10)}.json`;
    a.click();
    addLog('Realizou backup completo do sistema');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.processes && Array.isArray(imported.processes)) {
          setProcesses(imported.processes);
          saveCollection('processes', imported.processes);
          if (imported.areasList) { setAreasList(imported.areasList); saveCollection('areas', imported.areasList); }
          addToast('Backup do sistema restaurado!', 'success');
        } else if (imported.id && imported.steps) {
          const idx = processes.findIndex(p => p.id === imported.id);
          let updated = [...processes];
          if (idx >= 0) updated[idx] = imported;
          else updated.push(imported);
          setProcesses(updated);
          saveCollection('processes', updated);
          addToast(`Processo "${imported.title}" importado com sucesso!`, 'success');
        }
      } catch (err) {
        addToast('Erro ao ler arquivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Render Login View
  if (!currentUser || currentView === 'login') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1b0a33] via-[#3b154c] to-[#a31d5b] p-4 relative">
        <div className="absolute top-6 left-6 flex items-center gap-2 text-white font-bold text-2xl tracking-wide">
          <Mountain className="w-8 h-8" />
          <span>Solplanet</span>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Smart Energy System</h1>
          <p className="text-slate-300 text-sm">Enterprise platform • Fluxos de Processos Solplanet</p>
        </div>

        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Login</h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">v5.2</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Digite seu usuário" 
                  required 
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#a31d5b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Senha</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#a31d5b]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold rounded-lg shadow-md transition-all text-sm mt-2"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>

        {/* Toast notifications */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-2 ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-emerald-600' : 'bg-[#a31d5b]'}`}>
              {t.msg}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pendingReportsCount = errorReports.filter(r => r.status === 'Pendente').length;
  const canEditOrManage = ['Master', 'Admin'].includes(currentUser.role);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* NAVBAR TOP */}
      <header className="h-14 bg-[#a31d5b] text-white flex items-center justify-between px-4 shadow-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight cursor-pointer" onClick={() => setCurrentView('list')}>
            <img src={logo} alt="Solplanet" className="h-7 object-contain bg-white/10 rounded px-1.5 py-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          {canEditOrManage && (
            <button onClick={() => setActiveModal('revisoes')} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-2.5 py-1.5 rounded flex items-center gap-1.5 transition">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Revisões</span>
              <span className="bg-white text-amber-600 font-bold px-1.5 py-0.2 rounded-full text-[10px]">{pendingReportsCount}</span>
            </button>
          )}

          {currentUser.role === 'Master' && (
            <button onClick={() => setActiveModal('logo')} className="bg-white/10 hover:bg-white/20 text-white font-medium px-2.5 py-1.5 rounded transition hidden sm:flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Logo
            </button>
          )}

          {canEditOrManage && (
            <label className="bg-white/10 hover:bg-white/20 text-white font-medium px-2.5 py-1.5 rounded transition flex items-center gap-1 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
            </label>
          )}

          <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded">
            <div className="w-6 h-6 rounded-full bg-white text-[#a31d5b] font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <span className="font-medium hidden md:inline max-w-[150px] truncate">{currentUser.name}</span>
            <span className="bg-black/20 text-slate-200 text-[10px] px-1.5 py-0.5 rounded font-mono">{currentUser.role}</span>
            
            <button onClick={() => setActiveModal('change_password')} title="Trocar Minha Senha" className="ml-1 text-slate-200 hover:text-white">
              <Key className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} title="Sair do sistema" className="ml-1 text-slate-200 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* BODY CONTENT CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
          <div className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">SOLPLANET SYSTEM</div>
          <nav className="flex-1 px-2 space-y-1">
            <button onClick={() => { setSelectedAreaFilter(''); setSelectedSubareaFilter(''); setCurrentView('list'); }} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'list' && !selectedAreaFilter ? 'bg-[#a31d5b]/10 text-[#a31d5b] font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
              <LayoutGrid className="w-4 h-4" /> Todos os Processos
            </button>
            <button onClick={() => { setSelectedAreaFilter('Diagnóstico Técnico'); setSelectedSubareaFilter(''); setCurrentView('list'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Diagnóstico de Falhas
            </button>
            <button onClick={() => { setSelectedAreaFilter('Garantia & Suporte'); setSelectedSubareaFilter(''); setCurrentView('list'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Garantia & Serviços
            </button>

            {canEditOrManage && (
              <button onClick={() => setActiveModal('revisoes')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                <span className="flex items-center gap-2.5"><Flag className="w-4 h-4 text-[#a31d5b]" /> Central de Erros</span>
                {pendingReportsCount > 0 && <span className="bg-[#a31d5b] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingReportsCount}</span>}
              </button>
            )}

            {canEditOrManage && (
              <button onClick={() => setActiveModal('usuarios')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                <UserPlus className="w-4 h-4 text-blue-500" /> Usuários
              </button>
            )}

            {currentUser.role === 'Master' && (
              <button onClick={() => setActiveModal('auditoria')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                <Clock className="w-4 h-4 text-slate-500" /> Auditoria (Logs)
              </button>
            )}
          </nav>
          <div className="p-3 border-t border-slate-100 text-xs text-slate-400">
            Solplanet Flow v5.2 • Cloud
          </div>
        </aside>

        {/* MAIN VIEW AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative">
          
          {/* VIEW: PROCESS LIST */}
          {currentView === 'list' && (
            <div className="max-w-6xl mx-auto space-y-4">
              {/* FILTERS TOOLBAR */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar: Digite o código ou nome..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#a31d5b]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold">Área:</span>
                  <select 
                    value={selectedAreaFilter} 
                    onChange={(e) => { setSelectedAreaFilter(e.target.value); setSelectedSubareaFilter(''); }} 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#a31d5b]"
                  >
                    <option value="">Todas as Áreas</option>
                    {areasList.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold">Subárea:</span>
                  <select 
                    value={selectedSubareaFilter} 
                    onChange={(e) => setSelectedSubareaFilter(e.target.value)} 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#a31d5b]"
                  >
                    <option value="">Todas as Subáreas</option>
                    {availableSubareas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <button onClick={() => { setSearchQuery(''); setSelectedAreaFilter(''); setSelectedSubareaFilter(''); }} className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition font-medium">Reset</button>

                {canEditOrManage && (
                  <>
                    <button onClick={() => setActiveModal('areas')} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" /> Nova Área
                    </button>
                    <button onClick={exportBackup} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-slate-500" /> Backup
                    </button>
                    <button onClick={createNewProcess} className="text-xs px-3.5 py-1.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold rounded-lg shadow-sm flex items-center gap-1 transition">
                      <Plus className="w-4 h-4" /> Criar Novo Processo
                    </button>
                  </>
                )}
              </div>

              {/* PROCESS LIST CONTAINER */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-slate-700 text-sm">
                  Lista de Processos ({getFilteredProcesses().length})
                </div>

                <div className="divide-y divide-slate-100">
                  {getFilteredProcesses().length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhum processo encontrado com os filtros atuais.</div>
                  ) : (
                    getFilteredProcesses().map(proc => (
                      <div key={proc.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                            <span className="bg-pink-100 text-[#a31d5b] px-2 py-0.5 rounded-md">{proc.area}</span>
                            {proc.subarea && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">{proc.subarea}</span>}
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{proc.visibility}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{proc.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2">{proc.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button onClick={() => startProcess(proc.id)} className="px-3.5 py-1.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition">
                            Iniciar <ChevronRight className="w-3 h-3" />
                          </button>
                          
                          {canEditOrManage && (
                            <>
                              <button onClick={() => exportSingleProcess(proc.id)} title="Exportar Processo" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                                <FileDown className="w-4 h-4" />
                              </button>
                              <button onClick={() => editProcess(proc.id)} title="Editar Processo" className="p-1.5 text-slate-400 hover:text-[#a31d5b] hover:bg-slate-100 rounded">
                                <PenSquare className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteProcess(proc.id)} title="Excluir Processo" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PROCESS PLAYER */}
          {currentView === 'player' && activeProcess && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <button onClick={() => setCurrentView('list')} className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Voltar ao Task Center
                </button>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => { setReportingContext({ procId: activeProcess.id, stepId: activeStepId }); setActiveModal('report_error'); }} className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-amber-600" /> Sinalizar Erro / Sugestão
                  </button>
                  <button onClick={() => setActiveStepId(activeProcess.steps[0]?.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                  </button>
                </div>
              </div>

              {(() => {
                const step = activeProcess.steps.find(s => s.id === activeStepId) || activeProcess.steps[0];
                if (!step) return <div>Passo não encontrado.</div>;

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-[#0f172a] text-white p-6 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="bg-[#a31d5b] px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">{activeProcess.area}</span>
                        <span className="bg-emerald-600 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">{activeProcess.subarea}</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold">{step.title}</h2>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        {step.elements.map((el, idx) => (
                          <div key={idx}>
                            {el.type === 'text' && (
                              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-sm leading-relaxed">{el.content}</div>
                            )}
                            {el.type === 'image' && (
                              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex flex-col items-center justify-center relative group">
                                <img src={el.url} className="w-full h-auto max-h-[500px] object-contain" alt="Process asset" />
                                <a href={el.url} download={el.title || 'imagem_solplanet'} target="_blank" rel="noreferrer" className="absolute top-3 right-3 bg-slate-900/80 hover:bg-[#a31d5b] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5">
                                  <Download className="w-3.5 h-3.5" /> Baixar Imagem
                                </a>
                              </div>
                            )}
                            {el.type === 'video' && (
                              <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center relative">
                                {el.url && (el.url.includes('youtube.com') || el.url.includes('vimeo.com')) ? (
                                  <iframe className="w-full h-full" src={el.url} title="Video" frameBorder="0" allowFullScreen></iframe>
                                ) : (
                                  <video className="w-full h-full" controls controlsList="nodownload">
                                    <source src={el.url} />
                                  </video>
                                )}
                              </div>
                            )}
                            {el.type === 'pdf' && (
                              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-8 h-8 text-red-600" />
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm">{el.title || 'Documento PDF Anexado'}</div>
                                    <div className="text-xs text-slate-500">Clique para abrir ou baixar</div>
                                  </div>
                                </div>
                                <a href={el.url} target="_blank" rel="noreferrer" download={`${el.title || 'documento'}.pdf`} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                  <Download className="w-3.5 h-3.5" /> Baixar PDF
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {step.decisions && step.decisions.length > 0 ? (
                        <div className="pt-6 border-t border-slate-100 space-y-3">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">SELECIONE A AÇÃO:</label>
                          <div className="space-y-2">
                            {step.decisions.map((dec, dIdx) => (
                              <button 
                                key={dIdx}
                                onClick={() => {
                                  if (dec.nextProcessId) startProcess(dec.nextProcessId);
                                  else if (dec.nextStepId) setActiveStepId(dec.nextStepId);
                                  else addToast('Fim do fluxo.', 'info');
                                }}
                                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition font-medium text-slate-800 text-sm flex items-center justify-between group"
                              >
                                <span>{dec.text}</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#a31d5b] transition-transform group-hover:translate-x-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-6 border-t border-slate-100 text-center py-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-semibold text-sm">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                          Fluxo Concluído com Sucesso!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: PROCESS EDITOR */}
          {currentView === 'editor' && activeProcess && (
            <div className="max-w-5xl mx-auto space-y-4 pb-12">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenSquare className="w-5 h-5 text-[#a31d5b]" />
                  <h2 className="font-bold text-slate-800 text-base">Criador & Editor Interativo de Processos</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentView('list')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Cancelar</button>
                  <button onClick={saveProcessEditor} className="px-4 py-1.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white rounded-lg text-xs font-bold shadow-sm">Salvar Alterações</button>
                </div>
              </div>

              {/* PROCESS METADATA FORM */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                      Nome do Processo 
                      <button onClick={() => { setEditingTooltipKey('procName'); setActiveModal('tooltip_edit'); }} className="text-slate-400 hover:text-[#a31d5b]"><Info className="w-3.5 h-3.5" /></button>
                    </label>
                    <input 
                      type="text" 
                      value={activeProcess.title} 
                      onChange={(e) => setActiveProcess({ ...activeProcess, title: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#a31d5b]" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">Área</label>
                    <select 
                      value={activeProcess.area} 
                      onChange={(e) => setActiveProcess({ ...activeProcess, area: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#a31d5b]"
                    >
                      {areasList.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">Subárea</label>
                    <select 
                      value={activeProcess.subarea} 
                      onChange={(e) => setActiveProcess({ ...activeProcess, subarea: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#a31d5b]"
                    >
                      {availableSubareas.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nível de Visibilidade</label>
                    <select 
                      value={activeProcess.visibility} 
                      onChange={(e) => setActiveProcess({ ...activeProcess, visibility: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#a31d5b]"
                    >
                      <option value="Interno">Restrito (Equipe Interna)</option>
                      <option value="Público">Público (Externo + Interno)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Resumo / Objetivo</label>
                    <input 
                      type="text" 
                      value={activeProcess.description} 
                      onChange={(e) => setActiveProcess({ ...activeProcess, description: e.target.value })} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#a31d5b]" 
                    />
                  </div>
                </div>
              </div>

              {/* STEPS BUILDER */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">ETAPAS E LÓGICA DE DECISÃO</h3>
                  <button 
                    onClick={() => {
                      const newStep = { id: 'step-' + Date.now(), title: 'Nova Etapa', elements: [], decisions: [] };
                      setActiveProcess({ ...activeProcess, steps: [...activeProcess.steps, newStep] });
                    }} 
                    className="px-3 py-1.5 bg-pink-50 text-[#a31d5b] hover:bg-pink-100 font-bold text-xs rounded-lg border border-pink-200 transition"
                  >
                    + Adicionar Novo Passo
                  </button>
                </div>

                <div className="space-y-6">
                  {activeProcess.steps.map((step, idx) => (
                    <div key={step.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 flex-1 mr-4">
                          <span className="w-6 h-6 rounded-full bg-[#a31d5b] text-white font-bold text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                          <input 
                            type="text" 
                            value={step.title} 
                            onChange={(e) => {
                              const updated = activeProcess.steps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s);
                              setActiveProcess({ ...activeProcess, steps: updated });
                            }} 
                            className="w-full font-bold text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#a31d5b] focus:bg-white px-1 py-0.5 rounded focus:outline-none" 
                          />
                        </div>
                        <button 
                          onClick={() => {
                            if (activeProcess.steps.length <= 1) return addToast('Mínimo 1 etapa.', 'error');
                            const updated = activeProcess.steps.filter(s => s.id !== step.id);
                            setActiveProcess({ ...activeProcess, steps: updated });
                          }} 
                          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover
                        </button>
                      </div>

                      {/* STEP ELEMENTS */}
                      <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Elementos da Instrução</label>
                          <div className="flex items-center gap-1">
                            {['text', 'image', 'video', 'pdf'].map(type => (
                              <button 
                                key={type}
                                onClick={() => {
                                  const updated = activeProcess.steps.map(s => {
                                    if (s.id === step.id) {
                                      return { ...s, elements: [...s.elements, { type, content: '', url: '', title: '' }] };
                                    }
                                    return s;
                                  });
                                  setActiveProcess({ ...activeProcess, steps: updated });
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded capitalize"
                              >
                                + {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {step.elements.map((el, eIdx) => (
                          <div key={eIdx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-200 text-slate-600 mt-0.5 shrink-0">{el.type}</span>
                            <div className="flex-1 space-y-2">
                              {el.type === 'text' && (
                                <textarea 
                                  value={el.content} 
                                  onChange={(e) => {
                                    const updated = activeProcess.steps.map(s => {
                                      if (s.id === step.id) {
                                        const els = [...s.elements];
                                        els[eIdx].content = e.target.value;
                                        return { ...s, elements: els };
                                      }
                                      return s;
                                    });
                                    setActiveProcess({ ...activeProcess, steps: updated });
                                  }}
                                  rows={2} 
                                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-[#a31d5b]" 
                                />
                              )}
                              {['image', 'video', 'pdf'].includes(el.type) && (
                                <div className="space-y-2">
                                  {el.type === 'pdf' && (
                                    <input 
                                      type="text" 
                                      placeholder="Título do Documento PDF..." 
                                      value={el.title || ''} 
                                      onChange={(e) => {
                                        const updated = activeProcess.steps.map(s => {
                                          if (s.id === step.id) {
                                            const els = [...s.elements];
                                            els[eIdx].title = e.target.value;
                                            return { ...s, elements: els };
                                          }
                                          return s;
                                        });
                                        setActiveProcess({ ...activeProcess, steps: updated });
                                      }}
                                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded"
                                    />
                                  )}
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      placeholder={`Cole a URL do ${el.type.toUpperCase()}...`} 
                                      value={el.url && !el.url.startsWith('data:') ? el.url : ''} 
                                      onChange={(e) => {
                                        const updated = activeProcess.steps.map(s => {
                                          if (s.id === step.id) {
                                            const els = [...s.elements];
                                            els[eIdx].url = e.target.value;
                                            return { ...s, elements: els };
                                          }
                                          return s;
                                        });
                                        setActiveProcess({ ...activeProcess, steps: updated });
                                      }}
                                      className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded" 
                                    />
                                    <label className="px-3 py-2 bg-slate-800 hover:bg-black text-white font-bold text-xs rounded cursor-pointer shrink-0 flex items-center gap-1.5">
                                      <Upload className="w-3.5 h-3.5" /> Arquivo Local
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (!file) return;
                                          const reader = new FileReader();
                                          reader.onload = (ev) => {
                                            const updated = activeProcess.steps.map(s => {
                                              if (s.id === step.id) {
                                                const els = [...s.elements];
                                                els[eIdx].url = ev.target.result;
                                                if (el.type === 'pdf' && !els[eIdx].title) els[eIdx].title = file.name;
                                                return { ...s, elements: els };
                                              }
                                              return s;
                                            });
                                            setActiveProcess({ ...activeProcess, steps: updated });
                                            addToast('Arquivo local vinculado!', 'success');
                                          };
                                          reader.readAsDataURL(file);
                                        }} 
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button 
                              onClick={() => {
                                const updated = activeProcess.steps.map(s => {
                                  if (s.id === step.id) {
                                    const els = s.elements.filter((_, i) => i !== eIdx);
                                    return { ...s, elements: els };
                                  }
                                  return s;
                                });
                                setActiveProcess({ ...activeProcess, steps: updated });
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* STEP DECISIONS */}
                      <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Decisões Desta Etapa</label>
                          <button 
                            onClick={() => {
                              const updated = activeProcess.steps.map(s => {
                                if (s.id === step.id) {
                                  return { ...s, decisions: [...(s.decisions || []), { text: 'Nova Opção', nextStepId: '', nextProcessId: '' }] };
                                }
                                return s;
                              });
                              setActiveProcess({ ...activeProcess, steps: updated });
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
                          >
                            + Decisão
                          </button>
                        </div>

                        {(step.decisions || []).map((dec, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <input 
                              type="text" 
                              value={dec.text} 
                              onChange={(e) => {
                                const updated = activeProcess.steps.map(s => {
                                  if (s.id === step.id) {
                                    const decs = [...s.decisions];
                                    decs[dIdx].text = e.target.value;
                                    return { ...s, decisions: decs };
                                  }
                                  return s;
                                });
                                setActiveProcess({ ...activeProcess, steps: updated });
                              }}
                              placeholder="Texto do botão..." 
                              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded" 
                            />
                            <span className="text-xs text-slate-400 font-bold">Direcionar:</span>
                            <select 
                              value={dec.nextProcessId ? `proc:${dec.nextProcessId}` : dec.nextStepId ? `step:${dec.nextStepId}` : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = activeProcess.steps.map(s => {
                                  if (s.id === step.id) {
                                    const decs = [...s.decisions];
                                    if (val.startsWith('step:')) {
                                      decs[dIdx].nextStepId = val.replace('step:', '');
                                      decs[dIdx].nextProcessId = '';
                                    } else if (val.startsWith('proc:')) {
                                      decs[dIdx].nextProcessId = val.replace('proc:', '');
                                      decs[dIdx].nextStepId = '';
                                    } else {
                                      decs[dIdx].nextStepId = '';
                                      decs[dIdx].nextProcessId = '';
                                    }
                                    return { ...s, decisions: decs };
                                  }
                                  return s;
                                });
                                setActiveProcess({ ...activeProcess, steps: updated });
                              }}
                              className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded"
                            >
                              <option value="">Fim do Processo</option>
                              <optgroup label="Passos Deste Processo">
                                {activeProcess.steps.map(s => <option key={s.id} value={`step:${s.id}`}>Passo: {s.title}</option>)}
                              </optgroup>
                              <optgroup label="Outro Processo">
                                {processes.filter(p => p.id !== activeProcess.id).map(p => <option key={p.id} value={`proc:${p.id}`}>Proc: {p.title}</option>)}
                              </optgroup>
                            </select>
                            <button 
                              onClick={() => {
                                const updated = activeProcess.steps.map(s => {
                                  if (s.id === step.id) {
                                    const decs = s.decisions.filter((_, i) => i !== dIdx);
                                    return { ...s, decisions: decs };
                                  }
                                  return s;
                                });
                                setActiveProcess({ ...activeProcess, steps: updated });
                              }}
                              className="text-red-500 hover:text-red-700 px-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS CONTROLLER */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          {/* MODAL: CHANGE PASSWORD */}
          {activeModal === 'change_password' && (
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#a31d5b] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><Key className="w-4 h-4" /> Alterar Minha Senha</h3>
                <button onClick={() => { setShowPassword(false); setActiveModal(null); }} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleChangeMyPassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nova Senha</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="newPass" placeholder="Digite sua nova senha" className="w-full text-xs p-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Confirme a Nova Senha</label>
                  <input type={showPassword ? "text" : "password"} name="confirmPass" placeholder="Confirme a nova senha" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold text-xs rounded-xl shadow-md">
                  Salvar Nova Senha
                </button>
              </form>
            </div>
          )}

          {/* MODAL: REVISÕES / ERROS */}
          {activeModal === 'revisoes' && (
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" /> Central de Apontamentos & Revisões
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {errorReports.filter(r => r.status === 'Pendente').length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Nenhum erro pendente no momento.</div>
                ) : (
                  errorReports.filter(r => r.status === 'Pendente').map(rep => (
                    <div key={rep.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded">Pendente</span>
                        <span className="text-slate-400">{rep.date}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{rep.processTitle}</h4>
                        <div className="text-xs text-[#a31d5b] font-semibold">Etapa: {rep.stepTitle}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs text-slate-700 italic">
                        "{rep.note}"
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
                        <span className="text-slate-500">Solicitado por: <strong>{rep.author}</strong></span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setActiveModal(null); editProcess(rep.processId); }} 
                            className="px-3 py-1 bg-white hover:bg-slate-50 text-[#a31d5b] border border-pink-200 rounded-lg font-bold flex items-center gap-1"
                          >
                            <PenSquare className="w-3.5 h-3.5" /> Ir para Edição
                          </button>
                          <button 
                            onClick={() => {
                              const updated = errorReports.map(r => r.id === rep.id ? { ...r, status: 'Concluído' } : r);
                              setErrorReports(updated);
                              saveCollection('reports', updated);
                              addLog(`Resolveu o apontamento do processo: "${rep.processTitle}"`);
                              addToast('Apontamento concluído!', 'success');
                            }} 
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como OK
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MODAL: REPORT ERROR */}
          {activeModal === 'report_error' && reportingContext && (
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#a31d5b] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><Flag className="w-4 h-4" /> Sinalizar Erro / Sugestão</h3>
                <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const note = e.target.note.value;
                  if (!note.trim()) return addToast('Descreva o problema.', 'error');

                  const proc = processes.find(p => p.id === reportingContext.procId);
                  const step = proc?.steps.find(s => s.id === reportingContext.stepId);

                  const newRep = {
                    id: 'rep-' + Date.now(),
                    processId: reportingContext.procId,
                    processTitle: proc ? proc.title : '',
                    stepId: reportingContext.stepId,
                    stepTitle: step ? step.title : '',
                    note,
                    author: currentUser.name,
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    status: 'Pendente'
                  };

                  const updated = [newRep, ...errorReports];
                  setErrorReports(updated);
                  saveCollection('reports', updated);
                  addLog(`Reportou erro no processo: "${proc?.title}"`);
                  addToast('Apontamento enviado!', 'success');
                  setActiveModal(null);
                }} 
                className="p-6 space-y-4"
              >
                <p className="text-xs text-slate-600">Descreva a divergência ou sugestão para a etapa atual. O administrador será notificado.</p>
                <textarea name="note" rows={4} placeholder="Ex: O limite de isolamento informado mudou..." className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#a31d5b]" />
                <button type="submit" className="w-full py-2.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold text-xs rounded-xl shadow-md">
                  Enviar Apontamento
                </button>
              </form>
            </div>
          )}

          {/* MODAL: USUÁRIOS */}
          {activeModal === 'usuarios' && (
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><UserPlus className="w-4 h-4" /> Gerenciamento de Usuários</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {currentUser.role === 'Master' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target;
                      const nu = {
                        id: 'usr-' + Date.now(),
                        name: form.name.value,
                        username: form.username.value,
                        role: form.role.value,
                        password: form.password.value
                      };
                      const updated = [...usersList, nu];
                      setUsersList(updated);
                      saveCollection('users', updated);
                      addLog(`Cadastrou novo usuário: "${nu.name}" (${nu.role})`);
                      addToast('Usuário cadastrado com sucesso!', 'success');
                      form.reset();
                    }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
                  >
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">CADASTRAR NOVO USUÁRIO</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="name" placeholder="Nome Completo" required className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                      <input type="text" name="username" placeholder="Usuário / Login" required className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                      <select name="role" className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg">
                        <option value="Usuário Interno">Usuário Interno (Leitura)</option>
                        <option value="Admin">Administrador (Cria / Edita)</option>
                        <option value="Master">Master (Acesso Total)</option>
                        <option value="Usuário Externo">Usuário Externo (Apenas Públicos)</option>
                      </select>
                      <input type="password" name="password" placeholder="Senha Inicial" required className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold text-xs rounded-lg">Cadastrar Usuário</button>
                  </form>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Usuários Cadastrados ({usersList.length})</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {usersList.map(u => (
                      <div key={u.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{u.name} <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{u.role}</span></div>
                          <div className="text-slate-400 font-mono">User: {u.username}</div>
                        </div>
                        {currentUser.role === 'Master' && u.id !== currentUser.id && (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                const updated = usersList.map(x => x.id === u.id ? { ...x, password: '123456' } : x);
                                setUsersList(updated);
                                saveCollection('users', updated);
                                addLog(`Resetou a senha do usuário: "${u.username}"`);
                                addToast(`Senha de ${u.username} resetada para "123456".`, 'success');
                              }} 
                              title="Resetar Senha" 
                              className="p-1.5 text-slate-400 hover:text-[#a31d5b]"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const updated = usersList.filter(x => x.id !== u.id);
                                setUsersList(updated);
                                saveCollection('users', updated);
                                addLog(`Excluiu o usuário: "${u.username}"`);
                                addToast('Usuário excluído com sucesso.', 'success');
                              }} 
                              title="Excluir Usuário" 
                              className="p-1.5 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
          {/* MODAL: AUDITORIA / LOGS */}
          {activeModal === 'auditoria' && (
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Registro de Auditoria & Atividades (Logs)</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <div key={log.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{log.action}</div>
                      <div className="text-slate-400">Por: {log.user}</div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODAL: LOGO */}
          {activeModal === 'logo' && (
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Alterar Logo do Aplicativo</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-xs font-bold text-slate-600">URL ou Imagem do Logo:</label>
                <input 
                  type="text" 
                  value={logo} 
                  onChange={(e) => setLogo(e.target.value)} 
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" 
                />
                <label className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-slate-200">
                  <Upload className="w-4 h-4" /> Escolher Imagem do Computador
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setLogo(ev.target.result);
                        saveCollection('general', { logo: ev.target.result, infoTooltips });
                        addToast('Logo atualizado!', 'success');
                        setActiveModal(null);
                      };
                      reader.readAsDataURL(file);
                    }} 
                  />
                </label>
                <button 
                  onClick={() => {
                    saveCollection('general', { logo, infoTooltips });
                    addToast('Logo salvo com sucesso!', 'success');
                    setActiveModal(null);
                  }} 
                  className="w-full py-2.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold text-xs rounded-xl"
                >
                  Aplicar Logo
                </button>
              </div>
            </div>
          )}

          {/* MODAL: TOOLTIP EDIT */}
          {activeModal === 'tooltip_edit' && editingTooltipKey && (
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2"><Info className="w-4 h-4 text-[#a31d5b]" /> Editar Ajuda do Campo (i)</h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <textarea 
                  value={infoTooltips[editingTooltipKey] || ''} 
                  onChange={(e) => setInfoTooltips({ ...infoTooltips, [editingTooltipKey]: e.target.value })} 
                  rows={4} 
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#a31d5b]" 
                />
                <button 
                  onClick={() => {
                    saveCollection('general', { logo, infoTooltips });
                    addToast('Texto de ajuda atualizado!', 'success');
                    setActiveModal(null);
                  }} 
                  className="w-full py-2.5 bg-[#a31d5b] hover:bg-[#8b194d] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Salvar Ajuda
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TOAST CONTAINER */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-2 ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-emerald-600' : 'bg-[#a31d5b]'}`}>
            {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
}
