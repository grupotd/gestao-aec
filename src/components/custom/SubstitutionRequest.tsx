'use client';

import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { PedidoSubstituicao, Sessao, Utilizador } from '@/lib/types';

interface SubstitutionRequestProps {
  pedido: PedidoSubstituicao;
  sessao?: Sessao;
  tecnicoOrigem?: Utilizador;
  tecnicoSubstituto?: Utilizador;
  onApprove?: (pedidoId: string) => void;
  onReject?: (pedidoId: string) => void;
  onAccept?: (pedidoId: string) => void;
  onDecline?: (pedidoId: string) => void;
  showActions: boolean;
  currentUserId?: string;
}

export default function SubstitutionRequest({
  pedido,
  sessao,
  tecnicoOrigem,
  tecnicoSubstituto,
  onApprove,
  onReject,
  onAccept,
  onDecline,
  showActions,
  currentUserId,
}: SubstitutionRequestProps) {
  const getEstadoBadge = () => {
    switch (pedido.estado) {
      case 'PENDENTE_APROVACAO':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendente Aprovação
          </span>
        );
      case 'PENDENTE_ACEITACAO_TECNICO':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Aguarda Técnico
          </span>
        );
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Recusado
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar se o usuário atual é o técnico substituto
  const isSubstituto = currentUserId === pedido.tecnico_substituto_id;
  const canAcceptOrDecline = isSubstituto && pedido.estado === 'PENDENTE_ACEITACAO_TECNICO';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getEstadoBadge()}
          </div>
          {sessao && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sessão: {sessao.turma} - {new Date(sessao.data).toLocaleDateString('pt-PT')} às {sessao.hora_inicio}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Técnico Origem</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {tecnicoOrigem?.nome || 'Não especificado'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Técnico Substituto</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {tecnicoSubstituto?.nome || 'Não especificado'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Motivo</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{pedido.motivo}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
          <span>Criado: {formatDate(pedido.dataCriacao)}</span>
          {pedido.dataAtualizacao !== pedido.dataCriacao && (
            <span>Atualizado: {formatDate(pedido.dataAtualizacao)}</span>
          )}
        </div>
      </div>

      {/* Ações para ADMIN/COORDENADOR (aprovar/recusar) */}
      {showActions && pedido.estado === 'PENDENTE_APROVACAO' && onApprove && onReject && (
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onReject(pedido.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-medium"
          >
            <XCircle className="w-4 h-4" />
            Recusar
          </button>
          <button
            onClick={() => onApprove(pedido.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Aprovar
          </button>
        </div>
      )}

      {/* Ações para TÉCNICO SUBSTITUTO (aceitar/recusar) */}
      {canAcceptOrDecline && onAccept && onDecline && (
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onDecline(pedido.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-medium"
          >
            <XCircle className="w-4 h-4" />
            Recusar
          </button>
          <button
            onClick={() => onAccept(pedido.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Aceitar
          </button>
        </div>
      )}
    </div>
  );
}
