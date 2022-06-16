export class Post {
    _id!: string;
    imageUrl!: string;
    text!: string;
    likes!: number;
    usersLiked!: string[];
    userId!: string;
}