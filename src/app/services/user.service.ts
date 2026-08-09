import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UpdateProfileInput, UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  updateMyProfile(input: UpdateProfileInput): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/me`, input);
  }
}
