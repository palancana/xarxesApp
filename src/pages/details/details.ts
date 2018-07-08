import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';

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

  personCard: any;
  occupationCard: any;
  familyNameCard: any;
  historicalContextCards: any;

  hidePersonCard: boolean;
  hideFamilyNameCard: boolean;
  hideOccupationCard: boolean;
  hideHistoricalContextCards: boolean;

  cameraImage: any;
  photoTaken: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public http: Http, private camera: Camera, public plt: Platform) {

    this.hidePersonCard = true;
    this.hideFamilyNameCard = true;
    this.hideOccupationCard = true;
    this.hideHistoricalContextCards = true;
    this.photoTaken = false;

    this.personCard = {
        id: '',
        label: '',
        description: '',
        image: '',
        link: '',
        jobs: ''
      };

    this.person = navParams.get('data');

  }

  ionViewDidLoad() {
    //If the image is the placeholder it replaces it with a generic image that aims
    //the user to click on it to take a photo
    this.checkImage();
    
    this.retrievePersonCard();
    //Occupation is retrieved from personCard. The function is called inside retrievePersonCard()
    //This function is to retrieve jobs from the XARXES database in case the occupation
    //is added to the people search in the future:
    //this.retrieveOccupationCardByDatabaseSparql();
    this.retrieveFamilyNameCard();
    this.retrieveHistoricalContextCard();
  }

  checkImage() {
    if (this.person.imatgeCara = 'http://158.109.8.76/xarxes/images/fictional/placeholder.png') {
      this.person.imatgeCara = "./assets/imgs/default_person_image.png";
    }
  }

  //Gets the needed entity data into JS objects to use them in HTML
  //Can be edited to have a fallback in the near future
  getPersonEntityData(entity) {

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

    //Gets jobs
    if (entity.claims.hasOwnProperty('P106')) {
      //Has image property
      this.personCard.jobs = entity.claims.P106;
    } else {
      //Does not jobs property
      this.personCard.jobs = '';
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
    const url = wdk.searchEntities({
      search: name,
      limit: 1,
      language: 'en'
    });

    this.http.get(url).map(res => res.json()).subscribe(
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
              console.log(entity);
              this.getPersonEntityData(entity);

              this.retrieveOccupationCardByPersonCard();

              var t1 = performance.now();
              console.log("Call to retrievePersonCard took " + (t1 - t0) + " milliseconds.");
              
              });
        }
      });
      

  }

  retrieveOccupationCardByPersonCard(){
    //Sets de fallback method for the query
    let fallback = 'ca,es,en';

    //Querys the needed data and has a fallback regarding itemLabel and itemDescription
    const sparql = `
    SELECT ?item ?itemLabel ?itemDescription ?image ?articleEN ?articleES ?articleCA WHERE {
      BIND(wd:${this.personCard.jobs[0]} AS ?item)
      OPTIONAL { ?item wdt:P18 ?image }
      OPTIONAL{?articleEN schema:about ?item .
      ?articleEN schema:isPartOf <https://en.wikipedia.org/>.}
      OPTIONAL{?articleES schema:about ?item .
      ?articleES schema:isPartOf <https://es.wikipedia.org/>.}
      OPTIONAL{?articleCA schema:about ?item .
      ?articleCA schema:isPartOf <https://ca.wikipedia.org/>.}
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${fallback}". }
      } LIMIT 1
    `

    const url = wdk.sparqlQuery(sparql);

    this.http.get(url).map(res => res.json()).subscribe(
      data => {

        //Proceed if data contains at least one result
        if (data.results.bindings.length != 0 ) {

          //Simplify the results in an object
          this.occupationCard = wdk.simplifySparqlResults(data);

          //Iterates through all the results and makes sure there's information inside to avoid errors:
          //if the content is undefined, the next var is set and so on
          for (let i in this.occupationCard) {

            //Default card view is hidden until we can check if a link to the Wiki exists
            this.occupationCard[i].hide = true;

            //Retrieves the article link and makes a fallback (ca => es => en)
            this.occupationCard[i].link = this.occupationCard[i].articleCA 
              || this.occupationCard[i].articleES 
              || this.occupationCard[i].articleEN 
              || '';

            //Only shows the card if it has a link to the wiki
            if (this.occupationCard[i].link != '') {

              //Enable HTML view and single card view
              this.hideOccupationCard = false;
              this.occupationCard[i].hide = false;

              //Check label content
              this.occupationCard[i].item.label = this.occupationCard[i].item.label 
                || '';

              //Check description content
              this.occupationCard[i].itemDescription = this.occupationCard[i].itemDescription 
                || '';

              //Check image content, if there's no image, default image is shown
              this.occupationCard[i].image = this.occupationCard[i].image 
                || './assets/imgs/default_card_image.png'

            } else {
              console.log(this.occupationCard[i].item.label + ' : Wikidata entry exists but does not have a Wikipedia article.');
            }

        }
      }
    });
  }

  retrieveOccupationCardByDatabase(){

    //Job to be searched in Spanish (as found in the database)
    //Please, change the string to match the occupation from the person
    //retrieved from the XARXES database in the future
    let occupation = "medico";

    //Sets de fallback method for the query
    let fallback = 'ca,es,en';

    //Querys the needed data and has a fallback regarding itemLabel and itemDescription
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
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${fallback}". }
    } LIMIT 1
    `

    const url = wdk.sparqlQuery(sparql);

    this.http.get(url).map(res => res.json()).subscribe(
      data => {

        //Proceed if data contains at least one result
        if (data.results.bindings.length != 0 ) {

          //Simplify the results in an object
          this.occupationCard = wdk.simplifySparqlResults(data);
          console.log(this.occupationCard);

          //Iterates through all the results and makes sure there's information inside to avoid errors:
          //if the content is undefined, the next var is set and so on
          for (let i in this.occupationCard) {

            //Default card view is hidden until we can check if a link to the Wiki exists
            this.occupationCard[i].hide = true;

            //Retrieves the article link and makes a fallback (ca => es => en)
            this.occupationCard[i].link = this.occupationCard[i].articleCA 
              || this.occupationCard[i].articleES 
              || this.occupationCard[i].articleEN 
              || '';

            //Only shows the card if it has a link to the wiki
            if (this.occupationCard[i].link != '') {

              //Enable HTML view and single card view
              this.hideOccupationCard = false;
              this.occupationCard[i].hide = false;

              //Check label content
              this.occupationCard[i].item.label = this.occupationCard[i].item.label 
                || '';

              //Check description content
              this.occupationCard[i].itemDescription = this.occupationCard[i].itemDescription 
                || '';

              //Check image content, if there's no image, default image is shown
              this.occupationCard[i].image = this.occupationCard[i].image 
                || './assets/imgs/default_card_image.png'

            } else {
              console.log(this.occupationCard[i].item.label + ' : Wikidata entry exists but does not have a Wikipedia article.');
            }

        }
      }
    });
  }

  retrieveFamilyNameCard(){

    //Converts first letter to Upper Case
    let cognom1 = this.person.cognom1.charAt(0).toUpperCase() + this.person.cognom1.slice(1);

    //Sets de fallback method for the query
    let fallback = 'ca,es,en';

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
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${fallback}". }
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
              console.log(this.familyNameCard[i].item.label + ' : Wikidata entry exists but does not have a Wikipedia article.');
            }
        }
      }
    });
  }

  retrieveHistoricalContextCard(){

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

               } else {
                console.log(this.historicalContextCards[i].item.label + ' : Wikidata entry exists but does not have a Wikipedia article.');            }

        }
      }
    });
  }

  }

  openCamera() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.cameraImage = 'data:image/jpeg;base64,' + imageData;
      this.photoTaken = true;
    }, (err) => {
     // Handle error
    });
  }

}
