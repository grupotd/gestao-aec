// Sistema de persistência com Local Storage

import { Utilizador, Escola, Sessao, PedidoSubstituicao, HorarioSessao, RegistoSessao, DocumentoUtilizador, LogEntry } from './types';

const STORAGE_KEYS = {
  USERS: 'users', // Chave simplificada para utilizadores
  ESCOLAS: 'aec_escolas',
  SESSOES: 'aec_sessoes', // Manter para compatibilidade
  HORARIOS: 'aec_horarios', // NOVO
  REGISTOS: 'aec_registos', // NOVO
  PEDIDOS: 'aec_pedidos',
  DOCUMENTOS: 'aec_documentos', // NOVO
  LOGS: 'logs', // NOVO - Sistema de Auditoria
  CURRENT_USER: 'currentUser', // Chave simplificada
};

// ============================================
// FUNÇÕES DE LOGS/AUDITORIA
// ============================================

export function loadLogs(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : [];
}

export function saveLogs(entries: LogEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(entries));
}

export function addLog(entry: Partial<LogEntry>): void {
  if (typeof window === 'undefined') return;
  
  const logs = loadLogs();
  const newLog: LogEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    utilizadorId: entry.utilizadorId || '',
    utilizadorEmail: entry.utilizadorEmail || '',
    acao: entry.acao || '',
    entidade: entry.entidade || '',
    entidadeId: entry.entidadeId || '',
    descricao: entry.descricao || '',
    dataHora: new Date().toISOString(),
  };
  
  logs.push(newLog);
  saveLogs(logs);
}

// ============================================
// FUNÇÕES DE ARMAZENAMENTO DE UTILIZADORES
// ============================================

export function loadUsersFromLocalStorage(): Utilizador[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsersToLocalStorage(users: Utilizador[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// ============================================
// BOOTSTRAP DE UTILIZADORES DE TESTE
// ============================================

export function bootstrapTestUsers() {
  if (typeof window === 'undefined') return;

  const existing = loadUsersFromLocalStorage();
  if (existing.length > 0) return; // Já existem utilizadores

  const testUsers: Utilizador[] = [
    {
      id: "1",
      nomeCompleto: "Administrador do Sistema",
      email: "admin@aec.pt",
      password: "admin123",
      perfil: "ADMINISTRADOR",
      ativo: true,
      codigoTecnico: undefined,
      nif: "",
      niss: "",
      dataNascimento: ""
    },
    {
      id: "2",
      nomeCompleto: "Coordenador Geral",
      email: "coord@aec.pt",
      password: "coord123",
      perfil: "COORDENADOR",
      ativo: true,
      codigoTecnico: undefined,
      nif: "",
      niss: "",
      dataNascimento: ""
    },
    {
      id: "3",
      nomeCompleto: "Técnico Exemplo",
      email: "tecnico@aec.pt",
      password: "tecnico123",
      perfil: "TECNICO",
      ativo: true,
      codigoTecnico: "T00-EXEMPLO",
      nif: "",
      niss: "",
      dataNascimento: ""
    }
  ];

  saveUsersToLocalStorage(testUsers);
}

// ============================================
// LÓGICA DE LOGIN SIMPLIFICADA
// ============================================

export const login = (email: string, password: string): Utilizador | null => {
  const users = loadUsersFromLocalStorage();
  const user = users.find((u) => 
    u.email === email && 
    u.password === password && 
    u.ativo === true
  );
  
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    // LOG: Login realizado
    addLog({
      utilizadorId: user.id,
      utilizadorEmail: user.email,
      acao: 'LOGIN',
      entidade: 'Utilizador',
      entidadeId: user.id,
      descricao: `Login realizado por ${user.nomeCompleto}`,
    });
    
    return user;
  }
  
  return null;
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  const currentUser = getCurrentUser();
  if (currentUser) {
    // LOG: Logout realizado
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'LOGOUT',
      entidade: 'Utilizador',
      entidadeId: currentUser.id,
      descricao: `Logout realizado por ${currentUser.nomeCompleto}`,
    });
  }
  
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): Utilizador | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

// ============================================
// INICIALIZAR DADOS DE EXEMPLO
// ============================================

