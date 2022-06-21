import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Post } from '../models/Post.model';
import { PostService } from '../services/posts.service';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.scss']
})
export class SinglePostComponent implements OnInit {

  loading!: boolean;
  post$!: Observable<Post>;
  userId!: string;
  admin!: boolean;
  likePending!: boolean;
  likes!: boolean;
  errorMessage!: string;

  constructor(private posts: PostService,
              private route: ActivatedRoute,
              private auth: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.admin = this.auth.getAdmin();
    this.loading = true;
    this.userId = this.auth.getUserId();
    this.post$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.posts.getOnePost(id)),
      tap(post => {
        this.loading = false;
        if (post.usersLiked.find(user => user === this.userId)) {
          this.likes = true;
        }
      })
    );
  }

  onLikes() {
    this.likePending = true;
    this.post$.pipe(
      take(1),
      switchMap((post: Post) => this.posts.likePost(post._id, !this.likes).pipe(
        tap(likes => {
          this.likePending = false;
          this.likes = likes;
        }),
        map(likes => ({ ...post, likes: likes ? post.likes + 1 : post.likes - 1 })),
      )),
    ).subscribe(() => {
      this.router.navigate(['/post'])
    });
  }

  onBack() {
    this.router.navigate(['/post']);
  }

  onModify() {
    this.post$.pipe(
      take(1),
      tap(post => this.router.navigate(['/modify-post', post._id]))
    ).subscribe();
  }

  onDelete() {
    this.loading = true;
    this.post$.pipe(
      take(1),
      switchMap(post => this.posts.deletePost(post._id)),
      tap(message => {
        this.loading = false;
        this.router.navigate(['/post']);
      }),
      catchError(error => {
        this.loading = false;
        this.errorMessage = error.message;
        console.error(error);
        return EMPTY;
      })
    ).subscribe();
  }
}
