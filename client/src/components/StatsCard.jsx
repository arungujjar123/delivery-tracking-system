import React from 'react';

const colorThemes = {
  blue: {
    bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-600 text-white',
    border: 'border-blue-100 hover:border-blue-300',
    glow: 'group-hover:shadow-blue-500/10',
  },
  green: {
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-600 text-white',
    border: 'border-emerald-100 hover:border-emerald-300',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  amber: {
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500 text-white',
    border: 'border-amber-100 hover:border-amber-300',
    glow: 'group-hover:shadow-amber-500/10',
  },
  purple: {
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    iconBg: 'bg-purple-600 text-white',
    border: 'border-purple-100 hover:border-purple-300',
    glow: 'group-hover:shadow-purple-500/10',
  },
  indigo: {
    bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    iconBg: 'bg-indigo-600 text-white',
    border: 'border-indigo-100 hover:border-indigo-300',
    glow: 'group-hover:shadow-indigo-500/10',
  },
  rose: {
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    iconBg: 'bg-rose-600 text-white',
    border: 'border-rose-100 hover:border-rose-300',
    glow: 'group-hover:shadow-rose-500/10',
  },
};

const StatsCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  change,
  isPositive = true,
  color = 'blue',
}) => {
  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme.border} ${theme.glow}`}
    >
      {/* Background gradient splash */}
      <div
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${theme.bgGradient} blur-2xl transition-all duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {(subtext || change !== undefined) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {change !== undefined && (
                <span
                  className={`font-semibold ${
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {change}%
                </span>
              )}
              {subtext && <span className="text-slate-400">{subtext}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 p-3 ${theme.iconBg}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
