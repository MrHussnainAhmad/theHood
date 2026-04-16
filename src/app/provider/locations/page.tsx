"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MapPin, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ProviderLocation {
  id: string;
  city: string;
  area: string | null;
  pincode: string | null;
  active: boolean;
  createdAt: string;
}

export default function ProviderLocationsPage() {
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProviderLocation | null>(null);
  const [formData, setFormData] = useState({ city: "", area: "", pincode: "", active: true });

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/provider/locations");
      const data = await response.json();
      setLocations(data);
    } catch {
      toast.error("Failed to fetch service areas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const resetForm = () => {
    setFormData({ city: "", area: "", pincode: "", active: true });
    setEditing(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/provider/locations/${editing.id}` : "/api/provider/locations";
    const method = editing ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Failed to save service area");
      return;
    }

    toast.success(editing ? "Area updated" : "Area added");
    setShowModal(false);
    resetForm();
    fetchLocations();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this service area?")) return;
    const response = await fetch(`/api/provider/locations/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete service area");
      return;
    }
    toast.success("Service area deleted");
    fetchLocations();
  };

  const toggleActive = async (loc: ProviderLocation) => {
    const response = await fetch(`/api/provider/locations/${loc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: loc.city, area: loc.area, pincode: loc.pincode, active: !loc.active }),
    });

    if (!response.ok) {
      toast.error("Failed to update status");
      return;
    }

    toast.success(!loc.active ? "Area activated" : "Area deactivated");
    fetchLocations();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">My Service Areas</h1>
            <p className="text-neutral-600">Set locations where customers can book your services.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className="w-5 h-5" /> Add Area
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="py-3 px-4 text-sm font-semibold">City</th>
                  <th className="py-3 px-4 text-sm font-semibold">Area</th>
                  <th className="py-3 px-4 text-sm font-semibold">Pincode</th>
                  <th className="py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-neutral-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-600" />{loc.city}</div>
                    </td>
                    <td className="py-4 px-4 text-neutral-600">{loc.area || "-"}</td>
                    <td className="py-4 px-4 text-neutral-600">{loc.pincode || "-"}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleActive(loc)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${loc.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-700"}`}
                      >
                        {loc.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {loc.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                          onClick={() => {
                            setEditing(loc);
                            setFormData({ city: loc.city, area: loc.area || "", pincode: loc.pincode || "", active: loc.active });
                            setShowModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => onDelete(loc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {locations.length === 0 && (
              <div className="text-center py-12 text-neutral-500">No service areas set yet. Add your first area.</div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-display font-bold mb-6">{editing ? "Edit Service Area" : "Add Service Area"}</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="City *" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
              <Input label="Area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
              <Input label="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
                Active
              </label>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">{editing ? "Update" : "Add"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}