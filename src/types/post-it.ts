export interface PostIt {
    content: string;
    category: string;
    position: {
        x: number;
        y: number;
    };
}