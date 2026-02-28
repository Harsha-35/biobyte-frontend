import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function App() {
  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    goal: "fat_loss",
  });

  const [result, setResult] = useState(null);
  const [water, setWater] = useState(0);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("nutriData");
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addWater = () => {
    if (water < 3) {
      setWater(water + 0.5);
    }
  };

  const generatePlan = async () => {
    try {
      const response = await fetch(
        "https://biobyte-backend.onrender.com/generate-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age: Number(form.age),
            weight: Number(form.weight),
            height: Number(form.height),
            goal: form.goal,
          }),
        }
      );

      const data = await response.json();
      setResult(data);
      localStorage.setItem("nutriData", JSON.stringify(data));
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  // Prediction chart
  const predictedWeights = [];
  if (result) {
    let currentWeight = parseFloat(form.weight || 0);
    for (let i = 0; i < 30; i++) {
      currentWeight -= 0.05;
      predictedWeights.push(currentWeight.toFixed(1));
    }
  }

  let aiInsight = "";
  if (result) {
    if (form.goal === "fat_loss") {
      aiInsight =
        "AI Insight: Maintain high protein and reduce refined carbs.";
    } else if (form.goal === "muscle_gain") {
      aiInsight =
        "AI Insight: Increase protein intake and maintain calorie surplus.";
    } else {
      aiInsight =
        "AI Insight: Balanced macros recommended for maintenance.";
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] px-4 overflow-hidden">
      {!result ? (
        <div className="glass p-8 w-full max-w-md space-y-5">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            NutriSync AI
          </h1>

          <input
            type="number"
            name="age"
            placeholder="Age"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10"
          />

          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10"
          />

          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10"
          />

          <select
            name="goal"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10"
          >
            <option value="fat_loss">Fat Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button
            onClick={generatePlan}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition"
          >
            Generate Plan
          </button>
        </div>
      ) : (
        <div className="glass p-8 w-full max-w-4xl space-y-8 animate-fadeIn">
          <h2 className="text-3xl font-bold text-blue-400 text-center">
            Your AI Nutrition Dashboard
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Smart Score */}
            <div className="p-6 bg-green-500/20 rounded-xl">
              <h3 className="text-sm text-gray-300 mb-2">
                🤖 AI Smart Score
              </h3>
              <p className="text-3xl font-bold">
                {result.smartScore}%
              </p>
            </div>

            {/* Calories */}
            <div className="p-6 bg-purple-500/20 rounded-xl">
              <h3 className="text-sm text-gray-300 mb-2">
                🔥 Calories Target
              </h3>
              <p className="text-2xl font-semibold">
                {result.calories}
              </p>
            </div>

            {/* Protein */}
            <div className="p-6 bg-pink-500/20 rounded-xl">
              <h3 className="text-sm text-gray-300 mb-2">
                🍗 Protein Target
              </h3>
              <p className="text-2xl font-semibold">
                {result.protein} g
              </p>
            </div>

            {/* AI Insight */}
            <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl md:col-span-2">
              <h3 className="text-sm text-gray-300 mb-2">
                🧠 AI Insight
              </h3>
              <p>{aiInsight}</p>
            </div>

            {/* Hydration */}
            <div className="p-6 bg-cyan-500/20 rounded-xl">
              <h3 className="text-sm text-gray-300 mb-2">
                💧 Hydration
              </h3>
              <p className="text-lg">{water} / 3 Liters</p>

              <div className="w-full bg-white/10 rounded-full h-3 mt-2">
                <div
                  className="bg-cyan-400 h-3 rounded-full"
                  style={{
                    width: `${(water / 3) * 100}%`,
                  }}
                ></div>
              </div>

              <button
                onClick={addWater}
                className="mt-3 w-full p-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transition"
              >
                + Add 0.5L
              </button>
            </div>

            {/* Chart */}
            <div className="bg-white/5 p-6 rounded-xl md:col-span-2">
              <h3 className="text-sm text-gray-300 mb-2">
                📈 30-Day Weight Prediction
              </h3>

              <Line
                data={{
                  labels: Array.from(
                    { length: 30 },
                    (_, i) => i + 1
                  ),
                  datasets: [
                    {
                      label: "Weight (kg)",
                      data: predictedWeights,
                      borderColor: "#8B5CF6",
                      backgroundColor:
                        "rgba(139,92,246,0.3)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setResult(null);
              localStorage.removeItem("nutriData");
            }}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;