export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
}

export interface EditorData {
  blocks: Array<{
    type: string;
    data: Record<string, any>;
  }>;
}
