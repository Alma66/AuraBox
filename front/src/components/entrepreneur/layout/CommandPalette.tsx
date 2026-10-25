import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { ENTREPRENEUR_SECTIONS } from '../../../config/entrepreneurNav';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  clubId: string;
}

interface CommandItem {
  key: string;
  group: string;
  label: string;
  to: string;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, clubId }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];
    ENTREPRENEUR_SECTIONS.forEach((section) => {
      section.tabs.forEach((tab) => {
        list.push({
          key: `${section.id}-${tab.id}`,
          group: section.label,
          label: tab.label,
          to: tab.to(clubId),
        });
      });
    });
    list.push({ key: 'profile', group: 'Cuenta', label: 'Mi perfil', to: '/entrepreneur/profile' });
    list.push({ key: 'faq', group: 'Ayuda', label: 'Preguntas frecuentes', to: '/faq' });
    list.push({ key: 'contact', group: 'Ayuda', label: 'Contacto', to: '/contact' });
    return list;
  }, [clubId]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    return items.filter((item) => normalize(`${item.group} ${item.label}`).includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`cp-option-${index}`)?.scrollIntoView({ block: 'nearest' });
  }, [index, open]);

  if (!open) return null;

  const go = (item: CommandItem) => {
    onClose();
    navigate(item.to);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (results[index]) go(results[index]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-aurora-navyDark/50 px-4 pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el panel"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-aurora"
      >
        <div className="flex items-center gap-3 border-b border-aurora-navy/10 px-4 py-3">
          <Icon name="search" className="h-5 w-5 text-aurora-navy/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ir a… (envíos, clientes, stock)"
            role="combobox"
            aria-expanded="true"
            aria-controls="cp-listbox"
            aria-activedescendant={results.length > 0 ? `cp-option-${index}` : undefined}
            className="min-h-[40px] flex-1 bg-transparent text-sm text-aurora-navy placeholder-aurora-navy/40 focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-aurora-navy/15 px-1.5 py-0.5 text-[11px] text-aurora-navy/50 sm:block">
            Esc
          </kbd>
        </div>
        <ul id="cp-listbox" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-aurora-navy/50">Sin resultados</li>
          )}
          {results.map((item, position) => (
            <li
              key={item.key}
              id={`cp-option-${position}`}
              role="option"
              aria-selected={position === index}
              onMouseEnter={() => setIndex(position)}
              onClick={() => go(item)}
              className={`flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm ${
                position === index ? 'bg-aurora-cream text-aurora-navy' : 'text-aurora-navy/80'
              }`}
            >
              <span className="font-semibold">{item.label}</span>
              <span className="text-xs text-aurora-navy/45">{item.group}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;