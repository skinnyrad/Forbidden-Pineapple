import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import { concat } from 'rxjs';


interface APResult {
    "ssid": string;
    "bssid": string;
    "channel": number;
    "mfp":string;
    "allClients":string;
}

interface scanResult {
    "scan_id": number;
    "date": string;
}

const ELEMENT_DATA: APResult[] = [

    {"ssid": "Load From Recon Scan", "bssid": '', "channel": 0, "mfp":"","allClients":""}
]

@Component({
    selector: 'lib-DeliciousDeauth',
    templateUrl: './DeliciousDeauth.component.html',
    styleUrls: ['./DeliciousDeauth.component.css']
})


export class DeliciousDeauthComponent implements OnInit {
    constructor(private API: ApiService) { } 
    

    ssidResponse = 'Press the button above to get a list of SSIDs.'; 
    //ssids:APResult[] = [];
    accesspoints:APResult[] = [];
    scans:scanResult[] = [];
    displayedColumns = ['SSID', 'MAC', 'Channel', 'MFP', "CLIENTS"];
    clientDisplayedColumns = ['SSID', 'MAC'];

    dataSource = new MatTableDataSource(ELEMENT_DATA);


    userInputBSSID = ""; 
    userInputClientMAC = "";
    channelInput = "";
    durationInput = "";
    targetInput = "";
    inputreadonly = true;
    allClients = "";
    scanNum  = {} as scanResult;
    scanitem = '';
    deauthStatus = false;
    timer = 0;
    statuslabel = false;
    statustext = "Status: Inactive";
    statusColor = "red";

    getScans(): void{
        this.API.APIGet('/api/recon/scans', (response) => {
            response.forEach(scanid => {
                let formatdate = new Date(scanid.date);
                formatdate.toISOString();
                scanid.date = formatdate;
                this.scans.push(scanid);
            })
        })

    }

    async changeStatus(val:boolean): Promise<void>{
        if(val === false){
            this.statustext = "Status: Inactive"
            this.statuslabel = false;
            this.statusColor = "red";
        }else{
            this.statustext = "Status: Active"
            this.statuslabel = true;
            this.statusColor = "green";
        }
    }

     getAPs(): void { 
        this.dataSource.data = [{"ssid": "Loading...", "bssid": '', "channel": 0, "mfp":"","allClients":""}];
        this.accesspoints = [];
        this.API.APIPost('/api/recon/scans/'+this.scanNum.scan_id+'/ap', {"search":"","sortCol":"last_seen","sortDir":"desc"}, (response) => { 
            
            response.aps.forEach(element => {
                if(element.ssid === ""){
                    element.ssid = "𝘏𝘪𝘥𝘥𝘦𝘯";
                }
                if(element.mfp === 0){
                    element.mfp = "No";
                }
                if(element.mfp ===1 ){
                    element.mfp = "Optional";
                }
                if(typeof element.clients === 'object' && element.clients !== null){
                    element.clients.forEach(clientnum => {
                        if(clientnum.client_mac !== null){
                            this.allClients = this.allClients.concat(clientnum.client_mac);
                            this.allClients = this.allClients.concat("\n");
                        }
                        else{
                            this.allClients = "";
                        }
                    })
                }
                
                element.allClients = this.allClients;
                this.accesspoints.push(element);
                this.allClients = "";
            });

            this.dataSource.data = this.accesspoints;
            //this.dataSource._updateChangeSubscription();
         }) 
     } 
   
    async stopDeauth(): Promise<void>{
        this.deauthStatus = false;
        this.alertUserStop();
        this.changeStatus(false);
     }
     startDeauth(): void{
        if(this.deauthStatus == true){
            if(this.userInputClientMAC === ""){
                this.userInputClientMAC = "FF:FF:FF:FF:FF:FF"
            }
            this.API.APIPost('/api/pineap/deauth/client', {"bssid":this.userInputBSSID,"mac":this.userInputClientMAC,"channel":Number(this.channelInput),"multiplier":5}, (response) => { 
                 
             }) 
        }
     }
     async alertUserStart(): Promise<void>{
        alert("Started Deauthentication Attack!");
     }
     async alertUserStop(): Promise<void>{
        alert("Terminated Deauthentication Attack");
     }
     async runDeauth(): Promise<void> {
        this.timer = 0;
        this.deauthStatus = true;
        //this.startDeauth(); 
        this.alertUserStart();
        this.changeStatus(true);
        if(this.durationInput === "30s"){
            while(this.timer < 5 && this.deauthStatus == true){
                this.startDeauth();
                await new Promise(f => setTimeout(f,7000));
                this.timer = this.timer+1;
            }
        }
        if(this.durationInput === "1m"){
            while(this.timer < 10 && this.deauthStatus == true){
                this.startDeauth();
                await new Promise(f => setTimeout(f,7000))
                this.timer = this.timer+1;
            }
        }
        if(this.durationInput === "5m"){
            while(this.timer < 50 && this.deauthStatus == true){
                this.startDeauth();
                await new Promise(f => setTimeout(f,7000))
                this.timer = this.timer+1;
            }

        }
        if(this.durationInput === "cont"){
            while(this.deauthStatus == true){
                this.startDeauth();
                await new Promise(f => setTimeout(f,7000))
            }
        }
        this.changeStatus(false);
     }

     setTarget(): void{
        if(this.targetInput === "apmode"){
            this.inputreadonly = true;
            this.userInputClientMAC = "";
        }else{
            this.inputreadonly = false;
        }
     }
    
    applyFilter(event: Event) {
       const filterValue = (event.target as HTMLInputElement).value;
       this.dataSource.filter = filterValue.trim().toLowerCase();
     }
  
     ngOnInit() { 
        this.getScans();
        
     } 
     ngOnDestroy(){
        this.deauthStatus = false;
     }
}
