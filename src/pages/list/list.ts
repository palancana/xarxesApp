import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DetailsPage } from '../details/details';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {

  peoples: any;
  name: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {

    this.name = navParams.get('data');
    //console.log(this.name);

    this.http.get('https://swapi.co/api/people/?search='+ this.name).map(res => res.json()).subscribe(
      data => {
          this.peoples = data.results;
          //console.log(this.peoples);
      },
      err => {
          console.log("Oops!");
      }
    );


    /*
    this.peoples = [
      'Pedro Dot Martinez',
      'Eduard Garcia Díaz',
      'Jose Antonio Perez',
      'Maria Granada Cuenca',
      'Lorena Garcia',
      'Dolores Fuertes',
      'Jimena Jimenez',
      'Aitor Tilla',
    ];
    */
  }


  showDetailOf(person: any) {
    //console.log(person);
    this.navCtrl.push(DetailsPage, {
      data: person
    });
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ListPage');
  }

}
