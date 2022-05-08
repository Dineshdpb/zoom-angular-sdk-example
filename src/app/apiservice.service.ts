import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {
  baseUrl='https://api.zoom.us/v2/'
  constructor(public http: HttpClient) { }
  
  createMeeting(data,token) {
    let httpHeaders = {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${token}`,
      'Access-Control-Allow-Origin': "*",
"Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    };
    return this.http.post(this.baseUrl+'users/me/meetings',data,{headers:httpHeaders})
  }
}
