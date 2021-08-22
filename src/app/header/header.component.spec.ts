import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have brand name as Automata', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.branding span')?.textContent).toContain('Automata');
  })

  it('brand name should have link to /', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.branding a')?.getAttribute('href')).toContain(window.location.origin);
  })

  it('should have github star button at right-most', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.header-actions .nav-link a')).toBeTruthy();
  })
});
