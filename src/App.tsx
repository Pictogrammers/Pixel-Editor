import { useState } from 'react';
import './App.css';
import Editor from './components/Editor/Editor';

function App() {
  const [path, setPath] = useState<string>('');

  function handleChange(value: string) {
    setPath(value);
  }

  return (
    <div className="App">
      <Editor width={22} height={22} onChange={handleChange}></Editor>
      <pre>{path}</pre>
    </div>
  );
}

export default App;
