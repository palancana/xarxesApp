import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { shouldCallLifecycleInitHook } from '@angular/core/src/view';
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

  fallback: any;

  personCard: any;
  familyNameCard: any;
  historicalContextCards: any;



  hidePersonCard: boolean;
  hideFamilyNameCard: boolean;
  hideOccupationCard: boolean;
  hideHistoricalContextCards: boolean;



  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public http: Http, private camera: Camera, public plt: Platform) {

    this.hidePersonCard = true;
    this.hideFamilyNameCard = true;
    this.hideOccupationCard = true;
    this.hideHistoricalContextCards = true;


    //Sets de fallback method for the queries
    var fallback = 'ca,es,en';

    this.searchUrl = {
      ca: '',
      en: '',
      es: '',
    }

    this.personCard = {
        id: '', //yes
        label: '', //yes
        description: '', //yes
        image: '', //yes
        link: '', //yes
      };

    this.card = {
      occupation: {
        id: '',
        label: '',
        description: '',
        image: '',
        link: ''
      }
    };

    this.person = navParams.get('data');

    /*
    if (this.person.imatgeCara = "http://158.109.8.76/xarxes/images/fictional/placeholder.png") {
      this.person.imatgeCara = "./assets/imgs/default_person_image.png";
    }
    */
    this.retrievePersonCard();
    this.retrieveFamilyNameCardSparql();
    this.retrieveOccupationCardSparql();

    this.retrieveHistoricalContextCardSparql();

  }

  ionViewDidLoad() {
    
  }

  //Gets the needed entity data into JS objects to use them in HTML
  //Can be edited to have a fallback in the near future
  getEntityData(entity) {

    //Gets label
    if (entity.labels.hasOwnProperty('ca')) {
      //Has Catalan label
      this.personCard.label = entity.labels.ca;
    } else {
      //Does not have Catalan description
      this.personCard.label = entity.labels.en;
    }

    //Gets descriptions
    if (entity.descriptions.hasOwnProperty('ca')) {
      //Has Catalan description
      this.personCard.description = entity.descriptions.ca;
    } else {
      //Does not have Catalan description
      this.personCard.description = entity.descriptions.en;
    }

    //Gets image
    if (entity.claims.hasOwnProperty('P18')) {
      //Has image property
      this.personCard.image = wdk.getImageUrl(entity.claims.P18[0], 250);
    } else {
      //Does not have image property
      this.personCard.image = './assets/imgs/default_card_image.png';
    }

    //Gets link
    if (entity.sitelinks.hasOwnProperty('cawiki')) {
      //Has Catalan Wikipedia link
      this.personCard.link = entity.sitelinks.cawiki.url;
    } else {
      //Does not have Catalan Wikipedia link
      this.personCard.link = '';
    }

  }

  retrievePersonCard() {
    var t0 = performance.now();

    //Gathers together the complete name of the person
    let name = this.person.nom + ' ' + this.person.cognom1 + ' ' + this.person.cognom2;

    //Searches Wikidata for entities
    this.searchUrl.ca = wdk.searchEntities({
      search: name,
      limit: 1,
      language: 'en'
    });

    this.http.get(this.searchUrl.ca).map(res => res.json()).subscribe(
      data => {

        if (data.search.length != 0 ) {
          this.hidePersonCard = false;
          this.personCard.id = data.search[0].id;
        
          const getUrl = wdk.getEntities({
            ids: this.personCard.id,
            languages: ['ca', 'es', 'en'], // returns all languages if not specified
            props: ['claims', 'descriptions', 'labels', 'sitelinks'], // returns all data if not specified
            format: 'json' // defaults to json
          })

          this.http.get(getUrl).map(res => res.json()).subscribe(
            data => {
  
              var entity = wdk.simplify.entity(data.entities[this.personCard.id], {addUrl: true});

              this.getEntityData(entity);

              var t1 = performance.now();
              console.log("Call to retrievePersonCard took " + (t1 - t0) + " milliseconds.");
              
              });
        }
      });
      

  }

  retrieveFamilyNameCardSparql(){
    var t0 = performance.now();

    //Converts first letter to Upper Case
    let cognom1 = this.person.cognom1.charAt(0).toUpperCase() + this.person.cognom1.slice(1);

    //Querys the needed data and has a fallback regarding itemLabel and itemDescription
    //The results are shown in ascending date order
    const sparql = `
    SELECT ?item ?itemLabel ?itemDescription ?image ?articleEN ?articleES ?articleCA WHERE {
      ?item wdt:P31/wdt:P279* wd:Q101352 .
      ?item ?label "${cognom1}"@en.
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

        //Proceed if data contains at least one result
        if (data.results.bindings.length != 0 ) {

          //Simplify the results in an object
          this.familyNameCard = wdk.simplifySparqlResults(data);

          //Iterates through all the results and makes sure there's information inside to avoid errors:
          //if the content is undefined, the next var is set and so on
          for (let i in this.familyNameCard) {

            //Default card view is hidden until we can check if a link to the Wiki exists
            this.familyNameCard[i].hide = true;

            //Retrieves the article link and makes a fallback (ca => es => en)
            this.familyNameCard[i].link = this.familyNameCard[i].articleCA 
              || this.familyNameCard[i].articleES 
              || this.familyNameCard[i].articleEN 
              || '';
              
            //Only shows the card if it has a link to the wiki
            if (this.familyNameCard[i].link != '') {

              //Enable HTML view and single card view
              this.hideFamilyNameCard = false;
              this.familyNameCard[i].hide = false;

              //Check label content
              this.familyNameCard[i].item.label = this.familyNameCard[i].item.label 
                || '';

              //Check description content
              this.familyNameCard[i].itemDescription = this.familyNameCard[i].itemDescription 
                || '';

              //Check image content, if there's no image, default image is shown
              this.familyNameCard[i].image = this.familyNameCard[i].image 
                || './assets/imgs/default_card_image.png'
            } else {
              console.log('Family name card: Wikidata entry exists but does not have a Wikipedia article');
            }



        }

        var t1 = performance.now();
        console.log("Call to retrieveFamilyNameCard took " + (t1 - t0) + " milliseconds.");
      }
    });
  }

  retrieveOccupationCardSparql(){
    var t0 = performance.now();
    
    //Job to be searched in Spanish (as found in the database)
    let occupation = "medico";

    //Querys the needed data and has a fallback (ca => es => en) regarding itemLabel and itemDescription
    const sparql = `
      SELECT ?item ?itemLabel ?itemDescription ?image ?articleEN ?articleES ?articleCA WHERE {
        ?item wdt:P31 wd:Q28640.
        ?item ?label "${occupation}"@es.
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

        if (data.results.bindings.length != 0 ) {
          this.hideOccupationCard = false;

        //Retrieves the id
        if (data.results.bindings[0].hasOwnProperty('item')) {
          this.card.occupation.id = data.results.bindings[0].item.value;
        } else {
          this.card.occupation.id = 'none';
        }

        //Retrieves the label
        if (data.results.bindings[0].hasOwnProperty('itemLabel')) {
          this.card.occupation.label = data.results.bindings[0].itemLabel.value;
        } else {
          this.card.occupation.label = 'none';
        }

        //Retrieves the description
        if (data.results.bindings[0].hasOwnProperty('itemDescription')) {
          this.card.occupation.description = data.results.bindings[0].itemDescription.value;
        } else {
          this.card.occupation.description = 'none';
        }

        //Retrieves the image
        if (data.results.bindings[0].hasOwnProperty('image')) {
          this.card.occupation.image = (data.results.bindings[0].image.value + '?width=250');
        } else {
          this.card.occupation.image = './assets/imgs/default_card_image.png';
        }

        //Retrieves the link. Can make a fallback in the future.
        if (data.results.bindings[0].hasOwnProperty('articleES')) {
          this.card.occupation.link = data.results.bindings[0].articleES.value;
        } else {
          this.card.occupation.link = 'none';
        }
        var t1 = performance.now();
        console.log("Call to retrieveOccupationCard took " + (t1 - t0) + " milliseconds.");
      }
      });

  }

 retrieveHistoricalContextCardSparql(){
  var t0 = performance.now();

  //Only retrieves this information if there exists information of when the person was born
  if (this.person.dataNaix != '') {

    //Extracts the year from a string in which the person was born
    let start = this.person.dataNaix.split("/").pop();

    //Extracts the year from a string in which the person was dead
    //If it is not available, it makes an assumption of 70 years
    let averageLifeExpectancy = 70;
    let end = this.person.dataMort.split("/").pop()
      || (Number(start) + averageLifeExpectancy);

    //Sets de fallback method for the query
    let fallback = 'ca,es,en';

    //Querys the needed data and has a fallback regarding itemLabel and itemDescription
    //The results are shown in ascending date order
    const sparql = `
      SELECT ?item ?itemLabel ?itemDescription ?startDate ?endDate ?image ?articleEN ?articleES ?articleCA
      WHERE
      {
        ?item wdt:P31/wdt:P279* wd:Q198 .
        ?item wdt:P17 wd:Q29 .
        filter ((?pointInTime > "${start}-01-01"^^xsd:dateTime && ?pointInTime < "${end}-01-01"^^xsd:dateTime) ||
                (?startDate > "${start}-01-01"^^xsd:dateTime && ?startDate < "${end}-01-01"^^xsd:dateTime))
        OPTIONAL { ?item wdt:P18 ?image }
        OPTIONAL{?articleEN schema:about ?item .
          ?articleEN schema:isPartOf <https://en.wikipedia.org/>.}
        OPTIONAL{?articleES schema:about ?item .
          ?articleES schema:isPartOf <https://es.wikipedia.org/>.}
        OPTIONAL{?articleCA schema:about ?item .
          ?articleCA schema:isPartOf <https://ca.wikipedia.org/>.}
        OPTIONAL {
          ?item wdt:P585 ?startDate .
        }
        OPTIONAL {
          ?item wdt:P580 ?startDate .
        }
        OPTIONAL {
          ?item wdt:P582 ?endDate .
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language"${fallback}". }
      }
      ORDER BY ASC(?startDate)
    `
    
    const url = wdk.sparqlQuery(sparql);

    this.http.get(url).map(res => res.json()).subscribe(
      data => {

        //Proceed if data contains at least one result
        if (data.results.bindings.length != 0 ) {

          //Simplify the results in an object
          this.historicalContextCards = wdk.simplifySparqlResults(data);

          //Iterates through all the results and makes sure there's information inside to avoid errors:
          //if the content is undefined, the next var is set and so on
          for (let i in this.historicalContextCards) {

            //Default card view is hidden until we can check if a link to the Wiki exists
            this.historicalContextCards[i].hide = true;

            //Retrieves the article link and makes a fallback (ca => es => en)
            this.historicalContextCards[i].link = this.historicalContextCards[i].articleCA 
              || this.historicalContextCards[i].articleES 
              || this.historicalContextCards[i].articleEN 
              || '';

            //Only shows the card if it has a link to the wiki
            if (this.historicalContextCards[i].link != '') {

              //Enable HTML view and single card view
              this.hideHistoricalContextCards = false;
              this.historicalContextCards[i].hide = false;

              console.log(this.historicalContextCards[i].hide);

              //Check label content
              this.historicalContextCards[i].item.label = this.historicalContextCards[i].item.label 
                || '';

              //Check description content
              this.historicalContextCards[i].itemDescription = this.historicalContextCards[i].itemDescription 
                || '';

              //Check image content, if there's no image, default image is shown
              this.historicalContextCards[i].image = this.historicalContextCards[i].image 
                || './assets/imgs/default_card_image.png'

              //Retrieves the event start date, simplifies it and extracts the year
              this.historicalContextCards[i].date = wdk.wikidataTimeToSimpleDay(this.historicalContextCards[i].startDate
                || '').split('-').shift(); 
              console.log(this.historicalContextCards[i].date);

            }

        }
        var t1 = performance.now();
        console.log("Call to retrieveHistoricalContextCards took " + (t1 - t0) + " milliseconds.");
      }
    });
  }

}

  openCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64:
     let base64Image = 'data:image/jpeg;base64,' + imageData;
     console.log(base64Image); //Do something with the base64 image
    }, (err) => {
     // Handle error
    });
  }

}
