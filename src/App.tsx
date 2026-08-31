import { BrowserRouter, Routes, Route } from "react-router-dom";
import StoreDetail from "./pages/StoreDetail";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Monitor from "./pages/Monitor";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores";
import Designs from "./pages/Designs";
import Trash from "./pages/Trash";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/monitor/:token" element={<Monitor />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/designs" element={<Designs />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/stores/:id" element={<StoreDetail />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;