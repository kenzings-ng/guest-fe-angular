import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from '../../app';
import { User } from '../../models/user.model';

const API_URL = 'http://localhost:3000/auth';
const pendingUser: User = {
  id: 'user-1',
  email: 'pending@maison.test',
  name: 'Pending Customer',
  role: 'user',
  isVerified: false,
};

describe('Email verification banner', () => {
  afterEach(() => localStorage.clear());

  it('stays hidden when the visitor is signed out', async () => {
    const { fixture } = await createApp();

    expect(findBanner(fixture)).toBeNull();
  });

  it('shows for an unverified account and confirms a resend', async () => {
    const { fixture, http } = await createApp(pendingUser);
    http.expectOne(`${API_URL}/me`).flush(pendingUser);
    fixture.detectChanges();

    const banner = findBanner(fixture);
    expect(banner?.textContent).toContain('Verify your email');
    expect(banner?.textContent).toContain(pendingUser.email);

    const button = banner?.querySelector<HTMLButtonElement>('button');
    button?.click();
    fixture.detectChanges();

    const request = http.expectOne(`${API_URL}/resend-verification`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: pendingUser.email });
    expect(button?.disabled).toBe(true);
    request.flush({ message: 'Verification email sent.' });
    fixture.detectChanges();

    expect(banner?.querySelector('[role="status"]')?.textContent).toContain(
      'A new verification link is on its way.',
    );
  });

  it('stays hidden after the database reports the account verified', async () => {
    const { fixture, http } = await createApp(pendingUser);
    http.expectOne(`${API_URL}/me`).flush({ ...pendingUser, isVerified: true });
    fixture.detectChanges();

    expect(findBanner(fixture)).toBeNull();
  });

  it('offers recovery when resending fails', async () => {
    const { fixture, http } = await createApp(pendingUser);
    http.expectOne(`${API_URL}/me`).flush(pendingUser);
    fixture.detectChanges();

    const banner = findBanner(fixture);
    banner?.querySelector<HTMLButtonElement>('button')?.click();
    http
      .expectOne(`${API_URL}/resend-verification`)
      .flush({ message: 'SMTP unavailable' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();

    expect(banner?.querySelector('[role="status"]')?.textContent).toContain(
      'We could not send the email. Try again.',
    );
    expect(banner?.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false);
  });
});

async function createApp(user?: User): Promise<{
  fixture: ComponentFixture<App>;
  http: HttpTestingController;
}> {
  localStorage.clear();
  if (user) {
    localStorage.setItem('maison-access-token', 'access-token');
    localStorage.setItem('maison-refresh-token', 'refresh-token');
    localStorage.setItem('maison-user', JSON.stringify(user));
  }

  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  for (const request of http.match('http://localhost:3000/carts')) {
    request.flush({ items: [] });
  }
  return { fixture, http };
}

function findBanner(fixture: ComponentFixture<App>): HTMLElement | null {
  return fixture.nativeElement.querySelector('[data-testid="email-verification-banner"]');
}
