import SelectList from './selectList';
import CSSTransitionGroup from 'preact-css-transition-group';
import { Link } from 'preact-router/match';

const renderPlayerListItem = (player, highlighted) => {
  return (
    <span>
      <i class={`fa fa-${highlighted ? 'check-circle-o' : 'circle-o'}`}></i>
      <span>{ player.fname } { player.lname }</span>
    </span>
  );
};

const SelectPlayerModal = ({ player1, player2, isSelectingPlayer, players, select, dismiss }) => {
  let modal;
  if (!!isSelectingPlayer) {
    let selectedPlayers = isSelectingPlayer === 1 ? [player1] : [player2];

    modal = (
      <div class="modal-wrapper select-player-modal-wrapper" key={1}>
        <div class="modal-backdrop select-player-modal-backdrop"></div>
        <div class="modal select-player-modal-main">
          <div class="modal-header">
            <h2>Select Player { isSelectingPlayer }</h2>
            <button class="dismiss-btn" onClick={() => dismiss()}>&times;</button>
          </div>
          <div class="modal-body flex-1">
            <div class="flex-1 flex-col">
              <div class="player-select-list-wrap flex-1 flex-col">
                <SelectList className="player-select-list" selectedItems={selectedPlayers} items={players} callback={(p) => select(p)} renderItem={renderPlayerListItem} />
              </div>
              <div class="btn-wrap margin-1rem flex-shrink-0 flex-col">
                <Link href="/add-player" class="btn primary add-player">
                  <i class="fa fa-plus-circle"></i>
                  <span>Add New Player</span>
                </Link>
              </div>
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