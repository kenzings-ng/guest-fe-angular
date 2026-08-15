import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentCredential } from '../models/payment-credential.model';

@Injectable({ providedIn: 'root' })
export class PaymentCredentialService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payment-credentials`;

  /** Capability data only; credential keys are intentionally absent. */
  available(): Observable<PaymentCredential[]> {
    return this.http.get<PaymentCredential[]>(`${this.baseUrl}/available`);
  }
}
