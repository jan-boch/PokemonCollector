export interface List {
    id: string;
    name: string;
}

export interface Card {
    id: string;
    name: string;
    set_name: string | null;
    price: number | null;
    cardmarket_url: string | null;
    image_path: string | null;
    list_id: string;
    user_id: string;
    collected: boolean;
    created_at: string;
    position: number | null;
}
