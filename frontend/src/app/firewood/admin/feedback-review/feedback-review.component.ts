import { Component, OnInit, Input } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { FeedbackService } from '../../_services/feedback.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment/moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback-review',
  templateUrl: './feedback-review.component.html'
})
export class AdminFeedbackReviewComponent implements OnInit {
  @Input() result: any;
  entries: any;

  constructor(
    private http: HttpClient,
    private service: FeedbackService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    // get all the feedback data and format the date values
    this.service.getAll().subscribe(res => {
      for (const entry in res) {
        if (res[entry]) {
          res[entry].created = moment(res[entry].created).format('MM-DD-YYYY');
        }
      }
      this.entries = res;
    });
  }

  // download report of feedback
  downloadReport() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: false
    };

    // initialize report with a headers row
    const orderedFeedback = [{
      created: 'Date',
      forests: 'Forest\s',
      message: 'Feedback'
    }];

    // push the values in to the rows in order that matches table headers
    for (const entry of this.entries) {
      orderedFeedback.push({
        created: entry.created,
        forests: entry.forests,
        message: entry.message
      });
    }

    const ng2csv = new AngularCsv(orderedFeedback, 'Feedback Report', options);
  }
}
