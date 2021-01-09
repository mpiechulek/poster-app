import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostModel } from '../post.model';
import { PostService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: PostModel[] = [];
  postSubscription$: Subscription;
  isLoading = false;
  // Pagination properties
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userId: string;

  userIsAuthenticated = false;
  private authListenerSub: Subscription;

  constructor(private postService: PostService, private authService: AuthService) { }

  ngOnInit(): void {

    // First geting this value 
    this.isLoading = true;
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();

    // Then swithcing to this because, it would not work at first because, 
    // you must be in the page to get the subscription    
    this.authListenerSub = this.authService.getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.postService.getPosts(this.postsPerPage, this.currentPage);

    this.postSubscription$ = this.postService.getPostUpdateListen().
      subscribe((postData: { posts: PostModel[], postCount: number }) => {
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.postSubscription$.unsubscribe();
    this.authListenerSub.unsubscribe();
  }

  onDeletePost(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    },(error) => {
      this.isLoading = false;
    });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    // Adding +1 because index starts with 0
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize;

    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }
}
