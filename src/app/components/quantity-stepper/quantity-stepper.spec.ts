import { TestBed } from '@angular/core/testing';
import { QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  it('emits the raw requested quantity without clamping', async () => {
    await TestBed.configureTestingModule({ imports: [QuantityStepper] }).compileComponents();
    const fixture = TestBed.createComponent(QuantityStepper);
    fixture.componentRef.setInput('quantity', 1);
    fixture.detectChanges();

    const emitted: number[] = [];
    fixture.componentInstance.quantityChange.subscribe((value) => emitted.push(value));

    const [decrease, increase] = fixture.nativeElement.querySelectorAll('button');
    (decrease as HTMLButtonElement).click();
    (increase as HTMLButtonElement).click();

    expect(emitted).toEqual([0, 2]);
  });

  it('renders the decrease/increase aria-labels and applies the requested size', async () => {
    await TestBed.configureTestingModule({ imports: [QuantityStepper] }).compileComponents();
    const fixture = TestBed.createComponent(QuantityStepper);
    fixture.componentRef.setInput('quantity', 3);
    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const decrease = host.querySelector('[aria-label="Decrease quantity"]') as HTMLElement;
    expect(decrease).toBeTruthy();
    expect(host.querySelector('[aria-label="Increase quantity"]')).toBeTruthy();
    expect(decrease.className).toContain('h-11');
    expect(host.textContent).toContain('3');
  });
});
