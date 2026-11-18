import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";

const statusStyle: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    reserved: "bg-amber-100 text-amber-800",
    sold: "bg-slate-100 text-slate-800",
    rented: "bg-slate-100 text-slate-800",
    hidden: "bg-gray-100 text-gray-800"
}
const PropertyCard = ({ p }: { p: any }) => (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col">
        {/* "place of the pic" */}
        <div className="relative h-48 bg-slate-200 rounded-t-2xl">
            <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[p.status]}`}>{p.status}</span>
            <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold bg-white text-slate-900">
                {p.listing_type === "sale" ? "For sale" : "For rent"}
            </span>
        </div>
        

        {/* {body} */}
        <div className="p-4 flex flex-col gap-2 flex-1">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">{Number(p.price).toLocaleString("en-US")} MAD</p>
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
        const load = async () => {
            setError(false)
            setLoading(true)
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

        useEffect(() => {
            load();
    }, [])
    return (
        <div>
            <p className="text-sm text-slate-500">Dashboard / Properties</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Properties</h1>
            <p className="text-sm text-slate-600">All listings of your agency.</p>
            
            {loading && (
                <div className=" bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"/>
                    <p className="text-sm text-slate-500">Loading properties...</p>
                </div>
            )}
            {!loading && !error && properties.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-3">
                    <h2 className="text-lg font-extrabold text-slate-900">No properties yet</h2>
                    <p className="text-sm text-slate-600 max-w-sm">Add your first listing. Clients and the assistant will see it once it is available.</p>
                </div>
            )}
            {error && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-3">
                    <h2 className="text-lg font-extrabold text-slate-900">Couldn't load properties</h2>
                    <p className="text-sm text-slate-600 max-w-sm">The server did not answer. Your listings are safe. Check your connection and try again.</p>
                    <button onClick={load}  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Try again</button>
                </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                    <PropertyCard key={p.id} p ={p} />
                ))}
            </div>
        </div>
    );
};