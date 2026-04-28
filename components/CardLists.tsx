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
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameError, setNameError] = useState('');

    const submitAddList = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;

        if (lists.some(l => l.name === trimmed)) {
            setNameError('A list with this name already exists.');
            return;
        }

        setLoading(true);
        setNameError('');
        try {
            const { data, error } = await supabase
                .from('lists')
                .insert([{ name: trimmed, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            setLists(prevLists => [...prevLists, data]);
            setActiveList(trimmed);
            setIsAdding(false);
            setNewName('');
        } catch (error: unknown) {
            const msg = error instanceof Error
                ? error.message
                : (error as { message?: string })?.message ?? 'Failed to add list.';
            setNameError(msg);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setNewName('');
        setNameError('');
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

                {isAdding ? (
                    <form onSubmit={submitAddList} className="flex items-center gap-1.5 ml-3 shrink-0">
                        <div className="relative">
                            <input
                                autoFocus
                                value={newName}
                                onChange={e => { setNewName(e.target.value); setNameError(''); }}
                                onKeyDown={e => e.key === 'Escape' && cancelAdding()}
                                placeholder="List name"
                                maxLength={40}
                                className={`h-7 px-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-36 ${nameError ? 'border-red-400' : 'border-gray-200'}`}
                            />
                            {nameError && (
                                <div className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap bg-white border border-red-200 rounded px-2 py-1 shadow-sm z-10">
                                    {nameError}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-7 px-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors disabled:opacity-50"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={cancelAdding}
                            className="h-7 px-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="ml-3 w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors flex items-center justify-center shrink-0"
                        title="Add new list"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
