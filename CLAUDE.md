## Obsidian vault sync
Контекст цього проєкту для Obsidian-vault: `D:\Obsidian_Kisliy\projects\vehicle_cost_tracker\` (CLAUDE.md, tasks.md, decisions.md, env.example.md).
- Тули `mcp__obsidian__*` доступні незалежно від поточної робочої директорії (конектор — локальний сервер).
- Коли просять "онови obsidian" / "sync obsidian" — прочитай актуальний стан цього репо (структура, README, git log, CODING_GUIDE.md, documents/) і перепиши ці 4 файли через `mcp__obsidian__*`.
- В `env.example.md` — тільки СТРУКТУРА `.env` (імена змінних + призначення), без значень і секретів.
- Онови ці файли одразу наприкінці сесії, якщо було зроблено значущу зміну (задача, архітектурне рішення, зміна `.env`) — не відкладай.

Пов'язаний репозиторій: **vehicle_tracker_api** (Django-бекенд, `C:\Users\b.kisliy\PycharmProjects\DjangoProject\vehicle_tracker_api\`) — це один застосунок, розділений на два репо. Vault-контекст бекенду: `D:\Obsidian_Kisliy\projects\vehicle_tracker_api\`.
