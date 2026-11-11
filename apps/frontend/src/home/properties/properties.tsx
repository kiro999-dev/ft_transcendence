import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";

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
            <ul>
                {properties.map((p) => (
                    <li key={p.id}>{p.title}</li>
                ))}
            </ul>
        </div>
    );
};