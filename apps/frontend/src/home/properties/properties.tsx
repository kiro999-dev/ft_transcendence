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
    useEffect(() => {
        const load = async () => {
            const res = await apiFetch("/properties");
            const data = await res.json();
            setProperties(data)
        };
        load();
    }, [])
    return (
        <div>
            <h1>Properties</h1>
            <p>Total: {properties.length}</p>
            <div>
                {properties.map((p) => (
                    <PropertyCard key={p.id} p ={p} />
                ))}
            </div>
        </div>
    );
};