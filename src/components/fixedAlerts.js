import * as Constants from '../lib/constants';
import { getBestGuessDevice } from '../lib/helpers';
import { route } from 'preact-router';

const goToHomeScreen = () => {

};

const RenderAlertBody = (alert, device) => {
  switch (alert.type) {
    case Constants.MATCH_STARTED:
      return NewMatchAlert(alert.msg, device);
    default:
      return alert.msg;
  }
};

const NewMatchAlert = (match, device) => {
  let clickOrTap = 'Click';
  let type = device && device.type ? device.type : getBestGuessDevice();
  if (type === Constants.DEVICE_TYPES.MOBILE_DEVICE || type === Constants.DEVICE_TYPES.TABLET_DEVICE) {
    clickOrTap = 'Tap';
  }
  return (
    <span onClick={() => goToHomeScreen()}>{ match.player1Fname } and { match.player2Fname } just started a match. { clickOrTap } here to view.</span>
  );
};

const FixedAlerts = ({ alerts, device, dismiss }) => {
  if (!alerts || alerts.length === 0) {
    return;
  }

  return (
    <div class="fixed-alerts">
      {
        alerts.map((al, i) => {
          return (
            <div class={`alert alert-${al.type}`}>
              { RenderAlertBody(al, device) }
              <button class="close-button" onClick={() => dismiss(i)}>&times;</button>
            </div>
          );
        })
      }
    </div>
  );
};

export default FixedAlerts;