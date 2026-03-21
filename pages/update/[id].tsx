import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import UpdateCardForm from '../../components/UpdateCardForm';
import type { Card, List } from '../../lib/types';

export default function UpdatePage({ user, lists }: { user: User | null, lists: List[] }) {
    const router = useRouter();
    const { id } = router.query;
    const [cardData, setCardData] = useState<Card | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login'); // Redirect if not logged in
            return;
        }

        async function fetchData() {
            setLoading(true);
            // Fetch card data
            if (id) {
                const { data: card, error: cardError } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (cardError) {
                    alert('Error loading card: ' + cardError.message);
                    console.error(cardError);
                    setCardData(null);
                } else {
                    setCardData(card);
                }
            }
            setLoading(false);
        }
        fetchData();
    }, [id, user, router]);

    if (!user) return null; // Wait for redirect
    if (loading) return <p>Loading card details...</p>;
    if (!cardData) return <p>Card not found.</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Update Card: {cardData.name}</h2>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                >
                    Back to Collection
                </button>
            </div>
            <UpdateCardForm initialData={cardData} user={user} lists={lists} />
        </div>
    );
}
