import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { AuthenticationService } from './_services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  version = environment.version;
  buildDate = environment.buildDate;
  currentRoute: string;
  apiurl = environment.apiUrl;
  currentUrl = '/';
  user: any;
  status = {
    heading: '',
    message: ''
  };

  constructor(private router: Router, private authentication: AuthenticationService) {
    router.events.subscribe(scroll => {
      // Scroll to top of page on route change
      window.scrollTo(0, 0);
    });
  }

  gotoHashtag(fragment: string, event) {
    event.preventDefault();
    const element = document.querySelector('#' + fragment);
    if (element) {
      element.scrollIntoView();
      document.getElementById(fragment).focus();
    }
  }

  isAuthenticated() {
    this.authentication.getAuthenticatedUser().subscribe((user: any) => {
      if (user) {
        this.user = user;
      }
    });
    if (localStorage.getItem('status')) {
      this.status = JSON.parse(localStorage.getItem('status'));
      localStorage.removeItem('status');
    } else {
      this.status = {
        heading: '',
        message: ''
      };
    }
  }

  updateStatus(status: any) {
    this.status = status;
  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    window.scrollTo(0, 0);
  }
}
