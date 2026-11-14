import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";

const PropertyCard = ({ p }: { p: any }) => (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col">
        {/* "place of the pic" */}
        <div className="h-48 bg-slate-200 rounded-t-2xl"></div>

        {/* {body} */}
        <div className="p-4 flex flex-col gap-2 flex-1">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">{p.price} MAD</p>
            <h2 className="text-[15px] font-semibold text-slate-900">{p.title}</h2>
            <p className="text-[13px] text-slate-500">{p.city}</p>
            <div className="flex gap-4 text-[13px] text-slate-700">
                <span>{p.bedrooms} beds</span>
                <span>{p.bathrooms} baths</span>
                {p.area && <span>{p.area} m²</span>}
            </div>
            {/* {footer} */}
            <div className="mt-auto pt-3 border-t border-slate-100 text-xs text-slate-500">
                {p.property_type}
            </div>
        </div>
    </article>
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