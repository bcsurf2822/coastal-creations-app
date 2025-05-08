"use client";

import { useState } from "react";

export default function Dashboard() {
  const [form, setForm] = useState({
    eventName: "",
    eventType: "class",
    description: "",
    price: "",
    quantity: "",
    startDate: "",
    startTime: "",
    timezone: "UTC",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: form.eventName,
          eventType: form.eventType,
          description: form.description,
          price: Number(form.price),
          quantity: Number(form.quantity),
          dates: { startDate: new Date(form.startDate), isRecurring: false },
          time: { startTime: form.startTime, timezone: form.timezone },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Event added successfully!");
        setForm({
          eventName: "",
          eventType: "class",
          description: "",
          price: "",
          quantity: "",
          startDate: "",
          startTime: "",
          timezone: "UTC",
        });
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (err) {
      setMessage("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Add New Event</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          name="eventName"
          placeholder="Event Name"
          value={form.eventName}
          onChange={handleChange}
          required
        />
        <select
          name="eventType"
          value={form.eventType}
          onChange={handleChange}
          required
        >
          <option value="class">Class</option>
          <option value="camp">Camp</option>
          <option value="workshop">Workshop</option>
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          min="0"
        />
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          min="0"
        />
        <input
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          required
        />
        <input
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange}
          required
        />
        <input
          name="timezone"
          placeholder="Timezone (e.g. UTC)"
          value={form.timezone}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Event"}
        </button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}
