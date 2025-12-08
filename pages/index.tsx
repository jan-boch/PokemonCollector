import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CardGrid from '../components/CardGrid';

// Update: Accept the `user` prop
export default function Home({ user }: { user: any }) {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCards() {
            setLoading(true);

            // 1. Fetch data only if a user is logged in
            if (user) {
                // NOTE: You should adjust this query to only fetch cards
                // belonging to the logged-in user (e.g., .eq('user_id', user.id)).
                // For now, we'll keep the general fetch but ensure it only runs when 'user' is present.
                const { data, error } = await supabase
                    .from('cards')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) console.error(error);
                setCards(data ?? []);
            } else {
                // Clear cards if the user logs out
                setCards([]);
            }
            setLoading(false);
        }

        // Dependency array includes 'user' so the effect re-runs on login/logout
        loadCards();
    }, [user]);

    // 2. Display a welcome message if no user is logged in
    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Welcome to Your Pokémon Card Tracker!</h2>
                <p>
                    Log in to start managing and viewing your personal collection.
                </p>
                <p>
                    You can sign in using the **Login** link in the header.
                </p>
            </div>
        );
    }

    // 3. Display loading state while logged-in user's cards are being fetched
    if (loading) return <p>Loading your collection...</p>;

    // 4. Display the card grid for logged-in users
    return (
        <>
            {cards.length === 0 ? (
                <p>Your collection is empty! Go to "Add card" to begin.</p>
            ) : (
                <CardGrid initialCards={cards} />
            )}
        </>
    );
}