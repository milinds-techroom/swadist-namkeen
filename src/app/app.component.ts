import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit, Component, Directive, ElementRef, HostListener, Inject, Input,
  NgZone, OnDestroy, OnInit, PLATFORM_ID
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Counts from 0 up to the given number the first time the element
 * scrolls into view.
 * Usage:  <span [appCountUp]="200000" suffix="+">200,000+</span>
 *
 * NOTE: this class must stay ABOVE AppComponent, because AppComponent
 * lists it in its `imports` array.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  /** Target number */
  @Input({ required: true, alias: 'appCountUp' }) end = 0;
  /** Animation length in ms */
  @Input() duration = 2200;
  /** Text added after the number, e.g. "+" */
  @Input() suffix = '';

  private observer?: IntersectionObserver;
  private frame = 0;
  private readonly format = new Intl.NumberFormat('en-US');

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngAfterViewInit(): void {
    // Server render / no-JS: keep the final value that is in the template.
    if (!isPlatformBrowser(this.platformId)) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      this.render(this.end);
      return;
    }

    this.render(0);

    // Run outside Angular so the animation doesn't trigger change detection every frame.
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.observer?.disconnect();
            this.animate();
          }
        },
        { threshold: 0.4 },
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  private animate(): void {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / this.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      this.render(Math.round(this.end * eased));
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private render(value: number): void {
    this.el.nativeElement.textContent = this.format.format(value) + this.suffix;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }
}

interface Product {
  name: string;
  description: string;
  pack: string;
  price: number;
  image: string;
  tag: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CountUpDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  // Paste your deployed Google Apps Script web-app URL here when ready.
  private readonly GOOGLE_APPS_SCRIPT_URL = '';

  products: Product[] = [
    { name: '0 No. Shev', description: 'Crispy, light and full of flavour.', pack: '180 g', price: 60, image: 'images/reference/product-1.jpg', tag: 'Bestseller' },
    { name: 'Bakarwadi', description: 'A crunchy, savoury tea-time favourite.', pack: '200 g', price: 85, image: 'images/reference/product-5.jpg', tag: 'Classic' },
    { name: 'Farsan Mix', description: 'A lively mix for every celebration.', pack: '200 g', price: 75, image: 'images/reference/product-2.jpg', tag: 'Popular' },
    { name: 'Khatta-Mithha Mix', description: 'Sweet, tangy and perfectly crunchy.', pack: '200 g', price: 70, image: 'images/reference/product-4.jpg', tag: 'Festive pick' },
    { name: 'Poha Chivda', description: 'A light, crisp snack to share.', pack: '180 g', price: 65, image: 'images/reference/product-3.jpg', tag: 'Tea-time' },
    { name: 'Ratlami Sev', description: 'Bold spices with a satisfying crunch.', pack: '180 g', price: 60, image: 'images/reference/product-6.jpg', tag: 'Spicy' }
  ];

  slideIndex = 0;
  /** Cards visible at once. Must match the CSS breakpoints (--per-view). */
  perView = 4;
  private slideTimer?: ReturnType<typeof setInterval>;
  isSubmitting = false;
  orderMessage = '';
  orderError = '';

  orderForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      address: ['', [Validators.required, Validators.minLength(8)]],
      items: this.fb.array(this.products.map(() => this.fb.control(0, [Validators.min(0), Validators.max(99)]))),
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.updatePerView();
    this.slideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  get itemControls(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get total(): number {
    return this.products.reduce((sum, product, i) => sum + product.price * Number(this.itemControls.at(i).value || 0), 0);
  }

  readonly currentYear = new Date().getFullYear();
  readonly MathMax = Math.max;
  readonly MathMin = Math.min;
  readonly Number = Number;

  get selectedCount(): number {
    return this.products.reduce((sum, _product, i) => sum + Number(this.itemControls.at(i).value || 0), 0);
  }

  // ---------- Slider ----------

  /** Highest slide index so the last card always sits at the right edge (no empty space). */
  get maxIndex(): number {
    return Math.max(0, this.products.length - this.perView);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updatePerView();
  }

  private updatePerView(): void {
    if (typeof window === 'undefined') return; // SSR safe
    const w = window.innerWidth;
    this.perView = w >= 1200 ? 4 : w >= 768 ? 3 : w >= 576 ? 2 : 1;
    this.slideIndex = Math.min(this.slideIndex, this.maxIndex);
  }

  nextSlide(): void {
    this.slideIndex = this.slideIndex >= this.maxIndex ? 0 : this.slideIndex + 1;
  }

  previousSlide(): void {
    this.slideIndex = this.slideIndex <= 0 ? this.maxIndex : this.slideIndex - 1;
  }

  pauseSlider(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
    this.slideTimer = undefined;
  }

  resumeSlider(): void {
    if (!this.slideTimer) this.slideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  // ---------- Order ----------

  selectProduct(index: number): void {
    const current = Number(this.itemControls.at(index).value || 0);
    this.itemControls.at(index).setValue(current + 1);
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  }

  async submitOrder(): Promise<void> {
    this.orderMessage = '';
    this.orderError = '';
    this.orderForm.markAllAsTouched();

    if (this.orderForm.invalid) {
      this.orderError = 'Please complete your name, valid 10-digit phone number, delivery address, and check your quantities.';
      return;
    }
    if (this.selectedCount === 0) {
      this.orderError = 'Please select at least one product and quantity.';
      return;
    }
    if (!this.GOOGLE_APPS_SCRIPT_URL) {
      this.orderError = 'The form is ready, but Google Sheets is not connected yet. Add your deployed Apps Script URL in app.component.ts.';
      return;
    }

    const selectedItems = this.products
      .map((product, i) => ({ name: product.name, pack: product.pack, quantity: Number(this.itemControls.at(i).value || 0), unitPrice: product.price }))
      .filter((item) => item.quantity > 0);

    const payload = {
      submittedAt: new Date().toISOString(),
      customerName: this.orderForm.value.customerName,
      phone: this.orderForm.value.phone,
      address: this.orderForm.value.address,
      notes: this.orderForm.value.notes,
      items: selectedItems,
      total: this.total
    };

    this.isSubmitting = true;
    try {
      await fetch(this.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      this.orderMessage = 'Your order request has been sent. The shop will contact you to confirm availability and delivery.';
      this.orderForm.reset({ customerName: '', phone: '', address: '', notes: '' });
      this.itemControls.controls.forEach((control) => control.setValue(0));
    } catch {
      this.orderError = 'Could not send the order right now. Please try again or contact the shop directly.';
    } finally {
      this.isSubmitting = false;
    }
  }
}