export type Note = {
  date: string | number | readonly string[] | undefined;
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  created_at?: string;
  folder: number | null;
  is_favorite: boolean;
  is_archived: boolean;
};
