import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Hello, world!</h1>
      <button
        type="button"
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        onClick={() => setCount((c) => c + 1)}
      >
        Count is {count}
      </button>
    </div>
  );
}

export default App;