export const initializeData = () => {
  if (typeof window === 'undefined') return;

  // Criar utilizadores de teste se não existirem
  bootstrapTestUsers();

  // Escolas de exemplo
  if (!localStorage.getItem(STORAGE_KEYS.ESCOLAS)) {
    const escolas: Escola[] = [
      { id: '1', nome: 'EB1 de São João', localidade: 'Lisboa' },
      { id: '2', nome: 'EB1 da Luz', localidade: 'Porto' },
      { id: '3', nome: 'EB1 Central', localidade: 'Coimbra' },
    ];
    localStorage.setItem(STORAGE_KEYS.ESCOLAS, JSON.stringify(escolas));
  }

  // Horários de exemplo (plano recorrente)
  if (!localStorage.getItem(STORAGE_KEYS.HORARIOS)) {
    const hoje = new Date();
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 6, 0).toISOString().split('T')[0];

    const horarios: HorarioSessao[] = [
      {
        id: '1',
        escola_id: '1',
        turma_id: '3º A',
        tecnico_id: '3',
        atividade: 'Expressão Plástica',
        dia_semana: 2, // Terça-feira
        hora_inicio: '14:00',
        hora_fim: '15:30',
        data_inicio: dataInicio,
        data_fim: dataFim,
        ativo: true,
      },
      {
        id: '2',
        escola_id: '1',
        turma_id: '4º B',
        tecnico_id: '3',
        atividade: 'Música',
        dia_semana: 2, // Terça-feira
        hora_inicio: '15:30',
        hora_fim: '17:00',
        data_inicio: dataInicio,
        data_fim: dataFim,
        ativo: true,
      },
      {
        id: '3',
        escola_id: '2',
        turma_id: '2º A',
        tecnico_id: '3',
        atividade: 'Desporto',
        dia_semana: 4, // Quinta-feira
        hora_inicio: '10:00',
        hora_fim: '11:30',
        data_inicio: dataInicio,
        data_fim: dataFim,
        ativo: true,
      },
      {
        id: '4',
        escola_id: '3',
        turma_id: '1º C',
        tecnico_id: '3',
        atividade: 'Expressão Dramática',
        dia_semana: 3, // Quarta-feira
        hora_inicio: '14:00',
        hora_fim: '15:30',
        data_inicio: dataInicio,
        data_fim: dataFim,
        ativo: true,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.HORARIOS, JSON.stringify(horarios));
  }

  // Registos de exemplo (sessões já realizadas)
  if (!localStorage.getItem(STORAGE_KEYS.REGISTOS)) {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataOntem = ontem.toISOString().split('T')[0];

    const registos: RegistoSessao[] = [
      {
        id: '1',
        horario_sessao_id: '4',
        data: dataOntem,
        estado: 'REALIZADA',
        numero_alunos_presentes: 18,
        sumario: 'Atividades de expressão plástica - pintura com aguarelas.',
        ocorrencias: '',
        assinada: true,
        tecnico_responsavel_id: '3',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.REGISTOS, JSON.stringify(registos));
  }

  // Pedidos de exemplo
  if (!localStorage.getItem(STORAGE_KEYS.PEDIDOS)) {
    const pedidos: PedidoSubstituicao[] = [];
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
  }

  // Documentos de exemplo
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTOS)) {
    const documentos: DocumentoUtilizador[] = [];
    localStorage.setItem(STORAGE_KEYS.DOCUMENTOS, JSON.stringify(documentos));
  }

  // Logs de exemplo
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    const logs: LogEntry[] = [];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }
};

// ============================================
// FUNÇÕES CRUD GENÉRICAS
// ============================================

export const getAll = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const save = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const add = <T extends { id: string }>(key: string, item: T): void => {
  const items = getAll<T>(key);
  items.push(item);
  save(key, items);
};

export const update = <T extends { id: string }>(key: string, id: string, updates: Partial<T>): void => {
  const items = getAll<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    save(key, items);
  }
};

export const remove = (key: string, id: string): void => {
  const items = getAll(key);
  const filtered = items.filter((item: any) => item.id !== id);
  save(key, filtered);
};

// ============================================
// FUNÇÕES ESPECÍFICAS PARA UTILIZADORES
// ============================================

export const getUtilizadores = () => loadUsersFromLocalStorage();

