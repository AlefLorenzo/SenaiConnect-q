import { useState } from 'react';
import { useData, useToast } from '../store';
import { Button, EmptyState } from '../components/UI';
import { Users, Search, UserPlus, UserMinus, Check } from 'lucide-react';

export function GroupsPage() {
  const { groups, toggleGroup } = useData();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'available'>('all');

  const filtered = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'joined' && g.joined) || (filter === 'available' && !g.joined);
    return matchesSearch && matchesFilter;
  });

  const handleToggle = (groupId: string, groupName: string, isJoined: boolean) => {
    toggleGroup(groupId);
    addToast('success', isJoined ? `Você saiu do grupo "${groupName}".` : `Você entrou no grupo "${groupName}"!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Grupos e Comunidades</h1>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar grupos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition"
            aria-label="Buscar grupos"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'joined', 'available'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f ? 'bg-senai text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'joined' ? 'Participando' : 'Disponíveis'}
            </button>
          ))}
        </div>
      </div>

      {/* Groups List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Nenhum grupo encontrado"
          description={search ? 'Tente buscar com outros termos.' : 'Ainda não há grupos disponíveis.'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(group => (
            <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{group.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{group.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {group.members} membros
                    </span>
                    {group.joined && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Participando
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant={group.joined ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleToggle(group.id, group.name, group.joined)}
                  className="w-full"
                  icon={group.joined ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                >
                  {group.joined ? 'Sair do grupo' : 'Participar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
