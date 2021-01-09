import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userIsAuthenticated = false;
  userEmail = '';
  private authListenerSub: Subscription;
  private userEmailSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.userEmail = this.authService.getUserEmail();
    this.userEmailSub =  this.authService.getEmailStatusListener()
    .subscribe((email) => {
      this.userEmail = email;     
    });
   

    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authListenerSub = this.authService.getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  ngOnDestroy() {
    this.userEmailSub.unsubscribe();
    this.authListenerSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
