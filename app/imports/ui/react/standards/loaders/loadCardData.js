import { DocumentCardSubs } from '/imports/startup/client/subsmanagers';
import { setIsCardReady } from '/client/redux/actions/standardsActions';

export default function loadCardData({
  dispatch,
  standard,
  organizationId,
  urlItemId,
}, onData) {
  let subscription;
  let isCardReady = true;

  if (standard) {
    const subArgs = { organizationId, _id: urlItemId };

    subscription = DocumentCardSubs.subscribe('standardCard', subArgs);

    isCardReady = subscription.ready();
  }

  dispatch(setIsCardReady(isCardReady));

  onData(null, {});

  return () => typeof subscription === 'function' && subscription.stop();
}