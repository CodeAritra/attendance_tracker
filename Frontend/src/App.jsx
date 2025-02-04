import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Auth from './pages/Auth'
import Dashboard from "./pages/Dashboard"
import ProgressPage from "./pages/ProgessPage"
import RoutinePage from "./pages/RoutinePage"
import RoutineUploader from "./pages/RoutineUploader"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/attendance' element={<ProgressPage/>}/>
        <Route path='/upload' element={<RoutineUploader/>}/>
        <Route path='/routine' element={<RoutinePage/>}/>
      </Routes>
    </Router>
  )
}
