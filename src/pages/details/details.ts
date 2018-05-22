import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
declare var require: any;
var wdk = require("wikidata-sdk");


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
  title: any;
  description: any;
  image: any;
  link: any;
  entity: any;
  personImage: any;
  personLink: any;

  searchUrl: any;
  card: any;





  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {

    this.searchUrl = {
      ca: '',
      en: '',
      es: '',
    }

    this.card = {
      person: {
        id: '', //yes
        label: '', //yes
        description: '', //yes
        image: '', //yes
        link: '', //yes
      },
      historicalContext: {
        id: '',
        label: '',
        description: '',
        image: '',
        link: ''
      }
    };

    this.person = navParams.get('data');
    this.retrievePersonCard();

    this.retrieveFamilyNameCard();


  }

  ionViewDidLoad() {
    
  }

  getEntityData(entity) {

    //Gets label
    if (entity.labels.hasOwnProperty('ca')) {
      //Has Catalan label
      this.card.person.label = entity.labels.ca;
    } else {
      //Does not have Catalan description
      this.card.person.label = entity.labels.en;
    }

    //Gets descriptions
    if (entity.descriptions.hasOwnProperty('ca')) {
      //Has Catalan description
      this.card.person.description = entity.descriptions.ca;
    } else {
      //Does not have Catalan description
      this.card.person.description = entity.descriptions.en;
    }

    //Gets image
    if (entity.claims.hasOwnProperty('P18')) {
      //Has image property
      this.card.person.image = wdk.getImageUrl(entity.claims.P18[0], 250);
    } else {
      //Does not have image property
      this.card.person.image = './assets/imgs/default_card_image.png';
    }

    //Gets link
    if (entity.sitelinks.hasOwnProperty('cawiki')) {
      //Has Catalan Wikipedia link
      this.card.person.link = entity.sitelinks.cawiki.url;
    } else {
      //Does not have Catalan Wikipedia link
      this.card.person.link = '';
    }

  }

  //Retrieves the person card information
  retrievePersonCard() {

    this.searchUrl.ca = wdk.searchEntities({
      search: this.person.name,
      limit: 1,
      language: 'ca'
    });

    this.http.get(this.searchUrl.ca).map(res => res.json()).subscribe(
      data => {

        this.card.person.id = data.search[0].id;

        const getUrl = wdk.getEntities({
          ids: this.card.person.id,
          languages: ['ca', 'es', 'en'], // returns all languages if not specified
          props: ['claims', 'descriptions', 'labels', 'sitelinks'], // returns all data if not specified
          format: 'json' // defaults to json
        })

        this.http.get(getUrl).map(res => res.json()).subscribe(
          data => {
 
            var entity = wdk.simplify.entity(data.entities[this.card.person.id], {addUrl: true});
            console.log(entity);

            this.getEntityData(entity);
            
            });
      });
  }




  retrieveFamilyNameCard() {
    var spl = this.person.name.split(" ");
    //console.log(spl[0]);

  }



  

}
