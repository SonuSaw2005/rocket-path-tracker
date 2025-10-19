// import { useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from "recharts";

// function App() {
//   const [trajectory, setTrajectory] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const runSimulation = async () => {
//     setLoading(true);
//     setError("");
//     setTrajectory([]);
//     setSummary(null);

//     try {
//       const response = await fetch("http://127.0.0.1:8000/simulate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           site: "ISRO",
//           velocity: 7500, // ✅ FIXED realistic velocity
//           angle: 45,
//           orbit: "LEO"
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Simulation Data:", data);

//       setTrajectory(data.trajectory || []);
//       setSummary(data.summary || null);
//     } catch (err) {
//       console.error("Error fetching simulation:", err);
//       setError("Failed to fetch simulation data. Please check backend connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
//       <h1 className="text-3xl font-bold mb-6">🚀 Rocket Launch Dashboard</h1>

//       <button
//         onClick={runSimulation}
//         className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg mb-6 transition disabled:opacity-50"
//         disabled={loading}
//       >
//         {loading ? "Simulating..." : "Run Simulation"}
//       </button>

//       {error && <p className="text-red-400 mb-4">{error}</p>}

//       {trajectory.length > 0 ? (
//         <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-4xl">
//           <ResponsiveContainer width="100%" height={350}>
//             <LineChart data={trajectory}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//               <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottom", offset: -5 }} />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="y" stroke="#82ca9d" name="Altitude (m)" />
//               <Line type="monotone" dataKey="speed" stroke="#ff7300" name="Speed (m/s)" />
//               <Line type="monotone" dataKey="fuel" stroke="#0088FE" name="Fuel (%)" />
//             </LineChart>
//           </ResponsiveContainer>

//           {summary && (
//             <div className="mt-4 text-lg">
//               <p>📈 <strong>Max Altitude:</strong> {summary.max_altitude} m</p>
//               <p>📏 <strong>Final Distance:</strong> {summary.final_distance} m</p>
//             </div>
//           )}
//         </div>
//       ) : (
//         !loading && <p className="text-gray-400">No data yet. Click "Run Simulation" to start.</p>
//       )}
//     </div>
//   );
// }

// export default App;
