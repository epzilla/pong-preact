import * as Constants from '../lib/constants';

const RenderAlertBody = ({ type, msg }) => {
  switch (type) {
    case Constants.MATCH_STARTED:
      return NewMatchAlert(msg);
    default:
      return msg;
  }
};

const NewMatchAlert = (match) => {
  // placeholder
  return (<div></div>);
};

const FixedAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return;
  }

  return (
    <div class="fixed-alerts">
      {
        alerts.map(al => <div class={`alert alert-${al.type}`}>{ RenderAlertBody(al) } </div>)
      }
    </div>
  );
};

export default FixedAlerts;