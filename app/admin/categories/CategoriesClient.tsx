"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, Loader2, X, Check,
  Tag, BookOpen, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  study_count: number;
}

const PRESET_COLORS = [
  "#8f1535", "#6b0f24", "#2E7D32", "#1565C0",
  "#6A1B9A", "#E65100", "#00695C", "#4527A0",
  "#AD1457", "#37474F",
];

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-maroon-200 bg-white text-maroon-900 placeholder-maroon-300 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Category Form (used for both Add and Edit) ────────────────────────────────
function CategoryForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<Category>;
  onSave: (data: { name: string; slug: string; description: string; color: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [slugManual, setSlugManual] = useState(!!initial?.slug);

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required."); return; }
    if (!slug.trim()) { toast.error("Slug is required."); return; }
    onSave({ name: name.trim(), slug: slug.trim(), description: description.trim(), color });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-maroon-600 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Teaching Strategies & Practice"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-maroon-600 mb-1.5">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            value={slug}
            onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
            placeholder="e.g. teaching-strategies-practice"
            className={inputCls}
          />
          <p className="text-[10px] text-maroon-400 mt-1">Auto-generated from name. Used in URLs.</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-maroon-600 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Brief description of what this category covers..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-maroon-600 mb-2">Color</label>
        <div className="flex items-center gap-3 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center flex-shrink-0"
              style={{
                background: c,
                borderColor: color === c ? "#fff" : c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            >
              {color === c && <Check size={12} className="text-white" />}
            </button>
          ))}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-lg border-2 border-maroon-200 cursor-pointer opacity-0 absolute inset-0"
            />
            <div
              className="w-7 h-7 rounded-lg border-2 border-dashed border-maroon-300 flex items-center justify-center text-maroon-400 text-[10px] font-bold pointer-events-none"
              title="Custom color"
            >
              +
            </div>
          </div>

          {/* Preview */}
          <div className="ml-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{ background: `${color}15`, borderColor: `${color}30`, color }}
            >
              <Tag size={9} /> Preview
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? "Saving..." : "Save Category"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-maroon-200 text-sm text-maroon-600 hover:bg-maroon-50 transition-all"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  onEdit,
  onDelete,
  deleting,
}: {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: cat.color }} />
      <div className="p-5 flex items-start gap-4">
        {/* Color swatch */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${cat.color}18`, border: `1.5px solid ${cat.color}30` }}
        >
          <Tag size={16} style={{ color: cat.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-serif text-base font-semibold text-maroon-900">{cat.name}</h3>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
              style={{ background: `${cat.color}12`, borderColor: `${cat.color}25`, color: cat.color }}
            >
              {cat.slug}
            </span>
          </div>
          {cat.description && (
            <p className="text-xs text-maroon-400 leading-relaxed mt-0.5">{cat.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <BookOpen size={11} className="text-maroon-300" />
            <span className="text-xs text-maroon-400">
              {cat.study_count} {cat.study_count === 1 ? "study" : "studies"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-maroon-200 text-xs text-maroon-600 hover:bg-maroon-50 transition-all font-medium"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting || cat.study_count > 0}
            title={cat.study_count > 0 ? "Cannot delete a category that has studies" : "Delete category"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CategoriesClient({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd(data: { name: string; slug: string; description: string; color: string }) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      color: data.color,
    });
    if (error) {
      toast.error(error.message.includes("unique") ? "A category with this slug already exists." : error.message);
    } else {
      toast.success("Category added.");
      setShowAdd(false);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleEdit(id: string, data: { name: string; slug: string; description: string; color: string }) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("categories").update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      color: data.color,
    }).eq("id", id);
    if (error) {
      toast.error("Failed to update category.");
    } else {
      toast.success("Category updated.");
      setEditingId(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete category.");
    } else {
      toast.success("Category deleted.");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">

      {/* Add button / form */}
      {showAdd ? (
        <div className="bg-white rounded-2xl border border-maroon-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)" }}>
              <Plus size={14} className="text-maroon-600" />
            </div>
            <h3 className="font-serif text-base font-semibold text-maroon-800">New Category</h3>
          </div>
          <CategoryForm
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
            saving={saving}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-maroon-200 text-sm font-medium text-maroon-500 hover:border-maroon-400 hover:text-maroon-700 hover:bg-maroon-50/50 transition-all"
        >
          <Plus size={15} /> Add New Category
        </button>
      )}

      {/* Notice about deletion */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
        <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Categories with existing studies cannot be deleted. Reassign or remove those studies first.
        </p>
      </div>

      {/* Category list */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-maroon-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #8f153515, #6b0f2415)", border: "1.5px solid #8f153525" }}>
            <Tag size={26} className="text-maroon-400" />
          </div>
          <h3 className="font-serif text-lg text-maroon-700 mb-2">No categories yet</h3>
          <p className="text-maroon-400 text-sm">Add your first category using the button above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) =>
            editingId === cat.id ? (
              <div key={cat.id} className="bg-white rounded-2xl border border-maroon-300 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)" }}>
                    <Pencil size={13} className="text-maroon-600" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-maroon-800">Edit Category</h3>
                </div>
                <CategoryForm
                  initial={cat}
                  onSave={(data) => handleEdit(cat.id, data)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <CategoryRow
                key={cat.id}
                cat={cat}
                onEdit={() => setEditingId(cat.id)}
                onDelete={() => handleDelete(cat.id)}
                deleting={deletingId === cat.id}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
