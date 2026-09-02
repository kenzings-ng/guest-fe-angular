import { TestBed } from '@angular/core/testing';
import { CloseButton } from './close-button';

describe('CloseButton', () => {
  it('emits closed when clicked and applies the given aria-label', async () => {
    await TestBed.configureTestingModule({ imports: [CloseButton] }).compileComponents();
    const fixture = TestBed.createComponent(CloseButton);
    fixture.componentRef.setInput('ariaLabel', 'Close cart');
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Close cart');
    button.click();

    expect(closed).toBe(true);
  });
});
