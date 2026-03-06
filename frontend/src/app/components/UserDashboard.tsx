import { Navigation } from "./Navigation";
import { StatsCard } from "./StatsCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FileCheck2, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const { totalCompilations, successRate, totalErrors, lastDeployment, history } = dashboardData;
  const successCount = history ? history.filter((r: any) => r.decision === "ALLOWED").length : 0;
  const blockedCount = totalCompilations - successCount;

  const chartData = [
    { name: "Allowed", value: successCount, color: "#4ec9b0" },
    { name: "Blocked", value: blockedCount, color: "#f48771" },
  ];

  return (
    <div className="h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              title="Total Compilations"
              value={totalCompilations || 0}
              icon={<FileCheck2 size={20} />}
              variant="default"
            />
            <StatsCard
              title="Success Rate"
              value={`${successRate || 0}%`}
              icon={<TrendingUp size={20} />}
              variant="success"
            />
            <StatsCard
              title="Total Errors"
              value={totalErrors || 0}
              icon={<AlertCircle size={20} />}
              variant="error"
            />
            <StatsCard
              title="Last Deployment"
              value={lastDeployment || "NONE"}
              icon={<Clock size={20} />}
              variant={lastDeployment === "ALLOWED" ? "success" : "error"}
              subtitle={history && history[0] ? new Date(history[0].createdAt).toLocaleString() : "-"}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Chart */}
            <div className="bg-[#252526] border border-[#3e3e42] rounded p-4 hover:border-[#505052] transition-colors">
              <h2 className="text-sm font-medium text-[#cccccc] mb-4">Deployment Analysis</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#252526",
                      border: "1px solid #3e3e42",
                      borderRadius: "4px",
                      color: "#cccccc",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ec9b0]" />
                  <span className="text-xs text-[#858585]">Allowed ({successCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f48771]" />
                  <span className="text-xs text-[#858585]">Blocked ({blockedCount})</span>
                </div>
              </div>
            </div>

            {/* Compilation History */}
            <div className="col-span-2 bg-[#252526] border border-[#3e3e42] rounded hover:border-[#505052] transition-colors">
              <div className="border-b border-[#3e3e42] px-4 py-3">
                <h2 className="text-sm font-medium text-[#cccccc]">Compilation History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3e3e42]">
                      <th className="text-left text-xs text-[#858585] px-4 py-2">Timestamp</th>
                      <th className="text-left text-xs text-[#858585] px-4 py-2">Status</th>
                      <th className="text-left text-xs text-[#858585] px-4 py-2">Errors</th>
                      <th className="text-left text-xs text-[#858585] px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center text-xs text-[#858585] p-4">Loading...</td>
                      </tr>
                    ) : (
                      (history || []).map((r: any) => (
                        <tr key={r._id} className="border-b border-[#3e3e42] hover:bg-[#2a2d2e] transition-colors">
                          <td className="text-xs text-[#cccccc] px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${r.decision === "ALLOWED" ? "bg-[#4ec9b0]/20 text-[#4ec9b0]" : "bg-[#f48771]/20 text-[#f48771]"}`}>
                              {r.decision}
                            </span>
                          </td>
                          <td className="text-xs text-[#cccccc] px-4 py-3">{r.errors || 0}</td>
                          <td className="text-xs text-[#858585] px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
