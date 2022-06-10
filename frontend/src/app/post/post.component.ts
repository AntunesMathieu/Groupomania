import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/posts.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { Post } from '../models/Post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  posts$!: Observable<Post[]>;
  loading!: boolean;
  errorMsg!: string;

  constructor(private post: PostService,
              private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.posts$ = this.post.posts$.pipe(
      tap(() => {
        this.loading = false;
        this.errorMsg = '';
      }),
      catchError(error => {
        this.errorMsg = JSON.stringify(error);
        this.loading = false;
        return of([]);
      })
    );
    this.post.getAllPost();
  }

  onClickPost(id: string) {
    this.router.navigate(['post', id]);
  }

}
