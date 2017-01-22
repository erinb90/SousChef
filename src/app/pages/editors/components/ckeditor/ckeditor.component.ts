//declare var drawGauge: any;
//var tts =require('./tts.js');

import { Component, ViewEncapsulation } from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import './ckeditor.loader.ts';


@Component({
  selector: 'ckeditor-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./ckeditor.html'),
  styles: [require('./ckeditor.scss')]
})

export class Ckeditor {
  recipeId=1583;
  recipe;
  minute;
  second;
  timerDone:boolean = false;
  timer;
  currentStep=0;
  public ckeditorContent:string = '<p>Hello CKEditor</p>';
  public config = {
    uiColor: '#F0F3F4',
    height: '600'
  };

  constructor(private http:Http){
  this.http.get("https://pumpout.anyhowstep.com/recipes/"+this.recipeId).toPromise().then( res =>{
    console.log("found result");
    console.log(res.json());
    this.recipe=res.json();
  }, err =>{
    console.log("Error")
    console.log(err);
  });
  //let test= new tts.tts();
  
  }
  
  goToNext() {
	if(this.currentStep<this.recipe.instructions.length) {
		console.log("going to next step");
		this.currentStep = this.currentStep+1;
	}
  }
  
  goToPrev() {
	if(this.currentStep>0) {
		console.log("going to previous step");
		this.currentStep = this.currentStep-1;
	}
  }

 startTimer(){
	console.log("entered");
	this.timer = Observable.timer(0, 1000);
	console.log("entered");
	this.timer.subscribe(t => {
		if(this.second==0)
		{
			if(this.minute ==0)
			{
				this.timerDone = true;
				this.timer.unsubscribe;
			}
			else
			{
			this.minute -= 1;
			this.second = 59;	
			}
			
		}
		else
		{
			this.second -= 1;
		}
	})
 }
  
}
