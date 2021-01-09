import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmailValidator, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PostModel } from '../post.model';
import { PostService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit, OnDestroy {

    private mode = 'create';
    private postId: string;
    post: PostModel;
    isLoading = false;
    form: FormGroup
    imagePreview: string;
    private authStatusSub: Subscription;
    userEmail = '';
    private userEmailSub: Subscription;

    constructor(
        private postService: PostService,
        public activeRoute: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {

        this.userEmail = this.authService.getUserEmail();
        this.userEmailSub = this.authService.getEmailStatusListener()
            .subscribe((email) => {
                this.userEmail = email;
                console.log(this.userEmail);
            });



        this.authStatusSub = this.authService.getAuthStatusListener()
            .subscribe((authStatus) => {
                //When reciving an error in creating post window removing spinner
                this.isLoading = false;
            });

        this.form = new FormGroup({
            'title': new FormControl(null, {
                validators: [
                    Validators.required,
                    Validators.minLength(3)
                ]
            }),
            'content': new FormControl(null, {
                validators: [
                    Validators.required
                ]
            }),
            'image': new FormControl(null, {
                validators: [
                    Validators.required
                ],
                asyncValidators: [mimeType]
            }),
            'email': new FormControl(this.userEmail, {
                validators: [
                    Validators.required
                ],
                asyncValidators: [mimeType]
            }),
        });

        this.activeRoute.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.isLoading = true;
                this.postId = paramMap.get('postId');

                this.postService.getPost(this.postId).subscribe((postData) => {

                    this.isLoading = false;

                    this.post = {
                        id: postData._id,
                        title: postData.title,
                        content: postData.content,
                        imagePath: postData.imagePath,
                        creator: postData.creator,
                        email: postData.email
                    };

                    // Adding value to form fields
                    this.form.setValue({
                        title: this.post.title,
                        content: this.post.content,
                        image: this.post.imagePath
                    });
                });

            } else {
                this.mode = 'create';
                this.postId = null;
            }
        });
    }

    ngOnDestroy(): void {
        this.authStatusSub.unsubscribe();
    }

    // displaying the image on the page
    onImagePicked(event: Event) {
        const file = (event.target as HTMLInputElement).files[0];
        // patchValue targets a single control
        this.form.patchValue({ image: file });
        // updating the value
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    onSavePost() {
        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;

        if (this.mode === 'create') {

            this.postService.addPost(
                this.form.value.title,
                this.form.value.content,
                this.form.value.image,
                this.form.value.email
            );

        } else if (this.mode === 'edit') {
            
            this.postService.updatePost(
                this.postId,
                this.form.value.title,
                this.form.value.content,
                this.form.value.image,                
                this.form.value.email                
            );

        } else {
            return;
        }

        this.form.reset();
    }


}