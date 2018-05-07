import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { FavoritesPage } from '../favorites/favorites';
import { ListPage } from '../list/list';

//import { Http } from '@angular/http';
//import 'rxjs/add/operator/map';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  name: any;

  //posts: any;

  // Constructor needed for http get: public http:Http
  constructor(public navCtrl: NavController) {

    /* Access a JSON so the HTML can read it
    this.http.get('https://swapi.co/api/films/?format=json').map(res => res.json()).subscribe(
      data => {
          this.posts = data.results;
          console.log(this.posts);
      },
      err => {
          console.log("Oops!");
      }
    );
    */
  
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

  searchNamesButton(name) {
    console.log(this.name);
    //this.navCtrl.push(ListPage, {name: name});
}

}
