export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface TaskCreate {
  title: string;
  description: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
}
