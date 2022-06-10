import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, iif, map, Observable, of, switchMap, take, tap } from 'rxjs';
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
  likePending!: boolean;
  likes!: boolean;
  dislikes!: boolean;
  errorMessage!: string;

  constructor(private posts: PostService,
              private route: ActivatedRoute,
              private auth: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.loading = true;
    this.userId = this.auth.getUserId();
    this.post$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.posts.getOnePost(id)),
      tap(post => {
        this.loading = false;
        if (post.usersLiked.find(user => user === this.userId)) {
          this.likes = true;
        } else if (post.usersDisliked.find(user => user === this.userId)) {
          this.dislikes = true;
        }
      })
    );
  }

  onLikes() {
    if (this.dislikes) {
      return;
    }
    this.likePending = true;
    this.post$.pipe(
      take(1),
      switchMap((post: Post) => this.posts.likePost(post._id, !this.likes).pipe(
        tap(likes => {
          this.likePending = false;
          this.likes = likes;
        }),
        map(likes => ({ ...post, likes: likes ? post.likes + 1 : post.likes - 1 })),
        tap(post => this.post$ = of(post))
      )),
    ).subscribe();
  }
  
  onDislikes() {
    if (this.likes) {
      return;
    }
    this.likePending = true;
    this.post$.pipe(
      take(1),
      switchMap((post: Post) => this.posts.dislikePost(post._id, !this.dislikes).pipe(
        tap(dislikes => {
          this.likePending = false;
          this.dislikes = dislikes;
        }),
        map(dislikes => ({ ...post, dislikes: dislikes ? post.dislikes + 1 : post.dislikes - 1 })),
        tap(post => this.post$ = of(post))
      )),
    ).subscribe();
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

  // onDelete() {
  //   this.loading = true;
  //   this.post$.pipe(
  //     take(1),
  //     switchMap(post => this.posts.deletePost(post._id)),
  //     tap(message => {
  //       console.log(message);
  //       this.loading = false;
  //       this.router.navigate(['/post']);
  //     }),
  //     catchError(error => {
  //       this.loading = false;
  //       this.errorMessage = error.message;
  //       console.error(error);
  //       return EMPTY;
  //     })
  //   ).subscribe();
  // }
}