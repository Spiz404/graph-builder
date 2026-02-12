import { ReactFlowProvider } from 'reactflow';
import GraphCanvas from './components/GraphCanvas';
import Toolbar from './components/Toolbar';
import AlgorithmPanel from './components/AlgorithmPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

function App() {
  useLocalStorage();

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen flex flex-col">
        <Toolbar />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas */}
          <div className="flex-1">
            <GraphCanvas />
          </div>

          {/* Algorithm sidebar */}
          <AlgorithmPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
