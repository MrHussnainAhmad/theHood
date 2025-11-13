"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, MapPin, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";

interface Location {
  id: string;
  city: string;
  area: string | null;
  pincode: string | null;
  active: boolean;
  createdAt: string;
}

export default function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    city: "",
    area: "",
    pincode: "",
    active: true,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(
      (loc) =>
        loc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.pincode?.includes(searchTerm)
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/admin/locations");
      const data = await response.json();
      setLocations(data);
      setFilteredLocations(data);
    } catch (error) {
      toast.error("Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city) {
      toast.error("City is required");
      return;
    }

    try {
      const url = editingLocation
        ? `/api/admin/locations/${editingLocation.id}`
        : "/api/admin/locations";

      const response = await fetch(url, {
        method: editingLocation ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save location");
        return;
      }

      toast.success(
        editingLocation ? "Location updated" : "Location added"
      );
      setShowModal(false);
      setEditingLocation(null);
      resetForm();
      fetchLocations();
    } catch (error) {
      toast.error("Failed to save location");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;

    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Location deleted");
        fetchLocations();
      }
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      city: location.city,
      area: location.area || "",
      pincode: location.pincode || "",
      active: location.active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      city: "",
      area: "",
      pincode: "",
      active: true,
    });
  };

  const toggleActive = async (location: Location) => {
    try {
      const response = await fetch(`/api/admin/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...location,
          active: !location.active,
        }),
      });

      if (response.ok) {
        toast.success(
          `Location ${!location.active ? "activated" : "deactivated"}`
        );
        fetchLocations();
      }
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Locations Management
          </h1>
          <p className="text-neutral-600">
            Manage service availability areas
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingLocation(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-5 h-5" />
          Add Location
        </Button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by city, area, or pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-neutral-600 mb-1">Total Locations</p>
          <p className="text-3xl font-bold text-neutral-900">
            {locations.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-600 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">
            {locations.filter((l) => l.active).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-600 mb-1">Inactive</p>
          <p className="text-3xl font-bold text-neutral-400">
            {locations.filter((l) => !l.active).length}
          </p>
        </div>
      </div>

      {/* Locations Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  City
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Area
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Pincode
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Added
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((location) => (
                <tr key={location.id} className="border-b border-neutral-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <span className="font-medium text-neutral-900">
                        {location.city}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral-600">
                    {location.area || "—"}
                  </td>
                  <td className="py-4 px-4 text-neutral-600">
                    {location.pincode || "—"}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleActive(location)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        location.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {location.active ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {location.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-neutral-600 text-sm">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(location)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No locations found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-display font-bold mb-6">
              {editingLocation ? "Edit Location" : "Add Location"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="City *"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="New York"
                required
              />
              <Input
                label="Area/District"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                placeholder="Manhattan"
              />
              <Input
                label="Pincode/ZIP"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                placeholder="10001"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="active" className="text-sm text-neutral-700">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingLocation ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}