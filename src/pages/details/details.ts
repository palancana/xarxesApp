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
      },
      familyName: {
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

  //Gets the needed entity data into JS objects to use them in HTML
  //Can be edited to have a fallback in the near future
  getEntityData(entity, obj) {

    //Gets label
    if (entity.labels.hasOwnProperty('ca')) {
      //Has Catalan label
      this.card[obj].label = entity.labels.ca;
    } else {
      //Does not have Catalan description
      this.card[obj].label = entity.labels.en;
    }

    //Gets descriptions
    if (entity.descriptions.hasOwnProperty('ca')) {
      //Has Catalan description
      this.card[obj].description = entity.descriptions.ca;
    } else {
      //Does not have Catalan description
      this.card[obj].description = entity.descriptions.en;
    }

    //Gets image
    if (entity.claims.hasOwnProperty('P18')) {
      //Has image property
      this.card[obj].image = wdk.getImageUrl(entity.claims.P18[0], 250);
    } else {
      //Does not have image property
      this.card[obj].image = './assets/imgs/default_card_image.png';
    }

    //Gets link
    if (entity.sitelinks.hasOwnProperty('cawiki')) {
      //Has Catalan Wikipedia link
      this.card[obj].link = entity.sitelinks.cawiki.url;
    } else {
      //Does not have Catalan Wikipedia link
      this.card[obj].link = '';
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

            this.getEntityData(entity, 'person');
            
            });
      });
  }

  retrieveFamilyNameCard() {
    //Splits the name in an array using the space delimeter
    var familyNames = this.person.name.split(" ");
    //Takes out of the array the first element, which is the name, to leave only family names
    familyNames.shift();

    //Goes through all the family names, iterates the array
    for (var i = 0; i < familyNames.length; i++) {
      //console.log(familyNames[i]);
      //Do something
    }

    const familyName = 'Brown';
    const sparqlq = `
      SELECT ?item ?itemLabel ?articleEN ?articleES ?articleCA ?articleDE WHERE {
        ?item wdt:P31 wd:Q101352.
        ?item ?label "${familyName}"@en.
        OPTIONAL{?articleEN schema:about ?item .
        ?articleEN schema:isPartOf <https://en.wikipedia.org/>.}
        OPTIONAL{?articleES schema:about ?item .
        ?articleES schema:isPartOf <https://es.wikipedia.org/>.}
        OPTIONAL{?articleCA schema:about ?item .
        ?articleCA schema:isPartOf <https://ca.wikipedia.org/>.}
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT 1
      `
    const url = wdk.sparqlQuery(sparqlq);

    this.http.get(this.searchUrl.ca).map(res => res.json()).subscribe(
      data => {
        console.log(data);
        //var entity = wdk.simplify.entity(data.search[0], {addUrl: true});
        //console.log(entity);
      });

    /*
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

            this.getEntityData(entity, 'person');
            
            });
      });
  }
  */
  }


}
