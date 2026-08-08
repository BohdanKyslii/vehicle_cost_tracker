// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// QueryClient — центральний об'єкт React Query
// Зберігає кеш і конфігурацію
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,     // дані "свіжі" 1 хвилину (не рефетчимо зайво)
            retry: 2,                  // при помилці — повторити 2 рази
            throwOnError: false,       // помилки обробляємо через isError у компоненті
        },
    },
});

// document.getElementById("root") — знаходить <div id="root"> в index.html
// createRoot → render → підключає React до DOM
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* QueryClientProvider — передає queryClient у всі дочірні компоненти */}
        <QueryClientProvider client={queryClient}>
            {/* BrowserRouter — дає компонентам доступ до React Router */}
            <BrowserRouter>
                <App />
            </BrowserRouter>
            {/* DevTools — панель налагодження React Query (тільки в dev режимі) */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>
);
