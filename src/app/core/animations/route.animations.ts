import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' })),
      ], { optional: true }),
      
      query(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('200ms ease-in', style({ opacity: 1, transform: 'translateX(0)' })),
      ], { optional: true }),
    ]),
  ]),
]);

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 })),
  ]),
]);

export const slideAnimation = trigger('slideAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' })),
  ]),
]);

export const scaleAnimation = trigger('scaleAnimation', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 })),
  ]),
]);
