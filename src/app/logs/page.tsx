'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Filter,
  Calendar,
  User,
  FileText,
  Activity
} from 'lucide-react';
import { getCurrentUser, loadLogs } from '@/lib/storage';
import { LogEntry, Utilizador } from '@/lib/types';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/lib/export';

export default function LogsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Utilizador | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  
  // Filtros
  const [filterEmail, setFilterEmail] = useState('');
  const [filterEntidade, setFilterEntidade] = useState('');
  const [filterAcao, setFilterAcao] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }

    // Apenas ADMINISTRADOR pode acessar logs completos
    if (user.perfil !== 'ADMINISTRADOR' && user.perfil !== 'COORDENADOR') {
      router.push('/');
      return;
    }

    setCurrentUser(user);
    loadLogsData(user);
  }, [router]);

  const loadLogsData = (user: Utilizador) => {
    let allLogs = loadLogs();
    
    // Ordenar por data mais recente primeiro
    allLogs = allLogs.sort((a, b) => 
      new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
    );

    // COORDENADOR vê apenas logs de técnicos
    if (user.perfil === 'COORDENADOR') {
      // Filtrar logs relacionados a utilizadores com perfil TECNICO
      // Isso pode ser feito verificando se a entidade é "Utilizador" e o perfil é TECNICO
      // Para simplificar, vamos mostrar todos os logs por enquanto
      // Em produção, seria necessário cruzar com dados de utilizadores
      allLogs = allLogs.filter(log => {
        // Filtrar logs que não sejam de ações administrativas críticas
        const acoesAdmin = ['CRIAR_UTILIZADOR', 'ALTERAR_PERFIL', 'RESETAR_PASSWORD'];
        return !acoesAdmin.includes(log.acao);
      });
    }

    setLogs(allLogs);
    setFilteredLogs(allLogs);
  };

  useEffect(() => {
    applyFilters();
  }, [filterEmail, filterEntidade, filterAcao, filterDataInicio, filterDataFim, logs]);

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtro por email
    if (filterEmail) {
      filtered = filtered.filter(log => 
        log.utilizadorEmail.toLowerCase().includes(filterEmail.toLowerCase())
      );
    }

    // Filtro por entidade
    if (filterEntidade) {
      filtered = filtered.filter(log => 
        log.entidade.toLowerCase().includes(filterEntidade.toLowerCase())
      );
    }

    // Filtro por ação
    if (filterAcao) {
      filtered = filtered.filter(log => 
        log.acao.toLowerCase().includes(filterAcao.toLowerCase())
      );
    }

    // Filtro por intervalo de datas
    if (filterDataInicio) {
      const dataInicio = new Date(filterDataInicio);
      filtered = filtered.filter(log => 
        new Date(log.dataHora) >= dataInicio
      );
    }

    if (filterDataFim) {
      const dataFim = new Date(filterDataFim);
      dataFim.setHours(23, 59, 59, 999); // Incluir todo o dia
      filtered = filtered.filter(log => 
        new Date(log.dataHora) <= dataFim
      );
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilterEmail('');
    setFilterEntidade('');
    setFilterAcao('');
    setFilterDataInicio('');
    setFilterDataFim('');
  };

  const handleExportCSV = () => {
    const exportData = filteredLogs.map(log => ({
      'Data/Hora': new Date(log.dataHora).toLocaleString('pt-PT'),
      'Email Utilizador': log.utilizadorEmail,
      'Ação': log.acao,
      'Entidade': log.entidade,
      'ID Entidade': log.entidadeId,
      'Descrição': log.descricao
    }));
    
    exportToCSV('logs_auditoria', exportData);
  };

  const handleExportXLSX = () => {
    const exportData = filteredLogs.map(log => ({
      'Data/Hora': new Date(log.dataHora).toLocaleString('pt-PT'),
      'Email Utilizador': log.utilizadorEmail,
      'Ação': log.acao,
      'Entidade': log.entidade,
      'ID Entidade': log.entidadeId,
      'Descrição': log.descricao
    }));
    
    exportToXLSX('logs_auditoria', exportData);
  };

  const handleExportPDF = () => {
    const exportData = filteredLogs.map(log => ({
      dataHora: new Date(log.dataHora).toLocaleString('pt-PT'),
      utilizadorEmail: log.utilizadorEmail,
      acao: log.acao,
      entidade: log.entidade,
      entidadeId: log.entidadeId,
      descricao: log.descricao
    }));

    const columns = [
      { key: 'dataHora', label: 'Data/Hora' },
      { key: 'utilizadorEmail', label: 'Email Utilizador' },
      { key: 'acao', label: 'Ação' },
      { key: 'entidade', label: 'Entidade' },
      { key: 'entidadeId', label: 'ID Entidade' },
      { key: 'descricao', label: 'Descrição' }
    ];
    
    exportToPDF('Logs de Auditoria', exportData, columns);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAcaoBadgeColor = (acao: string) => {
    if (acao.includes('CRIAR')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (acao.includes('EDITAR') || acao.includes('ATUALIZAR')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (acao.includes('APAGAR') || acao.includes('REJEITAR') || acao.includes('RECUSAR')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (acao.includes('APROVAR') || acao.includes('ACEITAR')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (acao.includes('LOGIN') || acao.includes('LOGOUT')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (!currentUser) {
    return null;
  }

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
                  Logs / Auditoria
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Histórico completo de ações no sistema
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
            {/* Filtro por Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Email Utilizador
              </label>
              <input
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Filtrar por email..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Entidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Entidade
              </label>
              <input
                type="text"
                value={filterEntidade}
                onChange={(e) => setFilterEntidade(e.target.value)}
                placeholder="Filtrar por entidade..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Ação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Activity className="w-4 h-4 inline mr-1" />
                Ação
              </label>
              <input
                type="text"
                value={filterAcao}
                onChange={(e) => setFilterAcao(e.target.value)}
                placeholder="Filtrar por ação..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
            Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredLogs.length}</span> de <span className="font-semibold text-gray-900 dark:text-gray-100">{logs.length}</span> registos
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Utilizador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Entidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Nenhum log encontrado
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr 
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(log.dataHora)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {log.utilizadorEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAcaoBadgeColor(log.acao)}`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {log.entidade}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.descricao}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
