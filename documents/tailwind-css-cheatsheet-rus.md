# Шпаргалка по Tailwind CSS

Tailwind CSS - это утилитарный CSS-фреймворк, который позволяет быстро создавать пользовательские интерфейсы с помощью встроенных классов. Давайте составим подробную шпаргалку по основным возможностям и компонентам Tailwind.

## Основные концепции

Tailwind работает на основе классов утилит, которые применяются непосредственно в HTML. Вместо написания CSS, вы используете предопределенные классы для стилизации элементов.

## Установка и настройка

### Установка через npm
```bash
npm install -D tailwindcss
npx tailwindcss init
```

### Базовая конфигурация (tailwind.config.js)
```javascript
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Подключение в CSS
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Типографика

### Размер шрифта
```html
<p class="text-xs">Очень маленький текст</p>
<p class="text-sm">Маленький текст</p>
<p class="text-base">Базовый размер текста</p>
<p class="text-lg">Большой текст</p>
<p class="text-xl">Очень большой текст</p>
<p class="text-2xl">2xl текст</p>
<!-- Доступны размеры до text-9xl -->
```

### Вес шрифта
```html
<p class="font-thin">Тонкий шрифт</p>
<p class="font-light">Светлый шрифт</p>
<p class="font-normal">Обычный шрифт</p>
<p class="font-medium">Средний шрифт</p>
<p class="font-bold">Жирный шрифт</p>
<p class="font-black">Очень жирный шрифт</p>
```

### Выравнивание текста
```html
<p class="text-left">Выравнивание по левому краю</p>
<p class="text-center">Выравнивание по центру</p>
<p class="text-right">Выравнивание по правому краю</p>
<p class="text-justify">Выравнивание по ширине</p>
```

### Цвет текста
```html
<p class="text-black">Черный текст</p>
<p class="text-white">Белый текст</p>
<p class="text-red-500">Красный текст (500)</p>
<p class="text-blue-700">Синий текст (700)</p>
<!-- Доступны оттенки от 50 до 900 -->
```

### Межстрочный интервал
```html
<p class="leading-none">Минимальный интервал</p>
<p class="leading-tight">Тесный интервал</p>
<p class="leading-normal">Обычный интервал</p>
<p class="leading-loose">Свободный интервал</p>
```

## Цвета и фоны

### Фоновый цвет
```html
<div class="bg-white">Белый фон</div>
<div class="bg-black">Черный фон</div>
<div class="bg-red-500">Красный фон</div>
<div class="bg-blue-200">Светло-синий фон</div>
```

### Градиенты
```html
<div class="bg-gradient-to-r from-cyan-500 to-blue-500">Градиент справа налево</div>
<div class="bg-gradient-to-t from-purple-500 to-pink-500">Градиент снизу вверх</div>
```

### Прозрачность
```html
<div class="bg-black bg-opacity-75">Черный фон с прозрачностью 75%</div>
<div class="text-black text-opacity-50">Полупрозрачный текст</div>
```

## Размеры

### Ширина
```html
<div class="w-1/2">50% ширины</div>
<div class="w-full">100% ширины</div>
<div class="w-screen">Ширина экрана</div>
<div class="w-64">16rem (256px)</div>
<div class="max-w-md">Максимальная ширина 28rem</div>
```

### Высота
```html
<div class="h-64">16rem (256px) высоты</div>
<div class="h-full">100% высоты контейнера</div>
<div class="h-screen">100% высоты экрана</div>
<div class="min-h-screen">Минимум 100% высоты экрана</div>
```

## Отступы и поля

### Внутренние отступы (padding)
```html
<div class="p-4">Отступ со всех сторон (1rem)</div>
<div class="px-4">Горизонтальный отступ (слева и справа)</div>
<div class="py-4">Вертикальный отступ (сверху и снизу)</div>
<div class="pt-4">Отступ сверху</div>
<div class="pr-4">Отступ справа</div>
<div class="pb-4">Отступ снизу</div>
<div class="pl-4">Отступ слева</div>
```

### Внешние отступы (margin)
```html
<div class="m-4">Внешний отступ со всех сторон</div>
<div class="mx-auto">Центрирование блока (авто-отступы по горизонтали)</div>
<div class="my-4">Вертикальный внешний отступ</div>
<div class="mt-4">Отступ сверху</div>
<div class="mr-4">Отступ справа</div>
<div class="mb-4">Отступ снизу</div>
<div class="ml-4">Отступ слева</div>
<div class="-mt-4">Отрицательный отступ сверху</div>
```

## Flexbox

### Основные свойства
```html
<div class="flex">Flex-контейнер</div>
<div class="inline-flex">Строчный flex-контейнер</div>
<div class="flex-row">Элементы в строку (по умолчанию)</div>
<div class="flex-col">Элементы в столбец</div>
<div class="flex-row-reverse">Элементы в строку в обратном порядке</div>
<div class="flex-col-reverse">Элементы в столбец в обратном порядке</div>
```

### Выравнивание
```html
<div class="justify-start">Выравнивание по началу (по умолчанию)</div>
<div class="justify-center">Выравнивание по центру</div>
<div class="justify-end">Выравнивание по концу</div>
<div class="justify-between">Равномерное распределение с отступами по краям</div>
<div class="justify-around">Равномерное распределение с половинными отступами по краям</div>
<div class="justify-evenly">Равномерное распределение с равными отступами</div>

