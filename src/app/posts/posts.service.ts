import { Injectable } from "@angular/core";
import { PostModel } from "./post.model";
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import {environment} from '../../environments/environment'

const BACKEND_URL =  environment.apiUrl + 'posts/';

@Injectable({
    providedIn: 'root'
})

export class PostService {

    private posts: PostModel[] = [];
    private postsUpdated = new Subject<{ posts: PostModel[], postCount: number }>();

    constructor(private httpClient: HttpClient, private router: Router) {

    }

    getPostUpdateListen() {
        return this.postsUpdated.asObservable();
    }

    getPosts(postsPerPage: number, currentPage: number) {
        // Pagination query parameters
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;

        this.httpClient.get<{ message: string, posts: any, postCount: number }>(
            BACKEND_URL + queryParams
        )
            .pipe(
                map((postData) => {
                    return {
                        posts: postData.posts.map((post) => {
                            return {
                                title: post.title,
                                content: post.content,
                                id: post._id,
                                imagePath: post.imagePath,
                                creator: post.creator,
                                email: post.email
                            }
                        }), postCount: postData.postCount
                    };
                })
            )
            .subscribe((transPostData) => {
                this.posts = transPostData.posts;
                const postsCount = transPostData.postCount;
                this.postsUpdated.next({ posts: [...this.posts], postCount: postsCount })
            });
    }

    getPost(id: string) {

        return this.httpClient.get<{
            _id: string,
            title: string,
            content: string,
            imagePath: string,
            creator: string
            email: string
        }>( BACKEND_URL + id);
    }

    addPost(title: string, content: string, image: File, email: string) {

        const postData = new FormData();

        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        postData.append('email', email);

        console.log(postData);        

        this.httpClient.post<{ message: string, post: PostModel }>( BACKEND_URL, postData)
            .subscribe((responseData) => {
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string, image: File | string, email: string) {
        let postData: PostModel | FormData;

        // A file type will be an ovject a string will not 
        if (typeof image === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            // title is the filename of the image 
            postData.append('image', image, title);
            postData.append('email', email);

        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image,
                // the crator is null becouse we don't want to handel this on the fornt end
                // we will mamage it on the backend
                creator: null,
                email:email
            }
        }

        this.httpClient.put( BACKEND_URL + id, postData)
            .subscribe((response) => {
                this.router.navigate(['/']);
            });
    }

    deletePost(postId: string) {
        return this.httpClient.delete( BACKEND_URL + postId);
    }
}