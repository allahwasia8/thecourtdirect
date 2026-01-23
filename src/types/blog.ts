export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  featured: boolean;
  image: string | null;
  categories?: string[];
  content?: string; // Optional because list view doesn't have it
  authorRole?: string;
  reviewedBy?: {
    name: string;
    title: string;
    image: string;
  };
  history?: {
    action: string;
    date: string;
    details: string;
  }[];
}
