import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CardGrid from '../components/CardGrid';

export default function Home() {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCards() {
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) console.error(error);
            setCards(data ?? []);
            setLoading(false);
        }
        loadCards();
    }, []);

    if (loading) return <p>Loading...</p>;

    return <CardGrid initialCards={cards} />;
}

