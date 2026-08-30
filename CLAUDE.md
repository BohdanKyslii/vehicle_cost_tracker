## Obsidian vault sync
Контекст цього проєкту для Obsidian-vault живе прямо в репо: `obsidian/`
(CLAUDE.md, tasks.md, decisions.md, env.example.md). У vault
(`C:\Users\b.kisliy\obsidian-vault-Kyslii\`) на цю теку вказує Windows
Junction `projects\vehicle_cost_tracker` — той самий підхід, що й для
`vehicle_tracker_api` (там `projects\vehicle_tracker_api` — Junction на
`task_description` всередині його репо).

Раніше тут був шлях `D:\Obsidian_Kisliy\projects\vehicle_cost_tracker\` і
розрахунок на конектор `mcp__obsidian__*` — обидва виявились недоступні з
середовища, де працює Claude Code для цього репо (нема диска D:, конектор
не підключений). Тому перейшли на файли в самому репо + Junction.

- Коли просять "онови obsidian" / "sync obsidian" — прочитай актуальний стан
  цього репо (структура, git log, CODING_GUIDE.md, documents/) і перепиши
  ці 4 файли напряму (Read/Write) в `obsidian/` — без MCP, це і є vault-контент.
- В `env.example.md` — тільки СТРУКТУРА `.env` (імена змінних + призначення),
  без значень і секретів.
- Онови ці файли одразу наприкінці сесії, якщо було зроблено значущу зміну
  (задача, архітектурне рішення, зміна `.env`) — не відкладай.
- Якщо Junction колись зникне (нове клонування репо, нова машина) —
  перестворити: `New-Item -ItemType Junction -Path "C:\Users\b.kisliy\obsidian-vault-Kyslii\projects\vehicle_cost_tracker" -Target "<шлях-до-репо>\obsidian"`.

Пов'язаний репозиторій: **vehicle_tracker_api** (Django-бекенд,
`C:\Users\b.kisliy\PycharmProjects\DjangoProject\vehicle_tracker_api\`) —
це один застосунок, розділений на два репо. Vault-контекст бекенду: тека
`projects\vehicle_tracker_api` у тому ж vault (Junction на
`task_description` в бекенд-репо).

> **Виправлено 2026-08-30 (третій раз — цього разу з поясненням, чому
> нотатка сама собі суперечила двічі поспіль):** правильний шлях —
> `C:\Users\b.kisliy\PycharmProjects\DjangoProject\vehicle_tracker_api\`
> (юзернейм "kisliy" через "і", і ПІД ПІДТЕКОЮ `DjangoProject\`). Це
> підтверджено 2026-08-30 напряму через `PowerShell`
> (`Get-ChildItem "C:\Users"`, `Get-ChildItem
> ...\PycharmProjects\DjangoProject`) — репо реально там, з git-історією
> й незакомiченими змінами на момент перевірки.
>
> **Чому цей шлях "виправляли" в хибний бік двічі (24.08 → 28.08):**
> обидві попередні "перевірки напряму" робились через `Bash`-інструмент
> (Git Bash/POSIX sh), а не `PowerShell`. У POSIX-шеллі зворотний слеш
> — escape-символ, тому `ls "C:\Users\b.kisliy\..."` в Bash ненадійний:
> може мовчки з'їсти частину шляху або дати хибний "No such file or
> directory" на РЕАЛЬНО існуючій теці (і навпаки — хибний "успіх" на
> неіснуючій). Сесія 28.08 отримала саме таку хибну відповідь, повірила
> їй як "перевірено трьома незалежними джерелами" і записала сюди
> протилежне до істини. **Правило на майбутнє:** перевіряти
> Windows-шляхи з `\` через `PowerShell`-інструмент
> (`Get-ChildItem`/`Test-Path`), не через `Bash`/`ls` — або передавати в
> Bash шлях з прямими слешами (`C:/Users/...`).

