import { supabase, isSupabaseConfigured } from "./supabase";
import type { Project, DesignDoc } from "./types";

const LOCAL_KEY = "thiepcuoi-studio-projects-v1";

export const starterDesign: DesignDoc = {
  width: 800, height: 1100, background: "#fbf5ec",
  elements: [
    { id: "t1", type: "text", x: 120, y: 105, width: 560, height: 45, text: "TRÂN TRỌNG KÍNH MỜI", fill: "#9b805b", fontSize: 18, fontFamily: "Georgia", align: "center", animation: "fade" },
    { id: "t2", type: "text", x: 70, y: 230, width: 660, height: 100, text: "Minh  &  Lan", fill: "#813943", fontSize: 68, fontFamily: "Georgia", align: "center", animation: "float" },
    { id: "t3", type: "text", x: 140, y: 375, width: 520, height: 48, text: "LỄ THÀNH HÔN", fill: "#9b805b", fontSize: 24, fontFamily: "Georgia", align: "center", animation: "fade" },
    { id: "t4", type: "text", x: 100, y: 500, width: 600, height: 60, text: "CHỦ NHẬT · 20 · 12 · 2026", fill: "#493b36", fontSize: 27, fontFamily: "Georgia", align: "center", animation: "fade" },
    { id: "t5", type: "text", x: 100, y: 640, width: 600, height: 80, text: "11:00 · NHÀ HÀNG HẠNH PHÚC\\n123 Đường Hạnh Phúc, TP.HCM", fill: "#6b5a51", fontSize: 20, fontFamily: "Georgia", align: "center", animation: "fade" },
    { id: "s1", type: "shape", x: 245, y: 190, width: 310, height: 2, fill: "#b99a6c", animation: "none" },
    { id: "s2", type: "shape", x: 245, y: 445, width: 310, height: 2, fill: "#b99a6c", animation: "none" }
  ]
};

function localRead(): Project[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
}
function localWrite(projects: Project[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
}

export async function listProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured || !supabase) return localRead().sort((a,b) => b.updated_at.localeCompare(a.updated_at));
  const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Project[];
}
export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured || !supabase) return localRead().find(p => p.id === id || p.slug === id) || null;
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}
export async function getPublicProject(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured || !supabase) return localRead().find(p => p.slug === slug && p.is_public) || null;
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("is_public", true).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}
export async function saveProject(project: Project): Promise<Project> {
  const updated = { ...project, updated_at: new Date().toISOString() };
  if (!isSupabaseConfigured || !supabase) {
    const all = localRead(); const idx = all.findIndex(p => p.id === updated.id);
    if (idx >= 0) all[idx] = updated; else all.unshift(updated);
    localWrite(all); return updated;
  }
  const { data, error } = await supabase.from("projects").upsert(updated).select().single();
  if (error) throw error;
  return data as Project;
}
export async function createProject(title: string): Promise<Project> {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const slug = `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,28) || "thiep"}-${id.slice(0,6)}`;
  return saveProject({ id, title, slug, is_public: false, design: structuredClone(starterDesign), updated_at: new Date().toISOString() });
}
export async function deleteProject(id: string) {
  if (!isSupabaseConfigured || !supabase) { localWrite(localRead().filter(p => p.id !== id)); return; }
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
