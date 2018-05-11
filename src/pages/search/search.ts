import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ListPage } from '../list/list';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  constructor(public navCtrl: NavController) {

  }

  searchNamesButton(name) {
    name = name || '';

    this.navCtrl.push(ListPage, {data: name});
}

}
