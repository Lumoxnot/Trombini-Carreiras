import express from "express";
import { supabase } from "../config/supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

const ENTITY_TABLES = {
  user_profiles: "user_profiles",
  resumes: "resumes",
  job_postings: "job_postings",
  applications: "applications",
  notifications: "notifications",
};

function getTable(entity) {
  return ENTITY_TABLES[entity] || null;
}

function parseQuery(queryParam) {
  if (!queryParam) return {};
  if (typeof queryParam === "string") {
    try {
      return JSON.parse(queryParam);
    } catch {
      return {};
    }
  }
  return queryParam;
}

function applyQueryFilters(query, filters) {
  let nextQuery = query;
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      nextQuery = nextQuery.in(key, value);
      return;
    }
    nextQuery = nextQuery.eq(key, value);
  });
  return nextQuery;
}

function applySort(query, sortParam) {
  if (!sortParam || typeof sortParam !== "string") return query;
  const descending = sortParam.startsWith("-");
  const column = descending ? sortParam.slice(1) : sortParam;
  if (!column) return query;
  return query.order(column, { ascending: !descending });
}

function withOwnershipFilter(query, entity, userId) {
  if (entity === "user_profiles") return query.eq("user_id", userId);
  if (entity === "resumes") return query.eq("user_id", userId);
  if (entity === "job_postings") return query.eq("user_id", userId);
  if (entity === "notifications") return query.eq("user_id", userId);
  return query;
}

async function getUserType(userId) {
  const { data } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("user_id", userId)
    .single();
  return data?.user_type || null;
}

router.use(authenticate);

router.get("/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    const table = getTable(entity);
    if (!table) {
      return res.status(404).json({ error: "Entidade nao suportada" });
    }

    const queryFilters = parseQuery(req.query.query);
    const limit = Number.parseInt(req.query.limit, 10) || 50;
    const sort = req.query.sort;

    let query = supabase.from(table).select("*");

    if (entity === "applications" && !queryFilters.user_id) {
      const userType = await getUserType(req.user.id);

      if (userType === "company") {
        const { data: jobs } = await supabase
          .from("job_postings")
          .select("id")
          .eq("user_id", req.user.id);

        const jobIds = (jobs || []).map((job) => job.id);
        if (jobIds.length === 0) {
          return res.json({ data: { items: [] } });
        }
        query = query.in("job_id", jobIds);
      } else {
        query = query.eq("user_id", req.user.id);
      }
    } else if (entity !== "job_postings" && !queryFilters.user_id) {
      query = withOwnershipFilter(query, entity, req.user.id);
    } else if (entity === "job_postings" && !queryFilters.user_id) {
      query = query.eq("user_id", req.user.id);
    }

    query = applyQueryFilters(query, queryFilters);
    query = applySort(query, sort);
    query = query.limit(Math.min(limit, 200));

    const { data, error } = await query;
    if (error) throw error;

    return res.json({
      data: {
        items: data || [],
      },
    });
  } catch (error) {
    console.error("Erro ao consultar entidade:", error);
    return res.status(500).json({ error: "Erro ao consultar entidade" });
  }
});

router.get("/:entity/all", async (req, res) => {
  try {
    const { entity } = req.params;
    const table = getTable(entity);
    if (!table) {
      return res.status(404).json({ error: "Entidade nao suportada" });
    }

    const queryFilters = parseQuery(req.query.query);
    const limit = Number.parseInt(req.query.limit, 10) || 100;
    const sort = req.query.sort;

    let query = supabase.from(table).select("*");
    query = applyQueryFilters(query, queryFilters);
    query = applySort(query, sort);
    query = query.limit(Math.min(limit, 500));

    const { data, error } = await query;
    if (error) throw error;

    return res.json({
      data: {
        items: data || [],
      },
    });
  } catch (error) {
    console.error("Erro ao consultar entidade (all):", error);
    return res.status(500).json({ error: "Erro ao consultar entidade" });
  }
});

router.get("/:entity/:id", async (req, res) => {
  try {
    const { entity, id } = req.params;
    const table = getTable(entity);
    if (!table) {
      return res.status(404).json({ error: "Entidade nao suportada" });
    }

    let query = supabase.from(table).select("*").eq("id", id);
    if (entity !== "job_postings") {
      query = withOwnershipFilter(query, entity, req.user.id);
    }

    const { data, error } = await query.single();
    if (error) throw error;

    return res.json({ data });
  } catch (error) {
    console.error("Erro ao buscar entidade por id:", error);
    return res.status(500).json({ error: "Erro ao buscar entidade" });
  }
});

router.post("/:entity", async (req, res) => {
  try {
    const { entity } = req.params;
    const table = getTable(entity);
    if (!table) {
      return res.status(404).json({ error: "Entidade nao suportada" });
    }

    const payload = req.body || {};
    const dataToInsert = { ...payload };

    if (
      entity === "user_profiles" ||
      entity === "resumes" ||
      entity === "job_postings" ||
      entity === "applications" ||
      entity === "notifications"
    ) {
      dataToInsert.user_id = req.user.id;
    }

    const { data, error } = await supabase
      .from(table)
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ data });
  } catch (error) {
    console.error("Erro ao criar entidade:", error);
    return res.status(500).json({ error: "Erro ao criar entidade" });
  }
});

router.put("/:entity/:id", async (req, res) => {
  try {
    const { entity, id } = req.params;
    const table = getTable(entity);
    if (!table) {
      return res.status(404).json({ error: "Entidade nao suportada" });
    }

    let query = supabase.from(table).update(req.body || {}).eq("id", id);
    query = withOwnershipFilter(query, entity, req.user.id);

    const { data, error } = await query.select().single();
    if (error) throw error;

    return res.json({ data });
  } catch (error) {
    console.error("Erro ao atualizar entidade:", error);
    return res.status(500).json({ error: "Erro ao atualizar entidade" });
  }
});

router.delete("/:entity/:id", async (req, res) => {
  try {
    const { entity, id } = req.params;
    const table = getTable(entity);
    if (!table) {
      return res.status(404).json({ error: "Entidade nao suportada" });
    }

    let query = supabase.from(table).delete().eq("id", id);
    query = withOwnershipFilter(query, entity, req.user.id);

    const { error } = await query;
    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar entidade:", error);
    return res.status(500).json({ error: "Erro ao deletar entidade" });
  }
});

export default router;
