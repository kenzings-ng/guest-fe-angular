import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

const API_URL = 'http://localhost:3000/auth';
const ACCESS_TOKEN_KEY = 'maison-access-token';
const REFRESH_TOKEN_KEY = 'maison-refresh-token';
const USER_KEY = 'maison-user';

describe('AuthService email verification state', () => {
  let http: HttpTestingController;
  let service: AuthService;

  const pendingUser: User = {
    id: 'user-1',
    email: 'pending@maison.test',
    name: 'Pending Customer',
    role: 'user',
    isVerified: false,
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(ACCESS_TOKEN_KEY, 'access-token');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token');
    localStorage.setItem(USER_KEY, JSON.stringify(pendingUser));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('synchronizes the current user with database verification state', async () => {
    const verifiedUser = { ...pendingUser, isVerified: true };
    const resultPromise = firstValueFrom(service.syncCurrentUser());

    const request = http.expectOne(`${API_URL}/me`);
    expect(request.request.method).toBe('GET');
    request.flush(verifiedUser);

    await expect(resultPromise).resolves.toEqual(verifiedUser);
    expect(service.currentUser()).toEqual(verifiedUser);
    expect(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')).toEqual(verifiedUser);
  });

  it('resends verification to the signed-in email address', async () => {
    const resultPromise = firstValueFrom(service.resendVerification());

    const request = http.expectOne(`${API_URL}/resend-verification`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: pendingUser.email });
    request.flush({ message: 'Verification email sent.' });

    await expect(resultPromise).resolves.toEqual({ message: 'Verification email sent.' });
  });

  it('marks the stored user verified after the verification endpoint succeeds', async () => {
    const resultPromise = firstValueFrom(service.verifyEmail('verification-token'));

    const request = http.expectOne(`${API_URL}/verify?token=verification-token`);
    request.flush({ message: 'Email verified successfully.' });

    await resultPromise;
    expect(service.currentUser()?.isVerified).toBe(true);
    expect(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')?.isVerified).toBe(true);
  });
});
