import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Editor from '@/pages/Editor';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Editor />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
