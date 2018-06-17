import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ListPage } from '../list/list';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  shouldHide: any;
  filtersButtonText: any;

  dual :any;
  text:1;
  knobValues: any = {
    upper:1959,
    lower:1845
}

  constructor(public navCtrl: NavController, private keyboard: Keyboard) {
    this.dual = this.dual;
    this.shouldHide = true;
    this.filtersButtonText = "+ filtres";
    keyboard.disableScroll(true);
  }

  showHideBox() {
    /*
    if (this.shouldHide == true) {
      this.shouldHide = false;
      this.filtersButtonText = "- filtres";
    } else {
      this.shouldHide = true;
      this.filtersButtonText = "+ filtres";
    }
    */

  }

  searchNamesButton(name) {
    name = name || '';

    this.navCtrl.push(ListPage, {data: name});
}

}
