
type Messages = typeof import('../locales/en.json');

// eslint-disable-next-line
declare interface IntlMessages extends Messages {}

type Window = {
  $: any;
  jQuery: any;
};
