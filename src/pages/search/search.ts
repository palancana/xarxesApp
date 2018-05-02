import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FavoritesPage } from '../favorites/favorites';
import { ListPage } from '../list/list';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  constructor(public navCtrl: NavController) {

  }

  searchNamesInput(event: any) {
    // set val to the value of the searchbar
    var searchValue = event.target.value;

    // if the value is an empty string don't filter the items
    if (searchValue && searchValue.trim() != '') {
      console.log(searchValue);
      /* Do things
      this.items = this.items.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
      */
    }
  }

  searchNamesButton(event, item) {
    this.navCtrl.push(ListPage, {
      item: item
    });
}

}
