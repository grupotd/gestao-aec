'use client';

import { Calendar, Clock, MapPin, User, Edit, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Sessao, Escola, Utilizador, PerfilUsuario } from '@/lib/types';

interface SessionCardProps {
  sessao: Sessao;
  escola?: Escola;
  tecnico?: Utilizador;
  onEdit: (sessao: Sessao) => void;
  onRegisterPresence?: (sessao: Sessao) => void;
  userPerfil: PerfilUsuario;
}

export default function SessionCard({
  sessao,
  escola,
  tecnico,
  onEdit,
  onRegisterPresence,
  userPerfil,
}: SessionCardProps) {
  const getEstadoBadge = () => {
    switch (sessao.estado) {
      case 'AGENDADA':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Agendada
          </span>
        );
      case 'REALIZADA':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Realizada
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Cancelada
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isFutureSession = () => {
    const sessionDate = new Date(sessao.data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  };

  const canEditAllFields = userPerfil === 'ADMINISTRADOR' || userPerfil === 'COORDENADOR';
  const isTecnico = userPerfil === 'TECNICO';
  const showSubstitutionButton = isTecnico && isFutureSession() && sessao.estado === 'AGENDADA';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{sessao.turma}</h3>
            {getEstadoBadge()}
            {sessao.assinada && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Assinada
              </span>
            )}
          </div>
          {escola && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {escola.nome} - {escola.localidade}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>{formatDate(sessao.data)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>{sessao.hora_inicio}</span>
        </div>
        {tecnico && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>{tecnico.nome}</span>
          </div>
        )}
        {sessao.numero_alunos_presentes !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>{sessao.numero_alunos_presentes} alunos presentes</span>
          </div>
        )}
      </div>

      {sessao.sumario && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sumário</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{sessao.sumario}</p>
        </div>
      )}

      {sessao.ocorrencias && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-400 mb-1 font-medium">Ocorrências</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{sessao.ocorrencias}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Botão Editar para ADMIN/COORDENADOR */}
        {canEditAllFields && (
          <button
            onClick={() => onEdit(sessao)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all font-medium"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}

        {/* Botão Registar Presença para TÉCNICO */}
        {isTecnico && onRegisterPresence && (
          <button
            onClick={() => onRegisterPresence(sessao)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Registar Presença
          </button>
        )}

        {/* Botão Pedir Substituição para TÉCNICO (apenas sessões futuras) */}
        {showSubstitutionButton && (
          <button
            onClick={() => onEdit(sessao)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all font-medium"
          >
            <Users className="w-4 h-4" />
            Pedir Substituição
          </button>
        )}
      </div>
    </div>
  );
}
