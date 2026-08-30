import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface MonitorData {
  monitoredUser: { name: string; isActive: boolean };
  designsToday: number;
  designsLast30Days: number;
  calendarData: { date: string; count: number; level: number }[];
  recentCompletedDesigns: { id: number; name: string; store_name: string; owner_name: string; completed_at: string }[];
  owners: { id: number; name: string }[];
}

export default function Monitor() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<MonitorData | null>(null);

  useEffect(() => {
    // pakai axios langsung (BUKAN instance `api` kita) — karena endpoint ini
    // publik, gak butuh withCredentials/cookie sama sekali
    axios.get<MonitorData>(`http://localhost:4000/api/monitor/${token}`)
      .then((res) => setData(res.data));
  }, [token]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>{data.monitoredUser.name} {data.monitoredUser.isActive ? "🟢 Online" : "⚪ Offline"}</h1>
      <p>Hari ini: {data.designsToday} — 30 hari terakhir: {data.designsLast30Days}</p>

      <h2>Completed Terbaru</h2>
      <ul>
        {data.recentCompletedDesigns.map((d) => (
          <li key={d.id}>{d.name} — {d.store_name} ({d.owner_name}) — {d.completed_at}</li>
        ))}
      </ul>
    </div>
  );
}