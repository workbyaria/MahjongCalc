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
  Clock,
  Save,
  RotateCcw,
  ArrowLeft,
  Instagram,
  Mail,
  Trash2
} from 'lucide-react';

const DEFAULT_POINT_RULES = [
  { id: 'zhuang', name: '莊家', pts: 1, cat: 'Basic' },
  { id: 'lian1', name: '連一', pts: 2, cat: 'Basic' },
  { id: 'zimo', name: '自摸', pts: 1, cat: 'Basic' },
  { id: 'mq', name: '門清', pts: 1, cat: 'Basic' },
  { id: 'mqzm', name: '門清自摸', pts: 3, cat: 'Basic' },
  { id: 'pph', name: '碰碰胡', pts: 4, cat: 'Big' },
  { id: 'ph', name: '平胡', pts: 2, cat: 'Big' },
  { id: 'qys', name: '清一色', pts: 8, cat: 'Big' },
  { id: 'hys', name: '混一色', pts: 4, cat: 'Big' },
  { id: 'gshk', name: '槓上開花', pts: 2, cat: 'Big' },
];

const STORAGE_KEYS = { pointRules: 'mahjong_point_rules', isDark: 'mahjong_is_dark', records: 'mahjong_records' };

// 手動紀錄表單：漏記、流局或非台數結算時可在此新增，用本地 state 管理輸入；字級與計算頁一致
const recordFormTitle = 'text-base font-bold text-gray-800 dark:text-[#ececec]';
const recordFormLabel = 'text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#c0c8c0]';

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
      <h3 className={`${recordFormTitle} mb-2 text-center`}>手動紀錄</h3>
      <p className={`text-xs text-center ${mutedLight} ${mutedDark} mb-5`}>漏記、備註、非台數結算時可在此新增</p>
      <div className="space-y-5 text-center">
        <div>
          <label className={`block ${recordFormLabel} mb-2.5 ${mutedLight} ${mutedDark}`}>金額</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            onFocus={(e) => e.target.select()}
            className={`w-full rounded-xl p-4 text-2xl font-black text-center outline-none border transition-all ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary`}
          />
        </div>
        <div>
          <label className={`block ${recordFormLabel} mb-2.5 ${mutedLight} ${mutedDark}`}>類型</label>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setType('win')}
              className={`py-3.5 rounded-xl font-semibold text-sm transition-all border ${
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
              className={`py-3.5 rounded-xl font-semibold text-sm transition-all border ${
                type === 'expense'
                  ? 'bg-primary border-primary text-white shadow-md'
                  : `border-gray-200 dark:border-[#2d302d] ${mutedLight} ${mutedDark} hover:border-gray-300 dark:hover:border-[#4a5a4a]`
              }`}
            >
              輸錢
            </button>
          </div>
        </div>
        <div>
          <label className={`block ${recordFormLabel} mb-2.5 ${mutedLight} ${mutedDark}`}>備註 <span className="font-normal normal-case">(選填)</span></label>
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
          className={`w-full max-w-xs mx-auto block py-3.5 rounded-xl font-semibold text-sm shadow-md ${secondaryBg}`}
        >
          確認新增
        </button>
      </div>
    </section>
  );
};

// 台數規則設定：用本地 state 管理編輯中規則，避免輸入時父層 re-render 導致跳掉
const SettingsView = ({
  initialRules,
  defaultRules,
  onSave,
  onClose,
  cardCls,
  cardLight,
  cardDark,
  sectionLabel,
  mutedLight,
  mutedDark,
  inputLight,
  inputDark,
}) => {
  const [editingRules, setEditingRules] = useState(() => initialRules.map(r => ({ ...r })));

  const updateRule = (index, field, value) => {
    setEditingRules(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = {
        ...next[index],
        [field]: field === 'pts' ? (parseInt(String(value).replace(/\D/g, ''), 10) || 0) : value,
      };
      return next;
    });
  };

  const addNewRule = () => {
    setEditingRules(prev => [...prev, { id: `rule_${Date.now()}`, name: '', pts: 0, cat: 'Custom' }]);
  };

  const removeRule = (index) => {
    setEditingRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(editingRules);
  };

  const handleReset = () => {
    setEditingRules(defaultRules.map(r => ({ ...r })));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F4EF] dark:bg-[#0a0c0a] text-gray-900 dark:text-[#ececec]">
      <header className="flex-none sticky top-0 z-10 w-full bg-[#F7F4EF] dark:bg-[#0a0c0a] border-b border-gray-200 dark:border-[#1a1c1a] shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button type="button" onClick={onClose} className="p-2 -ml-1 rounded-xl text-gray-600 dark:text-[#d0d4d0] hover:bg-gray-100 dark:hover:bg-[#1a1c1a] transition-colors shrink-0">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold tracking-tight">台數規則</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold border border-gray-200 dark:border-[#2d302d] text-gray-600 dark:text-[#d0d4d0] bg-white dark:bg-[#1a1c1a] hover:border-gray-300 dark:hover:border-[#4a5a4a] transition-colors">
              <RotateCcw size={16} /> 還原預設
            </button>
            <button type="button" onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-primary hover:opacity-90 transition-opacity">
              <Save size={16} /> 儲存
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-md mx-auto px-4 py-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <span className={`${sectionLabel} ${mutedLight} ${mutedDark}`}>規則列表</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
            </div>
            <div className={`${cardCls} ${cardLight} ${cardDark} overflow-hidden`}>
              {editingRules.map((rule, index) => (
                <div key={rule.id} className={`flex flex-row items-center gap-2 p-3 ${index < editingRules.length - 1 ? 'border-b border-gray-100 dark:border-[#2d302d]' : ''}`}>
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => updateRule(index, 'name', e.target.value)}
                    className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 outline-none transition-colors ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary text-sm font-medium`}
                    placeholder="名稱"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rule.pts}
                    onChange={(e) => updateRule(index, 'pts', e.target.value)}
                    className={`w-16 rounded-lg border px-2 py-2.5 text-center outline-none transition-colors ${inputLight} ${inputDark} border-gray-200 dark:border-[#2d302d] focus:border-primary text-sm font-bold`}
                    placeholder="台"
                  />
                  <button type="button" onClick={() => removeRule(index)} className={`p-2 rounded-lg shrink-0 ${mutedLight} ${mutedDark} hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors`} aria-label="刪除此規則">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addNewRule} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#3d403d] ${mutedLight} ${mutedDark} hover:border-primary hover:text-primary dark:hover:text-primary transition-colors`}>
              <Plus size={18} /> 新增規則
            </button>
            <p className={`text-[10px] text-center ${mutedLight} ${mutedDark}`}>儲存後將依序套用至計算頁</p>
          </section>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('calc');
  const [base, setBase] = useState(0);
  const [pointPrice, setPointPrice] = useState(0);
  const [extraPoints, setExtraPoints] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState({});
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.records);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(r => ({ ...r, date: r.date ? new Date(r.date) : new Date(), settledAt: r.settledAt ?? null }));
    } catch (_) { return []; }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  }, [records]);
  const [resultPosition, setResultPosition] = useState(null); // '上家'|'下家'|'對家'|'自摸'|null
  const [resultType, setResultType] = useState('win');        // 'win'|'expense'
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
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEYS.isDark, JSON.stringify(isDark));
  }, [isDark]);

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

  const addManualRecord = (amountNum, type, note, extra = {}) => {
    const num = typeof amountNum === 'number' ? amountNum : parseInt(amountNum, 10);
    if (num == null || isNaN(num)) return;
    const newRecord = {
      id: Date.now(),
      amount: type === 'win' ? Math.abs(num) : -Math.abs(num),
      date: new Date(),
      type: type === 'win' ? 'win' : 'loss',
      note: (note && note.trim()) || undefined,
      ...(extra.position != null && { position: extra.position }),
      ...(extra.points != null && Number.isInteger(extra.points) && { points: extra.points })
    };
    setRecords(prev => [newRecord, ...prev]);
    triggerToast();
  };

  const addRecordFromCalc = () => {
    const amount = resultType === 'win' ? currentTotalAmount : -currentTotalAmount;
    addManualRecord(Math.abs(amount), resultType, undefined, {
      position: resultPosition ?? undefined,
      points: currentTotalPoints
    });
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSavePointRules = (rules) => {
    const valid = rules.filter(r => r.name?.trim() && Number.isInteger(r.pts) && r.pts >= 0);
    setPointRules(valid.length ? valid : DEFAULT_POINT_RULES.map(r => ({ ...r })));
    localStorage.setItem(STORAGE_KEYS.pointRules, JSON.stringify(valid.length ? valid : DEFAULT_POINT_RULES));
    setShowSettings(false);
    triggerToast();
  };

  const stats = useMemo(() => {
    const total = records.reduce((acc, cur) => acc + cur.amount, 0);
    const winCount = records.filter(r => r.amount > 0).length;
    const wins = records.filter(r => r.amount > 0).map(r => r.amount);
    const losses = records.filter(r => r.amount < 0).map(r => r.amount);
    const maxWin = wins.length ? Math.max(...wins) : 0;
    const maxLoss = losses.length ? Math.min(...losses) : 0;
    return { total, winCount, totalCount: records.length, maxWin, maxLoss };
  }, [records]);

  // 依對象（上家/下家/對家）自動加總：只計「未結算」的紀錄。正數＝他要給你，負數＝你要給他。
  const positionSums = useMemo(() => {
    const pos = { 上家: 0, 下家: 0, 對家: 0 };
    records.filter(r => !r.settledAt).forEach(r => {
      if (!r.position) return;
      if (r.position === '自摸') {
        if (r.amount <= 0) return;
        pos.上家 += r.amount;
        pos.下家 += r.amount;
        pos.對家 += r.amount;
      } else if (pos.hasOwnProperty(r.position)) {
        pos[r.position] += r.amount;
      }
    });
    return pos;
  }, [records]);

  const hasUnsettled = records.some(r => !r.settledAt);
  const handleCompleteSettlement = () => {
    if (!window.confirm('確定完成本次結算？依對象結算將歸零，歷史紀錄與報表仍會保留。')) return;
    setRecords(prev => prev.map(r => ({ ...r, settledAt: r.settledAt ?? Date.now() })));
    triggerToast();
  };

  // 從紀錄時間計算：今天／本月 打牌時長（首筆到末筆的時間跨度）
  const durationStats = useMemo(() => {
    const toDate = (r) => {
      const d = r.date;
      return d instanceof Date ? d : new Date(d);
    };
    const now = new Date();
    const isToday = (d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    const isThisMonth = (d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    const getDurationParts = (ms) => {
      if (ms <= 0) return null;
      const totalMins = Math.floor(ms / 60000);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return { h, m };
    };
    const todayRecords = records.filter(r => isToday(toDate(r)));
    const monthRecords = records.filter(r => isThisMonth(toDate(r)));
    const span = (arr) => {
      if (arr.length < 2) return 0;
      const dates = arr.map(r => toDate(r).getTime());
      return Math.max(...dates) - Math.min(...dates);
    };
    return {
      todayParts: getDurationParts(span(todayRecords)),
      todayCount: todayRecords.length,
      monthParts: getDurationParts(span(monthRecords)),
      monthCount: monthRecords.length
    };
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
  const cardDark = 'dark:bg-[#1a1c1a] dark:border-[#2d302d] dark:text-[#ececec] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]';
  const inputLight = 'bg-[#FAFAF9] border-gray-200 text-gray-900 placeholder-gray-400';
  const inputDark = 'dark:bg-[#0a0c0a] dark:border-[#2d302d] dark:text-[#ececec] dark:placeholder-[#b8c4b8]';
  const mutedLight = 'text-gray-500';
  const mutedDark = 'dark:text-[#c0c8c0]';
  const sectionLabel = 'text-[10px] font-bold uppercase tracking-[0.2em]';
  const primaryBorder = 'border-primary focus:border-primary dark:border-primary';
  const secondaryBg = 'bg-secondary text-white hover:opacity-90';

  // 計算頁統一字級：區塊標題 / 欄位標籤 / 按鈕內文
  const calcSectionTitle = 'text-base font-bold text-gray-800 dark:text-[#ececec]';
  const calcLabel = `text-xs font-semibold uppercase tracking-wider ${mutedLight} ${mutedDark}`;
  const calcRuleText = 'text-sm font-medium';
  const calcRulePts = 'text-sm font-medium';

  const CalcView = () => (
    <div className="space-y-8">
      <section className={`${cardCls} ${cardLight} ${cardDark} p-6`}>
        <h3 className={`${calcSectionTitle} mb-5 text-center`}>底台設定</h3>
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center flex-1 max-w-[7rem]">
            <label className={`${calcLabel} mb-2.5 w-full text-center`}>底（元）</label>
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(parseInt(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className={`w-full bg-gray-50 dark:bg-[#0f110f] rounded-xl py-3.5 text-2xl font-black text-center border outline-none transition-colors ${primaryBorder} ${cardDark} focus:ring-2 focus:ring-primary/20`}
            />
          </div>
          <span className={`text-2xl font-bold pb-2 ${mutedLight} ${mutedDark}`}>/</span>
          <div className="flex flex-col items-center flex-1 max-w-[7rem]">
            <label className={`${calcLabel} mb-2.5 w-full text-center`}>每台（元）</label>
            <input
              type="number"
              value={pointPrice}
              onChange={(e) => setPointPrice(parseInt(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className={`w-full bg-gray-50 dark:bg-[#0f110f] rounded-xl py-3.5 text-2xl font-black text-center border outline-none transition-colors ${primaryBorder} ${cardDark} focus:ring-2 focus:ring-primary/20`}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <span className={calcLabel}>台數選擇</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pointRules.map(rule => (
            <button
              key={rule.id}
              onClick={() => togglePoint(rule.id)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border ${
                selectedPoints[rule.id]
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : `bg-white dark:bg-[#1a1c1a] border-gray-200 dark:border-[#2d302d] text-gray-700 dark:text-[#d0d4d0] hover:border-gray-300 dark:hover:border-[#4a5a4a]`
              }`}
            >
              <span className={calcRuleText}>{rule.name}</span>
              <span className={`${calcRulePts} ${selectedPoints[rule.id] ? 'text-white/90' : mutedLight + ' ' + mutedDark}`}>
                +{rule.pts} 台
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 額外加台：數字固定寬度避免按 +/- 時版面跳動 */}
      <section className={`${cardCls} ${cardLight} ${cardDark} p-5 flex justify-between items-center`}>
        <p className={`${calcSectionTitle} text-left`}>額外加台</p>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#0a0c0a] p-1 rounded-xl min-w-[120px] justify-center">
          <button
            type="button"
            onClick={() => setExtraPoints(Math.max(0, extraPoints - 1))}
            className="w-10 h-10 rounded-lg bg-white dark:bg-[#2d302d] flex items-center justify-center text-gray-600 dark:text-[#d0d4d0] border border-gray-200 dark:border-[#2d302d] shrink-0"
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

      {/* 本手結果：贏錢＝上家/下家/對家/自摸；輸錢＝上家/下家/對家（付給誰） */}
      <section className={`${cardCls} ${cardLight} ${cardDark} p-6`}>
        <h3 className={`${calcSectionTitle} mb-5 text-center`}>本手結果</h3>
        <div className="space-y-5">
          <div>
            <label className={`block ${calcLabel} mb-2.5 text-center`}>對象</label>
            <div className={`grid gap-2 ${resultType === 'win' ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {(resultType === 'win' ? ['上家', '下家', '對家', '自摸'] : ['上家', '下家', '對家']).map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setResultPosition(pos)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                    resultPosition === pos
                      ? 'bg-primary border-primary text-white shadow-md'
                      : `border-gray-200 dark:border-[#2d302d] ${mutedLight} ${mutedDark} hover:border-gray-300 dark:hover:border-[#4a5a4a]`
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block ${calcLabel} mb-2.5 text-center`}>輸贏</label>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setResultType('win')}
                className={`py-3.5 rounded-xl font-semibold text-sm transition-all border ${
                  resultType === 'win'
                    ? 'bg-secondary border-secondary text-white shadow-md'
                    : `border-gray-200 dark:border-[#2d302d] ${mutedLight} ${mutedDark} hover:border-gray-300 dark:hover:border-[#4a5a4a]`
                }`}
              >
                贏錢
              </button>
              <button
                type="button"
                onClick={() => { setResultType('expense'); if (resultPosition === '自摸') setResultPosition(null); }}
                className={`py-3.5 rounded-xl font-semibold text-sm transition-all border ${
                  resultType === 'expense'
                    ? 'bg-primary border-primary text-white shadow-md'
                    : `border-gray-200 dark:border-[#2d302d] ${mutedLight} ${mutedDark} hover:border-gray-300 dark:hover:border-[#4a5a4a]`
                }`}
              >
                輸錢
              </button>
            </div>
          </div>
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

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <span className={`${calcLabel}`}>歷史紀錄</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
          {records.length > 0 && (
            <button
              type="button"
              onClick={() => { if (window.confirm('確定要清除全部紀錄嗎？')) { setRecords([]); triggerToast(); } }}
              className={`text-xs font-medium shrink-0 ${mutedLight} ${mutedDark} hover:text-red-500 dark:hover:text-[#ff8080] transition-colors`}
            >
              清除紀錄
            </button>
          )}
        </div>
        {records.length === 0 ? (
          <div className={`py-20 text-center text-sm italic ${mutedLight} ${mutedDark}`}>尚無數據</div>
        ) : (
          records.map(record => (
            <div key={record.id} className={`${cardCls} ${cardLight} ${cardDark} p-4`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.amount >= 0 ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-red-400 dark:text-[#ff8080]'}`}>
                    {record.amount >= 0 ? <Plus size={16} /> : <Minus size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{record.amount >= 0 ? '贏錢' : '輸錢'}</p>
                    <p className={`text-xs mt-0.5 ${mutedLight} ${mutedDark}`}>
                      {record.date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} · {record.date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                      {record.settledAt && <span className="ml-1.5 text-[10px] text-primary">已結算</span>}
                    </p>
                    {(record.position || record.points != null) && (
                      <p className={`text-xs mt-0.5 ${mutedLight} ${mutedDark}`}>
                        {[record.position, record.points != null ? `${record.points} 台` : null].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {record.note && (
                      <p className="text-xs mt-1 text-gray-600 dark:text-[#d0d4d0] truncate" title={record.note}>{record.note}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-semibold tabular-nums ${record.amount >= 0 ? 'text-secondary' : 'text-red-400 dark:text-[#ff8080]'}`}>
                    {record.amount >= 0 ? `+${record.amount}` : record.amount}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRecords(prev => prev.filter(r => r.id !== record.id))}
                    className={`text-xs mt-1 font-medium ${mutedLight} ${mutedDark} hover:text-primary transition-colors`}
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <section className={`${cardCls} ${cardLight} ${cardDark} p-6 space-y-4 text-center`}>
        <h4 className={calcSectionTitle}>本次依對象結算</h4>
        <p className={`text-xs ${mutedLight} ${mutedDark}`}>正數＝他要給你，負數＝你要給他</p>
        {(['上家', '下家', '對家']).map(pos => (
          <div key={pos} className="flex justify-center items-center gap-4">
            <span className={`text-sm font-medium ${mutedLight} ${mutedDark}`}>{pos}</span>
            <span className={`text-sm font-semibold tabular-nums ${positionSums[pos] > 0 ? 'text-secondary' : positionSums[pos] < 0 ? 'text-red-500 dark:text-[#ff8080]' : ''}`}>
              {positionSums[pos] > 0 ? `+$${positionSums[pos].toLocaleString()}` : positionSums[pos] < 0 ? `-$${Math.abs(positionSums[pos]).toLocaleString()}` : '$0'}
            </span>
          </div>
        ))}
        {hasUnsettled && (
          <>
            <button
              type="button"
              onClick={handleCompleteSettlement}
              className={`w-full mt-2 py-3 rounded-xl font-semibold text-sm border-2 border-dashed border-gray-300 dark:border-[#3d403d] ${mutedLight} ${mutedDark} hover:border-primary hover:text-primary transition-colors`}
            >
              完成本次結算
            </button>
            <p className={`text-[11px] ${mutedLight} ${mutedDark}`}>以上為本次未結算金額；完成結算後本區歸零，歷史紀錄與報表仍會保留。</p>
          </>
        )}
      </section>
    </div>
  );

  // 報表頁字級與計算/紀錄頁一致：區塊標題用 calcSectionTitle、標籤用 calcLabel
  const reportCardValue = 'text-2xl font-semibold tabular-nums';
  const reportCardSub = `text-xs ${mutedLight} ${mutedDark}`;
  const reportRowLabel = `text-sm font-medium ${mutedLight} ${mutedDark}`;
  const reportRowValue = 'text-sm font-semibold tabular-nums';

  const ReportView = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 px-1 mb-4">
          <span className={calcLabel}>總覽</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`${cardCls} ${cardLight} ${cardDark} p-6 text-center`}>
            <p className={`text-sm font-semibold mb-2 ${mutedLight} ${mutedDark}`}>總輸贏</p>
            <p className={`${reportCardValue} ${stats.total >= 0 ? 'text-secondary' : 'text-red-500 dark:text-[#ff8080]'}`}>
              ${stats.total}
            </p>
          </div>
          <div className={`${cardCls} ${cardLight} ${cardDark} p-6 text-center`}>
            <p className={`text-sm font-semibold mb-2 ${mutedLight} ${mutedDark}`}>勝率</p>
            <p className={reportCardValue}>
              {stats.totalCount ? Math.round((stats.winCount / stats.totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 px-1 mb-4">
          <span className={calcLabel}>打牌時長</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#2d302d]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`${cardCls} ${cardLight} ${cardDark} p-5 flex flex-col items-center justify-center text-center`}>
            <Clock size={20} className={`mb-2 ${mutedLight} ${mutedDark}`} />
            <p className={`${calcLabel} mb-2`}>今天打了多久</p>
            <p className="text-gray-800 dark:text-[#ececec]">
              {durationStats.todayParts == null ? (
                '—'
              ) : (
                <>
                  {durationStats.todayParts.h > 0 && (
                    <><span className="text-base font-semibold tabular-nums">{durationStats.todayParts.h}</span><span className="text-xs font-medium text-gray-500 dark:text-[#c0c8c0] ml-0.5"> 小時 </span></>
                  )}
                  <span className="text-base font-semibold tabular-nums">{durationStats.todayParts.m}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-[#c0c8c0] ml-0.5"> 分鐘</span>
                </>
              )}
            </p>
            {durationStats.todayCount > 0 && (
              <p className={`${reportCardSub} mt-1`}>{durationStats.todayCount} 手</p>
            )}
          </div>
          <div className={`${cardCls} ${cardLight} ${cardDark} p-5 flex flex-col items-center justify-center text-center`}>
            <Clock size={20} className={`mb-2 ${mutedLight} ${mutedDark}`} />
            <p className={`${calcLabel} mb-2`}>本月打了多久</p>
            <p className="text-gray-800 dark:text-[#ececec]">
              {durationStats.monthParts == null ? (
                '—'
              ) : (
                <>
                  {durationStats.monthParts.h > 0 && (
                    <><span className="text-base font-semibold tabular-nums">{durationStats.monthParts.h}</span><span className="text-xs font-medium text-gray-500 dark:text-[#c0c8c0] ml-0.5"> 小時 </span></>
                  )}
                  <span className="text-base font-semibold tabular-nums">{durationStats.monthParts.m}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-[#c0c8c0] ml-0.5"> 分鐘</span>
                </>
              )}
            </p>
            {durationStats.monthCount > 0 && (
              <p className={`${reportCardSub} mt-1`}>{durationStats.monthCount} 手</p>
            )}
          </div>
        </div>
        <p className={`mt-3 text-center ${reportCardSub}`}>依第一筆與最後一筆紀錄時間計算</p>
      </section>

      <section className={`${cardCls} ${cardLight} ${cardDark} p-6`}>
        <h4 className={`${calcSectionTitle} mb-4 flex items-center gap-2`}>
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
              <span className={reportCardSub}>{i + 1}月</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`${cardCls} ${cardLight} ${cardDark} p-6 space-y-4`}>
        <h4 className={calcSectionTitle}>本年統計摘要</h4>
        <div className="flex justify-between items-center">
          <span className={reportRowLabel}>紀錄手數</span>
          <span className={reportRowValue}>{stats.totalCount} 手</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={reportRowLabel}>單手最高贏額</span>
          <span className={`${reportRowValue} ${stats.maxWin > 0 ? 'text-secondary' : ''}`}>
            +${stats.maxWin.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={reportRowLabel}>單手最高損失</span>
          <span className={`${reportRowValue} ${stats.maxLoss < 0 ? 'text-red-500 dark:text-[#ff8080]' : ''}`}>
            {stats.maxLoss < 0 ? `-$${Math.abs(stats.maxLoss).toLocaleString()}` : '$0'}
          </span>
        </div>
        <p className={`pt-2 border-t border-gray-100 dark:border-[#2d302d] ${reportCardSub}`}>
          數據僅含已新增紀錄，流局未計入
        </p>
      </section>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F7F4EF] dark:bg-[#0a0c0a] text-gray-900 dark:text-[#ececec] overflow-hidden">
      {/* ----- 固定頂部 Header (sticky) ----- */}
      <header className="flex-none sticky top-0 z-40 w-full bg-[#FBF9F6] dark:bg-[#0a0c0a] border-b border-gray-200 dark:border-[#1a1c1a]">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-[#1a1c1a] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-[#2d302d] shadow-sm">
              <div className="w-5 h-5 bg-primary rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-[#ececec]">
                麻將算算 <span className="text-primary">MahjongCalc</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 淺色模式顯示 Dark、深色模式顯示 Light */}
            <button
              type="button"
              onClick={() => setIsDark(d => !d)}
              className="min-w-[4rem] px-4 py-2.5 rounded-[2rem] text-xs font-semibold transition-colors bg-[#F5F3F0] dark:bg-[#2a2c2a] text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-[#3d403d] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none"
            >
              {isDark ? 'Light' : 'Dark'}
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
        <div className="max-w-md mx-auto px-4 py-6 pb-0">
          <p className={`text-sm font-medium mb-5 text-center ${mutedLight} ${mutedDark}`}>
            {greeting}
          </p>
          {activeTab === 'calc' && CalcView()}
          {activeTab === 'record' && RecordView()}
          {activeTab === 'report' && ReportView()}

          {/* 廣告：在 main 裡會隨頁面捲動 */}
          <div className="mt-8 pt-6 pb-4 border-t border-gray-200/80 dark:border-[#2d302d] flex flex-col">
            <div className="w-full rounded-2xl border border-dashed border-gray-200 dark:border-[#3d403d] bg-[#F5F3F0] dark:bg-[#1a1c1a]/90 min-h-[80px] flex items-center justify-center">
              <span className="text-[11px] font-medium text-gray-400 dark:text-[#c0c8c0]">Ad</span>
            </div>
          </div>

          {/* 版權與 icon：貼近 footer、隨視窗滾動 */}
          <div className="py-4 flex flex-col items-center justify-center gap-2">
            <p className="text-center text-[11px] text-gray-600 dark:text-[#d0d4d0] tracking-wide">
              MahjongCalc © 2026 ·{' '}
              <a
                href="https://www.friendlycatgroup.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-gray-600 dark:text-[#d0d4d0] hover:opacity-80 transition-opacity"
              >
                Friendly Cat Group
              </a>
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://instagram.com/friendlycatgroup"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-[#d0d4d0] hover:opacity-80 transition-opacity"
                aria-label="Instagram @friendlycatgroup"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:workbyaria@gmail.com"
                className="p-2 text-gray-600 dark:text-[#d0d4d0] hover:opacity-80 transition-opacity"
                aria-label="Email"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ----- 固定底部 Footer (sticky)，僅導覽與計算結果欄 ----- */}
      <footer className="flex-none sticky bottom-0 z-40 w-full bg-[#FBF9F6] dark:bg-[#0a0c0a] border-t border-gray-200 dark:border-[#1a1c1a]">
        <div className="max-w-md mx-auto flex flex-col items-center px-4 pt-4 pb-8">
          {activeTab === 'calc' && (
            <div className="w-full max-w-[92%] bg-primary rounded-xl shadow-sm mb-3 flex items-stretch gap-0 overflow-hidden">
              <div className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-xs font-semibold text-white/90">
                  總計 <span className="tabular-nums font-bold">{currentTotalPoints}</span> 台
                </span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-xs font-semibold text-white/90">總金額</span>
                  <span className="text-sm font-bold ml-0.5">$</span>
                  <span className="text-lg font-black tabular-nums ml-0.5">{currentTotalAmount.toLocaleString()}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={addRecordFromCalc}
                className="flex items-center justify-center gap-1.5 px-3 py-3 bg-white/95 dark:bg-[#1a1c1a] text-primary font-semibold text-xs hover:bg-white dark:hover:bg-[#2a2c2a] active:scale-[0.98] transition-all shrink-0"
                title="以目前總金額新增紀錄"
              >
                <CheckCircle2 size={16} strokeWidth={2.2} />
                新增紀錄
              </button>
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

      {showSettings && (
        <SettingsView
          initialRules={pointRules}
          defaultRules={DEFAULT_POINT_RULES}
          onSave={handleSavePointRules}
          onClose={() => setShowSettings(false)}
          cardCls={cardCls}
          cardLight={cardLight}
          cardDark={cardDark}
          sectionLabel={sectionLabel}
          mutedLight={mutedLight}
          mutedDark={mutedDark}
          inputLight={inputLight}
          inputDark={inputDark}
        />
      )}
    </div>
  );
};

export default App;
