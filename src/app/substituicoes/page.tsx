'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Filter,
  Calendar,
  School,
  User,
  Activity,
  FileText
} from 'lucide-react';
import { 
  getCurrentUser, 
  getPedidos, 
  getRegistos,
  getHorarios, 
  getEscolas, 
  getUtilizadores 
} from '@/lib/storage';
import { PedidoSubstituicao, Utilizador, RegistoSessao, HorarioSessao, Escola } from '@/lib/types';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/lib/export';

export default function SubstituicoesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Utilizador | null>(null);
  const [pedidos, setPedidos] = useState<PedidoSubstituicao[]>([]);
  const [registos, setRegistos] = useState<RegistoSessao[]>([]);
  const [horarios, setHorarios] = useState<HorarioSessao[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<PedidoSubstituicao[]>([]);
  
  // Filtros
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTecnicoOrigem, setFilterTecnicoOrigem] = useState('');
  const [filterTecnicoSubstituto, setFilterTecnicoSubstituto] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }

    // Apenas ADMINISTRADOR e COORDENADOR podem acessar
    if (user.perfil === 'TECNICO') {
      router.push('/');
      return;
    }

    setCurrentUser(user);
    loadData();
  }, [router]);

  const loadData = () => {
    const allPedidos = getPedidos();
    const allRegistos = getRegistos();
    const allHorarios = getHorarios();
    const allEscolas = getEscolas();
    const allUtilizadores = getUtilizadores();

    // Ordenar por data de criação mais recente primeiro
    const sortedPedidos = allPedidos.sort((a, b) => 
      new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    );

    setPedidos(sortedPedidos);
    setRegistos(allRegistos);
    setHorarios(allHorarios);
    setEscolas(allEscolas);
    setUtilizadores(allUtilizadores);
    setFilteredPedidos(sortedPedidos);
  };

  useEffect(() => {
    applyFilters();
  }, [filterEstado, filterTecnicoOrigem, filterTecnicoSubstituto, filterDataInicio, filterDataFim, pedidos]);

  const applyFilters = () => {
    let filtered = [...pedidos];

    // Filtro por estado
    if (filterEstado) {
      filtered = filtered.filter(p => p.estado === filterEstado);
    }

    // Filtro por técnico origem
    if (filterTecnicoOrigem) {
      filtered = filtered.filter(p => p.tecnico_origem_id === filterTecnicoOrigem);
    }

    // Filtro por técnico substituto
    if (filterTecnicoSubstituto) {
      filtered = filtered.filter(p => p.tecnico_substituto_id === filterTecnicoSubstituto);
    }

    // Filtro por intervalo de datas (data de criação do pedido)
    if (filterDataInicio) {
      const dataInicio = new Date(filterDataInicio);
      filtered = filtered.filter(p => new Date(p.dataCriacao) >= dataInicio);
    }

    if (filterDataFim) {
      const dataFim = new Date(filterDataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.dataCriacao) <= dataFim);
    }

    setFilteredPedidos(filtered);
  };

  const clearFilters = () => {
    setFilterEstado('');
    setFilterTecnicoOrigem('');
    setFilterTecnicoSubstituto('');
    setFilterDataInicio('');
    setFilterDataFim('');
  };

  const getRegistoInfo = (sessaoId: string) => {
    return registos.find(r => r.id === sessaoId);
  };

  const getHorarioInfo = (horarioId: string) => {
    return horarios.find(h => h.id === horarioId);
  };

  const getEscolaName = (escolaId: string) => {
    return escolas.find(e => e.id === escolaId)?.nome || 'N/A';
  };

  const getTecnicoName = (tecnicoId: string) => {
    return utilizadores.find(u => u.id === tecnicoId)?.nomeCompleto || 'N/A';
  };

  const handleExportCSV = () => {
    const exportData = filteredPedidos.map(pedido => {
      const registo = getRegistoInfo(pedido.sessao_id);
      const horario = registo ? getHorarioInfo(registo.horario_sessao_id) : null;
      
      return {
        'Data do Pedido': new Date(pedido.dataCriacao).toLocaleDateString('pt-PT'),
        'Escola': horario ? getEscolaName(horario.escola_id) : 'N/A',
        'Turma': horario?.turma_id || 'N/A',
        'Data da Sessão': registo?.data || 'N/A',
        'Técnico Origem': getTecnicoName(pedido.tecnico_origem_id),
        'Técnico Substituto': getTecnicoName(pedido.tecnico_substituto_id),
        'Estado': pedido.estado,
        'Motivo': pedido.motivo,
        'Data Atualização': new Date(pedido.dataAtualizacao).toLocaleDateString('pt-PT')
      };
    });
    
    exportToCSV('pedidos_substituicao', exportData);
  };

  const handleExportXLSX = () => {
    const exportData = filteredPedidos.map(pedido => {
      const registo = getRegistoInfo(pedido.sessao_id);
      const horario = registo ? getHorarioInfo(registo.horario_sessao_id) : null;
      
      return {
        'Data do Pedido': new Date(pedido.dataCriacao).toLocaleDateString('pt-PT'),
        'Escola': horario ? getEscolaName(horario.escola_id) : 'N/A',
        'Turma': horario?.turma_id || 'N/A',
        'Data da Sessão': registo?.data || 'N/A',
        'Técnico Origem': getTecnicoName(pedido.tecnico_origem_id),
        'Técnico Substituto': getTecnicoName(pedido.tecnico_substituto_id),
        'Estado': pedido.estado,
        'Motivo': pedido.motivo,
        'Data Atualização': new Date(pedido.dataAtualizacao).toLocaleDateString('pt-PT')
      };
    });
    
    exportToXLSX('pedidos_substituicao', exportData);
  };

  const handleExportPDF = () => {
    const exportData = filteredPedidos.map(pedido => {
      const registo = getRegistoInfo(pedido.sessao_id);
      const horario = registo ? getHorarioInfo(registo.horario_sessao_id) : null;
      
      return {
        dataPedido: new Date(pedido.dataCriacao).toLocaleDateString('pt-PT'),
        escola: horario ? getEscolaName(horario.escola_id) : 'N/A',
        turma: horario?.turma_id || 'N/A',
        dataSessao: registo?.data || 'N/A',
        tecnicoOrigem: getTecnicoName(pedido.tecnico_origem_id),
        tecnicoSubstituto: getTecnicoName(pedido.tecnico_substituto_id),
        estado: pedido.estado,
        motivo: pedido.motivo.substring(0, 50)
      };
    });

    const columns = [
      { key: 'dataPedido', label: 'Data Pedido' },
      { key: 'escola', label: 'Escola' },
      { key: 'turma', label: 'Turma' },
      { key: 'dataSessao', label: 'Data Sessão' },
      { key: 'tecnicoOrigem', label: 'Técnico Origem' },
      { key: 'tecnicoSubstituto', label: 'Técnico Substituto' },
      { key: 'estado', label: 'Estado' },
      { key: 'motivo', label: 'Motivo' }
    ];
    
    exportToPDF('Pedidos de Substituição', exportData, columns);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'APROVADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PENDENTE_APROVACAO':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'PENDENTE_ACEITACAO_TECNICO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'RECUSADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!currentUser) {
    return null;
  }

  const tecnicos = utilizadores.filter(u => u.perfil === 'TECNICO');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Pedidos de Substituição
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestão de pedidos de substituição de técnicos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              <button
                onClick={handleExportXLSX}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">XLSX</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Activity className="w-4 h-4 inline mr-1" />
                Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os estados</option>
                <option value="PENDENTE_APROVACAO">Pendente Aprovação</option>
                <option value="PENDENTE_ACEITACAO_TECNICO">Pendente Aceitação Técnico</option>
                <option value="APROVADO">Aprovado</option>
                <option value="RECUSADO">Recusado</option>
              </select>
            </div>

            {/* Filtro por Técnico Origem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Técnico Origem
              </label>
              <select
                value={filterTecnicoOrigem}
                onChange={(e) => setFilterTecnicoOrigem(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os técnicos</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>{tecnico.nomeCompleto}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Técnico Substituto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Técnico Substituto
              </label>
              <select
                value={filterTecnicoSubstituto}
                onChange={(e) => setFilterTecnicoSubstituto(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os técnicos</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>{tecnico.nomeCompleto}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={filterDataInicio}
                onChange={(e) => setFilterDataInicio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={filterDataFim}
                onChange={(e) => setFilterDataFim(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Botão Limpar Filtros */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredPedidos.length}</span> de <span className="font-semibold text-gray-900 dark:text-gray-100">{pedidos.length}</span> pedidos
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Data Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Escola
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Data Sessão
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Técnico Origem
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Técnico Substituto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPedidos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Nenhum pedido encontrado
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPedidos.map((pedido) => {
                    const registo = getRegistoInfo(pedido.sessao_id);
                    const horario = registo ? getHorarioInfo(registo.horario_sessao_id) : null;
                    
                    return (
                      <tr 
                        key={pedido.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(pedido.dataCriacao).toLocaleDateString('pt-PT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {horario ? getEscolaName(horario.escola_id) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {registo ? new Date(registo.data).toLocaleDateString('pt-PT') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {getTecnicoName(pedido.tecnico_origem_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {getTecnicoName(pedido.tecnico_substituto_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(pedido.estado)}`}>
                            {pedido.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {pedido.motivo}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
