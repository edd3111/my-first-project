import React, { useState, useRef, useEffect } from "react";

const GAME_RULES = `
ПРАВИЛА ИГРЫ «МЕСТО ПОД СОЛНЦЕМ» (контекст, который ты знаешь):
- 4 компании (Север, Юг, Запад, Восток) в равных стартовых условиях конкурируют за продавцов и контракты. Цель — максимум контрактов (доля рынка) и прибыльность.
- Команда принимает решения по областям: найм и обучение персонала, уровень зарплаты, бонус с продаж, соцпакет, политика качества, вложения в сервис, цена, размер офиса, бюджет рекламы и PR, маркетинговый бюджет.
- Решения дают компании РЕЙТИНГ ДЛЯ ПРОДАВЦОВ и РЕЙТИНГ ДЛЯ КЛИЕНТОВ по трём критериям: престиж, качество, цена.
- Контракты бывают по приоритетам клиента: престиж/престиж, престиж/качество, качество/качество, качество/цена, цена/цена. При конкуренции клиент выбирает компанию с более высоким коэффициентом по важной характеристике; при приоритете из двух — коэффициенты складываются; при равенстве учитываются расходы на рекламу и PR нужной характеристики; выполненный контракт даёт фишку лояльности (преимущество у этого клиента в следующем году).
- Продавцы различаются компетентностью (1–6) и лояльностью (меняют работу каждый год / раз в 2 года / не меняют). Обучение повышает компетентность. Заявленная компетентность может не совпадать с реальной. На рынке 3 уровня: высокая (4–6), средняя (2–5), низкая (1–3).
- Очередь найма и выбора контрактов определяется рейтингами компании. Со 2-го года доступен кредит: ставка 20% годовых, погасить к концу игры, не более 50% выручки прошлого периода, сумма кратна 5.
- Решения в одной области влияют на смежные: привлекательность для сотрудников, себестоимость, постоянные затраты, уровень качества, постоянные затраты.
`;

const MODES = {
  sparring: {
    label: "Спарринг",
    short: "Только вопросы. Не даёт решений.",
    instructions: `РЕЖИМ: СПАРРИНГ-ПАРТНЁР (основной обучающий режим).
- НИКОГДА не предлагай конкретное решение, число, цену, размер бюджета, кого нанять или сколько вложить.
- НИКОГДА не говори «я бы сделал так» или «вам стоит...».
- НИКОГДА не считай за команду оптимальный вариант.
- КРИТИЧНО: когда спрашивают «а как правильно / какое число лучше / от чего это зависит» — НЕ перечисляй факторы и не разворачивай логику решения за них. Перечень факторов — это и есть подсказанный ответ. Вместо этого верни ОДИН вопрос, который заставит их назвать фактор самим. Плохо: «это зависит от числа контрактов, выручки и затрат на персонал». Хорошо: «А от чего, по-вашему, это вообще должно зависеть? Назовите один фактор».
- Если просят готовый ответ — коротко откажись и сразу задай вопрос. Без длинных оговорок вроде «я не знаю, и это не уклонение». Достаточно: «Это решение за вами.» — и сразу вопрос.
- Задавай ПО ОДНОМУ вопросу за раз. Ответ — максимум 2–3 коротких предложения, последнее из них вопрос. Без преамбул и без мини-лекций.
- Проси называть допущения, на которых держится план. Подталкивай увидеть связи между областями НЕ называя их, а спрашивая. Спрашивай: «что будет, если конкурент сделает то же самое?».
- САМОЭСКАЛАЦИЯ: если команда содержит в плане явное противоречие (напр. премиум-качество при минимальной зарплате) — сначала подведи к нему наводящим вопросом, не вскрывая. Но если в следующих 1–2 репликах команда так и не увидела противоречие — назови его прямо одним предложением и спроси, как они его разрешат. Цель — чтобы слабая команда не проскочила ошибку незамеченной.`
  },
  rules: {
    label: "Спарринг + правила",
    short: "Вопросы + может объяснять механику игры.",
    instructions: `РЕЖИМ: СПАРРИНГ + ПОМОЩЬ С ПРАВИЛАМИ.
- По стратегии и решениям действуй строго как спарринг-партнёр: только вопросы, никаких готовых решений, чисел и рекомендаций.
- НО если команда не понимает МЕХАНИКУ игры (как считается рейтинг, как распределяются контракты, как работает кредит) — это можно объяснять прямо и понятно, опираясь на правила.
- Граница: объяснять «как устроена игра» — можно; советовать «что выбрать» — нельзя.`
  },
  mentor: {
    label: "Наставник (пробный период)",
    short: "Снимает порог входа на пробном периоде.",
    instructions: `РЕЖИМ: НАСТАВНИК (только для пробного периода).
- Команда осваивается с правилами. Помогай разобраться в механике и причинно-следственных связях максимально понятно.
- Всё равно НЕ давай готовых стратегических решений и чисел — но активно объясняй, как устроены зависимости («если поднять качество, но не поднять цену — что с маржой?»).
- Цель режима — чтобы команда не утонула в правилах, а начала думать о стратегии.`
  },
  silent: {
    label: "Тишина",
    short: "Советник отключён (проверка самостоятельности).",
    instructions: `РЕЖИМ: ТИШИНА. Советник недоступен в этом периоде по решению тренера.`
  }
};

