import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard       from './pages/Dashboard';
import Students        from './pages/Students';
import Teams           from './pages/Teams';
import Submissions     from './pages/Submissions';
import AllocationEngine from './pages/AllocationEngine';
import ReviewTasks     from './pages/ReviewTasks';
import FairnessAnalytics from './pages/FairnessAnalytics';
import ReviewWorkspace from './pages/ReviewWorkspace';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Dashboard />}       />
            <Route path="/students"   element={<Students />}        />
            <Route path="/teams"      element={<Teams />}           />
            <Route path="/submissions" element={<Submissions />}    />
            <Route path="/allocation" element={<AllocationEngine />} />
            <Route path="/reviews"    element={<ReviewTasks />}     />
            <Route path="/fairness"   element={<FairnessAnalytics />} />
            <Route path="/workspace"  element={<ReviewWorkspace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
