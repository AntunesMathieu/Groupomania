export class Post {
    _id!: string;
    imageUrl!: string;
    text!: string;
    createdDate! :Date;
    location!: string;
    likes!: number;
    dislikes!: number;
    usersLiked!: string[];
    usersDisliked!: string[];
    userId!: string;
}