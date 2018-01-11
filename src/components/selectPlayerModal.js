import SelectList from './selectList';
import CSSTransitionGroup from 'preact-css-transition-group';

const renderPlayerListItem = (player) => {
  return (
    <span>{ player.fname } { player.lname }</span>
  );
};

const SelectPlayerModal = ({ player1, player2, isSelectingPlayer, players, select, dismiss }) => {
  let modal;
  if (!!isSelectingPlayer) {
    modal = (
      <div class="modal-wrapper select-player-modal-wrapper" key={1}>
        <div class="modal-backdrop select-player-modal-backdrop"></div>
        <div class="modal select-player-modal-main">
          <div class="modal-header">
            <h2>Select Player { isSelectingPlayer }</h2>
            <button class="dismiss-btn" onClick={() => dismiss()}>&times;</button>
          </div>
          <div class="modal-body flex">
            <div class="flex-col">
              <SelectList className="player-select-list" items={players} callback={(p) => select(p)} renderItem={renderPlayerListItem} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CSSTransitionGroup
      transitionName="modal-flip-in"
      transitionAppear={false}
      transitionLeave={true}
      transitionEnter={true}
      transitionEnterTimeout={200}
      transitionLeaveTimeout={200}
    >
      { modal || null }
    </CSSTransitionGroup>
  )
};

export default SelectPlayerModal;