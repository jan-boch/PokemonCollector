import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UpdateCardForm from '../../components/UpdateCardForm'; // You will create this component

export default function UpdatePage({ user }: any) {
    const router = useRouter();
    const { id } = router.query;
    const [cardData, setCardData] = useState<any>(null);
    const [lists, setLists] = useState<any[]>([]); // State to hold fetched lists
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login'); // Redirect if not logged in
            return;
        }

        if (id) {
            async function fetchCard() {
                const { data, error } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    alert('Error loading card: ' + error.message);
                    console.error(error);
                } else {
                    setCardData(data);
                }
                setLoading(false);
            }
            fetchCard();
        }
    }, [id, user, router]);

    if (!user) return null; // Wait for redirect
    if (loading) return <p>Loading card details...</p>;
    if (!cardData) return <p>Card not found.</p>;

    return (
        <div style={{ maxWidth: 700 }}>
            <h2>Update Card: {cardData.name}</h2>
            <UpdateCardForm initialData={cardData} />
        </div>
    );
}
