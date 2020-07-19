import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FrontService } from '../services/front.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit {
  public villes;public cinemas;public salles;
  public currentVille;
  public currentCinema;
  public currentProjection;
  public listSelectedTicket;
  totalRecords:string
  page:Number=1
  openform=false;

   dataForm:FormGroup
   dataFormCinema:FormGroup

  
 
  constructor(public frontService:FrontService,public fb:FormBuilder,public cb:FormBuilder) {

   }

  ngOnInit(): void {
    this.frontService.getVilles()
    .subscribe(data =>{
        this.villes=data;
    },err =>{
        console.log(err);
    }
    );
    this.dataForm = this.fb.group({
      nomClient: ['',Validators.required],
      codePayment: ['',Validators.required,
                        ]
    })
    this.dataFormCinema=this.cb.group({
      name :['',Validators.required],
      nomVille :['',Validators.required]
    })
  
  }
  onGetCinema(v){
    this.currentVille=v;
    this.salles=undefined;
    this.frontService.getCinemas(v)
    .subscribe(data =>{
      this.cinemas=data;
  },err =>{
      console.log(err);
  }
  );
  }
  onGetSalles(c){
    this.currentCinema=c;
    this.frontService.getSalles(c)
    .subscribe(data =>{
      this.salles=data;
      this.totalRecords=this.salles.length
      this.salles._embedded.salles.forEach(salle =>{
          this.frontService.getProjections(salle)
          .subscribe(data =>{
            salle.projections=data;
        },err =>{
            console.log(err);
        }
        );
      })
  },err =>{
      console.log(err);
  }
  );
  }
  onGetPlaces(p){
    this.currentProjection=p;
    this.frontService.getPlaces(p)
    .subscribe(data =>{
      this.currentProjection.tickets=data;
      this.listSelectedTicket=[];
  },err =>{
      console.log(err);
  }
  );
  }

  onSelectTicket(t){
   if(!t.selected){
     t.selected=true;
     this.listSelectedTicket.push(t);
   }else{
    t.selected=false;
    this.listSelectedTicket.splice( this.listSelectedTicket.indexOf(t),1);
   }
   console.log(this.listSelectedTicket);
    

  }

  getBtnClass(t){
    let clss="btn ticket ";
    if(t.reserve==true){
      console.log("hhhhh")
      clss+="btn-danger";
    }else if(t.selected){
      clss+="btn-warning";
    }else{
      clss+="btn-success";
    }
    return clss;
  }
  onPayTickets(dataForm){
    console.log(dataForm);
    let tickets=[];
    this.listSelectedTicket.forEach(element => {
      tickets.push(element.id);
     
    });
    dataForm.tickets=tickets;
    this.frontService.payerTickets(dataForm)
    .subscribe(data =>{
     alert("tickets reservées avec succés");
     this.onGetPlaces(this.currentProjection);
  },err =>{
      console.log(err);
  }
  );

  }
  get nomClient(){
   return  this.dataForm.get('nomClient');
  }
  get codePayment(){
    return  this.dataForm.get('codePayment');
   }
  onAddCinema(dataFormCinema){
  console.log(dataFormCinema)
    this.frontService.ajouterCinema(dataFormCinema)
    .subscribe(data =>{
     alert("Cinema ajoutée  avec succés");
     this.onGetPlaces(this.currentProjection);
  },err =>{
      console.log(err);
  }
  );
  }
  onClickOpenForm(){
    if(this.openform==false){
      this.openform=true;
      return this.openform;
    }else {
      this.openform=false;
      return this.openform;
    }
    
  
    }
}