export const addUtilizador = (utilizador: Utilizador) => {
  const users = loadUsersFromLocalStorage();
  users.push(utilizador);
  saveUsersToLocalStorage(users);
  
  // LOG: Criar utilizador
  const currentUser = getCurrentUser();
  if (currentUser) {
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'CRIAR_UTILIZADOR',
      entidade: 'Utilizador',
      entidadeId: utilizador.id,
      descricao: `Utilizador criado: ${utilizador.nomeCompleto} (${utilizador.email}) - Perfil: ${utilizador.perfil}`,
    });
  }
};

export const updateUtilizador = (id: string, updates: Partial<Utilizador>) => {
  const users = loadUsersFromLocalStorage();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    const oldUser = { ...users[index] };
    users[index] = { ...users[index], ...updates };
    saveUsersToLocalStorage(users);
    
    // LOG: Editar utilizador
    const currentUser = getCurrentUser();
    if (currentUser) {
      let descricao = `Utilizador editado: ${users[index].nomeCompleto}`;
      
      // Detectar alterações específicas
      if (updates.perfil && updates.perfil !== oldUser.perfil) {
        descricao += ` - Perfil alterado de ${oldUser.perfil} para ${updates.perfil}`;
        addLog({
          utilizadorId: currentUser.id,
          utilizadorEmail: currentUser.email,
          acao: 'ALTERAR_PERFIL',
          entidade: 'Utilizador',
          entidadeId: id,
          descricao,
        });
      } else if (updates.ativo !== undefined && updates.ativo !== oldUser.ativo) {
        descricao += ` - ${updates.ativo ? 'Ativado' : 'Desativado'}`;
        addLog({
          utilizadorId: currentUser.id,
          utilizadorEmail: currentUser.email,
          acao: updates.ativo ? 'ATIVAR_UTILIZADOR' : 'DESATIVAR_UTILIZADOR',
          entidade: 'Utilizador',
          entidadeId: id,
          descricao,
        });
      } else if (updates.password) {
        addLog({
          utilizadorId: currentUser.id,
          utilizadorEmail: currentUser.email,
          acao: 'RESETAR_PASSWORD',
          entidade: 'Utilizador',
          entidadeId: id,
          descricao: `Password resetada para utilizador: ${users[index].nomeCompleto}`,
        });
      } else {
        addLog({
          utilizadorId: currentUser.id,
          utilizadorEmail: currentUser.email,
          acao: 'EDITAR_UTILIZADOR',
          entidade: 'Utilizador',
          entidadeId: id,
          descricao,
        });
      }
    }
    
    // Atualizar também o current user se for o mesmo
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }
  }
};

export const getEscolas = () => getAll<Escola>(STORAGE_KEYS.ESCOLAS);

// ============================================
// FUNÇÕES PARA SESSÕES ANTIGAS (compatibilidade)
// ============================================

export const getSessoes = () => getAll<Sessao>(STORAGE_KEYS.SESSOES);
export const addSessao = (sessao: Sessao) => add(STORAGE_KEYS.SESSOES, sessao);
export const updateSessao = (id: string, updates: Partial<Sessao>) => update(STORAGE_KEYS.SESSOES, id, updates);

// ============================================
// FUNÇÕES PARA HORÁRIOS
// ============================================

export const getHorarios = () => getAll<HorarioSessao>(STORAGE_KEYS.HORARIOS);

export const addHorario = (horario: HorarioSessao) => {
  add(STORAGE_KEYS.HORARIOS, horario);
  
  // LOG: Criar horário
  const currentUser = getCurrentUser();
  if (currentUser) {
    const escola = getEscolas().find(e => e.id === horario.escola_id);
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'CRIAR_HORARIO',
      entidade: 'HorarioSessao',
      entidadeId: horario.id,
      descricao: `Horário criado: ${horario.atividade} - Turma ${horario.turma_id} - ${escola?.nome || 'Escola'}`,
    });
  }
};

