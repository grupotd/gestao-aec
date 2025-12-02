'use client';

import { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Search,
  Clock
} from 'lucide-react';
import { RegistoSessao, PedidoSubstituicao, Utilizador, Escola, HorarioSessao } from '@/lib/types';
import SubstitutionRequest from './SubstitutionRequest';
import HorarioManager from './HorarioManager';

interface CoordenadorDashboardProps {
  registos: RegistoSessao[];
  horarios: HorarioSessao[];
  pedidos: PedidoSubstituicao[];
  escolas: Escola[];
  utilizadores: Utilizador[];
  currentUser: Utilizador;
  onCreateHorario: () => void;
  onEditHorario: (horario: HorarioSessao) => void;
  onDeleteHorario: (id: string) => void;
  onEditRegisto: (registo: RegistoSessao) => void;
  onApprovePedido: (id: string) => void;
  onRejectPedido: (id: string) => void;
  onAcceptPedido: (id: string) => void;
  onDeclinePedido: (id: string) => void;
}

export default function CoordenadorDashboard({
  registos,
  horarios,
  pedidos,
  escolas,
  utilizadores,
  currentUser,
  onCreateHorario,
  onEditHorario,
  onDeleteHorario,
  onEditRegisto,
  onApprovePedido,
  onRejectPedido,
  onAcceptPedido,
  onDeclinePedido,
}: CoordenadorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'horarios' | 'registos' | 'pedidos'>('horarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEscola, setFilterEscola] = useState('');
  const [filterTecnico, setFilterTecnico] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');

  // TODO: Futuramente, filtrar por escolas associadas ao coordenador
  // const escolasAssociadas = currentUser.escolas_ids || [];
  // const horariosFiltradasPorEscola = horarios.filter(h => escolasAssociadas.includes(h.escola_id));
  
  // Por enquanto, coordenador vê todos os horários e registos
  const horariosVisiveis = horarios;
  const registosVisiveis = registos;
  const pedidosVisiveis = pedidos;

  // Calcular KPIs
  const hoje = new Date().toISOString().split('T')[0];
  const totalHorariosAtivos = horariosVisiveis.filter(h => h.ativo).length;
  const registosRealizados = registosVisiveis.filter(r => r.estado === 'REALIZADA').length;
  const registosFaltas = registosVisiveis.filter(r => 
    r.estado !== 'REALIZADA' && r.data < hoje
  ).length;
  const pedidosPendentes = pedidosVisiveis.filter(
    p => p.estado === 'PENDENTE_APROVACAO' || p.estado === 'PENDENTE_ACEITACAO_TECNICO'
  ).length;

  // Filtrar registos
  const getFilteredRegistos = () => {
    let filtered = registosVisiveis;

    if (filterEscola) {
      filtered = filtered.filter(r => {
        const horario = horarios.find(h => h.id === r.horario_sessao_id);
        return horario?.escola_id === filterEscola;
      });
    }

    if (filterTecnico) {
      filtered = filtered.filter(r => r.tecnico_responsavel_id === filterTecnico);
    }

    if (filterEstado) {
      filtered = filtered.filter(r => r.estado === filterEstado);
    }

    if (filterDataInicio) {
      filtered = filtered.filter(r => r.data >= filterDataInicio);
    }
    if (filterDataFim) {
      filtered = filtered.filter(r => r.data <= filterDataFim);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const horario = horarios.find(h => h.id === r.horario_sessao_id);
        const escola = escolas.find(e => e.id === horario?.escola_id);
        const tecnico = utilizadores.find(u => u.id === r.tecnico_responsavel_id);
        
        return (
          horario?.turma_id.toLowerCase().includes(searchLower) ||
          horario?.atividade.toLowerCase().includes(searchLower) ||
          escola?.nome.toLowerCase().includes(searchLower) ||
          tecnico?.nome.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  };

  const filteredRegistos = getFilteredRegistos();
  const tecnicos = utilizadores.filter(u => u.perfil === 'TECNICO');

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalHorariosAtivos}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Horários Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{registosRealizados}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessões Realizadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{registosFaltas}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Não Confirmadas / Faltas</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pedidosPendentes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pedidos Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('horarios')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'horarios'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Horários
          </button>
          <button
            onClick={() => setActiveTab('registos')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'registos'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Registos de Sessões
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'pedidos'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Pedidos de Substituição
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'horarios' && (
            <HorarioManager
              horarios={horariosVisiveis}
              escolas={escolas}
              utilizadores={utilizadores}
              onCreateHorario={onCreateHorario}
              onEditHorario={onEditHorario}
              onDeleteHorario={onDeleteHorario}
            />
          )}

          {activeTab === 'registos' && (
            <>
              {/* Barra de pesquisa e filtros */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar registos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <select
                    value={filterEscola}
                    onChange={(e) => setFilterEscola(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todas as Escolas</option>
                    {escolas.map(escola => (
                      <option key={escola.id} value={escola.id}>{escola.nome}</option>
                    ))}
                  </select>

                  <select
                    value={filterTecnico}
                    onChange={(e) => setFilterTecnico(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todos os Técnicos</option>
                    {tecnicos.map(tecnico => (
                      <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
                    ))}
                  </select>

                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todos os Estados</option>
                    <option value="PLANEADA">Planeada</option>
                    <option value="REALIZADA">Realizada</option>
                    <option value="FALTA_TECNICO">Falta Técnico</option>
                    <option value="SUBSTITUIDA">Substituída</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>

                  <input
                    type="date"
                    value={filterDataInicio}
                    onChange={(e) => setFilterDataInicio(e.target.value)}
                    placeholder="Data início"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />

                  <input
                    type="date"
                    value={filterDataFim}
                    onChange={(e) => setFilterDataFim(e.target.value)}
                    placeholder="Data fim"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Tabela de registos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Escola</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Turma</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Atividade</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Técnico</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nº Alunos</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistos.map((registo) => {
                      const horario = horarios.find(h => h.id === registo.horario_sessao_id);
                      const escola = escolas.find(e => e.id === horario?.escola_id);
                      const tecnico = utilizadores.find(u => u.id === registo.tecnico_responsavel_id);
                      
                      return (
                        <tr key={registo.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                            {new Date(registo.data).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{escola?.nome}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{horario?.turma_id}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{horario?.atividade}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{tecnico?.nome}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              registo.estado === 'REALIZADA'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : registo.estado === 'CANCELADA'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : registo.estado === 'FALTA_TECNICO'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {registo.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                            {registo.numero_alunos_presentes || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => onEditRegisto(registo)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredRegistos.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhum registo encontrado</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'pedidos' && (
            <>
              <div className="space-y-4">
                {pedidosVisiveis.map((pedido) => {
                  const registo = registos.find(r => r.id === pedido.sessao_id);
                  const horario = registo ? horarios.find(h => h.id === registo.horario_sessao_id) : null;
                  
                  return (
                    <SubstitutionRequest
                      key={pedido.id}
                      pedido={pedido}
                      sessao={registo ? {
                        id: registo.id,
                        escola_id: horario?.escola_id || '',
                        turma: horario?.turma_id || '',
                        tecnico_id: registo.tecnico_responsavel_id,
                        data: registo.data,
                        hora_inicio: horario?.hora_inicio || '',
                        estado: registo.estado === 'REALIZADA' ? 'REALIZADA' : 'AGENDADA',
                      } : undefined}
                      tecnicoOrigem={utilizadores.find(u => u.id === pedido.tecnico_origem_id)}
                      tecnicoSubstituto={utilizadores.find(u => u.id === pedido.tecnico_substituto_id)}
                      onApprove={onApprovePedido}
                      onReject={onRejectPedido}
                      onAccept={onAcceptPedido}
                      onDecline={onDeclinePedido}
                      showActions={true}
                      currentUserId={currentUser.id}
                    />
                  );
                })}

                {pedidosVisiveis.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhum pedido de substituição</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
