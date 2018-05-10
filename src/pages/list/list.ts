import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DetailsPage } from '../details/details';

/**
 * Generated class for the ListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {

  peoples: any;

  name: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.name = navParams.get('data');
    console.log(this.name);

    this.peoples = [
      'Pedro Dot Martinez',
      'Eduard Garcia Díaz',
      'Jose Antonio Perez',
      'Maria Granada Cuenca',
      'Lorena Garcia',
      'Dolores Fuertes',
      'Jimena Jimenez',
      'Aitor Tilla',
      'Pedro Dot Martinez',
      'Eduard Garcia Díaz',
      'Jose Antonio Perez',
      'Maria Granada Cuenca',
      'Lorena Garcia',
      'Dolores Fuertes',
      'Pedro Dot Martinez',
      'Eduard Garcia Díaz',
      'Jose Antonio Perez',
      'Maria Granada Cuenca',
      'Lorena Garcia',
      'Dolores Fuertes'
    ];
  }


  showDetailOf(person: any) {
    console.log(person);
    this.navCtrl.push(DetailsPage, {
      item: person
    });
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ListPage');
  }

}
