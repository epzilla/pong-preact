import { Component } from 'preact';
import { route } from 'preact-router';
import Rest from '../lib/rest-service';
import WebSocketService from '../lib/websocket-service';
import LocalStorageService from '../lib/local-storage-service';
import Avatar from '../components/avatar';
import PlayerSelectBlock from '../components/playerSelectBlock';
import SelectPlayerModal from '../components/selectPlayerModal';
import Stepper from '../components/stepper';
import SegmentedControl from '../components/segmentedControl';
import Toggle from '../components/toggle';
import { MATCH_STARTED } from '../lib/constants';

export default class StartMatch extends Component {
  constructor(props) {
    super(props);
    let selectedPlayToOption = -1;
    if (props.config && props.config.playTo && (props.config.playTo === 11 || props.config.playTo === 21)) {
      selectedPlayToOption = props.config.playTo;
    }
    this.p2wins = false;
    this.state = {
      doubles: false,
      player1: null,
      player2: null,
      partner1: null,
      partner2: null,
      isSelectingPlayer: 0,
      players: [],
      playTo: props.config && props.config.playTo ? props.config.playTo : 21,
      selectedPlayToOption,
      winByTwo: props.config && props.config.winByTwo,
      bestOf: props.config && props.config.bestOf ? props.config.bestOf : 4,
      updateEveryPoint: props.config && typeof props.config.updateEveryPoint !== 'undefined' ? props.config.updateEveryPoint : 0,
      playAllGames: props.config && typeof props.config.playAllGames !== 'undefined' ? props.config.playAllGames : 0,
      showPlayToInput: false,
      flipping: false,
      showCoinToss: false,
      showCoinReverse: false,
      firstServe: null
    }
  }

  componentDidMount() {
    WebSocketService.subscribe(MATCH_STARTED, this.onMatchStartedElsewhere);
    Rest.get('players').then(players => {
      this.setState({ players }, () => {
        let cachedState = LocalStorageService.get('start-match-state');
        let { num, addedPlayer } = this.props;
        let player;
        if (num && addedPlayer) {
          player = this.state.players.find(p => p.id === parseInt(addedPlayer));
        }

        if (player) {
          let stateCopy = Object.assign({}, this.state);
          if (cachedState.player1) {
            stateCopy.player1 = cachedState.player1;
          }
          if (cachedState.player2) {
            stateCopy.player2 = cachedState.player2;
          }
          if (cachedState.partner1) {
            stateCopy.partner1 = cachedState.partner1;
          }
          if (cachedState.partner2) {
            stateCopy.partner2 = cachedState.partner2;
          }
          stateCopy[`player${num}`] = player;
          this.setState(stateCopy);
        } else if (this.state.doubles) {
          this.setState({
            player1: cachedState && cachedState.player1 ? cachedState.player1 : players[0],
            player2: cachedState && cachedState.player2 ? cachedState.player2 : players[1],
            partner1: cachedState && cachedState.partner1 ? cachedState.partner1 : players[2],
            partner2: cachedState && cachedState.partner2 ? cachedState.partner2 : players[3]
          });
        } else {
          this.setState({
            player1: cachedState && cachedState.player1 ? cachedState.player1 : players[0],
            player2: cachedState && cachedState.player2 ? cachedState.player2 : players[1]
          });
        }
      });
    });
  }

  componentWillUnmount() {
    WebSocketService.unsubscribe(MATCH_STARTED, this.onMatchStartedElsewhere);
  }

  onMatchStartedElsewhere = () => {
    route('/');
  };

  setAndCacheState = (obj) => {
    this.setState(obj, () => {
      let { player1, player2, partner1, partner2 } = this.state;
      LocalStorageService.set('start-match-state', { player1, player2, partner1, partner2 });
    });
  };

  selectPlayer = (p) => {
    let obj = { isSelectingPlayer: 0 };
    if (this.state.isSelectingPlayer <= 2) {
      obj[`player${this.state.isSelectingPlayer}`] = p;
    } else {
      obj[`partner${this.state.isSelectingPlayer - 2}`] = p;
    }
    this.setAndCacheState(obj);
  };

