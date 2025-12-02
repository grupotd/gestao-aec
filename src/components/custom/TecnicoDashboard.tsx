'use client';

import { 
  Calendar, 
  CheckCircle, 
  Clock,
  FileText
} from 'lucide-react';
import { RegistoSessao, PedidoSubstituicao, Utilizador, Escola, HorarioSessao } from '@/lib/types';

interface TecnicoDashboardProps {
  registos: RegistoSessao[];
  horarios: HorarioSessao[];
  pedidos: PedidoSubstituicao[];
  escolas: Escola[];
  utilizadores: Utilizador[];
  currentUser: Utilizador;
  onRequestSubstitution: (registo: RegistoSessao) => void;
  onRegisterPresence: (registo: RegistoSessao) => void;
  onAcceptPedido: (id: string) => void;
  onDeclinePedido: (id: string) => void;
}

export default function TecnicoDashboard({
  registos,
  horarios,
  pedidos,
  escolas,
  utilizadores,
  currentUser,
  onRequestSubstitution,
  onRegisterPresence,
  onAcceptPedido,
  onDeclinePedido,
}: TecnicoDashboardProps) {
  // Filtrar registos do técnico
  const meusRegistos = registos.filter(r => r.tecnico_responsavel_id === currentUser.id);
  
  // Filtrar pedidos onde o técnico é origem ou substituto
  const meusPedidos = pedidos.filter(p => 
    p.tecnico_origem_id === currentUser.id || 
    p.tecnico_substituto_id === currentUser.id
  );

  // Separar registos
  const hoje = new Date().toISOString().split('T')[0];
  const proximosRegistos = meusRegistos.filter(r => r.data >= hoje && r.estado === 'PLANEADA');
  const historicoRegistos = meusRegistos.filter(r => r.estado === 'REALIZADA');

  // Pedidos pendentes de aceitação para o técnico substituto
  const pedidosPendentesAceitacao = meusPedidos.filter(
    p => p.estado === 'PENDENTE_ACEITACAO_TECNICO' && p.tecnico_substituto_id === currentUser.id
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{proximosRegistos.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Próximas Sessões</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{historicoRegistos.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Realizadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {pedidosPendentesAceitacao.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aguardam Resposta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas Sessões */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Próximas Sessões</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {proximosRegistos.map((registo) => {
              const horario = horarios.find(h => h.id === registo.horario_sessao_id);
              const escola = escolas.find(e => e.id === horario?.escola_id);
              
              return (
                <div key={registo.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(registo.data).toLocaleDateString('pt-PT')} - {horario?.hora_inicio} às {horario?.hora_fim}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {escola?.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Turma: {horario?.turma_id} | Atividade: {horario?.atividade}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRequestSubstitution(registo)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-medium"
                      >
                        Pedir Substituição
                      </button>
                      <button
                        onClick={() => onRegisterPresence(registo)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium"
                      >
                        Registar Presença
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {proximosRegistos.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhuma sessão agendada</p>
            </div>
          )}
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Histórico de Sessões</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {historicoRegistos.slice(0, 6).map((registo) => {
              const horario = horarios.find(h => h.id === registo.horario_sessao_id);
              const escola = escolas.find(e => e.id === horario?.escola_id);
              
              return (
                <div key={registo.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(registo.data).toLocaleDateString('pt-PT')} - {horario?.hora_inicio} às {horario?.hora_fim}
                        </span>
                        {registo.assinada && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Assinada
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {escola?.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Turma: {horario?.turma_id} | Atividade: {horario?.atividade}
                      </p>
                      {registo.numero_alunos_presentes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Alunos presentes: {registo.numero_alunos_presentes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onRegisterPresence(registo)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {historicoRegistos.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhuma sessão realizada</p>
            </div>
          )}
        </div>
      </div>

      {/* Pedidos de Substituição */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pedidos de Substituição</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {meusPedidos.map((pedido) => {
              const registo = registos.find(r => r.id === pedido.sessao_id);
              const horario = registo ? horarios.find(h => h.id === registo.horario_sessao_id) : null;
              const escola = escolas.find(e => e.id === horario?.escola_id);
              const tecnicoOrigem = utilizadores.find(u => u.id === pedido.tecnico_origem_id);
              const tecnicoSubstituto = utilizadores.find(u => u.id === pedido.tecnico_substituto_id);
              const isSubstituto = pedido.tecnico_substituto_id === currentUser.id;
              
              return (
                <div key={pedido.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pedido.estado === 'PENDENTE_APROVACAO'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : pedido.estado === 'PENDENTE_ACEITACAO_TECNICO'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : pedido.estado === 'APROVADO'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {pedido.estado.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(pedido.dataCriacao).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {escola?.nome} - {horario?.turma_id}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {registo && new Date(registo.data).toLocaleDateString('pt-PT')} - {horario?.hora_inicio}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p><strong>De:</strong> {tecnicoOrigem?.nome}</p>
                      <p><strong>Para:</strong> {tecnicoSubstituto?.nome}</p>
                      <p className="mt-1"><strong>Motivo:</strong> {pedido.motivo}</p>
                    </div>
                    
                    {isSubstituto && pedido.estado === 'PENDENTE_ACEITACAO_TECNICO' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onAcceptPedido(pedido.id)}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => onDeclinePedido(pedido.id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {meusPedidos.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhum pedido de substituição</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
