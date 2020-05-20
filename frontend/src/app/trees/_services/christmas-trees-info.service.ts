/* tslint:disable:no-shadowed-variable prefer-const */


import {mergeMap, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as moment from 'moment/moment';

@Injectable()
export class ChristmasTreesInfoService {
  private endpoint = environment.apiUrl + 'forests/';
  private CUTTING_AREA_KEYS = ['ELKCREEK', 'REDFEATHERLAKES', 'SULPHUR', 'CANYONLAKES'];

  constructor(private http: HttpClient) {}

  /**
   * @returns all forests
   */
  getAll() {
    return this.http.get(this.endpoint);
  }

  /**
   * @returns forest by id
   */
  getOne(id) {
    return this.http.get<any>(this.endpoint + id).pipe(mergeMap(forest =>
      this.getJSON(forest.forestAbbr).pipe(map(forestJSON => {
        forest.species = forestJSON.treeSpecies;
        return forest;
      }))
    ));
  }

  /**
   * @returns forest by id with markdown content
   */
  getForestWithContent(id) {
    let content;
    return this.http.get<any>(this.endpoint + id).pipe(mergeMap(forest =>
      this.joinMdRequests(forest).pipe(mergeMap(content =>
        this.getJSON(forest.forestAbbr).pipe(map(forestJSON => {
          forest.species = forestJSON.treeSpecies;
          forest.content = this.nameMdArray(content, forest);
          return forest;
        }))
      ))
    ));
  }

  /**
   * @returns forest specific json
   */
  getJSON(forest): Observable<any> {
    return this.http.get('assets/config/christmasTreesForests-' + forest + '.json');
  }

  /**
   * @returns array of markdown file paths
   */
  nameMdArray(content, forest) {
    const files = {};
    let i = 0;
    for (let key in this.getMdUrls(forest)) {
      if (key) {
        files[key] = content[i];
        i++;
      }
    }
    return files;
  }

  /**
   * @returns fork join of markdown requests
   */
  joinMdRequests(forest) {
    const mdFiles = this.getMdFiles(forest);
    const requests = Object.keys(mdFiles).map(val => mdFiles[val]);
    return forkJoin(requests);
  }

  /**
   * @returns configure each markdown file that will be added to the forest.content
   */
  getMdUrls(forest) {
    return {
      introduction: `${forest.forestAbbr}/introduction.md`,
      contactUs: `${forest.forestAbbr}/contact-us.md`,
      forestContact: `${forest.forestAbbr}/forest-contact.md`,
      beforeYouCut: `${forest.forestAbbr}/how-to-cut/helpful-tips.md`,
      whenYouCut: `${forest.forestAbbr}/how-to-cut/measuring.md`,
      whenToCutInfo: `${forest.forestAbbr}/when-to-cut-your-tree.md`,
      whereToCutCuttingAreaMaps: `${forest.forestAbbr}/where-to-cut-your-tree/cutting-area-maps.md`,
      whereToCutProhibited: `${forest.forestAbbr}/where-to-cut-your-tree/prohibited-areas.md`,
      howToPlanYourTrip: `${forest.forestAbbr}/how-to-plan-your-trip.md`,
      rules: `${forest.forestAbbr}/tree-cutting-rules.md`,
      permitRules: `common/permit-rules.md`
    };
  }

  /**
   * @returns Markdown request
   */
  getText(url) {
    return this.http.get(url, { responseType: 'text' });
  }

  /**
   * @returns array of markdown requests
   */
  getMdFiles(forest) {
    let result = {};
    const urls = this.getMdUrls(forest);
    for (let url in urls) {
      if (url) {
        result[url] = this.getText(`/assets/content/${urls[url]}`);
      }
    }

    return result;
  }

  /**
   * @returns cutting area text with variables replaced with forest specific text
   */
  parseCuttingAreaMarkdown(text, forest) {
    for (const key of this.CUTTING_AREA_KEYS) {
      if (text.indexOf(key) > -1) {
        const jsonKey = key.toUpperCase();
        const cuttingAreas = forest.cuttingAreas;
        text = this.replaceCuttingAreaText(text, key, forest, cuttingAreas, jsonKey);
      }
    }

    return text;
  }
  /**
  * @returns find and replace cutting area date and time
  */
  replaceCuttingAreaText (text, key, forest, cuttingAreas, jsonKey) {
    if (cuttingAreas[jsonKey] && cuttingAreas[jsonKey].startDate) {
      return text
        .replace(
          '{{' + key + 'Date}}',
          this.formatCuttingAreaDate(forest, cuttingAreas[jsonKey].startDate, cuttingAreas[jsonKey].endDate)
        )
        .replace(
          '{{' + key + 'Time}}',
          this.formatCuttingAreaTime(forest, cuttingAreas[jsonKey].startDate, cuttingAreas[jsonKey].endDate)
        );
    }
  }

  /**
   * @returns cutting area dates text with variables replaced with forest specific text
   */
  formatCuttingAreaDate(forest, startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    let startFormat = 'MMM D -';
    let endFormat = ' D, YYYY';

    if (start.month() !== end.month()) {
      endFormat = ' MMM D, YYYY';
    }
    if (start.year() !== end.year()) {
      startFormat = 'MMM D, YYYY - ';
    }
    return start.format(startFormat) + end.format(endFormat);
  }

  /**
   * @returns cutting area time text with variables replaced with forest specific text
   */
  formatCuttingAreaTime(forest, startDate, endDate) {
    const start = moment(startDate)
      .format('h:mm a - ');
    return (
      start +
      moment(endDate)
        .format('h:mm a')
    );
  }

  /**
   * @returns formatted map description text
   */
  updateMapDescriptionLinks(text) {
    if (text.indexOf('map description') > -1) {
      text = `<span class='screen-reader-only'>${text}</span>`;
    }
    return text;
  }

  /**
   * @returns Replace variables in markdown files with forest specific text.
   */
  updateMarkdownText(markdownService, forest) {
    markdownService.renderer.text = (text: string) => {
      const replaceArray = Object.keys(forest);
      if (forest && text.indexOf('{{') > -1) {
        text = this.replaceText(forest, text, replaceArray);
        return text;
      }
      text = this.updateMapDescriptionLinks(text);
      return text;
    };

    markdownService.renderer.heading = (text, level) => {
      return `<h${level}>${text}</h${level}>`;
    };
  }

  /**
   * iterate and replace text for the cutting areas
   */
  replaceText(forest, text, replaceArray) {
    for (let i = 0; i < replaceArray.length; i++) {
      text = text.replace(new RegExp('{{' + replaceArray[i] + '}}', 'gi'), forest[replaceArray[i]]);
      if (forest.cuttingAreas) {
        text = this.parseCuttingAreaMarkdown(text, forest); // cutting areas are handled special from other variables
      }
    }
    return text;
  }
}