const TOUGHNESS = {
  soft:   "ЖЁСТКОСТЬ: мягкая. Только подводящие вопросы, противоречия не вскрывай прямо даже при повторе — дай команде дойти самой.",
  medium: "ЖЁСТКОСТЬ: средняя (по умолчанию). Действует правило самоэскалации: подводишь вопросом, но если за 1–2 реплики команда не увидела противоречие — называешь его прямо.",
  hard:   "ЖЁСТКОСТЬ: высокая. Замеченное противоречие вскрывай прямо в первой же реплике одним предложением и сразу спрашивай, как они его разрешат. По-прежнему без готовых решений и чисел."
};

function buildSystemPrompt(team, period, finance, market, mode, toughness) {
  return `Ты — бизнес-консультант управленческой команды в обучающей бизнес-симуляции «Место под солнцем». Команда играет за компанию, конкурирующую за продавцов и контракты. Твоя задача — НЕ помочь им выиграть, а помочь им НАУЧИТЬСЯ думать как управленцы. Ты спарринг-партнёр для мышления, а не источник ответов.

${GAME_RULES}

ДАННЫЕ ЭТОЙ КОМАНДЫ:
- Команда: ${team || "не указана"}
- Текущий период (год): ${period || "не указан"}
- Финансовое положение: ${finance || "не указано командой"}
- Информация о рынке в этом периоде: ${market || "не указана тренером"}

Ты НЕ знаешь решений других команд. Если спрашивают про ходы соперников — отвечай, что это закрытая информация, и переводи на вопрос: «а что вы предполагаете об их стратегии и на чём основано это предположение?».

${MODES[mode].instructions}

${TOUGHNESS[toughness] || TOUGHNESS.medium}

СТИЛЬ: очень кратко — максимум 2–3 коротких предложения, заканчивай вопросом. Никаких преамбул, оговорок и мини-лекций (формат «я не знаю, но...» запрещён — сразу к делу). Один вопрос за реплику. Уважительно и на равных, язык простой и конкретный (аудитория — студенты бакалавриата, без жаргона). Не поддакивай слабым решениям из вежливости — твоя ценность в честных неудобных вопросах. Если команда хорошо аргументировала — коротко признай и подними планку следующим вопросом. Отвечай на русском языке.`;
}

const TEAMS = ["Север", "Юг", "Запад", "Восток"];
const C = {
  bg: "#1a1206", panel: "#241a0c", panel2: "#2e2210",
  sun: "#f5a623", sunDeep: "#e8820c", cream: "#fdf2de",
  line: "#3d2e14", text: "#f3e4c8", dim: "#a8916a", user: "#3a2c12"
};

