import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();
    return (<>
            <nav>
                <Link to="/">Dashboard</Link> | <Link to="/stores">Stores</Link>
            </nav>
        <div>
            <h1>Dashboard</h1>
            <p>Halo, {user?.name}!</p>
            <button onClick={logout}>Logout</button>
        </div></>
    );
}