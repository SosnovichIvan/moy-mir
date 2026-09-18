import { Link, Route, Routes } from 'react-router';

export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4 py-12">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 className="text-3xl font-bold tracking-tight">Мой МИР</h1>
              <Link className="underline" to="/about/project">
                О проекте
              </Link>
            </>
          }
        />
        <Route
          path="/about/project"
          element={
            <>
              <h1 className="text-3xl font-bold">О проекте</h1>
              <p>Пространство для друзей и совместных планов.</p>
              <Link className="underline" to="/">
                На главную
              </Link>
            </>
          }
        />
        <Route
          path="*"
          element={
            <>
              <h1 className="text-3xl font-bold">Страница не найдена</h1>
              <Link className="underline" to="/">
                На главную
              </Link>
            </>
          }
        />
      </Routes>
    </main>
  );
}
