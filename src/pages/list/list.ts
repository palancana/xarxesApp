import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DetailsPage } from '../details/details';

import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {

  people: any;
  name: any;
  wiki: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {

    this.name = navParams.get('data');
  }

  delete(chip: Element) {
    chip.remove();
  }

  showDetailOf(person: any) {
    //console.log(person);
    this.navCtrl.push(DetailsPage, {
      data: person
    });
  }

  ionViewDidLoad() {

    const searchUrl = 'http://158.109.8.76/xarxes/?c=app&a=cercar';

    let headers = new Headers();
    headers.append('APPXARXES', '1');

    let body = new FormData();
    
    if (this.name.split(" ").length > 1) {
      let nameOnly = this.name.substr(0,this.name.indexOf(' '));
      let lastNameOnly = this.name.substr(this.name.indexOf(' ')+1);
      body.append('n', nameOnly);
      body.append('c', lastNameOnly);
    } else {
      body.append('n', this.name);
    }

    this.http.post(searchUrl, body, {headers: headers})
      .map(res => res.json())
      .subscribe(data => {
        this.people = data.persones;
      });
      
  }

}