  dismissModal = () => {
    this.setState({ isSelectingPlayer: null });
  };

  beginMatch = () => {
    let packet = Object.assign({ deviceId: this.props.device.id }, this.state);
    Rest.post('matches/create', packet).then(({ match }) => {
      LocalStorageService.delete('start-match-state');
      let matchIds = LocalStorageService.get('match-ids');
      if (!matchIds || matchIds.length === 0) {
        matchIds = [match.id];
      } else {
        matchIds.push(match.id);
      }
      LocalStorageService.set('match-ids', matchIds);
      route('/update-score');
    })
  };

  addNewPlayer = (num) => {
    if (this.state.player1 || this.state.player2 || this.state.partner1 || this.state.partner2) {
      LocalStorageService.set('start-match-state', this.state);
    }
    route(`/add-new-player/new-match/${num}`);
  };

  onBestOfChange = ({ amount }) => {
    this.setState({ bestOf: amount });
  };

  onPlayToOptionChange = (playTo) => {
    if (playTo === 11 || playTo === 21) {
      this.setState({ selectedPlayToOption: playTo, playTo, showPlayToInput: false });
    } else {
      this.setState({ selectedPlayToOption: -1, showPlayToInput: true });
    }
  };

  onPlayToInputChange = (e) => {
    this.setState({ playTo: parseInt(e.target.value) });
  };

  onDoublesChange = (doubles) => {
    this.setState({ doubles })
  };

  onScoringTypeChange = (updateEveryPoint) => {
    this.setState({ updateEveryPoint })
  };

  onPlayAllChange = (playAllGames) => {
    this.setState({ playAllGames })
  };

  onCoinFlipAnimationEnd = e => {
    if (e.animationName.indexOf('coin-flip') !== -1) {
      document.removeEventListener('animationend', this.onCoinFlipAnimationEnd);
      if (this.p2wins) {
        this.setState({ firstServe: this.state.player2, flipping: false, flippingToP2: false, showCoinReverse: true });
      } else {
        this.setState({ firstServe: this.state.player1, flipping: false, flippingToP2: false, showCoinReverse: false });
      }
    }
  };

  flipCoin = () => {
    this.setState({ firstServe: null, showCoinToss: true, showCoinReverse: false });
    this.p2wins = Math.floor(Math.random() * 101) >= 50 ? true : false;
    setTimeout(() => {
      this.setState({ flipping: !this.p2wins, flippingToP2: this.p2wins }, () => {
        setTimeout(() => {
          document.addEventListener('animationend', this.onCoinFlipAnimationEnd);
        }, 200);
      });
    }, 500);
  };

  closeCoinFlip = () => {
    this.setState({ showCoinToss: false });
  };