export default function App() {
  const [setup, setSetup] = useState(true);
  const [team, setTeam] = useState("");
  const [period, setPeriod] = useState("1");
  const [finance, setFinance] = useState("");
  const [market, setMarket] = useState("");
  const [mode, setMode] = useState("sparring");
  const [toughness, setToughness] = useState("medium");
  const [limit, setLimit] = useState(8);

  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const [trainerOpen, setTrainerOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    if (mode === "silent") return;
    if (used >= limit) return;

    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setUsed(u => u + 1);

    try {
      const sys = buildSystemPrompt(team, period, finance, market, mode, toughness);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: sys,
          messages: next.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка API");
      }
      const text = (data.content || [])
        .filter(b => b.type === "text").map(b => b.text).join("\n").trim()
        || "(пустой ответ — попробуйте переформулировать)";
      setMsgs(m => [...m, { role: "assistant", content: text }]);
    } catch (e) {
      setMsgs(m => [...m, { role: "assistant", content: "Ошибка связи с ИИ. Проверьте интернет и попробуйте ещё раз. Игра при этом продолжается как обычная настольная." }]);
    } finally {
      setBusy(false);
    }
  }

  const left = Math.max(0, limit - used);

  if (setup) {
    return (
      <Shell>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Logo />
          <h1 style={{ color: C.cream, fontSize: 26, margin: "8px 0 4px", fontWeight: 800 }}>
            Настройка перед игрой
          </h1>
          <p style={{ color: C.dim, fontSize: 14, margin: "0 0 22px" }}>
            Заполняет тренер. Один экран на команду.
          </p>

          <Field label="Команда">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TEAMS.map(t => (
                <button key={t} onClick={() => setTeam(t)}
                  style={chip(team === t)}>{t}</button>
              ))}
            </div>
          </Field>

          <Field label="Период (год)">
            <div style={{ display: "flex", gap: 8 }}>
              {["проб.", "1", "2", "3", "4", "5"].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={chip(period === p)}>{p}</button>
              ))}
            </div>
          </Field>

          <Field label="Режим советника">
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(MODES).map(([k, v]) => (
                <button key={k} onClick={() => setMode(k)} style={{
                  ...chip(mode === k), textAlign: "left", display: "block",
                  padding: "10px 14px", width: "100%"
                }}>
                  <div style={{ fontWeight: 700 }}>{v.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 400 }}>{v.short}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Жёсткость советника">
            <div style={{ display: "flex", gap: 8 }}>
              {[["soft","Мягкая"],["medium","Средняя"],["hard","Жёсткая"]].map(([k, l]) => (
                <button key={k} onClick={() => setToughness(k)} style={chip(toughness === k)}>{l}</button>
              ))}
            </div>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 6 }}>
              Средняя — для смешанных групп. Жёсткая — для сильных. Мягкая — для самых слабых.
            </div>
          </Field>

          <Field label="Лимит обращений за период">
            <div style={{ display: "flex", gap: 8 }}>
              {[5, 8, 12, 99].map(n => (
                <button key={n} onClick={() => setLimit(n)} style={chip(limit === n)}>
                  {n === 99 ? "∞" : n}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Финансовое положение команды (необязательно)">
            <input value={finance} onChange={e => setFinance(e.target.value)}
              placeholder="напр.: 40 фишек, кредит не брали"
              style={inp} />
          </Field>

          <Field label="Информация о рынке этого периода (необязательно)">
            <textarea value={market} onChange={e => setMarket(e.target.value)}
              placeholder="напр.: спрос на премиум-контракты вырос"
              rows={2} style={{ ...inp, resize: "vertical" }} />
          </Field>

          <button disabled={!team} onClick={() => setSetup(false)} style={{
            marginTop: 14, width: "100%", padding: "14px",
            background: team ? C.sunDeep : C.line, color: team ? "#1a1206" : C.dim,
            border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800,
            cursor: team ? "pointer" : "not-allowed", letterSpacing: 0.3
          }}>
            {team ? "Запустить советника →" : "Выберите команду"}
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingBottom: 12, borderBottom: `1px solid ${C.line}`, marginBottom: 12, flexWrap: "wrap", gap: 8
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SunMark size={34} />
            <div>
              <div style={{ color: C.cream, fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>
                Советник · {team}
              </div>
              <div style={{ color: C.dim, fontSize: 12 }}>
                Период {period} · {MODES[mode].label}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              fontSize: 12, color: left > 0 ? C.sun : "#e57", fontWeight: 700,
              background: C.panel2, padding: "6px 10px", borderRadius: 8
            }}>
              {mode === "silent" ? "режим тишины" : (limit >= 99 ? "вопросы: без лимита" : `осталось вопросов: ${left}`)}
            </span>
            <button onClick={() => setTrainerOpen(o => !o)} style={{
              ...chip(false), padding: "6px 10px", fontSize: 12
            }}>⚙ тренер</button>
          </div>
        </div>

        {trainerOpen && (
          <div style={{
            background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12,
            padding: 14, marginBottom: 12
          }}>
            <div style={{ color: C.sun, fontSize: 12, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>
              ПАНЕЛЬ ТРЕНЕРА
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 5, fontWeight: 700 }}>РЕЖИМ</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {Object.entries(MODES).map(([k, v]) => (
                <button key={k} onClick={() => setMode(k)} style={{
                  ...chip(mode === k), fontSize: 12, padding: "6px 10px"
                }}>{v.label}</button>
              ))}
            </div>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 5, fontWeight: 700 }}>ЖЁСТКОСТЬ</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {[["soft","Мягкая"],["medium","Средняя"],["hard","Жёсткая"]].map(([k, l]) => (
                <button key={k} onClick={() => setToughness(k)} style={{
                  ...chip(toughness === k), fontSize: 12, padding: "6px 10px"
                }}>{l}</button>
              ))}
            </div>
            <button onClick={() => { setUsed(0); }} style={{
              ...chip(false), fontSize: 12, padding: "6px 10px", marginRight: 8
            }}>↺ сбросить лимит (новый период)</button>
            <button onClick={() => setSetup(true)} style={{
              ...chip(false), fontSize: 12, padding: "6px 10px"
            }}>← изменить настройки</button>
          </div>
        )}

        <div style={{
          flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
          gap: 12, paddingRight: 4
        }}>
          {msgs.length === 0 && mode !== "silent" && (
            <div style={{
              color: C.dim, fontSize: 14, lineHeight: 1.6,
              background: C.panel, border: `1px dashed ${C.line}`,
              borderRadius: 12, padding: 18
            }}>
              Я не дам вам готовых решений — это ваша работа как управленческой
              команды. Я буду задавать вопросы, чтобы ваши решения стали крепче.
              <br /><br />
              Расскажите, какое решение вы сейчас обдумываете.
            </div>
          )}

          {mode === "silent" && (
            <div style={{
              color: C.text, fontSize: 15, lineHeight: 1.6, textAlign: "center",
              background: C.panel, border: `1px solid ${C.line}`,
              borderRadius: 12, padding: 28, marginTop: 20
            }}>
              <SunMark size={40} />
              <div style={{ marginTop: 14, fontWeight: 700 }}>Режим тишины</div>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 6 }}>
                В этом периоде советник отключён.<br />
                Команда принимает решения самостоятельно.
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? C.user : C.panel,
              border: `1px solid ${m.role === "user" ? C.line : C.sunDeep + "55"}`,
              color: C.text, padding: "12px 16px", borderRadius: 14,
              fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-wrap"
            }}>
              {m.role === "assistant" && (
                <div style={{ color: C.sun, fontSize: 11, fontWeight: 800, marginBottom: 5, letterSpacing: 0.5 }}>
                  СОВЕТНИК
                </div>
              )}
              {m.content}
            </div>
          ))}

          {busy && (
            <div style={{
              alignSelf: "flex-start", background: C.panel,
              border: `1px solid ${C.sunDeep}55`, padding: "12px 16px",
              borderRadius: 14, color: C.dim, fontSize: 14
            }}>
              думает над вопросом…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {mode !== "silent" && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
            {left === 1 && (
              <div style={{
                color: C.sun, fontSize: 13, textAlign: "center",
                marginBottom: 10, fontWeight: 600
              }}>
                Остался последний вопрос на этот период — задайте самый важный.
              </div>
            )}
            {left <= 0 ? (
              <div style={{
                color: C.dim, fontSize: 14, textAlign: "center",
                padding: "12px", background: C.panel, borderRadius: 12
              }}>
                Лимит обращений на этот период исчерпан. Дальше команда решает сама.
                <br />Тренер может сбросить лимит в начале следующего периода.
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Опишите решение, которое обдумываете…"
                  rows={2}
                  style={{
                    flex: 1, background: C.panel2, color: C.text,
                    border: `1px solid ${C.line}`, borderRadius: 12,
                    padding: "12px 14px", fontSize: 15, resize: "none",
                    outline: "none", fontFamily: "inherit"
                  }}
                />
                <button onClick={send} disabled={busy || !input.trim()} style={{
                  background: busy || !input.trim() ? C.line : C.sunDeep,
                  color: busy || !input.trim() ? C.dim : "#1a1206",
                  border: "none", borderRadius: 12, padding: "0 22px",
                  fontSize: 15, fontWeight: 800,
                  cursor: busy || !input.trim() ? "default" : "pointer"
                }}>→</button>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: "100vh", background:
        `radial-gradient(ellipse at 50% -10%, ${C.sunDeep}22, transparent 60%), ${C.bg}`,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "26px 18px", boxSizing: "border-box",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 7, fontWeight: 700, letterSpacing: 0.3 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
function SunMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block" }}>
      <defs>
        <radialGradient id="sg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffd27a" />
          <stop offset="100%" stopColor="#e8820c" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="11" fill="url(#sg)" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <line key={i}
          x1={24 + Math.cos(a) * 15} y1={24 + Math.sin(a) * 15}
          x2={24 + Math.cos(a) * 21} y2={24 + Math.sin(a) * 21}
          stroke="#f5a623" strokeWidth="2.4" strokeLinecap="round" />;
      })}
    </svg>
  );
}
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <SunMark size={40} />
      <div style={{ color: C.sun, fontWeight: 800, fontSize: 15, letterSpacing: 1.5 }}>
        МЕСТО ПОД СОЛНЦЕМ · ИИ-СОВЕТНИК
      </div>
    </div>
  );
}
const inp = {
  width: "100%", background: C.panel2, color: C.text,
  border: `1px solid ${C.line}`, borderRadius: 10,
  padding: "11px 13px", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit"
};
function chip(active) {
  return {
    background: active ? C.sunDeep : C.panel2,
    color: active ? "#1a1206" : C.text,
    border: `1px solid ${active ? C.sunDeep : C.line}`,
    borderRadius: 10, padding: "9px 16px", fontSize: 14,
    fontWeight: active ? 800 : 500, cursor: "pointer",
    fontFamily: "inherit"
  };
}
