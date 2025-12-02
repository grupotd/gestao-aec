// Tipos de dados para o sistema AEC

export type PerfilUsuario = 'ADMINISTRADOR' | 'COORDENADOR' | 'TECNICO';

export type EstadoSessao = 'AGENDADA' | 'REALIZADA' | 'CANCELADA';

export type EstadoRegistoSessao = 
  | 'PLANEADA' 
  | 'REALIZADA' 
  | 'FALTA_TECNICO' 
  | 'SUBSTITUIDA' 
  | 'CANCELADA';

export type EstadoPedidoSubstituicao = 
  | 'PENDENTE_APROVACAO' 
  | 'PENDENTE_ACEITACAO_TECNICO' 
  | 'APROVADO' 
  | 'RECUSADO';

export type TipoDocumento = 
  | 'REGISTO_CRIMINAL'
  | 'CC_FRENTE'
  | 'CC_VERSO'
  | 'CONTRATO_ASSINADO';

export type EstadoValidacao = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface Utilizador {
  id: string;
  nomeCompleto: string;
  email: string;
  password: string; // Senha em texto simples para MVP
  perfil: PerfilUsuario;
  codigoTecnico?: string;
  nif: string;
  niss: string;
  dataNascimento: string;
  ativo: boolean;
}

export interface DocumentoUtilizador {
  id: string;
  utilizadorId: string;
  tipo: TipoDocumento;
  nomeFicheiro: string;
  urlOuConteudo: string; // Base64 ou URL
  estadoValidacao: EstadoValidacao;
  validadoPor?: string; // email ou id do utilizador que validou
  dataValidacao?: string;
}

export interface Escola {
  id: string;
  nome: string;
  localidade: string;
}

// Modelo antigo - manter para compatibilidade temporária
export interface Sessao {
  id: string;
  escola_id: string;
  turma: string;
  tecnico_id: string;
  data: string;
  hora_inicio: string;
  estado: EstadoSessao;
  numero_alunos_presentes?: number;
  sumario?: string;
  ocorrencias?: string;
  assinada?: boolean;
}

// NOVO: Horário recorrente (plano semanal ao longo de 6 meses)
export interface HorarioSessao {
  id: string;
  escola_id: string;
  turma_id: string;
  tecnico_id: string;
  atividade: string; // ou atividade_id se houver tabela de atividades
  dia_semana: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  hora_inicio: string;
  hora_fim: string;
  data_inicio: string; // Data de início de vigência
  data_fim: string; // Data de fim de vigência
  ativo: boolean;
}

// NOVO: Registo diário de uma sessão específica
export interface RegistoSessao {
  id: string;
  horario_sessao_id: string; // FK para HorarioSessao
  data: string; // Data concreta da sessão
  estado: EstadoRegistoSessao;
  numero_alunos_presentes?: number;
  sumario?: string;
  ocorrencias?: string;
  assinada: boolean;
  tecnico_responsavel_id: string; // FK para Utilizador (pode ser diferente do horário se houver substituição)
}

export interface PedidoSubstituicao {
  id: string;
  sessao_id: string;
  tecnico_origem_id: string;
  tecnico_substituto_id: string;
  estado: EstadoPedidoSubstituicao;
  motivo: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// NOVO: Sistema de Logs/Auditoria
export interface LogEntry {
  id: string;
  utilizadorId: string;
  utilizadorEmail: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  descricao: string;
  dataHora: string; // ISO timestamp
}