  render() {
    let { player1, player2, partner1, partner2, doubles, players, flipping, flippingToP2, showCoinToss, showCoinReverse, firstServe } = this.state;

    let team1block = (
      <div class="team-select-block">
        <PlayerSelectBlock
          doubles={doubles}
          isPartner={false}
          player={player1}
          num={1}
          selectCallback={() => this.setState({ isSelectingPlayer: 1 })}
          selectBtnText="Change"
        />
        {
          doubles ?
          <PlayerSelectBlock
            doubles={true}
            isPartner={true}
            player={partner1}
            num={3}
            selectCallback={() => this.setState({ isSelectingPlayer: 3 })}
            selectBtnText="Change"
          />
          : null
        }
      </div>
    );

    let team2block = (
      <div class="team-select-block">
        <PlayerSelectBlock
          doubles={doubles}
          isPartner={false}
          player={player2}
          num={2}
          selectCallback={() => this.setState({ isSelectingPlayer: 2 })}
          selectBtnText="Change"
        />
        {
          doubles ?
          <PlayerSelectBlock
            doubles={true}
            isPartner={true}
            player={partner2}
            num={4}
            selectCallback={() => this.setState({ isSelectingPlayer: 4 })}
            selectBtnText="Change"
          />
          : null
        }
      </div>
    );

    return (
      <div class="main new-match">
        <h2>Start New Match</h2>
        <div class="doubles-switch">
          <SegmentedControl
            options={[
              { label: 'Singles', value: false },
              { label: 'Doubles', value: true }
            ]}
            value={this.state.doubles}
            onChange={(e) => this.onDoublesChange(e)}
          />
        </div>
        <hr />
        <div class="player-selection-area">
          { team1block }
          <div class="player-selected-block flex-center">
            <div class="versus-separator">vs.</div>
          </div>
          { team2block }
        </div>
        <hr />
        <div class="match-settings flex-col">
          <div class="flex-col margin-bottom-1rem">
            <div class="stepper-wrap flex-center">
              <label class="label">Best of</label>
              <Stepper full onChange={(e) => this.onBestOfChange(e)} initialValue={this.state.bestOf} />
              <label class="label">Games</label>
            </div>
            <hr />
            <div class="flex-center flex-col controls-col">
              <label class="label">Play to</label>
              <SegmentedControl
                options={[
                  { label: '11', value: 11 },
                  { label: '21', value: 21 },
                  { label: 'Other', value: -1 }
                ]}
                value={this.state.selectedPlayToOption}
                onChange={(e) => this.onPlayToOptionChange(e)}
              />
              { this.state.showPlayToInput ?
                <input type="number" inputmode="numeric" pattern="[0-9]*" name="play-to-input" id="play-to-input" value={this.state.playTo} onChange={this.onPlayToInputChange} />
                : null
              }
            </div>
            <hr />
            <div class="flex-center flex-col controls-col">
              <label class="label">Play all games, even if match clinched?</label>
              <SegmentedControl
                options={[
                  { label: 'Yes', value: 1 },
                  { label: 'No', value: 0 }
                ]}
                value={this.state.playAllGames}
                onChange={(e) => this.onPlayAllChange(e)}
              />
            </div>
            <hr />
            <div class="flex-center flex-col controls-col">
              <label class="label">Update scores</label>
              <SegmentedControl
                options={[
                  { label: 'After each game', value: 0 },
                  { label: 'Point-by-point', value: 1 }
                ]}
                value={this.state.updateEveryPoint}
                onChange={(e) => this.onScoringTypeChange(e)}
              />
            </div>
          </div>
          <hr />
        </div>
        { player1 && player2 &&
          <div class="coin-flip-area">
            <div class={`flip-container ${ flipping ? 'flipping' : '' } ${ flippingToP2 ? 'flipping-extra' : '' } ${ showCoinReverse ? 'reversed' : '' }`}>
              <div class="flipper">
                <div class="front">
                  <Avatar coin big fname={player1.fname} lname={player1.lname} />
                </div>
                <div class="back">
                  <Avatar coin big fname={player2.fname} lname={player2.lname} />
                </div>
              </div>
            </div>
          </div>
        }
        { player1 && player2 && !firstServe && !showCoinToss &&
          <div class="match-settings">
            <button class="btn secondary big" onClick={() => this.flipCoin()}>Flip Coin for 1st Serve</button>
          </div>
        }
        { (firstServe || showCoinToss) &&
          <div class="match-settings first-serve">
            <div class="flex-center flex-col controls-col">
              { firstServe && <label class="label">{ firstServe.fname } serves first!</label> }
              { !firstServe && <label class="label">Here goes...</label> }
            </div>
          </div>
        }
        { firstServe &&
          <div class="match-settings">
            <button class="btn secondary big" onClick={() => this.flipCoin()}>I don't like that result! Re-do! :)</button>
          </div>
        }
        <hr />
        <div class="start-btn-wrap margin-bottom-1rem">
          <button class="btn success big begin-match-btn" onClick={() => this.beginMatch()}>Begin</button>
        </div>
        <SelectPlayerModal {...this.state} select={this.selectPlayer} dismiss={this.dismissModal} />
      </div>
    );
  }
}