export type Notification = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  read?: boolean;
  url?: string;
};
