import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { Post } from '../models/Post.model';
import { PostService } from '../services/posts.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  postForm!: FormGroup;
  mode!: string;
  loading!: boolean;
  post!: Post;
  errorMsg!: string;
  imagePreview!: string

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private posts: PostService,
              private auth: AuthService) { }

  ngOnInit() {
    this.loading = true;
    this.route.params.pipe(
      switchMap(params => {
        if (!params['id']){
          this.mode = 'new';
          this.initEmptyForm();
          this.loading = false;
          return EMPTY;
        } else {
          this.mode = 'edit';
          return this.posts.getOnePost(params['id'])
        }
      }),
      tap(post => {
        if (post) {
          this.post = post;
          this.initModifyForm(post);
          this.loading = false;
        }
      }),
      catchError(error => this.errorMsg = JSON.stringify(error))
    ).subscribe();
  }

  initEmptyForm() {
    this.postForm = this.formBuilder.group({
      image: [null, Validators.required],
      text: [null, Validators.required],
      location: [null, Validators.required]
    });
  }  

  initModifyForm(post: Post) {
    this.postForm = this.formBuilder.group({
      image: [post.imageUrl, Validators.required],
      text: [post.text, Validators.required],
      location: [post.location, Validators.required]
    });
    this.imagePreview = this.post.imageUrl
  }

  onSubmit() {
    this.loading = true;
    const newPost = new Post();
    newPost.text = this.postForm.get('text')!.value;
    newPost.location =this.postForm.get('location')!.value;
    newPost.userId = this.auth.getUserId();
    if (this.mode === 'new') {
      this.posts.createPost(newPost, this.postForm.get('image')!.value).pipe(
        // tap(({ message }) => {
        //   console.log(message);
        //   this.loading = false;
        //   this.router.navigate(['/post']);
        // }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    } else if (this.mode === 'edit') {
      this.posts.modifyPost(this.post._id, newPost, this.postForm.get('image')!.value).pipe(
        // tap(({ message }) => {
        //   console.log(message);
        //   this.loading = false;
        //   this.router.navigate(['/post']);
        // }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      )
    }
  }

  onFileAdd(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.postForm.get('image')!.setValue(file);
    this.postForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
