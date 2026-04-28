import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { List } from '../lib/types';

interface CardListsProps {
    user: User;
    lists: List[];
    setLists: React.Dispatch<React.SetStateAction<List[]>>;
    activeList: string;
    setActiveList: (list: string) => void;
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
        } catch (error: unknown) {
            alert('Error adding new list: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 flex items-center overflow-x-auto no-scrollbar">
                {lists.map(list => (
                    <button
                        key={list.id}
                        onClick={() => setActiveList(list.name)}
                        className={`px-5 py-3 text-sm font-medium transition-all whitespace-nowrap relative shrink-0 ${
                            activeList === list.name
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {list.name}
                        {activeList === list.name && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                        )}
                    </button>
                ))}
                <button
                    onClick={addList}
                    disabled={loading}
                    className="ml-3 w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                    title="Add new list"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
