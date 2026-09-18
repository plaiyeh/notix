'use client'

import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  value: string | null
  onChange: (date: string) => void
  placeholder?: string
}

export default function DatePicker({ value, onChange, placeholder = 'Choisir' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(() => (value ? new Date(value + 'T00:00:00') : new Date()))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startingDay = (firstDayOfMonth + 6) % 7 // Lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    onChange(`${year}-${formattedMonth}-${formattedDay}`)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  const handleSetToday = () => {
    const now = new Date()
    const formattedMonth = String(now.getMonth() + 1).padStart(2, '0')
    const formattedDay = String(now.getDate()).padStart(2, '0')
    onChange(`${now.getFullYear()}-${formattedMonth}-${formattedDay}`)
    setViewDate(now)
    setIsOpen(false)
  }

  const formatButtonDate = (isoStr: string) => {
    const parts = isoStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`
    }
    return isoStr
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium border transition flex items-center gap-1.5 cursor-pointer select-none ${
          value
            ? 'bg-slate-950 text-sky-400 border-sky-500/40 hover:border-sky-400'
            : 'bg-slate-950 text-slate-500 border-slate-700 hover:border-slate-600'
        }`}
      >
        <span>📅</span>
        <span>{value ? formatButtonDate(value) : placeholder}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-10 z-50 w-64 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between text-xs font-bold text-white pb-1 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1 text-slate-400 hover:text-white"
            >
              ◀
            </button>
            <span>{monthNames[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1 text-slate-400 hover:text-white"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-500 font-bold">
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const currentIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const isSelected = value === currentIso

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-7 rounded-lg font-mono text-xs flex items-center justify-center transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-sky-400 hover:text-sky-300 font-semibold"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-400"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}