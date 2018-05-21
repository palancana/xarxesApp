import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
declare var require: any;
var wdk = require("wikidata-sdk");

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

  personEntity: any;

  id: any;
  label: any;
  description: any;
  entity: any;
  personImage: any;
  personLink: any;
  personCard: any;



  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {

    this.person = navParams.get('data');

    /*
        //this.http.get('https://en.wikipedia.org/w/api.php?action=opensearch&search='+this.name+'&limit=1&format=json&origin=*').subscribe(
   this.http.get('https://en.wikipedia.org/w/api.php?action=query&formatversion=2&prop=pageimages%7Cpageterms&titles='+this.person.name+'&format=json&origin=*').subscribe(
    data => {
          this.personCard = data.json();
          console.log(this.personCard);
      });
    */

    //Retrieves the name card information
    const searchUrl = wdk.searchEntities({
      search: this.person.name,
      limit: 1,
      language: 'ca'
    });

    this.http.get(searchUrl).map(res => res.json()).subscribe(
      data => {
          this.id = data.search[0].id;
          this.label = data.search[0].label;
          this.description = data.search[0].description;
          

          const getUrl = wdk.getEntities({
            ids: this.id,
            languages: ['ca'], // returns all languages if not specified
            //props: ['P31'], // returns all data if not specified
            format: 'json' // defaults to json
          })


          this.http.get(getUrl).map(res => res.json()).subscribe(
            data => {
 
              

              this.entity = data.entities[this.id];
              if (this.entity.claims.hasOwnProperty('P18')) {
                //Has image property
                const simplifiedP18Claim = wdk.simplify.claim(this.entity.claims.P18[0]);
                this.personImage = wdk.getImageUrl(simplifiedP18Claim, 250);
              } else {
                //Does not have image property
                this.personImage = './assets/imgs/default_card_image.png';
              }

              if (this.entity.sitelinks.hasOwnProperty('cawiki')) {
                //Has Catalan Wikipedia link
                const simplifiedSiteLinks = wdk.simplify.sitelinks(this.entity.sitelinks, { addUrl: true });
                this.personLink = simplifiedSiteLinks.cawiki.url;

              } else {
                //Does not have Catalan Wikipedia link
                this.personLink = '';
              }

          
            });

      });

  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad DetailsPage');
  }

  

}