export const updateHorario = (id: string, updates: Partial<HorarioSessao>) => {
  update(STORAGE_KEYS.HORARIOS, id, updates);
  
  // LOG: Editar horário
  const currentUser = getCurrentUser();
  if (currentUser) {
    const horario = getHorarios().find(h => h.id === id);
    if (horario) {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'EDITAR_HORARIO',
        entidade: 'HorarioSessao',
        entidadeId: id,
        descricao: `Horário editado: ${horario.atividade} - Turma ${horario.turma_id}`,
      });
    }
  }
};

export const removeHorario = (id: string) => {
  const horario = getHorarios().find(h => h.id === id);
  remove(STORAGE_KEYS.HORARIOS, id);
  
  // LOG: Apagar horário
  const currentUser = getCurrentUser();
  if (currentUser && horario) {
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'APAGAR_HORARIO',
      entidade: 'HorarioSessao',
      entidadeId: id,
      descricao: `Horário apagado: ${horario.atividade} - Turma ${horario.turma_id}`,
    });
  }
};

// ============================================
// FUNÇÕES PARA REGISTOS DE SESSÕES
// ============================================

export const getRegistos = () => getAll<RegistoSessao>(STORAGE_KEYS.REGISTOS);

export const addRegisto = (registo: RegistoSessao) => {
  add(STORAGE_KEYS.REGISTOS, registo);
  
  // LOG: Criar registo de sessão
  const currentUser = getCurrentUser();
  if (currentUser) {
    const horario = getHorarios().find(h => h.id === registo.horario_sessao_id);
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'CRIAR_REGISTO_SESSAO',
      entidade: 'RegistoSessao',
      entidadeId: registo.id,
      descricao: `Registo de sessão criado: ${horario?.atividade || 'Sessão'} - ${registo.data}`,
    });
  }
};

export const updateRegisto = (id: string, updates: Partial<RegistoSessao>) => {
  const registos = getRegistos();
  const registoAntigo = registos.find(r => r.id === id);
  
  update(STORAGE_KEYS.REGISTOS, id, updates);
  
  // LOG: Atualizar registo de sessão
  const currentUser = getCurrentUser();
  if (currentUser && registoAntigo) {
    const horario = getHorarios().find(h => h.id === registoAntigo.horario_sessao_id);
    
    // Detectar tipo de alteração
    if (updates.estado === 'REALIZADA' && registoAntigo.estado !== 'REALIZADA') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'MARCAR_SESSAO_REALIZADA',
        entidade: 'RegistoSessao',
        entidadeId: id,
        descricao: `Sessão marcada como REALIZADA: ${horario?.atividade || 'Sessão'} - ${registoAntigo.data}`,
      });
    } else if (updates.estado === 'FALTA_TECNICO' && registoAntigo.estado !== 'FALTA_TECNICO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'MARCAR_SESSAO_FALTA_TECNICO',
        entidade: 'RegistoSessao',
        entidadeId: id,
        descricao: `Sessão marcada como FALTA_TECNICO: ${horario?.atividade || 'Sessão'} - ${registoAntigo.data}`,
      });
    } else if (updates.estado === 'CANCELADA' && registoAntigo.estado !== 'CANCELADA') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'MARCAR_SESSAO_CANCELADA',
        entidade: 'RegistoSessao',
        entidadeId: id,
        descricao: `Sessão marcada como CANCELADA: ${horario?.atividade || 'Sessão'} - ${registoAntigo.data}`,
      });
    }
  }
};

export const removeRegisto = (id: string) => remove(STORAGE_KEYS.REGISTOS, id);

