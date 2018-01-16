const FixedAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return;
  }

  return (
    <div class="fixed-alerts">
      {
        alerts.map(al => {
          return (
            <div class={`alert alert-${al.type}`}>
              { al.msg }
            </div>
          )
        })
      }
    </div>
  );
};

export default FixedAlerts;