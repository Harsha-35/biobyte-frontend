import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const BACKEND_URL = "https://biobyte-backend-1.onrender.com";

function App() {
  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    activity: "moderate",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const [progressData, setProgressData] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ----------------- GENERATE PLAN -----------------
  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          weight: Number(form.weight),
          height: Number(form.height),
          activity: form.activity,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (error) {
      alert("Failed to connect to backend.");
    }
    setLoading(false);
  };

  // ----------------- FOOD IMAGE -----------------
  const handleImage = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      const response = await fetch(`${BACKEND_URL}/analyze-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64 }),
      });

      const data = await response.json();
      alert(data.analysis);
    };
  };

  // ----------------- CHAT -----------------
  const sendMessage = async () => {
    if (!message) return;

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    setChat([...chat, { user: message, ai: data.reply }]);
    setMessage("");
  };

  // ----------------- PROGRESS -----------------
  const trackWeight = async () => {
    const response = await fetch(`${BACKEND_URL}/track-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: Number(form.weight) }),
    });

    const data = await response.json();

    const formatted = data.data.map((w, i) => ({
      day: i + 1,
      weight: w,
    }));

    setProgressData(formatted);
  };

  // ----------------- UI -----------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] flex items-center justify-center p-6 text-white">
      {!result ? (
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md space-y-4 shadow-xl">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Biobyte AI Nutrition
          </h1>

          <input
            type="number"
            name="age"
            placeholder="Age"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10 outline-none"
          />

          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10 outline-none"
          />

          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10 outline-none"
          />

          <select
            name="activity"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/10 outline-none"
          >
            <option value="sedentary">Sedentary</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </select>

          <button
            onClick={generatePlan}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition"
          >
            {loading ? "Analyzing..." : "Generate Plan"}
          </button>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-5xl space-y-8 shadow-xl">

          <h2 className="text-3xl font-bold text-center text-purple-400">
            Biobyte AI Dashboard
          </h2>

          {/* BMI + Goal */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-yellow-500/20 rounded-xl">
              <h3>BMI</h3>
              <p className="text-2xl font-bold">{result.bmi}</p>
            </div>

            <div className="p-6 bg-green-500/20 rounded-xl">
              <h3>Recommended Goal</h3>
              <p className="text-xl">{result.goal}</p>
            </div>

            <div className="p-6 bg-blue-500/20 rounded-xl">
              <h3>Calories Target</h3>
              <p className="text-xl">{result.calories} kcal</p>
            </div>
          </div>

          {/* AI Plan */}
          <div className="p-6 bg-white/5 rounded-xl whitespace-pre-wrap">
            <h3 className="mb-2 text-purple-300">🤖 Gemini Recommendation</h3>
            {result.aiPlan}
          </div>

          {/* Image Upload */}
          <div className="p-6 bg-white/5 rounded-xl">
            <h3 className="mb-2">📸 Food Image Calorie Detection</h3>
            <input type="file" accept="image/*" onChange={handleImage} />
          </div>

          {/* Chat */}
          <div className="p-6 bg-white/5 rounded-xl space-y-3">
            <h3>💬 AI Nutrition Coach</h3>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {chat.map((c, i) => (
                <div key={i}>
                  <p><strong>You:</strong> {c.user}</p>
                  <p><strong>AI:</strong> {c.ai}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 rounded-lg bg-white/10"
              />
              <button
                onClick={sendMessage}
                className="px-4 bg-purple-500 rounded-lg"
              >
                Send
              </button>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="p-6 bg-white/5 rounded-xl">
            <h3>📈 Progress Tracking</h3>
            <button
              onClick={trackWeight}
              className="mb-4 px-4 py-2 bg-pink-500 rounded-lg"
            >
              Save Current Weight
            </button>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;