// Função auxiliar: Gerar registos para uma semana específica baseado nos horários
export const gerarRegistosSemana = (dataInicio: Date, dataFim: Date): RegistoSessao[] => {
  const horarios = getHorarios().filter(h => h.ativo);
  const registosExistentes = getRegistos();
  const novosRegistos: RegistoSessao[] = [];

  horarios.forEach(horario => {
    const inicioVigencia = new Date(horario.data_inicio);
    const fimVigencia = new Date(horario.data_fim);

    // Iterar pelos dias entre dataInicio e dataFim
    const dataAtual = new Date(dataInicio);
    while (dataAtual <= dataFim) {
      // Verificar se o dia da semana corresponde ao horário
      if (dataAtual.getDay() === horario.dia_semana) {
        // Verificar se está dentro do período de vigência
        if (dataAtual >= inicioVigencia && dataAtual <= fimVigencia) {
          const dataStr = dataAtual.toISOString().split('T')[0];
          
          // Verificar se já existe registo para este horário nesta data
          const registoExistente = registosExistentes.find(
            r => r.horario_sessao_id === horario.id && r.data === dataStr
          );

          if (!registoExistente) {
            // Criar novo registo com estado PLANEADA
            const novoRegisto: RegistoSessao = {
              id: `${horario.id}_${dataStr}`,
              horario_sessao_id: horario.id,
              data: dataStr,
              estado: 'PLANEADA',
              assinada: false,
              tecnico_responsavel_id: horario.tecnico_id,
            };
            novosRegistos.push(novoRegisto);
          }
        }
      }
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
  });

  return novosRegistos;
};

// Função auxiliar: Obter ou criar registo para uma data específica
export const getOrCreateRegistoForDate = (horarioId: string, data: string): RegistoSessao => {
  const registos = getRegistos();
  const registoExistente = registos.find(
    r => r.horario_sessao_id === horarioId && r.data === data
  );

  if (registoExistente) {
    return registoExistente;
  }

  // Criar novo registo
  const horario = getHorarios().find(h => h.id === horarioId);
  if (!horario) {
    throw new Error('Horário não encontrado');
  }

  const novoRegisto: RegistoSessao = {
    id: `${horarioId}_${data}`,
    horario_sessao_id: horarioId,
    data: data,
    estado: 'PLANEADA',
    assinada: false,
    tecnico_responsavel_id: horario.tecnico_id,
  };

  addRegisto(novoRegisto);
  return novoRegisto;
};

// ============================================
// FUNÇÕES PARA PEDIDOS DE SUBSTITUIÇÃO
// ============================================

export const getPedidos = () => getAll<PedidoSubstituicao>(STORAGE_KEYS.PEDIDOS);

export const addPedido = (pedido: PedidoSubstituicao) => {
  add(STORAGE_KEYS.PEDIDOS, pedido);
  
  // LOG: Criar pedido de substituição
  const currentUser = getCurrentUser();
  if (currentUser) {
    const tecnicoSubstituto = getUtilizadores().find(u => u.id === pedido.tecnico_substituto_id);
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'CRIAR_PEDIDO_SUBSTITUICAO',
      entidade: 'PedidoSubstituicao',
      entidadeId: pedido.id,
      descricao: `Pedido de substituição criado para técnico ${tecnicoSubstituto?.nomeCompleto || 'desconhecido'} - Motivo: ${pedido.motivo}`,
    });
  }
};

export const updatePedido = (id: string, updates: Partial<PedidoSubstituicao>) => {
  const pedidos = getPedidos();
  const pedidoAntigo = pedidos.find(p => p.id === id);
  
  const pedidoAtualizado = {
    ...updates,
    dataAtualizacao: new Date().toISOString(),
  };
  update(STORAGE_KEYS.PEDIDOS, id, pedidoAtualizado);
  
  // LOG: Atualizar pedido de substituição
  const currentUser = getCurrentUser();
  if (currentUser && pedidoAntigo) {
    const tecnicoSubstituto = getUtilizadores().find(u => u.id === pedidoAntigo.tecnico_substituto_id);
    
    // Detectar tipo de alteração
    if (updates.estado === 'PENDENTE_ACEITACAO_TECNICO' && pedidoAntigo.estado === 'PENDENTE_APROVACAO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'APROVAR_PEDIDO_SUBSTITUICAO',
        entidade: 'PedidoSubstituicao',
        entidadeId: id,
        descricao: `Pedido de substituição aprovado para técnico ${tecnicoSubstituto?.nomeCompleto || 'desconhecido'}`,
      });
    } else if (updates.estado === 'RECUSADO' && pedidoAntigo.estado === 'PENDENTE_APROVACAO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'REJEITAR_PEDIDO_SUBSTITUICAO',
        entidade: 'PedidoSubstituicao',
        entidadeId: id,
        descricao: `Pedido de substituição rejeitado para técnico ${tecnicoSubstituto?.nomeCompleto || 'desconhecido'}`,
      });
    } else if (updates.estado === 'APROVADO' && pedidoAntigo.estado === 'PENDENTE_ACEITACAO_TECNICO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'ACEITAR_PEDIDO_SUBSTITUICAO',
        entidade: 'PedidoSubstituicao',
        entidadeId: id,
        descricao: `Técnico substituto ${tecnicoSubstituto?.nomeCompleto || 'desconhecido'} aceitou o pedido de substituição`,
      });
      
      // LOG adicional: Atribuir sessão ao substituto
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'ATRIBUIR_SESSAO_SUBSTITUTO',
        entidade: 'Sessao',
        entidadeId: pedidoAntigo.sessao_id,
        descricao: `Sessão atribuída ao técnico substituto ${tecnicoSubstituto?.nomeCompleto || 'desconhecido'}`,
      });
    } else if (updates.estado === 'RECUSADO' && pedidoAntigo.estado === 'PENDENTE_ACEITACAO_TECNICO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'RECUSAR_PEDIDO_SUBSTITUICAO',
        entidade: 'PedidoSubstituicao',
        entidadeId: id,
        descricao: `Técnico substituto ${tecnicoSubstituto?.nomeCompleto || 'desconhecido'} recusou o pedido de substituição`,
      });
    }
  }
};

