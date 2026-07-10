## Obsidian vault sync
Контекст цього проєкту для Obsidian-vault живе прямо в репо: `obsidian/`
(CLAUDE.md, tasks.md, decisions.md, env.example.md). У vault
(`C:\Users\b.kysliy\obsidian-vault-Kyslii\`) на цю теку вказує Windows
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
  перестворити: `New-Item -ItemType Junction -Path "C:\Users\b.kysliy\obsidian-vault-Kyslii\projects\vehicle_cost_tracker" -Target "<шлях-до-репо>\obsidian"`.

Пов'язаний репозиторій: **vehicle_tracker_api** (Django-бекенд,
`C:\Users\b.kysliy\PycharmProjects\vehicle_tracker_api\`) — це один
застосунок, розділений на два репо. Vault-контекст бекенду: тека
`projects\vehicle_tracker_api` у тому ж vault (Junction на
`task_description` в бекенд-репо).