<div class="items-start">Выравнивание элементов по верху</div>
<div class="items-center">Выравнивание элементов по центру</div>
<div class="items-end">Выравнивание элементов по низу</div>
<div class="items-stretch">Растягивание элементов (по умолчанию)</div>
```

### Порядок и размер элементов
```html
<div class="flex-1">Гибкий элемент (flex-grow: 1)</div>
<div class="flex-auto">Автоматический размер</div>
<div class="flex-none">Негибкий элемент</div>
<div class="order-1">Порядок 1</div>
<div class="order-2">Порядок 2</div>
```

## Grid

### Основные свойства
```html
<div class="grid">Grid-контейнер</div>
<div class="grid-cols-3">Сетка с 3 колонками</div>
<div class="grid-cols-12">Сетка с 12 колонками</div>
<div class="grid-rows-4">Сетка с 4 строками</div>
```

### Размеры ячеек
```html
<div class="col-span-2">Занимает 2 колонки</div>
<div class="col-span-full">Занимает все колонки</div>
<div class="row-span-3">Занимает 3 строки</div>
```

### Отступы между ячейками
```html
<div class="gap-4">Отступ между ячейками (1rem)</div>
<div class="gap-x-4">Горизонтальный отступ между ячейками</div>
<div class="gap-y-4">Вертикальный отступ между ячейками</div>
```

## Границы

### Ширина границы
```html
<div class="border">Граница стандартной ширины (1px)</div>
<div class="border-2">Граница шириной 2px</div>
<div class="border-4">Граница шириной 4px</div>
<div class="border-8">Граница шириной 8px</div>
```

### Стороны границы
```html
<div class="border-t">Только верхняя граница</div>
<div class="border-r">Только правая граница</div>
<div class="border-b">Только нижняя граница</div>
<div class="border-l">Только левая граница</div>
```

### Цвет границы
```html
<div class="border-red-500">Красная граница</div>
<div class="border-blue-300">Светло-синяя граница</div>
```

### Скругление углов
```html
<div class="rounded">Скругленные углы (0.25rem)</div>
<div class="rounded-md">Средне скругленные углы</div>
<div class="rounded-lg">Сильно скругленные углы</div>
<div class="rounded-full">Полностью скругленные углы (круг/овал)</div>
<div class="rounded-t-lg">Скругленные только верхние углы</div>
<div class="rounded-r-lg">Скругленные только правые углы</div>
```

## Тени

### Тени для блоков
```html
<div class="shadow">Стандартная тень</div>
<div class="shadow-md">Средняя тень</div>
<div class="shadow-lg">Большая тень</div>
<div class="shadow-xl">Очень большая тень</div>
<div class="shadow-2xl">Огромная тень</div>
<div class="shadow-inner">Внутренняя тень</div>
<div class="shadow-none">Без тени</div>
```

## Переходы и анимации

### Переходы
```html
<div class="transition">Стандартный переход</div>
<div class="transition-colors">Переход только для цветов</div>
<div class="duration-300">Длительность 300ms</div>
<div class="ease-in-out">Плавное ускорение и замедление</div>
```

### Трансформации
```html
<div class="scale-75">Масштаб 75%</div>
<div class="scale-100">Масштаб 100%</div>
<div class="scale-125">Масштаб 125%</div>
<div class="rotate-45">Поворот на 45 градусов</div>
<div class="translate-x-4">Смещение по X на 1rem</div>
<div class="translate-y-4">Смещение по Y на 1rem</div>
```

## Интерактивность

### Состояния
```html
<button class="hover:bg-blue-700">Синий фон при наведении</button>
<button class="focus:outline-none">Убрать обводку при фокусе</button>
<button class="active:bg-blue-800">Темно-синий фон при нажатии</button>
<input class="focus:ring-2 focus:ring-blue-500">
```

### Курсор
```html
<button class="cursor-pointer">Указатель (рука)</button>
<div class="cursor-not-allowed">Запрещено</div>
<div class="cursor-wait">Ожидание</div>
```

## Адаптивный дизайн

Tailwind предоставляет брейкпоинты для адаптивного дизайна:
- `sm`: 640px и выше
- `md`: 768px и выше
- `lg`: 1024px и выше
- `xl`: 1280px и выше
- `2xl`: 1536px и выше

```html
<div class="text-sm md:text-base lg:text-lg">
  Текст меняет размер в зависимости от ширины экрана
