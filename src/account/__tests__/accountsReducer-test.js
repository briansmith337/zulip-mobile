/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import {
  REALM_ADD,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../../actionConstants';
import accountsReducer from '../accountsReducer';

import * as eg from '../../__tests__/exampleData';

describe('accountsReducer', () => {
  describe('REALM_ADD', () => {
    const account1 = eg.makeAccount({ apiKey: '', realm: 'https://realm.one.org' });
    const account2 = eg.makeAccount({ apiKey: '', realm: 'https://realm.two.org' });

    const prevState = deepFreeze([account1, account2]);

    test('if no account with this realm exists, prepend new one, with empty email/apiKey', () => {
      const newAccount = eg.makeAccount({
        email: '',
        apiKey: '',
        realm: 'https://new.realm.org',
      });

      const action = deepFreeze({
        type: REALM_ADD,
        realm: newAccount.realm,
      });

      const expectedState = [newAccount, account1, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });

    test('if account with this realm exists, move to front of list', () => {
      const newAccount = eg.makeAccount({
        email: '',
        realm: account2.realm,
        apiKey: '',
      });

      const action = deepFreeze({
        type: REALM_ADD,
        realm: newAccount.realm,
      });

      const expectedState = [account2, account1];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(prevState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    const account1 = eg.makeAccount();
    const account2 = eg.makeAccount();
    const account3 = eg.makeAccount();

    test('switching to first account does not change state', () => {
      const prevState = deepFreeze([account1, account2, account3]);
      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 0,
      });

      const newState = accountsReducer(prevState, action);

      expect(newState).toBe(prevState);
    });

    test('switching to an account moves the account to be first in the list', () => {
      const prevState = deepFreeze([account1, account2, account3]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = [account2, account1, account3];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    const account1 = eg.makeAccount({ email: '', realm: 'https://one.example.org' });
    const account2 = eg.makeAccount({ realm: 'https://two.example.org' });

    const prevState = deepFreeze([account1, account2]);

    test('on login, update initial account with auth information', () => {
      const newAccount = eg.makeAccount({
        realm: account1.realm,
      });

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newAccount.apiKey,
        email: newAccount.email,
        realm: newAccount.realm,
      });

      const expectedState = [newAccount, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does not exist, add as first item', () => {
      const newAccount = eg.makeAccount({
        email: 'newaccount@example.com',
        realm: 'https://new.realm.org',
      });

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newAccount.apiKey,
        email: newAccount.email,
        realm: newAccount.realm,
      });

      const expectedState = [newAccount, account1, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('on login, if account does exist, merge new data, move to top', () => {
      const newAccount = eg.makeAccount({
        email: account2.email,
        realm: account2.realm,
      });
      const action = deepFreeze({
        type: LOGIN_SUCCESS,
        apiKey: newAccount.apiKey,
        realm: newAccount.realm,
        email: newAccount.email,
      });

      const expectedState = [newAccount, account1];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGOUT', () => {
    test('on logout, clear just apiKey and ackedPushToken from active account', () => {
      const account1 = eg.makeAccount({ ackedPushToken: '123' });
      const account2 = eg.makeAccount();

      const prevState = deepFreeze([account1, account2]);

      const action = deepFreeze({ type: LOGOUT });

      const expectedState = [{ ...account1, apiKey: '', ackedPushToken: null }, account2];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_REMOVE', () => {
    test('on account removal, delete item from list', () => {
      const prevState = deepFreeze([eg.makeAccount()]);

      const action = deepFreeze({
        type: ACCOUNT_REMOVE,
        index: 0,
      });

      const expectedState = [];

      const newState = accountsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
