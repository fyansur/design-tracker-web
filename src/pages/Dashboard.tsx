import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    api.get<DashboardData>(`/dashboard?period=${period}`).then((res) => setData(res.data));
  }, [period]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Halo, {user?.name}!</p>
      <button onClick={logout}>Logout</button>

      <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
        <option value="week">Minggu ini</option>
        <option value="month">Bulan ini</option>
        <option value="year">Tahun ini</option>
      </select>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Total ide: {data.totalIdeas} — Completed: {data.completedCount}</p>

          <h2>Chart Completed</h2>
          <ul>
            {data.chartData.map((c) => <li key={c.label}>{c.label}: {c.completed}</li>)}
          </ul>

          <h2>Ranking Store</h2>
          <ol>
            {data.ranking.map((r) => (
              <li key={r.storeId} style={{ color: r.color }}>{r.name} — {r.completedCount}</li>
            ))}
          </ol>

          <h2>Goals Aktif</h2>
          <ul>
            {data.goals.map((g) => (
              <li key={g.id}>{g.name} — {g.completedCount}/{g.targetCount}</li>
            ))}
          </ul>

          <h2>Daily Goals</h2>
          <ul>
            {data.dailyGoals.map((dg) => (
              <li key={dg.id}>{dg.displayName}: target {dg.targetCount ?? "belum diset"}</li>
            ))}
          </ul>

          <h2>Aktivitas Terbaru</h2>
          <ul>
            {data.recentActivities.map((a) => <li key={a.id}>{a.description}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}