import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { FavoritesPage } from '../favorites/favorites';
import { ListPage } from '../list/list';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  films: Observable<any>;

  constructor(public navCtrl: NavController, public httpClient: HttpClient) {
    this.films = this.httpClient.get('https://swapi.co/api/films');
    this.films.subscribe(data => {console.log('my data: ', data);})


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

  searchNamesButton(event, film) {
    this.navCtrl.push(ListPage, {film: film});
}

}
