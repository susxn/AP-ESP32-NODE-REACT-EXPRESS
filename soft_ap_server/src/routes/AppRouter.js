import {
    BrowserRouter as Router,
    Route,
    Routes,
  } from "react-router-dom";
import BlackList from "../components/BlackList";
import Historic from "../components/Historic";
import Navbar from "../components/Navbar";



  
  
  
  
  export default function AppRouter() {
  
  
    return (
      <>
        <Router>
           <Navbar />
          <Routes>
  
            <Route exact path="/" element={ <Historic /> } />
            <Route path="/blacklist" element={<BlackList /> } />
            
          </Routes>
        </Router>
      </>
    );
  }
  