// ============================================
// FUNÇÕES PARA DOCUMENTOS
// ============================================

export const getDocumentos = () => getAll<DocumentoUtilizador>(STORAGE_KEYS.DOCUMENTOS);
export const getDocumentosByUtilizador = (utilizadorId: string) => 
  getDocumentos().filter(d => d.utilizadorId === utilizadorId);

export const addDocumento = (documento: DocumentoUtilizador) => {
  add(STORAGE_KEYS.DOCUMENTOS, documento);
  
  // LOG: Upload de documento
  const currentUser = getCurrentUser();
  if (currentUser) {
    const utilizador = getUtilizadores().find(u => u.id === documento.utilizadorId);
    addLog({
      utilizadorId: currentUser.id,
      utilizadorEmail: currentUser.email,
      acao: 'UPLOAD_DOCUMENTO',
      entidade: 'DocumentoUtilizador',
      entidadeId: documento.id,
      descricao: `Documento carregado: ${documento.tipo} - Utilizador: ${utilizador?.nomeCompleto || 'desconhecido'}`,
    });
  }
};

export const updateDocumento = (id: string, updates: Partial<DocumentoUtilizador>) => {
  const documentos = getDocumentos();
  const documentoAntigo = documentos.find(d => d.id === id);
  
  update(STORAGE_KEYS.DOCUMENTOS, id, updates);
  
  // LOG: Atualizar documento
  const currentUser = getCurrentUser();
  if (currentUser && documentoAntigo) {
    const utilizador = getUtilizadores().find(u => u.id === documentoAntigo.utilizadorId);
    
    // Detectar tipo de alteração
    if (updates.urlOuConteudo && updates.urlOuConteudo !== documentoAntigo.urlOuConteudo) {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'ATUALIZAR_DOCUMENTO',
        entidade: 'DocumentoUtilizador',
        entidadeId: id,
        descricao: `Documento atualizado: ${documentoAntigo.tipo} - Utilizador: ${utilizador?.nomeCompleto || 'desconhecido'}`,
      });
    }
    
    if (updates.estadoValidacao === 'APROVADO' && documentoAntigo.estadoValidacao !== 'APROVADO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'APROVAR_REGISTO_CRIMINAL',
        entidade: 'DocumentoUtilizador',
        entidadeId: id,
        descricao: `Registo criminal aprovado - Utilizador: ${utilizador?.nomeCompleto || 'desconhecido'}`,
      });
    } else if (updates.estadoValidacao === 'REJEITADO' && documentoAntigo.estadoValidacao !== 'REJEITADO') {
      addLog({
        utilizadorId: currentUser.id,
        utilizadorEmail: currentUser.email,
        acao: 'REJEITAR_REGISTO_CRIMINAL',
        entidade: 'DocumentoUtilizador',
        entidadeId: id,
        descricao: `Registo criminal rejeitado - Utilizador: ${utilizador?.nomeCompleto || 'desconhecido'}`,
      });
    }
  }
};

export const removeDocumento = (id: string) => remove(STORAGE_KEYS.DOCUMENTOS, id);
