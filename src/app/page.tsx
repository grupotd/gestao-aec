'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, 
  LogOut, 
  X,
  AlertCircle,
} from 'lucide-react';
import { 
  initializeData, 
  login, 
  logout, 
  getCurrentUser,
  getEscolas,
  getUtilizadores,
  getPedidos,
  addPedido,
  updatePedido,
  getHorarios,
  addHorario,
  updateHorario,
  removeHorario,
  getRegistos,
  addRegisto,
  updateRegisto,
  gerarRegistosSemana,
} from '@/lib/storage';
import { Utilizador, PedidoSubstituicao, HorarioSessao, RegistoSessao } from '@/lib/types';
import AdminDashboard from '@/components/custom/AdminDashboard';
import CoordenadorDashboard from '@/components/custom/CoordenadorDashboard';
import TecnicoDashboard from '@/components/custom/TecnicoDashboard';

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState<Utilizador | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [horarios, setHorarios] = useState<HorarioSessao[]>([]);
  const [registos, setRegistos] = useState<RegistoSessao[]>([]);
  const [pedidos, setPedidos] = useState<PedidoSubstituicao[]>([]);
  
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [selectedRegisto, setSelectedRegisto] = useState<RegistoSessao | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<HorarioSessao | null>(null);
  
  const [presenceData, setPresenceData] = useState({
    numero_alunos_presentes: 0,
    sumario: '',
    ocorrencias: '',
    assinada: false,
  });
  
  const [substitutionData, setSubstitutionData] = useState({
    tecnico_substituto_id: '',
    motivo: '',
  });

  const [horarioData, setHorarioData] = useState({
    escola_id: '',
    turma_id: '',
    tecnico_id: '',
    atividade: '',
    dia_semana: 1,
    hora_inicio: '',
    hora_fim: '',
    data_inicio: '',
    data_fim: '',
    ativo: true,
  });

  useEffect(() => {
    initializeData();
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      loadData();
    }
  }, []);

  const loadData = () => {
    setHorarios(getHorarios());
    setRegistos(getRegistos());
    setPedidos(getPedidos());
    
    // Gerar registos para as próximas 2 semanas
    const hoje = new Date();
    const duasSemanasDepois = new Date();
    duasSemanasDepois.setDate(hoje.getDate() + 14);
    
    const novosRegistos = gerarRegistosSemana(hoje, duasSemanasDepois);
    novosRegistos.forEach(registo => {
      addRegisto(registo);
    });
    
    // Recarregar registos após gerar novos
    setRegistos(getRegistos());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      loadData();
    } else {
      setLoginError('Email ou password incorretos');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  const handleRegisterPresence = (registo: RegistoSessao) => {
    setSelectedRegisto(registo);
    setPresenceData({
      numero_alunos_presentes: registo.numero_alunos_presentes || 0,
      sumario: registo.sumario || '',
      ocorrencias: registo.ocorrencias || '',
      assinada: registo.assinada || false,
    });
    setShowPresenceModal(true);
  };

  const savePresence = () => {
    if (selectedRegisto && currentUser) {
      // Se técnico assinar, muda estado para REALIZADA
      const novoEstado = presenceData.assinada ? 'REALIZADA' : selectedRegisto.estado;
      
      updateRegisto(selectedRegisto.id, {
        ...presenceData,
        estado: novoEstado,
      });
      loadData();
      setShowPresenceModal(false);
      setSelectedRegisto(null);
    }
  };

  const handleRequestSubstitution = (registo: RegistoSessao) => {
    setSelectedRegisto(registo);
    setSubstitutionData({ tecnico_substituto_id: '', motivo: '' });
    setShowSubstitutionModal(true);
  };

  const saveSubstitution = () => {
    if (selectedRegisto && currentUser && substitutionData.tecnico_substituto_id && substitutionData.motivo) {
      const agora = new Date().toISOString();
      const novoPedido: PedidoSubstituicao = {
        id: Date.now().toString(),
        sessao_id: selectedRegisto.id,
        tecnico_origem_id: currentUser.id,
        tecnico_substituto_id: substitutionData.tecnico_substituto_id,
        estado: 'PENDENTE_APROVACAO',
        motivo: substitutionData.motivo,
        dataCriacao: agora,
        dataAtualizacao: agora,
      };
      addPedido(novoPedido);
      loadData();
      setShowSubstitutionModal(false);
      setSelectedRegisto(null);
    }
  };

  // ADMIN/COORDENADOR aprova pedido
  const handleApprovePedido = (pedidoId: string) => {
    updatePedido(pedidoId, { estado: 'PENDENTE_ACEITACAO_TECNICO' });
    loadData();
  };

  // ADMIN/COORDENADOR recusa pedido
  const handleRejectPedido = (pedidoId: string) => {
    updatePedido(pedidoId, { estado: 'RECUSADO' });
    loadData();
  };

  // TÉCNICO SUBSTITUTO aceita pedido
  const handleAcceptPedido = (pedidoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      // Atualiza o estado do pedido para APROVADO
      updatePedido(pedidoId, { estado: 'APROVADO' });
      
      // Atualiza o registo com o novo técnico
      updateRegisto(pedido.sessao_id, { 
        tecnico_responsavel_id: pedido.tecnico_substituto_id,
        estado: 'SUBSTITUIDA'
      });
      
      loadData();
    }
  };

  // TÉCNICO SUBSTITUTO recusa pedido
  const handleDeclinePedido = (pedidoId: string) => {
    updatePedido(pedidoId, { estado: 'RECUSADO' });
    loadData();
  };

  const handleCreateHorario = () => {
    const hoje = new Date();
    const dataInicio = hoje.toISOString().split('T')[0];
    const seisMesesDepois = new Date();
    seisMesesDepois.setMonth(hoje.getMonth() + 6);
    const dataFim = seisMesesDepois.toISOString().split('T')[0];

    setSelectedHorario(null);
    setHorarioData({ 
      escola_id: '', 
      turma_id: '', 
      tecnico_id: '',
      atividade: '',
      dia_semana: 1,
      hora_inicio: '', 
      hora_fim: '',
      data_inicio: dataInicio,
      data_fim: dataFim,
      ativo: true,
    });
    setShowHorarioModal(true);
  };

  const handleEditHorario = (horario: HorarioSessao) => {
    setSelectedHorario(horario);
    setHorarioData({
      escola_id: horario.escola_id,
      turma_id: horario.turma_id,
      tecnico_id: horario.tecnico_id,
      atividade: horario.atividade,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fim: horario.hora_fim,
      data_inicio: horario.data_inicio,
      data_fim: horario.data_fim,
      ativo: horario.ativo,
    });
    setShowHorarioModal(true);
  };

  const saveHorario = () => {
    if (currentUser && horarioData.escola_id && horarioData.turma_id && horarioData.tecnico_id && 
        horarioData.atividade && horarioData.hora_inicio && horarioData.hora_fim &&
        horarioData.data_inicio && horarioData.data_fim) {
      
      if (selectedHorario) {
        // Editar horário existente
        updateHorario(selectedHorario.id, horarioData);
      } else {
        // Criar novo horário
        const novoHorario: HorarioSessao = {
          id: Date.now().toString(),
          ...horarioData,
        };
        addHorario(novoHorario);
      }
      
      loadData();
      setShowHorarioModal(false);
      setSelectedHorario(null);
    }
  };

  const handleDeleteHorario = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este horário?')) {
      removeHorario(id);
      loadData();
    }
  };

  const escolas = getEscolas();
  const utilizadores = getUtilizadores();
  const tecnicos = utilizadores.filter(u => u.perfil === 'TECNICO');

  // Verificar se usuário pode editar todos os campos (ADMIN ou COORDENADOR)
  const canEditAllFields = currentUser?.perfil === 'ADMINISTRADOR' || currentUser?.perfil === 'COORDENADOR';

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Gestão AEC
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de Gestão de Atividades de Enriquecimento Curricular
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="seu@email.pt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Credenciais de teste:</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">Admin: admin@aec.pt / admin123</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">Coordenador: coord@aec.pt / coord123</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">Técnico: tecnico@aec.pt / tecnico123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gestão AEC</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentUser.nomeCompleto} - {
                    currentUser.perfil === 'ADMINISTRADOR' ? 'Administrador' :
                    currentUser.perfil === 'COORDENADOR' ? 'Coordenador' :
                    'Técnico'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Renderizar dashboard baseado no perfil */}
        {currentUser.perfil === 'ADMINISTRADOR' && (
          <AdminDashboard
            registos={registos}
            horarios={horarios}
            pedidos={pedidos}
            escolas={escolas}
            utilizadores={utilizadores}
            currentUser={currentUser}
            onCreateHorario={handleCreateHorario}
            onEditHorario={handleEditHorario}
            onDeleteHorario={handleDeleteHorario}
            onEditRegisto={handleRegisterPresence}
            onApprovePedido={handleApprovePedido}
            onRejectPedido={handleRejectPedido}
            onAcceptPedido={handleAcceptPedido}
            onDeclinePedido={handleDeclinePedido}
          />
        )}

        {currentUser.perfil === 'COORDENADOR' && (
          <CoordenadorDashboard
            registos={registos}
            horarios={horarios}
            pedidos={pedidos}
            escolas={escolas}
            utilizadores={utilizadores}
            currentUser={currentUser}
            onCreateHorario={handleCreateHorario}
            onEditHorario={handleEditHorario}
            onDeleteHorario={handleDeleteHorario}
            onEditRegisto={handleRegisterPresence}
            onApprovePedido={handleApprovePedido}
            onRejectPedido={handleRejectPedido}
            onAcceptPedido={handleAcceptPedido}
            onDeclinePedido={handleDeclinePedido}
          />
        )}

        {currentUser.perfil === 'TECNICO' && (
          <TecnicoDashboard
            registos={registos}
            horarios={horarios}
            pedidos={pedidos}
            escolas={escolas}
            utilizadores={utilizadores}
            currentUser={currentUser}
            onRequestSubstitution={handleRequestSubstitution}
            onRegisterPresence={handleRegisterPresence}
            onAcceptPedido={handleAcceptPedido}
            onDeclinePedido={handleDeclinePedido}
          />
        )}
      </main>

      {/* Modal - Registar Presença (TÉCNICO) */}
      {showPresenceModal && selectedRegisto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Registar Presença</h2>
              <button
                onClick={() => setShowPresenceModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Alunos Presentes
                </label>
                <input
                  type="number"
                  min="0"
                  value={presenceData.numero_alunos_presentes}
                  onChange={(e) => setPresenceData({ ...presenceData, numero_alunos_presentes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sumário da Sessão
                </label>
                <textarea
                  value={presenceData.sumario}
                  onChange={(e) => setPresenceData({ ...presenceData, sumario: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Descreva as atividades realizadas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ocorrências (opcional)
                </label>
                <textarea
                  value={presenceData.ocorrencias}
                  onChange={(e) => setPresenceData({ ...presenceData, ocorrencias: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Registe eventuais ocorrências..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <input
                  type="checkbox"
                  id="assinada"
                  checked={presenceData.assinada}
                  onChange={(e) => setPresenceData({ ...presenceData, assinada: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="assinada" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Confirmo que a sessão foi realizada e assino este registo
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowPresenceModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={savePresence}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Pedido de Substituição */}
      {showSubstitutionModal && selectedRegisto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pedido de Substituição</h2>
              <button
                onClick={() => setShowSubstitutionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Técnico Substituto
                </label>
                <select
                  value={substitutionData.tecnico_substituto_id}
                  onChange={(e) => setSubstitutionData({ ...substitutionData, tecnico_substituto_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um técnico</option>
                  {tecnicos.filter(t => t.id !== currentUser.id && t.ativo).map(tecnico => (
                    <option key={tecnico.id} value={tecnico.id}>{tecnico.nomeCompleto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo da Substituição
                </label>
                <textarea
                  value={substitutionData.motivo}
                  onChange={(e) => setSubstitutionData({ ...substitutionData, motivo: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Explique o motivo do pedido..."
                  required
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowSubstitutionModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveSubstitution}
                disabled={!substitutionData.motivo || !substitutionData.tecnico_substituto_id}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Criar/Editar Horário (apenas ADMIN e COORDENADOR) */}
      {showHorarioModal && canEditAllFields && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedHorario ? 'Editar Horário' : 'Novo Horário'}
              </h2>
              <button
                onClick={() => setShowHorarioModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Escola
                  </label>
                  <select
                    value={horarioData.escola_id}
                    onChange={(e) => setHorarioData({ ...horarioData, escola_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma escola</option>
                    {escolas.map(escola => (
                      <option key={escola.id} value={escola.id}>{escola.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Técnico
                  </label>
                  <select
                    value={horarioData.tecnico_id}
                    onChange={(e) => setHorarioData({ ...horarioData, tecnico_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um técnico</option>
                    {tecnicos.filter(t => t.ativo).map(tecnico => (
                      <option key={tecnico.id} value={tecnico.id}>{tecnico.nomeCompleto}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Turma
                  </label>
                  <input
                    type="text"
                    value={horarioData.turma_id}
                    onChange={(e) => setHorarioData({ ...horarioData, turma_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 3º A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Atividade
                  </label>
                  <input
                    type="text"
                    value={horarioData.atividade}
                    onChange={(e) => setHorarioData({ ...horarioData, atividade: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Expressão Plástica"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dia da Semana
                  </label>
                  <select
                    value={horarioData.dia_semana}
                    onChange={(e) => setHorarioData({ ...horarioData, dia_semana: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {DIAS_SEMANA.map(dia => (
                      <option key={dia.value} value={dia.value}>{dia.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    value={horarioData.hora_inicio}
                    onChange={(e) => setHorarioData({ ...horarioData, hora_inicio: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de Fim
                  </label>
                  <input
                    type="time"
                    value={horarioData.hora_fim}
                    onChange={(e) => setHorarioData({ ...horarioData, hora_fim: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={horarioData.data_inicio}
                    onChange={(e) => setHorarioData({ ...horarioData, data_inicio: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={horarioData.data_fim}
                    onChange={(e) => setHorarioData({ ...horarioData, data_fim: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={horarioData.ativo}
                    onChange={(e) => setHorarioData({ ...horarioData, ativo: e.target.checked })}
                    className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Horário Ativo
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowHorarioModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveHorario}
                disabled={!horarioData.escola_id || !horarioData.turma_id || !horarioData.tecnico_id || 
                  !horarioData.atividade || !horarioData.hora_inicio || !horarioData.hora_fim ||
                  !horarioData.data_inicio || !horarioData.data_fim}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedHorario ? 'Guardar Alterações' : 'Criar Horário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
