import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {

  person: any;


  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.person = navParams.get('data');
    console.log(this.person);
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad DetailsPage');
  }

  

}
