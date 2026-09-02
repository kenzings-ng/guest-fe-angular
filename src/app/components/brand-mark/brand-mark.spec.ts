import { TestBed } from '@angular/core/testing';
import { BrandMark } from './brand-mark';

describe('BrandMark', () => {
  it('exposes the MAISON identity and authored pattern-piece mark', async () => {
    await TestBed.configureTestingModule({ imports: [BrandMark] }).compileComponents();
    const fixture = TestBed.createComponent(BrandMark);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[aria-label="MAISON"]')).toBeTruthy();
    expect(host.querySelector('svg[data-maison-mark="pattern-m"]')).toBeTruthy();
    expect(host.textContent).toContain('MAISON');
  });
});
