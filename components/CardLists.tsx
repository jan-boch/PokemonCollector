import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CardListsProps {
    user: any;
    lists: { id: string, name: string }[];
    setLists: React.Dispatch<React.SetStateAction<any[]>>;
    activeList: string;
    setActiveList: React.Dispatch<React.SetStateAction<string>>;
}

export default function CardLists({ user, lists, setLists, activeList, setActiveList }: CardListsProps) {
    const [loading, setLoading] = useState(false);

    const addList = async () => {
        const newListName = prompt('Enter the name for the new list:');
        if (!newListName) return;

        if (lists.some(l => l.name === newListName)) {
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
            setLists(prevLists => [...prevLists, data]);
            setActiveList(newListName);
        } catch (error: any) {
            alert('Error adding new list: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center px-4 bg-white border-b border-gray-200 overflow-x-auto no-scrollbar">
            <div className="flex space-x-1">
                {lists.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveList(list.name)}
                        className={`px-6 py-3 text-sm font-medium transition-all relative ${
                            activeList === list.name
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {list.name}
                        {activeList === list.name && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                ))}
            </div>
            <button
                onClick={addList}
                disabled={loading}
                className="ml-4 p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors disabled:opacity-50"
                title="Add new list"
            >
                +
            </button>
        </div>
    );
}