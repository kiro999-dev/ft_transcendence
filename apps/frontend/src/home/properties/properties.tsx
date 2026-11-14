import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";

const PropertyCard = ({ p }: { p: any }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
        <h2 className="text-slate-900 font-extrabold tracking-tight"> { p.title} </h2>
        <p className="text-sm text-slate-600"> { p.city } </p>
        <p> { p.price } MAD</p>
        <p> { p.bedrooms } bedrooms</p>
    </div>
)
export const Properties = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch("/properties");
                if (!res.ok)
                {
                    throw new Error("Failed to load properties")
                }
                const data = await res.json();
                setProperties(data)
            } catch{
                setError(true);
            }
            setLoading(false);
        };
        load();
    }, [])
    return (
        <div>
            <h1>Properties</h1>
            <p>Total: {properties.length}</p>
            {loading && <p>Loading...</p>}
            {!loading && !error && properties.length === 0 && <p>No properties yet</p>}
            {error && <p>Couldn't load properties</p>}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                    <PropertyCard key={p.id} p ={p} />
                ))}
            </div>
        </div>
    );
};