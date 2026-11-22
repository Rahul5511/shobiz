import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { loginDestination } from './login-navigation';

describe('loginDestination', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
  });

  it('preserves query parameters and a fragment on the protected workspace', () => {
    expect(router.serializeUrl(loginDestination(router, '/events?view=upcoming#list'))).toBe(
      '/events?view=upcoming#list',
    );
  });

  it.each([
    null,
    'https://example.com',
    '//example.com',
    '/login',
    '/events-other',
    '/events/missing',
    '/events(aux:other)',
    '/events/%ZZ',
    '/events\\example.com',
    '/%65vents',
  ])('falls back to the workspace for an unapproved return URL: %s', (url) => {
    expect(router.serializeUrl(loginDestination(router, url))).toBe('/app');
  });
});
