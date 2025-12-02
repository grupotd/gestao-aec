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
  Activity
} from 'lucide-react';
import { 
  getCurrentUser, 
  getRegistos, 
  getHorarios, 
  getEscolas, 
  getUtilizadores 
} from '@/lib/storage';
import { RegistoSessao, Utilizador, HorarioSessao, Escola } from '@/lib/types';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/lib/export';

export default function SessoesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Utilizador | null>(null);
  const [registos, setRegistos] = useState<RegistoSessao[]>([]);
  const [horarios, setHorarios] = useState<HorarioSessao[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([]);
  const [filteredRegistos, setFilteredRegistos] = useState<RegistoSessao[]>([]);
  
  // Filtros
  const [filterEscola, setFilterEscola] = useState('');
  const [filterTecnico, setFilterTecnico] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
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
    const allRegistos = getRegistos();
    const allHorarios = getHorarios();
    const allEscolas = getEscolas();
    const allUtilizadores = getUtilizadores();

    // Ordenar por data mais recente primeiro
    const sortedRegistos = allRegistos.sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    setRegistos(sortedRegistos);
    setHorarios(allHorarios);
    setEscolas(allEscolas);
    setUtilizadores(allUtilizadores);
    setFilteredRegistos(sortedRegistos);
  };

  useEffect(() => {
    applyFilters();
  }, [filterEscola, filterTecnico, filterEstado, filterDataInicio, filterDataFim, registos]);

  const applyFilters = () => {
    let filtered = [...registos];

    // Filtro por escola
    if (filterEscola) {
      filtered = filtered.filter(r => {
        const horario = horarios.find(h => h.id === r.horario_sessao_id);
        return horario?.escola_id === filterEscola;
      });
    }

    // Filtro por técnico
    if (filterTecnico) {
      filtered = filtered.filter(r => r.tecnico_responsavel_id === filterTecnico);
    }

    // Filtro por estado
    if (filterEstado) {
      filtered = filtered.filter(r => r.estado === filterEstado);
    }

    // Filtro por intervalo de datas
    if (filterDataInicio) {
      filtered = filtered.filter(r => r.data >= filterDataInicio);
    }

    if (filterDataFim) {
      filtered = filtered.filter(r => r.data <= filterDataFim);
    }

    setFilteredRegistos(filtered);
  };

  const clearFilters = () => {
    setFilterEscola('');
    setFilterTecnico('');
    setFilterEstado('');
    setFilterDataInicio('');
    setFilterDataFim('');
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
    const exportData = filteredRegistos.map(registo => {
      const horario = getHorarioInfo(registo.horario_sessao_id);
      return {
        'Data': registo.data,
        'Escola': horario ? getEscolaName(horario.escola_id) : 'N/A',
        'Turma': horario?.turma_id || 'N/A',
        'Atividade': horario?.atividade || 'N/A',
        'Técnico': getTecnicoName(registo.tecnico_responsavel_id),
        'Estado': registo.estado,
        'Alunos Presentes': registo.numero_alunos_presentes || 0,
        'Sumário': registo.sumario || ''
      };
    });
    
    exportToCSV('sessoes_AEC', exportData);
  };

  const handleExportXLSX = () => {
    const exportData = filteredRegistos.map(registo => {
      const horario = getHorarioInfo(registo.horario_sessao_id);
      return {
        'Data': registo.data,
        'Escola': horario ? getEscolaName(horario.escola_id) : 'N/A',
        'Turma': horario?.turma_id || 'N/A',
        'Atividade': horario?.atividade || 'N/A',
        'Técnico': getTecnicoName(registo.tecnico_responsavel_id),
        'Estado': registo.estado,
        'Alunos Presentes': registo.numero_alunos_presentes || 0,
        'Sumário': registo.sumario || ''
      };
    });
    
    exportToXLSX('sessoes_AEC', exportData);
  };

  const handleExportPDF = () => {
    const exportData = filteredRegistos.map(registo => {
      const horario = getHorarioInfo(registo.horario_sessao_id);
      return {
        data: registo.data,
        escola: horario ? getEscolaName(horario.escola_id) : 'N/A',
        turma: horario?.turma_id || 'N/A',
        atividade: horario?.atividade || 'N/A',
        tecnico: getTecnicoName(registo.tecnico_responsavel_id),
        estado: registo.estado,
        alunos: registo.numero_alunos_presentes || 0,
        sumario: registo.sumario ? registo.sumario.substring(0, 100) : ''
      };
    });

    const columns = [
      { key: 'data', label: 'Data' },
      { key: 'escola', label: 'Escola' },
      { key: 'turma', label: 'Turma' },
      { key: 'atividade', label: 'Atividade' },
      { key: 'tecnico', label: 'Técnico' },
      { key: 'estado', label: 'Estado' },
      { key: 'alunos', label: 'Alunos' },
      { key: 'sumario', label: 'Sumário' }
    ];
    
    exportToPDF('Registos de Sessões AEC', exportData, columns);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'REALIZADA':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PLANEADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'FALTA_TECNICO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'SUBSTITUIDA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'CANCELADA':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
                  Registos de Sessões
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Histórico completo de sessões AEC
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
            {/* Filtro por Escola */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <School className="w-4 h-4 inline mr-1" />
                Escola
              </label>
              <select
                value={filterEscola}
                onChange={(e) => setFilterEscola(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as escolas</option>
                {escolas.map(escola => (
                  <option key={escola.id} value={escola.id}>{escola.nome}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Técnico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Técnico
              </label>
              <select
                value={filterTecnico}
                onChange={(e) => setFilterTecnico(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os técnicos</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>{tecnico.nomeCompleto}</option>
                ))}
              </select>
            </div>

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
                <option value="PLANEADA">Planeada</option>
                <option value="REALIZADA">Realizada</option>
                <option value="FALTA_TECNICO">Falta Técnico</option>
                <option value="SUBSTITUIDA">Substituída</option>
                <option value="CANCELADA">Cancelada</option>
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
            Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredRegistos.length}</span> de <span className="font-semibold text-gray-900 dark:text-gray-100">{registos.length}</span> sessões
          </div>
        </div>

        {/* Tabela de Sessões */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Escola
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Atividade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Alunos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRegistos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Nenhuma sessão encontrada
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRegistos.map((registo) => {
                    const horario = getHorarioInfo(registo.horario_sessao_id);
                    return (
                      <tr 
                        key={registo.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(registo.data).toLocaleDateString('pt-PT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {horario ? getEscolaName(horario.escola_id) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {horario?.turma_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {horario?.atividade || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {getTecnicoName(registo.tecnico_responsavel_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(registo.estado)}`}>
                            {registo.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {registo.numero_alunos_presentes || 0}
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