</div>

<div class="flex flex-col md:flex-row">
  Элементы в столбец на мобильных устройствах, в строку на планшетах и выше
</div>

<div class="hidden md:block">
  Этот элемент скрыт на мобильных устройствах, но виден на md и выше
</div>
```

## Утилиты для позиционирования

```html
<div class="static">Статичное позиционирование (по умолчанию)</div>
<div class="relative">Относительное позиционирование</div>
<div class="absolute">Абсолютное позиционирование</div>
<div class="fixed">Фиксированное позиционирование</div>
<div class="sticky">Липкое позиционирование</div>

<div class="top-0">Прикрепить к верху</div>
<div class="right-0">Прикрепить к правому краю</div>
<div class="bottom-0">Прикрепить к низу</div>
<div class="left-0">Прикрепить к левому краю</div>
<div class="inset-0">Прикрепить ко всем краям</div>
```

## Z-index

```html
<div class="z-0">z-index: 0</div>
<div class="z-10">z-index: 10</div>
<div class="z-50">z-index: 50</div>
<div class="z-auto">z-index: auto</div>
```

## Переполнение

```html
<div class="overflow-auto">Автоматические полосы прокрутки при необходимости</div>
<div class="overflow-hidden">Скрыть переполнение</div>
<div class="overflow-scroll">Всегда показывать полосы прокрутки</div>
<div class="overflow-x-auto">Автоматическая горизонтальная прокрутка</div>
<div class="overflow-y-auto">Автоматическая вертикальная прокрутка</div>
```

## Группировка и кастомизация

### Группировка
```html
<div class="group">
  Родительский элемент
  <div class="hidden group-hover:block">
    Показывается при наведении на родителя
  </div>
</div>
```

### Кастомизация с помощью @apply
```css
.btn {
  @apply py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700;
}
```

## Темная тема

```html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  Этот элемент меняет цвета в зависимости от темы
</div>
```

## Плагины и расширения

Tailwind имеет богатую экосистему плагинов:
- `@tailwindcss/forms`: Стили для форм
- `@tailwindcss/typography`: Стили для типографики
- `@tailwindcss/aspect-ratio`: Управление соотношением сторон
- `@tailwindcss/line-clamp`: Обрезка текста

## JIT (Just-In-Time) компилятор

Начиная с Tailwind CSS v3.0, JIT компилятор включен по умолчанию. Он позволяет:
- Генерировать классы по мере необходимости
- Использовать произвольные значения: `text-[17px]`, `mt-[43px]`
- Улучшить время компиляции и размер выходного файла

---