export interface BlogPost {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  tags: string[];
  views: number;
  createdAt: string;
  updateAt: string; 
  status: "PUBLISHED" | "DRAFT";
  isFeatured: boolean;
  authorId: string;
  _count: {
    comments: number;
  };
}
