import { Hono } from "hono";
import { ok, err } from "@nomadly/types";
import { supabase } from "../lib/supabase";

const jobs = new Hono();

// GET /jobs?stack=react&min_salary=5000&india_friendly=true&page=1&limit=20
jobs.get("/", async (c) => {
  const stack = c.req.query("stack");
  const minSalary = c.req.query("min_salary");
  const indiaFriendly = c.req.query("india_friendly");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (indiaFriendly !== undefined) {
    query = query.eq("india_friendly", indiaFriendly === "true");
  }

  if (minSalary) {
    query = query.gte("salary_min_usd", parseInt(minSalary));
  }

  if (stack) {
    query = query.contains("tech_stack", [stack]);
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1);

  if (error) return c.json(err(error.message), 500);

  return c.json(ok(data, { page, total: count ?? 0 }));
});

// GET /jobs/:id
jobs.get("/:id", async (c) => {
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return c.json(err(`Job not found: ${id}`), 404);

  return c.json(ok(data));
});

export default jobs;
