'use client';

import { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import { HorarioSessao, Escola, Utilizador } from '@/lib/types';

interface HorarioManagerProps {
  horarios: HorarioSessao[];
  escolas: Escola[];
  utilizadores: Utilizador[];
  onCreateHorario: () => void;
  onEditHorario: (horario: HorarioSessao) => void;
  onDeleteHorario: (id: string) => void;
}

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export default function HorarioManager({
  horarios,
  escolas,
  utilizadores,
  onCreateHorario,
  onEditHorario,
  onDeleteHorario,
}: HorarioManagerProps) {
  const [filterEscola, setFilterEscola] = useState('');
  const [filterTecnico, setFilterTecnico] = useState('');

  const getFilteredHorarios = () => {
    let filtered = horarios;

    if (filterEscola) {
      filtered = filtered.filter(h => h.escola_id === filterEscola);
    }

    if (filterTecnico) {
      filtered = filtered.filter(h => h.tecnico_id === filterTecnico);
    }

    return filtered;
  };

  const filteredHorarios = getFilteredHorarios();
  const tecnicos = utilizadores.filter(u => u.perfil === 'TECNICO');

  return (
    <div>
      {/* Barra de filtros e ações */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        <button
          onClick={onCreateHorario}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Horário</span>
        </button>
      </div>

      {/* Tabela de horários */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Escola</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Turma</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Atividade</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Técnico</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Dia</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Horário</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Vigência</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredHorarios.map((horario) => {
              const escola = escolas.find(e => e.id === horario.escola_id);
              const tecnico = utilizadores.find(u => u.id === horario.tecnico_id);
              const diaSemana = DIAS_SEMANA.find(d => d.value === horario.dia_semana);
              
              return (
                <tr key={horario.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{escola?.nome}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{horario.turma_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{horario.atividade}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{tecnico?.nome}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{diaSemana?.label}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                    {horario.hora_inicio} - {horario.hora_fim}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(horario.data_inicio).toLocaleDateString('pt-PT')} a{' '}
                    {new Date(horario.data_fim).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      horario.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {horario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditHorario(horario)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteHorario(horario.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredHorarios.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum horário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
