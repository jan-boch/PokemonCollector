import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CardListsProps {
    user: any;
    lists: string[];
    setLists: React.Dispatch<React.SetStateAction<string[]>>;
    activeList: string;
    setActiveList: React.Dispatch<React.SetStateAction<string>>;
}

export default function CardLists({ user, lists, setLists, activeList, setActiveList }: CardListsProps) {
    const [loading, setLoading] = useState(false);

    const addList = async () => {
        const newListName = prompt('Enter the name for the new list:');
        if (!newListName) return;

        if (lists.includes(newListName)) {
            alert('A list with this name already exists.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('lists')
                .insert([{ name: newListName, user_id: user.id }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Update local state to include the new list and set it as active
            setLists(prevLists => [...prevLists, newListName]);
            setActiveList(newListName);
        } catch (error: any) {
            alert('Error adding new list: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center px-4 border-b border-gray-300">
            {lists.map(list => (
                <button
                    key={list}
                    onClick={() => setActiveList(list)}
                    className={`px-4 py-2 border-t border-l border-r rounded-t-md cursor-pointer ${
                        activeList === list
                            ? 'bg-white border-gray-300 -mb-px'
                            : 'bg-gray-200 border-transparent'
                    }`}
                >
                    {list}
                </button>
            ))}
            <button
                onClick={addList}
                disabled={loading}
                className="px-3 py-1 ml-2 text-xl font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Adding...' : '+'}
            </button>
        </div>
    );
}