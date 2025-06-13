// app/create-shop/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function CreateShopPage() {
  const router = useRouter();
  const { createOrganization } = useClerk();
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
    location: "",
    shopType: "local" as "local" | "online" | "both",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsCreating(true);
    setError("");

    try {
      await createOrganization({
        name: formData.shopName,
        slug: formData.shopName.toLowerCase().replace(/\s+/g, '-'),
      });
      
      // Redirect to dashboard after successful creation
      router.push("/");
    } catch (err) {
      console.error("Error creating shop:", err);
      setError("Failed to create shop. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your TCG Shop
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your trading card game shop to start managing inventory and sales
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Shop Name */}
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                Shop Name *
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                autoComplete="organization"
                required
                value={formData.shopName}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="e.g., Dragon's Den Cards"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Brief description of your shop and specialties"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="e.g., Los Angeles, CA"
              />
            </div>

            {/* Shop Type */}
            <div>
              <label htmlFor="shopType" className="block text-sm font-medium text-gray-700">
                Shop Type *
              </label>
              <select
                id="shopType"
                name="shopType"
                required
                value={formData.shopType}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="local">Local Store Only</option>
                <option value="online">Online Only</option>
                <option value="both">Both Local & Online</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isCreating || !formData.shopName.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating Shop..." : "Create Shop"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">
              By creating a shop, you agree to our terms of service and privacy policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}