import { CryptoPage } from '../pages/crypto-page';

export let cryptoPage: CryptoPage;

export const setCryptoPage = (page: CryptoPage) => {
  cryptoPage = page;
};