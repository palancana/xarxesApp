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
    var t0 = performance.now();

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
      var t1 = performance.now();
      console.log("Call to retrievePersonCard took " + (t1 - t0) + " milliseconds.");
  }

  retrieveFamilyNameCard() {
    var t0 = performance.now();
    //Splits the name in an array using the space delimeter
    var familyNames = this.person.name.split(" ");
    //Takes out of the array the first element, which is the name, to leave only family names
    familyNames.shift();

    //Goes through all the family names, iterates the array
    for (var i = 0; i < familyNames.length; i++) {
      //console.log(familyNames[i]);
      //Do something
    }

    const familyName = 'Rodriguez'; //${familyName}
    //Querys the needed data and has a fallback (ca => es => en) regarding itemLabel and itemDescription
    const sparql = `
      SELECT ?item ?itemLabel ?itemDescription ?image ?articleEN ?articleES ?articleCA ?articleDE WHERE {
        ?item wdt:P31 wd:Q101352.
        ?item ?label "${familyNames[0]}"@en.
        OPTIONAL { ?item wdt:P18 ?image }
        OPTIONAL{?articleEN schema:about ?item .
        ?articleEN schema:isPartOf <https://en.wikipedia.org/>.}
        OPTIONAL{?articleES schema:about ?item .
        ?articleES schema:isPartOf <https://es.wikipedia.org/>.}
        OPTIONAL{?articleCA schema:about ?item .
        ?articleCA schema:isPartOf <https://ca.wikipedia.org/>.}
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ca, es, en". }
      } LIMIT 1
    `

    const url = wdk.sparqlQuery(sparql);

    this.http.get(url).map(res => res.json()).subscribe(
      data => {
        console.log(data);

        //Retrieves the id
        if (data.results.bindings[0].hasOwnProperty('item')) {
          this.card.familyName.id = data.results.bindings[0].item.value;
        } else {
          this.card.familyName.id = 'none';
        }

        //Retrieves the label
        if (data.results.bindings[0].hasOwnProperty('itemLabel')) {
          this.card.familyName.label = data.results.bindings[0].itemLabel.value;
        } else {
          this.card.familyName.label = 'none';
        }

        //Retrieves the description
        if (data.results.bindings[0].hasOwnProperty('itemDescription')) {
          this.card.familyName.description = data.results.bindings[0].itemDescription.value;
        } else {
          this.card.familyName.description = 'none';
        }

        //Retrieves the image
        if (data.results.bindings[0].hasOwnProperty('image')) {
          this.card.familyName.image = (data.results.bindings[0].image.value + '?width=250');
        } else {
          this.card.familyName.image = './assets/imgs/default_card_image.png';
        }

        //Retrieves the link. Can make a fallback in the future.
        if (data.results.bindings[0].hasOwnProperty('articleES')) {
          this.card.familyName.link = data.results.bindings[0].articleES.value;
        } else {
          this.card.familyName.link = 'none';
        }

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
    var t1 = performance.now();
    console.log("Call to retrieveFamilyNameCard took " + (t1 - t0) + " milliseconds.");
  }


}
