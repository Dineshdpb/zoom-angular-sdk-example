import { environment } from './../environments/environment.prod';
import { ApiserviceService } from './apiservice.service';
import { KJUR } from 'jsrsasign';
import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { ZoomMtg } from '@zoomus/websdk';
import ZoomMtgEmbedded from "@zoomus/websdk/embedded";

const client = ZoomMtgEmbedded.createClient();

ZoomMtg.setZoomJSLib('https://source.zoom.us/2.4.0/lib', '/av');

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US');
ZoomMtg.i18n.reload('en-US');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // setup your signature endpoint here: https://github.com/zoom/meetingsdk-sample-signature-node.js
  signatureEndpoint = 'http://localhost:4000/'
  // This Sample App has been updated to use SDK App type credentials https://marketplace.zoom.us/docs/guides/build/sdk-app
  sdkKey =environment.sdkKey
  sdkSecret=environment.sdkSecret
  apiKey=environment.apiKey
  JWT=''
  apiSecret=environment.apiSecret
  meetingNumber = '82721220425'
  role = 0
  leaveUrl = 'http://localhost:4200'
  userName = 'Angular'
  userEmail = ''
  passWord = 'trrU3f'
  meetingsArr=[]
  // pass in the registrant's token if your meeting or webinar requires registration. More info here:
  // Meetings: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/meetings#join-registered
  // Webinars: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/webinars#join-registered
  registrantToken = ''

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) document,public apiService:ApiserviceService) {

  }

  ngOnInit() {
    document.getElementById('zmmtg-root').style.display = 'none'
    let meetingSDKElement = document.getElementById('meetingSDKElement');

client.init({
  debug: true,
  zoomAppRoot: meetingSDKElement,
  language: 'en-US',
  customize: {
    meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
    toolbar: {
      buttons: [
        {
          text: 'Custom Button',
          className: 'CustomButton',
          onClick: () => {
            console.log('custom button');
          }
        }
      ]
    }
  }
});


  }
startMeetingClient(signature){
  // debugger
  client.join({
    sdkKey: this.sdkKey,
    signature: signature,
    meetingNumber: this.meetingNumber,
    password: this.passWord,
    userName: this.userName,
    success: (success) => {
      // debugger
      console.log(success)
    },
    error: (error) => {
      // debugger
      console.log(error)
    }
  })
  
}
generateSignature(isClient=false){
  // debugger
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2
  
    const oHeader = { alg: 'HS256', typ: 'JWT' }
  
    const oPayload = {
      sdkKey: this.sdkKey,
      mn: this.meetingNumber,
      role: this.role,
      iat: iat,
      exp: exp,
      appKey: this.sdkKey,
      tokenExp: iat + 60 * 60 * 2
    }
  
    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, this.sdkSecret)
    if(isClient){
this.startMeetingClient(signature)
    }else{
       this.startMeeting(signature)
    }
  }
 
  createMeeting(){
    let payload = { 
      "agenda": "My Meeting",
  "default_password": false,
  "duration": 60,
  "password": "",
  "pre_schedule": false
    }
    if(!this.JWT){
      this.generateJWTToken()
    }
this.apiService.createMeeting(payload,this.JWT).subscribe(data =>{
debugger
},err=>{
  debugger
  if(err.code==124){
    // token sxpired
  }
debugger
})
    
  }
  generateJWTToken(){
    // debugger
      const iat = Math.round(new Date().getTime() / 1000) - 30;
      const exp = iat + 60 * 60 * 2
    
      const oHeader = { alg: 'HS256', typ: 'JWT' }
    
      const oPayload = {
        iss: this.apiKey,
        iat: iat,
        exp: exp,
      }
    
      const sHeader = JSON.stringify(oHeader)
      const sPayload = JSON.stringify(oPayload)
      this.JWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, this.apiSecret)
      debugger
    }
   
  startMeeting(signature) {
    // debugger
    document.getElementById('zmmtg-root').style.display = 'block'
    // debugger
    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      success: (success) => {
        console.log(success)
        // debugger
        ZoomMtg.join({
          signature: signature,
          meetingNumber: this.meetingNumber,
          userName: this.userName,
          sdkKey: this.sdkKey,
          userEmail: this.userEmail,
          passWord: this.passWord,
          tk: this.registrantToken,
          success: (success) => {
            console.log(success)
          },
          error: (error) => {
            // debugger
            console.log(error)
          }
        })
      },
      error: (error) => {
        // debugger
        console.log(error)
      }
    })
  }
  doUpdateMeetingNumber=(id)=>this.meetingNumber=id;
  doUpdatePassword=(pass)=>this.passWord=pass
}