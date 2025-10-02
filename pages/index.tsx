import { useEffect, useState } from "react";

type Campaign = {
  id: number;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
};

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "",
  });
  const [error, setError] = useState("");

  // Fetch campaigns
  async function fetchCampaigns() {
    const res = await fetch("/api/campaigns");
    const data = await res.json();
    setCampaigns(data);
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new campaign
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.budget ||
      !form.startDate ||
      !form.endDate ||
      !form.status
    ) {
      setError("All fields are required.");
      return;
    }

    if (isNaN(Number(form.budget))) {
      setError("Budget must be a number.");
      return;
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorRes = await res.json();
        setError(errorRes.message || "Failed to add campaign.");
        return;
      }

      setForm({ name: "", budget: "", startDate: "", endDate: "", status: "" });
      fetchCampaigns();
    } catch {
      setError("Failed to add campaign.");
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === "active") return c.status.toLowerCase() === "active";
    if (filter === "upcoming") return c.status.toLowerCase() === "upcoming";
    return true;
  });

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Campaign Dashboard</h1>

      {/* Filter */}
      <label>
        Filter:{" "}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </label>

      {/* Campaign List */}
      <table
        border={1}
        cellPadding={8}
        style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Budget</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredCampaigns.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No campaigns found.
              </td>
            </tr>
          )}
          {filteredCampaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>{campaign.name}</td>
              <td>${campaign.budget.toFixed(2)}</td>
              <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
              <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
              <td>{campaign.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Campaign Form */}
      <h2 style={{ marginTop: 40 }}>Add New Campaign</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            style={{ padding: 8, margin: "5px 0", width: "100%" }}
            required
          />
        </div>

        <div>
          <input
            type="number"
            name="budget"
            placeholder="Budget"
            value={form.budget}
            onChange={handleChange}
            style={{ padding: 8, margin: "5px 0", width: "100%" }}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            style={{ padding: 8, margin: "5px 0", width: "100%" }}
            required
          />
        </div>

        <div>
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            style={{ padding: 8, margin: "5px 0", width: "100%" }}
            required
          />
        </div>

        <div>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ padding: 8, margin: "5px 0", width: "100%" }}
            required
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" style={{ padding: 10, marginTop: 10 }}>
          Add Campaign
        </button>
      </form>
    </div>
  );
}
