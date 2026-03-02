import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  History, 
  BarChart3, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Settings,
  Calendar,
  Save,
  RotateCcw,
  ArrowLeft,
  Instagram,
  Mail
} from 'lucide-react';

const DEFAULT_POINT_RULES = [
  { id: 'zhuang', name: '莊家', pts: 1, cat: 'Basic' },
  { id: 'lian1', name: '連一', pts: 2, cat: 'Basic' },
  { id: 'zimo', name: '自摸', pts: 1, cat: 'Basic' },
  { id: 'mq', name: '門清', pts: 1, cat: 'Basic' },
  { id: 'pph', name: '碰碰胡', pts: 4, cat: 'Big' },
  { id: 'ph', name: '平胡', pts: 2, cat: 'Big' },
  { id: 'qys', name: '清一色', pts: 8, cat: 'Big' },
  { id: 'hys', name: '混一色', pts: 4, cat: 'Big' },
];

const STORAGE_KEYS = { pointRules: 'mahjong_point_rules', isDark: 'mahjong_is_dark' };

// 本局戰績表單：用本地 state 管理輸入，避免父層 re-render 導致金額被清掉
const RecordForm = ({ onAddRecord, cardCls, cardLight, cardDark, mutedLight, mutedDark, inputLight, inputDark, secondaryBg }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('win');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    const num = parseInt(amount, 10);
    if (!amount || isNaN(num) || num <= 0) return;
    onAddRecord(num, type, note);
    setAmount('');
    setNote('');
  };

  return (
    <section className={`${cardCls} ${cardLight} ${cardDark} p-6`}>
      <h3 className="text-base font-bold text-gray-800 dark:text-[#e0e0e0] mb-5 text-center">本局戰績</h3>
      <div className="space-y-4 text-center">
        <div>
          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedLight} ${mutedDark}`}>金額</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            onFocus={(e) => e.target.select()}
            className={`w-full rounded-xl p-4 text-2xl font-bold text-center outline-none border transition-all ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary`}
          />
        </div>
        <div>
          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedLight} ${mutedDark}`}>類型</label>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setType('win')}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                type === 'win'
                  ? 'bg-secondary border-secondary text-white shadow-md'
                  : `border-gray-200 dark:border-[#2d302d] ${mutedLight} ${mutedDark} hover:border-gray-300 dark:hover:border-[#4a5a4a]`
              }`}
            >
              贏錢
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                type === 'expense'
                  ? 'bg-primary border-primary text-white shadow-md'
                  : `border-gray-200 dark:border-[#2d302d] ${mutedLight} ${mutedDark} hover:border-gray-300 dark:hover:border-[#4a5a4a]`
              }`}
            >
              支出
            </button>
          </div>
        </div>
        <div>
          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedLight} ${mutedDark}`}>備註 <span className="font-normal normal-case">(選填)</span></label>
          <input
            type="text"
            placeholder="例：昨晚牌局、請客..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-sm text-center outline-none border transition-all ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary placeholder:opacity-60`}
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className={`w-full max-w-xs mx-auto block py-3.5 rounded-xl font-bold text-sm shadow-md ${secondaryBg}`}
        >
          新增紀錄
        </button>
      </div>
    </section>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('calc');
  const [base, setBase] = useState(30);
  const [pointPrice, setPointPrice] = useState(10);
  const [extraPoints, setExtraPoints] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState({});
  const [records, setRecords] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.isDark) ?? 'false');
    } catch { return false; }
  });
  const [pointRules, setPointRules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.pointRules);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) {}
    return DEFAULT_POINT_RULES.map(r => ({ ...r }));
  });
  const [editingRules, setEditingRules] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEYS.isDark, JSON.stringify(isDark));
  }, [isDark]);

  useEffect(() => {
    if (showSettings) setEditingRules(pointRules.map(r => ({ ...r })));
  }, [showSettings, pointRules]);

  const currentTotalPoints = useMemo(() => {
    let pts = extraPoints;
    Object.keys(selectedPoints).forEach(id => {
      if (selectedPoints[id]) {
        const rule = pointRules.find(r => r.id === id);
        if (rule) pts += rule.pts;
      }
    });
    return pts;
  }, [selectedPoints, extraPoints, pointRules]);

  const currentTotalAmount = base + (currentTotalPoints * pointPrice);

  const togglePoint = (id) => {
    setSelectedPoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addManualRecord = (amountNum, type, note) => {
    if (!amountNum || amountNum <= 0) return;
    const newRecord = {
      id: Date.now(),
      amount: type === 'win' ? amountNum : -amountNum,
      date: new Date(),
      type: type === 'win' ? 'win' : 'loss',
      note: (note && note.trim()) || undefined
    };
    setRecords(prev => [newRecord, ...prev]);
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const savePointRules = () => {
    const valid = editingRules.filter(r => r.name?.trim() && Number.isInteger(r.pts) && r.pts >= 0);
    setPointRules(valid.length ? valid : DEFAULT_POINT_RULES.map(r => ({ ...r })));
    localStorage.setItem(STORAGE_KEYS.pointRules, JSON.stringify(valid.length ? valid : DEFAULT_POINT_RULES));
    setShowSettings(false);
    triggerToast();
  };

  const resetPointRules = () => {
    setEditingRules(DEFAULT_POINT_RULES.map(r => ({ ...r })));
  };

  const updateEditingRule = (index, field, value) => {
    setEditingRules(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: field === 'pts' ? (parseInt(value, 10) || 0) : value };
      return next;
    });
  };

  const stats = useMemo(() => {
    const total = records.reduce((acc, cur) => acc + cur.amount, 0);
    const winCount = records.filter(r => r.amount > 0).length;
    return { total, winCount, totalCount: records.length };
  }, [records]);

  // 依時段打招呼 + 幽默短句（每次進入依當下時段選一句）
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeWord = hour >= 5 && hour < 12 ? '早安' : hour >= 12 && hour < 18 ? '午安' : '晚安';
    const phrases = [
      '是不是又忍不住打麻將了？',
      '就知道你又來打麻將了！',
      '手癢了齁，來算一局吧',
      '今天也要胡好胡滿喔',
      '算好台數，安心開打',
      '三缺一還是已經開打了？',
    ];
    const phrase = phrases[hour % phrases.length];
    return `${timeWord}，${phrase}`;
  }, []);

  // 參考截圖：圓角卡片、輕陰影、區塊標題
  const cardCls = 'rounded-3xl border transition-colors ';
  const cardLight = 'bg-white border-gray-100 text-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)]';
  const cardDark = 'dark:bg-[#1a1c1a] dark:border-[#2d302d] dark:text-[#e0e0e0] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]';
  const inputLight = 'bg-[#FAFAF9] border-gray-200 text-gray-900 placeholder-gray-400';
  const inputDark = 'dark:bg-[#0a0c0a] dark:border-[#2d302d] dark:text-[#e0e0e0] dark:placeholder-[#4a5a4a]';
  const mutedLight = 'text-gray-500';
  const mutedDark = 'dark:text-[#6a7a6a]';
  const sectionLabel = 'text-[10px] font-bold uppercase tracking-[0.2em]';
  const primaryBorder = 'border-primary focus:border-primary dark:border-primary';
  const secondaryBg = 'bg-secondary text-white hover:opacity-90';

  const CalcView = () => (
    <div className="space-y-8">
      <section className={`${cardCls} ${cardLight} ${cardDark} p-6`}>
        <h3 className="text-sm font-bold text-gray-800 dark:text-[#e0e0e0] mb-5 text-center">底台設定</h3>
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center flex-1 max-w-[7rem]">
            <label className={`text-[10px] font-medium uppercase tracking-widest mb-2 w-full text-center ${mutedLight} ${mutedDark}`}>底（元）</label>
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(parseInt(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className={`w-full bg-gray-50 dark:bg-[#0f110f] rounded-xl py-3 text-2xl font-black text-center border outline-none transition-colors ${primaryBorder} ${cardDark} focus:ring-2 focus:ring-primary/20`}
            />
          </div>
          <span className={`text-2xl font-bold pb-2 ${mutedLight} ${mutedDark}`}>/</span>
          <div className="flex flex-col items-center flex-1 max-w-[7rem]">
            <label className={`text-[10px] font-medium uppercase tracking-widest mb-2 w-full text-center ${mutedLight} ${mutedDark}`}>每台（元）</label>
            <input
              type="number"
              value={pointPrice}
              onChange={(e) => setPointPrice(parseInt(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className={`w-full bg-gray-50 dark:bg-[#0f110f] rounded-xl py-3 text-2xl font-black text-center border outline-none transition-colors ${primaryBorder} ${cardDark} focus:ring-2 focus:ring-primary/20`}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <span className={`${sectionLabel} ${mutedLight} ${mutedDark}`}>台數選擇</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pointRules.map(rule => (
            <button
              key={rule.id}
              onClick={() => togglePoint(rule.id)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border ${
                selectedPoints[rule.id]
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : `bg-white dark:bg-[#1a1c1a] border-gray-200 dark:border-[#2d302d] text-gray-700 dark:text-[#a0a0a0] hover:border-gray-300 dark:hover:border-[#4a5a4a]`
              }`}
            >
              <span className="text-sm font-medium">{rule.name}</span>
              <span className={`text-[10px] mt-1 ${selectedPoints[rule.id] ? 'text-white/80' : mutedLight + ' ' + mutedDark}`}>
                +{rule.pts} 台
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 額外加台：數字固定寬度避免按 +/- 時版面跳動 */}
      <section className={`${cardCls} ${cardLight} ${cardDark} p-5 flex justify-between items-center`}>
        <div>
          <p className="font-bold text-sm">額外加台</p>
          <p className={`text-[10px] ${mutedLight} ${mutedDark}`}>Other custom points</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#0a0c0a] p-1 rounded-xl min-w-[120px] justify-center">
          <button
            type="button"
            onClick={() => setExtraPoints(Math.max(0, extraPoints - 1))}
            className="w-10 h-10 rounded-lg bg-white dark:bg-[#2d302d] flex items-center justify-center text-gray-600 dark:text-[#a0a0a0] border border-gray-200 dark:border-[#2d302d] shrink-0"
          >
            <Minus size={18} />
          </button>
          <span className="text-xl font-bold w-8 text-center tabular-nums" aria-live="polite">
            {extraPoints}
          </span>
          <button
            type="button"
            onClick={() => setExtraPoints(extraPoints + 1)}
            className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </section>
    </div>
  );

  const RecordView = () => (
    <div className="space-y-8">
      <RecordForm
        onAddRecord={addManualRecord}
        cardCls={cardCls}
        cardLight={cardLight}
        cardDark={cardDark}
        mutedLight={mutedLight}
        mutedDark={mutedDark}
        inputLight={inputLight}
        inputDark={inputDark}
        secondaryBg={secondaryBg}
      />

      <section className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <span className={`${sectionLabel} ${mutedLight} ${mutedDark}`}>最近紀錄</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
        </div>
        {records.length === 0 ? (
          <div className={`py-20 text-center italic ${mutedLight} ${mutedDark}`}>尚無數據</div>
        ) : (
          records.map(record => (
            <div key={record.id} className={`${cardCls} ${cardLight} ${cardDark} p-4`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.amount >= 0 ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-red-400 dark:text-[#ff8080]'}`}>
                    {record.amount >= 0 ? <Plus size={16} /> : <Minus size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{record.amount >= 0 ? '贏錢' : '支出'}</p>
                    <p className={`text-[10px] ${mutedLight} ${mutedDark}`}>
                      {record.date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} · {record.date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {record.note && (
                      <p className="text-xs mt-1 text-gray-600 dark:text-[#a0a0a0] truncate" title={record.note}>{record.note}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold tabular-nums ${record.amount >= 0 ? 'text-secondary' : 'text-red-400 dark:text-[#ff8080]'}`}>
                    {record.amount >= 0 ? `+${record.amount}` : record.amount}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRecords(records.filter(r => r.id !== record.id))}
                    className={`text-[10px] mt-1 ${mutedLight} ${mutedDark} hover:text-primary transition-colors`}
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );

  const ReportView = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 px-1 mb-4">
          <span className={`${sectionLabel} ${mutedLight} ${mutedDark}`}>總覽</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`${cardCls} ${cardLight} ${cardDark} p-6 text-center`}>
            <p className={`${sectionLabel} mb-1 ${mutedLight} ${mutedDark}`}>Total P/L</p>
            <p className={`text-2xl font-bold ${stats.total >= 0 ? 'text-secondary' : 'text-red-500 dark:text-[#ff8080]'}`}>
              ${stats.total}
            </p>
          </div>
          <div className={`${cardCls} ${cardLight} ${cardDark} p-6 text-center`}>
            <p className={`${sectionLabel} mb-1 ${mutedLight} ${mutedDark}`}>Win Rate</p>
            <p className="text-2xl font-bold">
              {stats.totalCount ? Math.round((stats.winCount / stats.totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
      </section>

      <section className={`${cardCls} ${cardLight} ${cardDark} p-6`}>
        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          月度趨勢
        </h4>
        <div className="h-32 flex items-end gap-2 justify-between px-2">
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${i === 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-[#2d302d]'}`}
                style={{ height: `${h}%` }}
              />
              <span className={`text-[8px] ${mutedLight} ${mutedDark}`}>{i + 1}月</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`${cardCls} ${cardLight} ${cardDark} p-6 space-y-4`}>
        <h4 className="text-sm font-bold">本年統計摘要</h4>
        <div className="flex justify-between items-center text-sm">
          <span className={mutedLight + ' ' + mutedDark}>總對局數</span>
          <span className="font-mono">{stats.totalCount} 場</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={mutedLight + ' ' + mutedDark}>最高獲利</span>
          <span className="text-secondary font-mono">+$2,450</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={mutedLight + ' ' + mutedDark}>最大損失</span>
          <span className="text-red-500 dark:text-[#ff8080] font-mono">-$1,200</span>
        </div>
      </section>
    </div>
  );

  const SettingsView = () => (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F4EF] dark:bg-[#0a0c0a] text-gray-900 dark:text-[#e0e0e0]">
      {/* 與首頁一致的 Header */}
      <header className="flex-none sticky top-0 z-10 w-full bg-[#F7F4EF] dark:bg-[#0a0c0a] border-b border-gray-200 dark:border-[#1a1c1a] shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="p-2 -ml-1 rounded-xl text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-100 dark:hover:bg-[#1a1c1a] transition-colors shrink-0"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black tracking-tight">台數規則</h1>
            <p className={`text-[9px] font-semibold tracking-[0.2em] uppercase ${mutedLight} ${mutedDark}`}>Point Rules</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetPointRules}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold border border-gray-200 dark:border-[#2d302d] text-gray-600 dark:text-[#a0a0a0] bg-white dark:bg-[#1a1c1a] hover:border-gray-300 dark:hover:border-[#4a5a4a] transition-colors"
            >
              <RotateCcw size={16} />
              還原預設
            </button>
            <button
              type="button"
              onClick={savePointRules}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-primary hover:opacity-90 transition-opacity shadow-md"
            >
              <Save size={16} />
              儲存
            </button>
          </div>
        </div>
      </header>

      {/* 與計算頁一致的卡片區塊 */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-md mx-auto px-4 py-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <span className={`${sectionLabel} ${mutedLight} ${mutedDark}`}>規則列表</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
            </div>
            <div className={`${cardCls} ${cardLight} ${cardDark} overflow-hidden`}>
              {editingRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:py-4 ${index < editingRules.length - 1 ? 'border-b border-gray-100 dark:border-[#2d302d]' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${mutedLight} ${mutedDark}`}>
                      名稱
                    </label>
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => updateEditingRule(index, 'name', e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary text-sm font-medium`}
                      placeholder="例：莊家"
                    />
                  </div>
                  <div className="sm:w-24 shrink-0">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${mutedLight} ${mutedDark}`}>
                      台數
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={rule.pts}
                      onChange={(e) => updateEditingRule(index, 'pts', e.target.value)}
                      className={`w-full rounded-xl border px-3 py-3 text-center outline-none transition-colors ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary text-sm font-bold`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className={`text-[10px] text-center ${mutedLight} ${mutedDark}`}>
              儲存後將套用至計算頁
            </p>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F7F4EF] dark:bg-[#0a0c0a] text-gray-900 dark:text-[#e0e0e0] overflow-hidden">
      {/* ----- 固定頂部 Header (sticky) ----- */}
      <header className="flex-none sticky top-0 z-40 w-full bg-[#F7F4EF] dark:bg-[#0a0c0a] border-b border-gray-200 dark:border-[#1a1c1a] shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-[#1a1c1a] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-[#2d302d] shadow-sm">
              <div className="w-5 h-5 bg-primary rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-[#e0e0e0]">
                麻將算算 <span className="text-primary">MahjongCalc</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark 模式：橢圓藥丸形、淺奶油底、深灰字、輕陰影 */}
            <button
              type="button"
              onClick={() => setIsDark(d => !d)}
              className="min-w-[4rem] px-4 py-2.5 rounded-[2rem] text-xs font-semibold transition-colors bg-[#F5F3F0] dark:bg-[#2a2c2a] text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-[#3d403d] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none"
            >
              Dark
            </button>
            {/* 齒輪：正圓、淺奶油底、深灰圖示、輕陰影 */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F5F3F0] dark:bg-[#2a2c2a] text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-[#3d403d] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none"
            >
              <Settings size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      {/* ----- 可捲動主內容 (只有這裡會捲動) ----- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        <div className="max-w-md mx-auto px-4 py-6 pb-6">
          <p className={`text-sm font-medium mb-5 text-center ${mutedLight} ${mutedDark}`}>
            {greeting}
          </p>
          {activeTab === 'calc' && <CalcView />}
          {activeTab === 'record' && <RecordView />}
          {activeTab === 'report' && <ReportView />}

          {/* 廣告、版權與社群：在 main 裡、footer 上方，會隨頁面捲動，不 sticky */}
          <div className="mt-8 pt-6 pb-10 border-t border-gray-200 dark:border-[#2d302d]">
            <div className="w-full rounded-2xl border border-dashed border-gray-300 dark:border-[#3d403d] bg-gray-50/80 dark:bg-[#1a1c1a]/80 min-h-[72px] flex items-center justify-center">
              <span className={`text-xs font-medium ${mutedLight} ${mutedDark}`}>Ad</span>
            </div>
            <p className={`mt-4 text-center text-[10px] ${mutedLight} ${mutedDark} tracking-wide`}>
              Mahjong © {new Date().getFullYear()} · Friendly Cat Group
            </p>
            <div className="mt-2 flex items-center justify-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full ${mutedLight} ${mutedDark} hover:opacity-80 transition-opacity`}
                aria-label="Instagram"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hello@example.com"
                className={`p-2 rounded-full ${mutedLight} ${mutedDark} hover:opacity-80 transition-opacity`}
                aria-label="Email"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ----- 固定底部 Footer (sticky)，僅導覽與計算結果欄 ----- */}
      <footer className="flex-none sticky bottom-0 z-40 w-full bg-[#F7F4EF] dark:bg-[#0a0c0a] border-t border-gray-200 dark:border-[#2d302d] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
        <div className="max-w-md mx-auto flex flex-col items-center px-4 pt-4 pb-8">
          {activeTab === 'calc' && (
            <div className="w-full max-w-[92%] bg-primary rounded-xl px-4 py-2.5 shadow-sm mb-3 flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                總計 <span className="tabular-nums">{currentTotalPoints}</span> 台
              </span>
              <div className="flex items-baseline gap-0.5 text-white">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mr-1">總金額</span>
                <span className="text-sm font-bold opacity-90">$</span>
                <span className="text-xl font-black tabular-nums">{currentTotalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* 底欄：參考截圖 pill 選中樣式 */}
          <nav className="w-full flex justify-around items-center gap-2 py-2">
            <button
              type="button"
              onClick={() => setActiveTab('calc')}
              className={`flex flex-col items-center gap-1 min-w-[72px] py-2.5 px-3 rounded-2xl transition-all ${activeTab === 'calc' ? 'bg-primary text-white shadow-md' : mutedLight + ' ' + mutedDark}`}
            >
              <Calculator size={22} strokeWidth={activeTab === 'calc' ? 3 : 2} />
              <span className="text-[10px] font-bold">計算</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              className={`flex flex-col items-center gap-1 min-w-[72px] py-2.5 px-3 rounded-2xl transition-all ${activeTab === 'record' ? 'bg-secondary text-white shadow-md' : mutedLight + ' ' + mutedDark}`}
            >
              <History size={22} strokeWidth={activeTab === 'record' ? 3 : 2} />
              <span className="text-[10px] font-bold">紀錄</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`flex flex-col items-center gap-1 min-w-[72px] py-2.5 px-3 rounded-2xl transition-all ${activeTab === 'report' ? 'bg-gray-600 dark:bg-gray-500 text-white shadow-md' : mutedLight + ' ' + mutedDark}`}
            >
              <BarChart3 size={22} strokeWidth={activeTab === 'report' ? 3 : 2} />
              <span className="text-[10px] font-bold">報表</span>
            </button>
          </nav>
        </div>
      </footer>

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl">
          <CheckCircle2 size={18} />
          成功處理
        </div>
      )}

      {showSettings && <SettingsView />}
    </div>
  );
};

export default App;
