import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  constructor(public navCtrl: NavController) {

  }

  searchNames(event: any) {
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

}
